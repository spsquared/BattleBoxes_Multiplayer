// Copyright (C) 2021 Radioactive64'

const fs = require('fs');

round = {
    inProgress:false,
    id:null,
    number:0
};
gameinProgress = false;
const achievementsTemplate = Object.assign({}, require('./Achievements.json')).data;

// chat functions
insertChat = function(text, textcolor) {
    var time = new Date();
    var utcminute = '' + time.getUTCMinutes();
    if(utcminute.length === 1){
        utcminute = '' + 0 + utcminute;
    }
    if(utcminute == '0'){
        utcminute = '00';
    }
    var color = '#000000';
    if (textcolor == 'server') {
        color = 'server';
    } else if (textcolor == '#FFFFFF00') {
        color = 'rainbow-pulse'
    } else {
        color = textcolor;
    }
    logColor(text, '\x1b[36m', 'chat');
    var msg = '[' + time.getUTCHours() + ':' + utcminute + '] ' + text;
    io.emit('insertChat', {msg:msg, color:color});
}
// logging
log = function(text) {
    logColor(text, '', 'log');
}
logColor = function(text, colorstring, type) {
    var time = new Date();
    var minute = '' + time.getMinutes();
    if(minute.length == 1){
        minute = '' + 0 + minute;
    }
    if(minute == '0'){
        minute = '00';
    }
    console.log('[' + time.getHours() + ':' + minute + '] ' + colorstring + text + '\x1b[0m');
    appendLog('[' + time.getHours() + ':' + minute + '] ' + text, type);
}
error = function(text) {
    logColor(text, '\x1b[31m', 'error');
}
appendLog = function(text, type) {
    var typestring = '--- ';
    if (type == 'error') typestring = 'ERR ';
    if (type == 'log') typestring = 'LOG ';
    if (type == 'chat') typestring = 'CHT ';
    fs.appendFileSync('./server/log.txt', typestring + text + '\n', {encoding: 'utf-8'});
}

