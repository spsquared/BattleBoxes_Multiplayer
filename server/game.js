// Copyright (C) 2021 Radioactive64'

round = {inProgress:false, number:0};
gameinProgress = false;
const achievementsTemplate = require('./Achievements.json').data;

// chat functions
insertChat = function(text, textcolor) {
    var time = new Date();
    var minute = '' + time.getMinutes();
    if(minute.length === 1){
        minute = '' + 0 + minute;
    }
    if(minute === '0'){
        minute = '00';
    }
    var color = '#000000';
    if (textcolor != '#FFFFFF00') {
        color = textcolor;
    }
    console.log('[' + time.getHours() + ':' + minute + '] ' + text);
    var msg = '[' + time.getHours() + ':' + minute + '] ' + text;
    io.emit('insertChat', {msg:msg, color:color});
}
log = function(text) {
    var time = new Date();
    var minute = '' + time.getMinutes();
    if(minute.length === 1){
        minute = '' + 0 + minute;
    }
    if(minute === '0'){
        minute = '00';
    }
    console.log('[' + time.getHours() + ':' + minute + '] ' + text);
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
        Achievements.update();
    }
    for (var i in PLAYER_LIST) {
        PLAYER_LIST[i].ingame = false;
    }
    round.inProgress = false;
    gameinProgress = false;
    setTimeout(function() {
        CURRENT_MAP = 0;
        io.emit('map', CURRENT_MAP);
    }, 1000)
}
// round functions
startRound = function() {
    if (gameinProgress) {
        switch (Math.floor(Math.random()*5)) {
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
            default:
                break;
        }
        io.emit('map', CURRENT_MAP);
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
    if (remainingPlayers != 0 && nextround && gameinProgress) {
        setTimeout(function () {
            startRound();
        }, 1000);
    }
}

// achievements
Achievements = function() {
    var self = {
        achievements:achievementsTemplate,
        grant: function(player, achievement) {
            achievement.aqquired = true;
            io.emit('achievement_get', {player:player, achievement:achievement.id});
            console.log('Player "' + player + '" got the achievement "' + achievement.name + '"!');
        },
        revoke: function(player, achievement) {
            achievement.aqquired = false;
            io.emit('achievementrevoked', {player:player, achievement:achievement.id});
        },
        kills: 0,
        deaths: 0,
        wins: 0
    };
    // temporary hard-coding while linking is fixed
    self.achievements = [
        {id:"1_Wins", name:"Winner Winner Chicken Dinner", aqquired:false},
        {id:"10_Wins", name:"Master of Gaming", aqquired:false},
        {id:"100_Wins", name:"The Ultimate Champion", aqquired:false},
        {id:"1000_Wins", name:"Unparalleled Dominance", aqquired:false},
        {id:"1_Kills", name:"Pew pew gun!", aqquired:false},
        {id:"10_Kills", name:"Assassin", aqquired:false},
        {id:"100_Kills", name:"Hitman", aqquired:false},
        {id:"1000_Kills", name:"Homocide", aqquired:false},
        {id:"Snipe", name:"Sniper", aqquired:false},
        {id:"1_Deaths", name:"YOU DIED!", aqquired:false},
        {id:"10_Deaths", name:"Careless but Alive", aqquired:false},
        {id:"100_Deaths", name:"Witchcraft", aqquired:false},
        {id:"1000_Deaths", name:"Immortal", aqquired:false},
        {id:"1000000_Deaths", name:"How did we get here?", aqquired:false},
        {id:"all_achievements", name:"Overachiever", aqquired:false},
        {id:"debug_EasterEgg", name:"Debugger", aqquired:false},
        {id:"null_EasterEgg", name:"Hacker", aqquired:false}
    ]
    return self;
}
Achievements.update = function() {
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        if (localplayer.ingame) {
            localplayer.checkAchievements();
        }
    }
}
// debug
Achievements.log = function() {
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        console.log(localplayer.trackedData);
    }
}