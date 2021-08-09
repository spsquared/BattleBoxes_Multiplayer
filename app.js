// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

console.info('\x1b[33m%s\x1b[0m', '-----------------------------------------------------------------------\nBattleBoxes Multiplayer Server Preview Copyright (C) 2021 Radioactive64\nFull license can be found in LICENSE or at https://www.gnu.org/licenses\n-----------------------------------------------------------------------');
// start server
console.log('\x1b[32m%s\x1b[0m', '\n  This server is running BattleBoxes Server Experimental Pathfinding Preview\n  Initializing...\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
const salt = 5;
const bcrypt = require('bcrypt');
const ini = require('ini');
const Cryptr = require('cryptr');
const key = ini.parse(fs.readFileSync('./server/key.ini', 'utf-8', 'r'));
const cryptr = new Cryptr(key.key);
const connectionString = cryptr.decrypt(key.url);
const { Client } = require('pg');
const database = new Client({connectionString: connectionString, ssl:{rejectUnauthorized:false}});
const spamcheck = require('spam-detection');

require('./server/pathfind.js');
require('./server/entity.js');
require('./server/game.js');
round.id = Math.random();
MAPS = [];
CURRENT_MAP = 0;
OPS = require('./server/ops.json').ops;

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

// init functions
function getMap(name) {
    var data1 = require('./server/maps/' + name);
    var data2 = [[]];
    data2.name = data1.name;
    data2.width = data1.width;
    data2.height = data1.height;
    var j = 0;
    for (var i in data1.data) {
        data2[j][i-(j*data1.width)] = data1.data[i];
        if (i-(j*data1.width) > data1.width-2) {
            j++;
            data2[j] = [];
        }
    }
    data2.spawns = [];
    for (var i in data1.spawns) {
        data2.spawns[i] = {x:null, y:null};
        data2.spawns[i].x = (data1.spawns[i].x*40)+20;
        data2.spawns[i].y = (data1.spawns[i].y*40)+20;
    }
    data2.lootspawns = [];
    for (var i in data1.lootspawns) {
        data2.lootspawns[i] = {x:null, y:null};
        data2.lootspawns[i].x = (data1.lootspawns[i].x*40)+20;
        data2.lootspawns[i].y = (data1.lootspawns[i].y*40)+20;
    }
    MAPS[MAPS.length] = data2;
};

// initialize
logColor('Starting server...', '\x1b[32m', 'log');
getMap('Lobby.json');
getMap('Map1.json');
getMap('Map2.json');
getMap('Map3.json');
getMap('Map4.json');
getMap('Map5.json');
getMap('Map6.json');
getMap('Map7.json');
SOCKET_LIST = [];
TPS = 0;
TPS_COUNTER = 0;
var port;
try {
    database.connect();
} catch (err) {
    error('\nFATAL ERROR:');
    error(err);
    error('STOP.\n');
    prompt.close();
    error('Server stopped.');
    process.abort();
}
if (process.env.PORT) {
    port = process.env.PORT;
    server.listen(port);
    logColor('Server started, listening to port ' + port + '.', '\x1b[32m', 'log');
    console.log('\n-----------------------------------------------------------------------\n');
} else {
    var count = fs.readFileSync('./server/PORTS.txt', {encoding:'utf8', flag:'r'});
    if (count == 'NaN') {
        console.warn('\x1b[31m%s\x1b[0m', '\n--------------------------------------------------------------------------------\nUNCAUGHT ERROR: PORTS.txt IS NaN. PLEASE CONSULT README.md FOR MORE INFORMATION.\n--------------------------------------------------------------------------------\n');
        database.end();
        prompt.close();
        process.abort();
    }
    if (count >=100) {
        console.warn('\x1b[31m%s\x1b[0m', '\n--------------------------------------------------------------------------------\nWARNING: YOU HAVE OVER 100 INSTANCES RUNNING. THIS MAY CAUSE ISSUES. STOPPING...\n--------------------------------------------------------------------------------\n');
        database.end();
        prompt.close();
        process.abort();
    }
    ports = parseInt(count)+1;
    logColor('There are ' + ports + ' servers running on this host.', '\x1b[32m', 'log');
    var portsstring = ports.toString();
    fs.writeFileSync('./server/PORTS.txt', portsstring);
    port = 1000;
    for (var i = 1; i < ports; i++) {port += 100;}
    server.listen(port);
    logColor('Server started, listening to port ' + port + '.', '\x1b[32m', 'log');
    console.log('\n-----------------------------------------------------------------------\n');
}
appendLog('This server is running BattleBoxes Server Experimental Pathfinding Preview', 'log');

// user login data handlers
async function getCredentials(usrname) {
    try {
        var data = await database.query('SELECT username, password FROM users;');
        for (var i in data.rows) {
            if (data.rows[i].username == usrname) {
                return {usrname:data.rows[i].username, psword:data.rows[i].password};
            }
        }
        return false;
    } catch (err) {
        stop(err);
    }
};
async function writeCredentials(username, password, userData) {
    try {
        var encryptedpassword = bcrypt.hashSync(password, salt);
        database.query('INSERT INTO users (username, password, data) VALUES ($1, $2, $3);', [username, encryptedpassword, userData], function(err, res) {if (err) stop(err);});
    } catch (err) {
        stop(err);
    }
};
async function deleteCredentials(username) {
    try {
        database.query('DELETE FROM users WHERE username=$1;', [username], function(err, res) {if (err) stop(err);});
    } catch (err) {
        stop(err);
    }
};
async function updateCredentials(username, password) {
    try {
        database.query('UPDATE users SET password=$2 WHERE username=$1;', [username, password], function(err, res) {if (err) stop(err);});
    } catch (err) {
        stop(err);
    }
};

io = require('socket.io') (server, {});
// Enable TEST_BOT by removing the double slashes (//)
TEST_BOT = new Bot(true);
TEST_BOT.respawn(60, 100);
bottest = function() {
    var i = 0;
    var botcreate = setInterval(function() {
        var localbot = new Bot(true)
        localbot.respawn(60,60)
        i++;
        if (i > 6) {
            clearInterval(botcreate)
        }
    }, 500)
}
// client connection
io.on('connection', function(socket) {
    socket.emit('init');
    socket.id = Math.random();
    var player = new Player(socket.id);
    SOCKET_LIST[socket.id] = socket;
    log('Client connection made.');
    // connection handlers
    socket.on('disconnect', async function() {
        for (var i in COLORS[1]) {
            if (COLORS[0][i] == player.color) {
                COLORS[1][i] = 0;
            }
        }
        if (player.ingame && player.alive) {
            remainingPlayers--;
            insertChat('"' + player.name + '" left the game.', 'server');
        }
        if (player.name != null) {
            database.query('UPDATE users SET data=$2 WHERE username=$1;', [player.name, player.trackedData], function(err, res) {if (err) console.log(err);});
        }
        io.emit('deleteplayer', player.id);
        log('Player "' + player.name + '" has disconnected.');
        delete SOCKET_LIST[socket.id];
        delete Player.list[player.id];
        player = null;
    });
    socket.on('timeout', async function() {
        log('Player "' + player.name + '" timed out.');
        socket.disconnect();
    });
    //login handlers
    socket.on('login', async function(cred) {
        if (cred.usrname == '' || cred.usrname.length > 20 || cred.usrname.includes(' ') || cred.psword.includes(' ') > 0) {
            socket.emit('disconnected');
        } else {
            var fetchedcreds = await getCredentials(cred.usrname);
            if (fetchedcreds) {
                if (bcrypt.compareSync(cred.psword, fetchedcreds.psword)) {
                    var signedin;
                    for (var i in Player.list) {
                        if (Player.list[i].name == cred.usrname) {
                            signedin = true;
                        }
                    }
                    if (signedin) {
                        socket.emit('loginFailed', 'alreadyloggedin');
                        log('Player could not login. Reason:ALREADY_LOGGED_IN');
                    } else {
                        player.name = cred.usrname;
                        socket.name = cred.usrname;
                        if (cred.usrname == 'null') {
                            player.color = '#FFFFFF00';
                        }
                        try {
                            // fetch tracked data
                            var data = await database.query('SELECT username, data FROM users');
                            for (var i in data.rows) {
                                if (data.rows[i].username == cred.usrname) {
                                    var localtrackedData = data.rows[i].data;
                                    try {
                                        var checkfornull = localtrackedData;
                                        if (checkfornull == null) {
                                            checkfornull = new TrackedData();
                                        }
                                        var checkfornull = localtrackedData.achievements;
                                        if (checkfornull == null) {
                                            checkfornull = new TrackedData().achievements;
                                        }
                                        var checkfornull = localtrackedData.kills;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.deaths;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.wins;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections;
                                        if (checkfornull == null) {
                                            checkfornull = new TrackedData().lootboxcollections;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.total;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.lucky;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.unlucky;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.speed;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.jump;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.shield;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.homing;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.firerate;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                        var checkfornull = localtrackedData.lootboxcollections.random;
                                        if (checkfornull == null) {
                                            checkfornull = 0;
                                        }
                                    } catch (err) {
                                        error('ERROR: Player trackedData was "' + data.rows[i].data + '" during fetch.');
                                        try {
                                            await database.query('UPDATE users SET data=$2 WHERE username=$1;', [player.name, new TrackedData()]);
                                            localtrackedData = new TrackedData();
                                        } catch (err) {
                                            stop(err);
                                        }
                                    }
                                    player.trackedData.kills = localtrackedData.kills;
                                    player.trackedData.deaths = localtrackedData.deaths;
                                    player.trackedData.wins = localtrackedData.wins;
                                    player.trackedData.lootboxcollections.total = localtrackedData.lootboxcollections.total;
                                    player.trackedData.lootboxcollections.lucky = localtrackedData.lootboxcollections.lucky;
                                    player.trackedData.lootboxcollections.unlucky = localtrackedData.lootboxcollections.unlucky;
                                    player.trackedData.lootboxcollections.speed = localtrackedData.lootboxcollections.speed;
                                    player.trackedData.lootboxcollections.jump = localtrackedData.lootboxcollections.jump;
                                    player.trackedData.lootboxcollections.shield = localtrackedData.lootboxcollections.shield;
                                    player.trackedData.lootboxcollections.homing = localtrackedData.lootboxcollections.homing;
                                    player.trackedData.lootboxcollections.firerate = localtrackedData.lootboxcollections.firerate;
                                    player.trackedData.lootboxcollections.random = localtrackedData.lootboxcollections.random;
                                    for (var j in localtrackedData.achievements) {
                                        var localfetchedachievement = localtrackedData.achievements[j];
                                        for (var k in player.trackedData.achievements) {
                                            var localplayerachievement = player.trackedData.achievements[k];
                                            if (localplayerachievement.id == localfetchedachievement.id) {
                                                localplayerachievement.aqquired = localfetchedachievement.aqquired;
                                            }
                                        }
                                    }
                                }
                            }
                        } catch (err) {
                            stop(err);
                        }
                        socket.emit('inittrackedData', player.trackedData);
                        socket.emit('loginConfirmed', 'login');
                        log('"' + player.name + '" logged in.');
                    }
                } else {
                    socket.emit('loginFailed', 'incorrect');
                    log('Player could not login. Reason:INCORRECT_CREDENTIALS');
                }
            } else {
                socket.emit('loginFailed', 'invalidusrname');
                log('Player could not login. Reason:USER_NOT_FOUND');
            }
        }
    });
    socket.on('signup', async function(cred) {
        if (cred.usrname == '' || cred.usrname.length > 20 || cred.usrname.includes(' ') || cred.psword.includes(' ') || spamcheck.detect(cred.usrname) == 'spam') {
            socket.emit('disconnected');
        } else {
            var fetchedcreds = await getCredentials(cred.usrname);
            if (fetchedcreds) {
                socket.emit('loginFailed', 'usrexists');
                log('Player could not sign up. Reason:USER_EXISTS');
            } else {
                player.name = cred.usrname;
                socket.name = cred.usrname;
                if (cred.usrname == 'null') {
                    player.color = "#FFFFFF00";
                    for (var i in player.trackedData.achievements) {
                        var localachievement = player.trackedData.achievements[i];
                        if (localachievement.id == 'null_EasterEgg') {
                            localachievement.aqquired = true;
                            log('null got the achievement "' + localachievement.name + '"!');
                            io.emit('achievement_get', {player:player.name, achievement:localachievement.id});
                        }
                    }
                }
                await writeCredentials(cred.usrname, cred.psword, player.trackedData);
                socket.emit('loginConfirmed', 'signup');
                log('"' + player.name + '" signed up.');
            }
        }
    });
    socket.on('deleteAccount', async function(cred) {
        if (cred.psword != null) {
            if (cred.usrname.length > 64) {
                socket.emit('disconnected');
            }
            var fetchedcreds = await getCredentials(cred.usrname);
            if (fetchedcreds == false) {
                socket.emit('disconnected');
                error('Error: Could not delete account. Reason:USER_NOT_FOUND');
            } else if (bcrypt.compareSync(cred.psword, fetchedcreds.psword)) {
                deleteCredentials(cred.usrname);
                socket.emit('loginConfirmed', 'deleted');
                socket.emit('disconnected');
                log('Player with username "' + player.name + '" deleted their account.');
            } else {
                socket.emit('loginFailed', 'incorrect');
                log('Player "' + player.name + '" could not delete account. Reason:INCORRECT_CREDENTIALS');
            }
        }
    });
    socket.on('changePassword', async function(cred) {
        var fetchedcreds = await getCredentials(cred.usrname);
        if (bcrypt.compareSync(cred.psword, fetchedcreds.psword) && player.name == cred.usrname) {
            updateCredentials(cred.usrname, cred.newpsword);
        }
    });
    // game handlers
    socket.on('joingame', function() {
        log('"' + player.name + '" attempted to join game.');
        var j = 0;
        for (var i in Player.list) {
            if (Player.list[i].ingame) {
                j++;
            }
        }
        for (var i in Bot.list) {
            j++;
        }
        if (j > 15) {
            socket.emit('gamefull');
            log('"' + player.name + '" was not able to join; Reason:Game_Full');
        } else if (round.inProgress == false) {
            player.ingame = true;
            player.respawn(MAPS[0].spawns[0].x, MAPS[0].spawns[0].y);
            player.invincible = true;
            // load maps
            var pack = [];
            for (var i in MAPS) {
                pack.push({
                    id: i,
                    width: (MAPS[i].width*40),
                    height: (MAPS[i].height*40),
                    name: MAPS[i].name
                });
            }
            socket.emit('initmap', pack);
            // send all existing players
            var players = [];
            for (var i in Player.list) {
                var localplayer = Player.list[i];
                if (localplayer.ingame) {
                    players.push({
                        id: localplayer.id,
                        name: localplayer.name,
                        color: localplayer.color
                    });
                }
            }
            for (var i in Bot.list) {
                var localbot = Bot.list[i];
                players.push({
                    id: localbot.id,
                    name: localbot.name,
                    color: localbot.color
                });
            }
            var pack = {
                self: player.id,
                players: players
            };
            socket.emit('initgame', pack);
            // send new player to all clients
            var pack = {
                id: player.id,
                name: player.name,
                color: player.color
            };
            io.emit('newplayer', pack);
            socket.emit('game-joined');
            insertChat('"' + player.name + '" joined the game.', 'server');
        } else {
            socket.emit('gamerunning');
            log('"' + player.name + '" was not able to join; Reason: Game_Started');
        }
    });
    socket.on('leavegame', function() {
        socket.emit('roundend');
        if (player.ingame && player.alive) {
            remainingPlayers--;
        }
        player.ingame = false;
        player.ready = false;
        setTimeout(function() {
            try {
                io.emit('deleteplayer', player.id);
            } catch (err) {}
        }, 1000);
        insertChat('"' + player.name + '" left the game.', 'server');
    });
    socket.on('keyPress', function(key) {
        if (player.alive) {
            if (key.key == 'W') player.Wpressed = key.state;
            if (key.key == 'S') player.Spressed = key.state;
            if (key.key == 'A') player.Apressed = key.state;
            if (key.key == 'D') player.Dpressed = key.state;
        }
    });
    socket.on('ready', function() {
        player.ready = true;
    });
    socket.on('click', function(click) {
        if (click.button == 'left' && round.inProgress && player.alive) {
            player.shoot(click.x, click.y);
        }
        if (click.button == 'right' && round.inProgress && player.alive) {
            player.secondaryAttack(click.x, click.y);
        }
    });
    // chat handlers
    var messageRate = 0;
    var spamOffenses = 0;
    setInterval(async function() {
        messageRate--;
        if (messageRate < 0) messageRate = 0;
    }, 5000);
    setInterval(async function() {
        spamOffenses--;
        if (spamOffenses < 0) spamOffenses = 0;
    }, 10000);
    socket.on('chatInput', async function(input) {
        if (input.length > 64) {
            socket.emit('disconnected');
            insertChat('"' + player.name + '" attempted to circumvent the chat message limit.', 'server');
            try {
                io.emit('deleteplayer', player.id);
            } catch (err) {}
            player.ingame = false;
        } else if (spamcheck.detect(input) == 'spam') {
            spamOffenses++;
            if (spamOffenses >= 10) {
                socket.emit('disconnected');
                insertChat('"' + player.name + '" was kicked for spamming.', 'server');
                try {
                    io.emit('deleteplayer', player.id);
                } catch (err) {}
                player.ingame = false;
            }
        } else {
            var msg = player.name + ': ' + input;
            insertChat(msg, player.color);
            spamcheck.detect(input);
            messageRate++;
            if (messageRate >= 10) {
                socket.emit('disconnected');
                insertChat('"' + player.name + '" was kicked for spamming.', 'server');
                try {
                    io.emit('deleteplayer', player.id);
                } catch (err) {}
                player.ingame = false;
            }
        }
    });
    // debug handlers
    socket.on('debug', function() {
        for (var i in player.trackedData.achievements) {
            var localachievement = player.trackedData.achievements[i];
            if (localachievement.id == 'debug_EasterEgg' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                insertChat('Player "' + player.name + '" got the achievement "' + localachievement.name + '"!', player.color);
                io.emit('achievement_get', {player:player.name, achievement:localachievement.id});
            }
        }
    });
    socket.on('consoleInput', async function(input) {
        logColor(player.name + ': ' + input, '\x1b[33m', 'log');
        if (SERVER.findOP(player.name)) {
            var convertedInput = input;
            while (convertedInput.includes('self')) {
                convertedInput = convertedInput.replace('self', 'SERVER.findUser("' + player.name + '")');
            }
            try {
                var command = Function('return (' + convertedInput + ')')();
                var msg = await command;
                if (msg == undefined) {
                    msg = 'Successfully executed command';
                }
                socket.emit('consoleLog', {color:'green', msg:msg});
                logColor(msg, '\x1b[33m', 'log');
            } catch (err) {
                socket.emit('consoleLog', {color:'red', msg:'Error: "' + input + '" is not a valid input.\n' + err});
                error('ERROR: "' + input + '" is not a valid input.');
                error(err + '');
            }
        } else {
            socket.emit('consoleLog', {color:'red', msg:'ERROR: NO PERMISSION.'});
            logColor('ERROR: NO PERMISSION.', '\x1b[33m', 'log');
        }
    });
    socket.on('ping', async function() {socket.emit('ping');});
});

// server-side tps
setInterval(function() {
    // advance game tick
    var players1 = Player.update();
    var players2 = Bot.update();
    var bullets = Bullet.update();
    LootBox.update();
    var pack = {players:players1.concat(players2), bullets:bullets};
    io.emit('update', pack);
    // round handling
    var j = 0;
    var k = 0;
    for (var i in Player.list) {
        if (Player.list[i].ingame) {
            j++;
        }
        if (Player.list[i].ready) {
            k++;
        }
    }
    for (var i in Bot.list) {
        j++;
    }
    if (k > (j-1) && k > 1) {
        startGame();
        for (var i in Player.list) {
            Player.list[i].ready = false;
        }
    }
    if (j < 2 && gameinProgress) {
        io.emit('roundend');
        round.inProgress = false;
        gameinProgress = false;
        for (var i in Bullet.list) {
            delete Bullet.list[i];
        }
        setTimeout(function() {endGame(null);}, 1000);
    }
    TPS_COUNTER++;
}, 1000/60);
setInterval(async function() {
    TPS = TPS_COUNTER;
    TPS_COUNTER = 0;
}, 1000);

// 5 minute autosave
setInterval(function() {
    for (var i in Player.list) {
        database.query('UPDATE users SET data=$2 WHERE username=$1;', [Player.list[i].name, Player.list[i].trackedData], function(err, res) {if (err) stop(err);});
    }
}, 300000);

// console interface
prompt.on('line', async function(input) {
    if (input=='stop') {
        queryStop(true);
    } else if (input == 'help') {
        console.log('\x1b[36mConsole help:\x1b[0m');
        console.log('\x1b[36mSERVER -\x1b[0m');
        console.log('\x1b[36m  users--- Account functions\x1b[0m');
        console.log('\x1b[36m  game---- Game manipulation & entity controls\x1b[0m');
        console.log('\x1b[36m  debug--- Debugging\x1b[0m');
        console.log('\x1b[36mFor more information, type "users help", "game help", or "debug help".\x1b[0m');
        console.log('\x1b[36mTo stop server:\x1b[0m');
        console.log('\x1b[36mtype "stop"\x1b[0m');
        console.log('\x1b[36mTo run a command, place dots between statements: SERVER.users.grant("Test_User", "100_Wins"); SERVER.game.spawnLootbox(60,100);\x1b[0m');
        console.log('\x1b[36mFor more functions, you can look into the source code\x1b[0m');
    } else if (input == 'users help') {
        console.log('\x1b[36mConsole help:\x1b[0m');
        console.log('\x1b[36musers -\x1b[0m');
        console.log('\x1b[36m  log------ \x1b[31m[Restricted]\x1b[36m Logs all users on database\x1b[0m');
        console.log('\x1b[36m  remove--- \x1b[31m[Restricted]\x1b[36m Removes a user\x1b[0m');
        console.log('\x1b[36m   \x1b[32musername\x1b[37m Username of target user\x1b[0m');
        console.log('\x1b[36m  reset---- \x1b[31m[Restricted]\x1b[36m Resets a user\'s tracked data\x1b[0m');
        console.log('\x1b[36m   \x1b[32musername\x1b[37m Username of target user\x1b[0m');
        console.log('\x1b[36m  grant---- Grants a user an achievement\x1b[0m');
        console.log('\x1b[36m   \x1b[32musername\x1b[37m Username of target user\x1b[0m');
        console.log('\x1b[36m         \x1b[32mid\x1b[37m id of achievement (1_Kills 100Lucky_Lootboxes)\x1b[0m');
        console.log('\x1b[36m  revoke--- Revokes a user an achievement\x1b[0m');
        console.log('\x1b[36m   \x1b[32musername\x1b[37m Username of target user\x1b[0m');
        console.log('\x1b[36m         \x1b[32mid\x1b[37m id of achievement (1_Kills 100Lucky_Lootboxes)\x1b[0m');
        console.log('\x1b[36mFor more functions, you can look into the source code.\x1b[0m');
    } else if (input == 'game help') {
        console.log('\x1b[36mConsole help:\x1b[0m');
        console.log('\x1b[36mgame -\x1b[0m');
        console.log('\x1b[36m  log------------ Logs all users online\x1b[0m');
        console.log('\x1b[36m  start---------- Starts the game\x1b[0m');
        console.log('\x1b[36m  end------------ Ends the game. If specified, there is a winner\x1b[0m');
        console.log('\x1b[36m         \x1b[32musername\x1b[37m Username of winner\x1b[0m');
        console.log('\x1b[36m  spawnBot------- Spawns a bot at specified location. You cannot have a total player/bot count of more than 16\x1b[0m');
        console.log('\x1b[36m       \x1b[32mattackBots\x1b[37m To attack or not to attack other bots\x1b[0m');
        console.log('\x1b[36m                \x1b[32mx\x1b[37m x position of bot\x1b[0m');
        console.log('\x1b[36m                \x1b[32my\x1b[37m y position of bot\x1b[0m');
        console.log('\x1b[36m  spawnLootbox--- Spawns a lootbox at specified location\x1b[0m');
        console.log('\x1b[36m                \x1b[32mx\x1b[37m x position of lootbox\x1b[0m');
        console.log('\x1b[36m                \x1b[32my\x1b[37m y position of lootbox\x1b[0m');
        console.log('\x1b[36m  kick----------- Kicks a user\x1b[0m');
        console.log('\x1b[36m         \x1b[32musername\x1b[37m Username of player to kick\x1b[0m');
        console.log('\x1b[36m  kickall-------- Kicks all users\x1b[0m');
        console.log('\x1b[36m  kill----------- Kills a player\x1b[0m');
        console.log('\x1b[36m         \x1b[32musername\x1b[37m Username of player to kill\x1b[0m');
        console.log('\x1b[36m  tp------------- Teleports a player to either another player or to a coordinate\x1b[0m');
        console.log('\x1b[36m         \x1b[32musername\x1b[37m Username of player to teleport\x1b[0m');
        console.log('\x1b[36m      \x1b[32musername2/x\x1b[37m Username of player to teleport to OR x position\x1b[0m');
        console.log('\x1b[36m                \x1b[32my\x1b[37m \x1b[33m(optional)\x1b[37m y position\x1b[0m');
        console.log('\x1b[36m  noclip--------- Toggles noclip for a player\x1b[0m');
        console.log('\x1b[36m         \x1b[32musername\x1b[37m Username of player to toggle noclip\x1b[0m');
        console.log('\x1b[36m  godmode-------- Toggles invincibility for a player\x1b[0m');
        console.log('\x1b[36m         \x1b[32musername\x1b[37m Username of player to toggle invincible\x1b[0m');
        console.log('\x1b[36m  yeet----------- Yeets everything\x1b[0m');
        console.log('\x1b[36mFor more functions, you can look into the source code.\x1b[0m');
    } else if (input == 'debug help') {
        console.log('\x1b[36mConsole help:\x1b[0m');
        console.log('\x1b[36mdebug -\x1b[0m');
        console.log('\x1b[36m  TPS--- Returns the server tps\x1b[0m');
        console.log('\x1b[36mFor more functions, you can look into the source code.\x1b[0m\x1b[0m');
    } else if (input == 'Purple') {
        console.log('Purple exception detected. Purpling...');
        console.log('---------------------------------------------------');
        io.emit('disconnected');
        stop(null);
        prompt.close();
        setTimeout(function() {
            while (true) {
                console.log('purple');
                console.warn('purple');
                console.error('purple');
            }
        }, 5000);
    } else {
        try {
            appendLog('server: ' + input, 'log');
            var command = Function('return (' + input + ')')();
            var msg = await command;
            if (msg == undefined) {
                msg = 'Successfully executed command';
            }
            logColor(msg, '\x1b[33m', 'log');
        } catch (err) {
            error('ERROR: "' + input + '" is not a valid input.');
            error(err + '');
        }
    }
});
function queryStop(firstrun) {
    if (firstrun == true) {
        prompt.question('Are you sure you want to stop the server? y/n\n> ', function(answer) {
            if (answer == 'y') {
                stop();
            } else if (answer == 'n') {
                console.log('Server stop cancelled.');
            } else {
                console.log(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    } else {
        prompt.question('Please enter y or n.\n> ', function(answer) {
            if (answer == 'y') {
                stop();
            } else if (answer == 'n') {
                console.log('Server stop cancelled.');
            } else {
                console.log(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    }
};
function stop(stoperr) {
    if (stoperr) {
        console.error('\n');
        error('FATAL ERROR:');
        error(stoperr);
        error('STOP.\n');
    }
    logColor('Closing server...', '\x1b[32m', 'log');
    if (gameinProgress) endGame();
    io.emit('disconnected');
    logColor('Saving user data...', '\x1b[32m', 'log');
    for (var i in Player.list) {
        try {
            database.query('UPDATE users SET data=$2 WHERE username=$1;', [Player.list[i].name, Player.list[i].trackedData]);
        } catch (err) {
            error(err);
        }
    }
    logColor('Stopping server...', '\x1b[32m', 'log');
    var count = fs.readFileSync('./server/PORTS.txt', {encoding:'utf8', flag:'r'});
    ports = parseInt(count)-1;
    var portsstring = ports.toString();
    fs.writeFileSync('./server/PORTS.txt', portsstring);
    database.end();
    prompt.close();
    logColor('Server stopped.', '\x1b[32m', 'log');
    appendLog('-----------------------------------------------------------------------');
    if (stoperr) {
        console.log('\x1b[31m%s\x1b[0m', '\nIf this issue persists, please submit a bug report on GitHub with a screenshot of this log.');
        console.log('\x1b[31m%s\x1b[0m', '\nPress ENTER to exit.');
        const stopprompt = readline.createInterface({input: process.stdin, output: process.stdout});
        stopprompt.on('line', function(input) {
            process.abort();
        });
    } else {
        process.exit();
    }
};

// debug functions
debug = function() {
    self = {
        users: {
            log: async function() {
                return 'YOU DO NOT HAVE PERMISSION TO PERFORM THIS ACTION!';
                // var data = await database.query('SELECT username FROM users');
                // var ret = [];
                // for (var i in data.rows) {
                //     log(data.rows[i].username);
                //     ret.push(data.rows[i].username);
                // }
                // return ret;
            },
            remove: async function(username) {
                return 'YOU DO NOT HAVE PERMISSION TO PERFORM THIS ACTION!';
                // database.query('DELETE FROM users WHERE username=$1;', [username], function(err, res) {if (err) stop(err); log('Removed "' + username + '".');});
                // return 'Removed "' + username + '".';
            },
            reset: async function(username) {
                return 'YOU DO NOT HAVE PERMISSION TO PERFORM THIS ACTION!';
                // database.query('UPDATE users SET data=$2 WHERE username=$1;', [username, new TrackedData()], function(err, res) {if (err) stop(err); log('Reset "' + username + '".');});
                // return 'Reset "' + username + '".';
            },
            grant: async function(username, id) {
                if (self.findUser(username)) {
                    var localtrackedData = self.findUser(username).trackedData;
                    for (var i in localtrackedData.achievements) {
                        if (localtrackedData.achievements[i].id == id) {
                            localtrackedData.grant(username, localtrackedData.achievements[i]);
                        }
                        if (id == 'all') {
                            localtrackedData.grant(username, localtrackedData.achievements[i]);
                        }
                    }
                    return 'Granted "' + id + '" to "' + username + '".';
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            revoke: async function(username, id) {
                if (self.findUser(username)) {
                    var localtrackedData = self.findUser(username).trackedData;
                    for (var i in localtrackedData.achievements) {
                        if (localtrackedData.achievements[i].id == id) {
                            localtrackedData.revoke(username, localtrackedData.achievements[i]);
                        }
                        if (id == 'all') {
                            localtrackedData.revoke(username, localtrackedData.achievements[i]);
                        }
                    }
                    return 'Revoked "' + id + '" from "' + username + '".';
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            }
        },
        game: {
            log: async function() {
                var pack = [];
                for (var i in Player.list) {
                    pack.push(Player.list[i].name);
                    log(Player.list[i].name);
                }
                for (var i in Bot.list) {
                    pack.push(Bot.list[i].name);
                    log(Bot.list[i].name);
                }
                return pack;
            },
            start: async function() {
                startGame();
                for (var i in Player.list) {
                    Player.list[i].ready = false;
                }
            },
            end: async function(username) {
                SOCKET_LIST[self.findUser(username).socketid].emit('disconnected');
                // if (self.findUser(username)) {
                //     var localplayer = self.findUser(username);
                //     endGame(localplayer.id);
                // }
            },
            spawnBot: async function(attackBots, x, y) {
                if (Bot.list.length + Player.list.length < 15) {
                    var localbot = new Bot(attackBots);
                    localbot.respawn(x, y);
                } else {
                    return 'Too many players!';
                }
            },
            spawnLootbox: async function(x, y) {
                new LootBox(x, y);
            },
            kick: async function(username) {
                if (self.findUser(username)) {
                    for (var i in SOCKET_LIST) {
                        if (SOCKET_LIST[i].name == username) {
                            SOCKET_LIST[i].emit('disconnected');
                            delete SOCKET_LIST[i];
                        }
                    }
                    return 'Kicked "' + username + '".';
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            kickall: async function() {
                io.emit('disconnected');
                return 'Kicked all players.';
            },
            kill: async function(username) {
                if (self.findUser(username)) {
                    self.findUser(username).death();
                    return 'Killed "' + username + '".';
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            tp: async function(username, xORname2, y) {
                if (self.findUser(username)) {
                    if (self.findUser(xORname2)) {
                        var localplayer = self.findUser(username);
                        var localplayer2 = self.findUser(xORname2);
                        localplayer.x = localplayer2.x;
                        localplayer.y = localplayer2.y;
                        return 'Teleported "' + username + '" to "' + xORname2 + '".';
                    } else {
                        if (isNaN(xORname2*10)) {
                            return 'ERROR: Could not find user "' + xORname2 + '".';
                        } else {
                            var localplayer = self.findUser(username);
                            localplayer.x = xORname2;
                            localplayer.y = y;
                            return 'Teleported "' + username + '" to (' + xORname2 + ',' + y + ').';
                        }
                    }
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            noclip: async function(username) {
                if (self.findUser(username)) {
                    var localplayer = self.findUser(username);
                    localplayer.noclip = !localplayer.noclip;
                    return 'Set noclip of "' + username + '" to ' + localplayer.noclip + '.';
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            godmode: async function(username) {
                if (self.findUser(username)) {
                    var localplayer = self.findUser(username);
                    localplayer.invincible = !localplayer.invincible;
                    return 'Set godmode of "' + username + '" to ' + localplayer.invincible + '.';
                } else {
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            yeet: async function() {
                for (var i in Player.list) {
                    Player.list[i].yspeed = 50;
                }
                for (var i in Bot.list) {
                    Bot.list[i].yspeed = 50;
                }
                io.emit('yeet');
                return 'Yeeted all players!';
            }
        },
        debug: {
            toggleDebugLog: function() {
                return 'Unfinished function';
            },
            TPS: function() {
                return TPS;
            }
        },
        findUser: function(username) {
            for (var i in Player.list) {
                if (Player.list[i].name == username) {
                    return Player.list[i];
                }
            }
            for (var i in Bot.list) {
                if (Bot.list[i].name == username) {
                    return Bot.list[i];
                }
            }
            return false;
        },
        findOP: function(username) {
            for (var i in OPS) {
                if (OPS[i] == username) {
                    return true;
                }
            }
            return false;
        },
        crash: function() {
            try {
                undefined.undefined
            } catch (err) {
                stop('Manually triggered crash');
            }
        }
    }
    return self;
};
SERVER = new debug();