// game functions
startGame = function() {
    endRound();
    var pack = [];
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        if (localplayer.ingame) {
            localplayer.score = 0;
            localplayer.invincible = false;
            pack.push(localplayer.name);
        }
    }
    for (var i in BOT_LIST) {
        var localbot = BOT_LIST[i];
        localbot.score = 0;
        pack.push(localbot.name);
    }
    round.number = 0;
    setTimeout(function () {
        io.emit('gamestart', pack);
        insertChat('Game started!', '#000000');
        gameinProgress = true;
        startRound();
    }, 1000);
}
endGame = function(id) {
    if (id == null) {
        insertChat('Game was cut short.', '#000000');
        io.emit('gamecut');
    } else {
        insertChat(PLAYER_LIST[id].name + ' Wins!', PLAYER_LIST[id].color);
        io.emit('winner', id);
        TrackedData.update();
    }
    for (var i in PLAYER_LIST) {
        PLAYER_LIST[i].ingame = false;
        PLAYER_LIST[i].score = 0;
    }
    for (var i in LOOT_BOXES) {
        delete LOOT_BOXES[i];
    }
    round.inProgress = false;
    gameinProgress = false;
    round.id = Math.random();
    CURRENT_MAP = 0;
}
// round functions
startRound = function() {
    if (gameinProgress) {
        round.id = Math.random();
        round.number++;
        // change map
        switch (Math.floor(Math.random()*7)) {
            case 0:
                CURRENT_MAP = 1;
                break;
            case 1:
                CURRENT_MAP = 2;
                break;
            case 2:
                CURRENT_MAP = 3;
                break;
            case 3:
                CURRENT_MAP = 4;
                break;
            case 4:
                CURRENT_MAP = 5;
                break;
            case 5:
                CURRENT_MAP = 6;
                break;
            case 6:
                CURRENT_MAP = 7;
                break;
            default:
                stop('INVALID MAP')
                break;
        }
        io.emit('map', CURRENT_MAP);
        // spawn lootboxes
        for (var i in LOOT_BOXES) {
            delete LOOT_BOXES[i];
        }
        var lootspawns = MAPS[CURRENT_MAP].lootspawns;
        for (var i in lootspawns) {
            new LootBox(lootspawns[i].x, lootspawns[i].y);
        }
        // spawn players
        var j = 0;
        var pack = [];
        var pack2 = [];
        for (var i in PLAYER_LIST) {
            localplayer = PLAYER_LIST[i];
            if (localplayer.ingame) {
                localplayer.respawn(MAPS[CURRENT_MAP].spawns[j].x, MAPS[CURRENT_MAP].spawns[j].y);
                pack.push({id:localplayer.id, x:localplayer.x, y:localplayer.y, hp:localplayer.hp, debug:{xspeed:localplayer.xspeed, yspeed:localplayer.yspeed, colliding:{left:localplayer.colliding.left, right:localplayer.colliding.right, bottom:localplayer.colliding.bottom, top:localplayer.colliding.top}}});
                pack2.push({id:localplayer.id, score:localplayer.score});
                j++;
            }
        }
        for (var i in BOT_LIST) {
            localbot = BOT_LIST[i];
            localbot.respawn(MAPS[CURRENT_MAP].spawns[j].x, MAPS[CURRENT_MAP].spawns[j].y);
            pack.push({id:localbot.id, x:localbot.x, y:localbot.y, hp:localbot.hp, debug:{xspeed:localbot.xspeed, yspeed:localbot.yspeed, colliding:{left:localbot.colliding.left, right:localbot.colliding.right, bottom:localbot.colliding.bottom, top:localbot.colliding.top}}});
            pack2.push({id:localbot.id, score:localbot.score});
            j++;
        }
        remainingPlayers = 0;
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame) {
                remainingPlayers++;
            }
        }
        for (var i in BOT_LIST) {
            remainingPlayers++;
        }
        io.emit('update', pack);
        io.emit('roundstart', pack2);
        insertChat('Round ' + round.number + '!', '#000000');
        round.inProgress = true;
    }
}
endRound = function() {
    io.emit('roundend');
    round.inProgress = false;
    var nextround = true;
    var ingamePlayers = [];
    for (var i in PLAYER_LIST) {
        ingamePlayers.push({isplayer:true, data:PLAYER_LIST[i]});
    }
    for (var i in BOT_LIST) {
        ingamePlayers.push({isplayer:false, data:BOT_LIST[i]});
    }
    for (var i in ingamePlayers) {
        var localplayer = ingamePlayers[i].data;
        if (localplayer.alive) {
            localplayer.score++;
            if (localplayer.score > 9) {
                if (ingamePlayers[i].isplayer) {
                    localplayer.trackedData.wins++;
                }
                endGame(localplayer.id);
                nextround = false;
            }
        }
    }
    for (var i in BULLET_LIST) {
        delete BULLET_LIST[i];
    }
    for (var i in LOOT_BOXES) {
        delete LOOT_BOXES[i];
    }
    if (remainingPlayers != 0 && nextround && gameinProgress) {
        setTimeout(function () {
            startRound();
        }, 1000);
    }
}

// achievements
TrackedData = function() {
    var self = {
        achievements:achievementsTemplate,
        locate: function(player, id) {
            for (var i in player.trackedData.achievements) {
                if (player.trackedData.achievements[i].id == id) {
                    return player.trackedData.achievements[i];
                }
            }
            return false;
        },
        grant: function(player, achievement) {
            achievement.aqquired = true;
            io.emit('achievement_get', {player:player, achievement:achievement.id});
            insertChat('Player "' + player + '" got the achievement "' + achievement.name + '"!', 'rainbow-pulse');
        },
        revoke: function(player, achievement) {
            achievement.aqquired = false;
            io.emit('achievementrevoked', {player:player, achievement:achievement.id});
        },
        kills: 0,
        deaths: 0,
        wins: 0,
        lootboxcollections: {
            total: 0,
            lucky: 0,
            unlucky: 0,
            speed: 0,
            jump: 0,
            shield: 0,
            homing: 0,
            firerate: 0,
            random: 0
        }
    };
    // temporary hard-coding while linking is fixed
    self.achievements = [
        {id:"1_Wins", name:"Winner Winner Chicken Dinner", aqquired:false},
        {id:"10_Wins", name:"Master of Gaming", aqquired:false},
        {id:"100_Wins", name:"The Ultimate Champion", aqquired:false},
        {id:"1000_Wins", name:"Unparalleled Dominance", aqquired:false},
        {id:"1000000_Wins", name:"Cheated or Sat Here Too Long", aqquired:false},
        {id:"1_Kills", name:"Pew Pew Gun!", aqquired:false},
        {id:"10_Kills", name:"Assassin", aqquired:false},
        {id:"100_Kills", name:"Hitman", aqquired:false},
        {id:"1000_Kills", name:"Homocide", aqquired:false},
        {id:"Snipe", name:"Sniper", aqquired:false},
        {id:"1_Deaths", name:"YOU DIED!", aqquired:false},
        {id:"10_Deaths", name:"Careless but Alive", aqquired:false},
        {id:"100_Deaths", name:"Witchcraft", aqquired:false},
        {id:"1000_Deaths", name:"Immortal", aqquired:false},
        {id:"1000000_Deaths", name:"How did we get here?", aqquired:false},
        {id:"1total_Lootboxes", name:"OOOH, what's this?", aqquired:false},
        {id:"100total_Lootboxes", name:"Loot Finder", aqquired:false},
        {id:"1000total_Lootboxes", name:"Looty McLootFace", aqquired:false},
        {id:"1lucky_Lootboxes", name:"Lucky Man", aqquired:false},
        {id:"100lucky_Lootboxes", name:"Lucky pants", aqquired:false},
        {id:"1000lucky_Lootboxes", name:"Gambler", aqquired:false},
        {id:"1unlucky_Lootboxes", name:"Better Luck Next Time!", aqquired:false},
        {id:"100unlucky_Lootboxes", name:"Gambler that Didn't Quit When they Should Have", aqquired:false},
        {id:"1speed_Lootboxes", name:"SPEEED!", aqquired:false},
        {id:"10speed_Lootboxes", name:"SPEEEEEED!!", aqquired:false},
        {id:"100speed_Lootboxes", name:"I AM SPEEEEEEEEEEEEEEEEEEEED!!!!!", aqquired:false},
        {id:"1jump_Lootboxes", name:"High Jump", aqquired:false},
        {id:"10jump_Lootboxes", name:"Sky High", aqquired:false},
        {id:"100_jump_Lootboxes", name:"I Believe I can Fly!", aqquired:false},
        {id:"1shield_Lootboxes", name:"I Have a Shield!", aqquired:false},
        {id:"10shield_Lootboxes", name:"*Insert Shield Joke*", aqquired:false},
        {id:"100shield_Lootboxes", name:"Too Many Shields", aqquired:false},
        {id:"1homing_Lootboxes", name:"Homing Bullet", aqquired:false},
        {id:"10homing_Lootboxes", name:"100% Aim Assist", aqquired:false},
        {id:"100homing_Lootboxes", name:"Don't Need to Aim", aqquired:false},
        {id:"1firerate_Lootboxes", name:"Pew Pew Pew Pew Pew Pew Pew Pew Pew Pew Gun!", aqquired:false},
        {id:"10firerate_Lootboxes", name:"More Bullets = More Damage", aqquired:false},
        {id:"100firerate_Lootboxes", name:"Somehow Still Have Bullets", aqquired:false},
        {id:"1random_Lootboxes", name:"What's in Here?", aqquired:false},
        {id:"10random_Lootboxes", name:"Risk Taker", aqquired:false},
        {id:"100random_Lootboxes", name:"Risk Ignorance", aqquired:false},
        {id:"aqquire_goldenbullet", name:"The Golden Bullet", aqquired:false},
        {id:"all_achievements", name:"Overachiever", aqquired:false},
        {id:"debug_EasterEgg", name:"Debugger", aqquired:false},
        {id:"null_EasterEgg", name:"Hacker", aqquired:false}
    ]
    return self;
}
TrackedData.update = function() {
    var pack = [];
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        if (localplayer.ingame) {
            localplayer.checkAchievements();
            pack.push({
                id: localplayer.id,
                kills: localplayer.trackedData.kills,
                deaths: localplayer.trackedData.deaths,
                wins: localplayer.trackedData.wins,
                lootboxcollections: localplayer.trackedData.lootboxcollections
            });
        }
        io.emit('updateTrackedData', pack);
    }
}

// debug
TrackedData.log = function() {
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        console.log(localplayer.trackedData);
    }
}