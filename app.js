// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

console.info('\x1b[33m%s\x1b[0m', '-----------------------------------------------------------------------\nBattleBoxes Multiplayer Server v-1.4.5 Copyright (C) 2021 Radioactive64\nFull license can be found in LICENSE or at https://www.gnu.org/licenses\n-----------------------------------------------------------------------');
// start server
console.log('\x1b[32m%s\x1b[0m', '\n  This server is running BattleBoxes Server v-1.4.5\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
const lineReader = require('line-reader');
const spamcheck = require('spam-detection');

require('./server/entity.js');
require('./server/game.js');
round.id = Math.random();
MAPS = [];
CURRENT_MAP = 0;
OPS = require('./server/ops.json').ops;

app.get('/', function (req, res) { res.sendFile(__dirname + '/client/index.html'); });
app.use('/client', express.static(__dirname + '/client'));

// init functions
getMap = function (name) {
    var data1 = require('./' + name);
    var data2 = [];
    data2.name = data1.name;
    data2[0] = [];
    data2.width = data1.width;
    data2.height = data1.height;
    var j = 0;
    for (var i in data1.data) {
        data2[j][i - (j * data1.width)] = data1.data[i];
        if (i - (j * data1.width) > data1.width - 2) {
            j++;
            data2[j] = [];
        }
    }
    data2.spawns = [];
    for (var i in data1.spawns) {
        data2.spawns[i] = { x: null, y: null };
        data2.spawns[i].x = (data1.spawns[i].x * 40) + 20;
        data2.spawns[i].y = (data1.spawns[i].y * 40) + 20;
    }
    data2.lootspawns = [];
    for (var i in data1.lootspawns) {
        data2.lootspawns[i] = { x: null, y: null };
        data2.lootspawns[i].x = (data1.lootspawns[i].x * 40) + 20;
        data2.lootspawns[i].y = (data1.lootspawns[i].y * 40) + 20;
    }
    MAPS[MAPS.length] = data2;
}

// initialize
logColor('Starting server...', '\x1b[32m', 'log');
getMap('./server/Lobby.json');
getMap('./server/Map1.json');
getMap('./server/Map2.json');
getMap('./server/Map3.json');
getMap('./server/Map4.json');
getMap('./server/Map5.json');
getMap('./server/Map6.json');
getMap('./server/Map7.json');
SOCKET_LIST = [];
TPS = 0;
TPS_COUNTER = 0;
var port;
try {
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
    fs.open('./server/PORTS.txt', 'a+', function (err) {
        if (err) stop(err);
        lineReader.open('./server/PORTS.txt', function (err, reader) {
            if (err) stop(err);
            reader.nextLine(function (err, line) {
                if (err) stop(err);
                if (line >= 100) {
                    console.warn('\x1b[31m%s\x1b[0m', '\n--------------------------------------------------------------------------------\nWARNING: YOU HAVE OVER 100 INSTANCES RUNNING. THIS MAY CAUSE ISSUES. STOPPING...\n--------------------------------------------------------------------------------\n');
                    prompt.close();
                    process.abort();
                }
                ports = parseInt(line) + 1;
                logColor('There are ' + ports + ' servers running on this host.', '\x1b[32m', 'log');
                var portsstring = ports.toString();
                fs.writeFileSync('./server/PORTS.txt', portsstring);
                var i;
                port = 1000
                for (i = 1; i < ports; i++) { port += 100; }
                server.listen(port);
                logColor('Server started, listening to port ' + port + '.', '\x1b[32m', 'log');
                console.log('\n-----------------------------------------------------------------------\n');
            });
        });
    });
}

// Enable TEST_BOT by removing the double slashes (//)
// TEST_BOT = new Bot(true);
// TEST_BOT.respawn(60, 60);
bottest = function () {
    var i = 0;
    var botcreate = setInterval(function () {
        var localbot = new Bot(true)
        localbot.respawn(60, 60)
        i++;
        if (i > 6) {
            clearInterval(botcreate)
        }
    }, 500)
}

// client connection
io = require('socket.io')(server, {});
io.on('connection', function (socket) {
    socket.emit('init');
    socket.id = Math.random();
    var player = new Player(socket.id);
    SOCKET_LIST[socket.id] = socket;
    log('Client connection made.');
    // connection handlers
    socket.on('error', function () {
        socket.emit('disconnected');
    })
    socket.on('disconnect', function () {
        for (var i in COLORS[1]) {
            if (COLORS[0][i] == player.color) {
                COLORS[1][i] = 0;
            }
        }
        if (player.ingame && player.alive) {
            remainingPlayers--;
            insertChat('"' + player.name + '" left the game.', 'server');
        }
        io.emit('deleteplayer', player.id);
        log('Player "' + player.name + '" has disconnected.');
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[player.id];
        player = null;
    });
    socket.on('timeout', function () {
        log('Player "' + player.name + '" timed out.');
        socket.disconnect();
    });
    //login handlers
    socket.on('login', async function (cred) {
        if (cred.usrname == '' || cred.usrname.length > 20 || cred.usrname.includes(' ') || cred.psword.includes(' ') > 0) {
            socket.emit('disconnected');
        } else {
            var signedin;
            for (var i in PLAYER_LIST) {
                if (PLAYER_LIST[i].name == cred.usrname) {
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
                socket.emit('inittrackedData', player.trackedData);
                socket.emit('loginConfirmed', 'login');
                log('Player with username "' + player.name + '" logged in.');
            }
        }
    });
    // game handlers
    socket.on('joingame', function () {
        log('Player "' + player.name + '" attempted to join game.');
        var j = 0;
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame) {
                j++;
            }
        }
        for (var i in BOT_LIST) {
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
                    width: (MAPS[i].width * 40),
                    height: (MAPS[i].height * 40),
                    name: MAPS[i].name
                });
            }
            socket.emit('initmap', pack);
            // send all existing players
            var players = [];
            for (var i in PLAYER_LIST) {
                var localplayer = PLAYER_LIST[i];
                if (localplayer.ingame) {
                    players.push({
                        id: localplayer.id,
                        name: localplayer.name,
                        color: localplayer.color
                    });
                }
            }
            for (var i in BOT_LIST) {
                var localbot = BOT_LIST[i];
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
    socket.on('leavegame', function () {
        socket.emit('roundend');
        if (player.ingame && player.alive) {
            remainingPlayers--;
        }
        player.ingame = false;
        player.ready = false;
        setTimeout(function () {
            try {
                io.emit('deleteplayer', player.id);
            } catch (err) { }
        }, 1000);
        insertChat('"' + player.name + '" left the game.', 'server');
    });
    socket.on('keyPress', function (key) {
        if (player.alive) {
            if (key.key == 'W') player.Wpressed = key.state;
            if (key.key == 'S') player.Spressed = key.state;
            if (key.key == 'A') player.Apressed = key.state;
            if (key.key == 'D') player.Dpressed = key.state;
        }
    });
    socket.on('ready', function () {
        player.ready = true;
    });
    socket.on('click', function (click) {
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
    setInterval(async function () {
        messageRate--;
        if (messageRate < 0) messageRate = 0;
    }, 5000);
    setInterval(async function () {
        spamOffenses--;
        if (spamOffenses < 0) spamOffenses = 0;
    }, 10000);
    socket.on('chatInput', async function (input) {
        if (input.length > 64) {
            socket.emit('disconnected');
            insertChat('"' + player.name + '" attempted to circumvent the chat message limit.', 'server');
            try {
                io.emit('deleteplayer', player.id);
            } catch (err) { }
            player.ingame = false;
        } else if (spamcheck.detect(input) == 'spam') {
            spamOffenses++;
            if (spamOffenses >= 10) {
                socket.emit('disconnected');
                insertChat('"' + player.name + '" was kicked for spamming.', 'server');
                try {
                    io.emit('deleteplayer', player.id);
                } catch (err) { }
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
                } catch (err) { }
                player.ingame = false;
            }
        }
    });
    // debug handlers
    socket.on('debug', function () {
        for (var i in player.trackedData.achievements) {
            var localachievement = player.trackedData.achievements[i];
            if (localachievement.id == 'debug_EasterEgg' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                insertChat('Player "' + player.name + '" got the achievement "' + localachievement.name + '"!', player.color);
                io.emit('achievement_get', { player: player.name, achievement: localachievement.id });
            }
        }
    });
    socket.on('consoleInput', async function (input) {
        log(player.name + ': ' + input);
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
                socket.emit('consoleLog', { color: 'green', msg: msg });
                log(msg);
            } catch (err) {
                socket.emit('consoleLog', { color: 'red', msg: 'Error: "' + input + '" is not a valid input.\n' + err });
                error('ERROR: "' + input + '" is not a valid input.');
                error(err + '');
            }
        } else {
            socket.emit('consoleLog', { color: 'red', msg: 'ERROR: NO PERMISSION.' });
            error('ERROR: NO PERMISSION.');
        }
    });
    socket.on('ping', async function () { socket.emit('ping'); });
});

// server-side tps
setInterval(function () {
    // advance game tick
    var players1 = Player.update();
    var players2 = Bot.update();
    var bullets = Bullet.update();
    LootBox.update();
    var pack = { players: players1.concat(players2), bullets: bullets };
    io.emit('update', pack);
    // round handling
    var j = 0;
    var k = 0;
    for (var i in PLAYER_LIST) {
        if (PLAYER_LIST[i].ingame) {
            j++;
        }
        if (PLAYER_LIST[i].ready) {
            k++;
        }
    }
    for (var i in BOT_LIST) {
        j++;
    }
    if (k > (j - 1) && k > 1) {
        startGame();
        for (var i in PLAYER_LIST) {
            PLAYER_LIST[i].ready = false;
        }
    }
    if (j < 2 && gameinProgress) {
        io.emit('roundend');
        round.inProgress = false;
        gameinProgress = false;
        for (var i in BULLET_LIST) {
            delete BULLET_LIST[i];
        }
        setTimeout(function () { endGame(null); }, 1000);
    }
    TPS_COUNTER++;
}, 1000 / 60);
setInterval(async function () {
    TPS = TPS_COUNTER;
    TPS_COUNTER = 0;
}, 1000);

// console interface
prompt.on('line', async function (input) {
    log('console: ' + input);
    if (input == 'stop') {
        queryStop(true);
    } else if (input == 'Purple') {
        console.log('Purple exception detected. Purpling...');
        console.log('---------------------------------------------------');
        if (gameinProgress) endGame();
        io.emit('disconnected');
        var count = fs.readFileSync('./server/PORTS.txt', { encoding: 'utf8', flag: 'r' });
        ports = parseInt(count) - 1;
        var portsstring = ports.toString();
        fs.writeFileSync('./server/PORTS.txt', portsstring);
        prompt.close();
        setTimeout(function () {
            while (true) {
                console.log('purple');
                console.warn('purple');
                console.error('purple');
            }
        }, 1000);
    } else {
        try {
            var command = Function('return (' + input + ')')();
            command;
        } catch (err) {
            error('ERROR: "' + input + '" is not a valid input.');
            error(err + '');
        }
    }
});
prompt.on('close', function () {
    error('Server was terminated');
    stop();
});
function queryStop(firstrun) {
    if (firstrun == true) {
        prompt.question('Are you sure you want to stop the server? y/n\n> ', function (answer) {
            log('console: ' + answer);
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
        prompt.question('Please enter y or n.\n> ', function (answer) {
            log('console: ' + answer);
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
}
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
    logColor('Stopping server...', '\x1b[32m', 'log');
    fs.open('./server/PORTS.txt', 'a+', function (err) {
        if (err) console.error(err);
        lineReader.open('./server/PORTS.txt', function (err, reader) {
            if (err) console.error(err);
            reader.nextLine(function (err, line) {
                if (err) console.error(err);
                ports = parseInt(line) - 1;
                var portsstring = ports.toString();
                fs.writeFileSync('./server/PORTS.txt', portsstring);
                prompt.close();
                logColor('Server stopped.', '\x1b[32m', 'log');
                if (stoperr) {
                    console.log('\x1b[31m%s\x1b[0m', '\nIf this issue persists, please submit a bug report on GitHub with a screenshot of this log.');
                    console.log('\x1b[31m%s\x1b[0m', '\nPress ENTER to exit.');
                    const stopprompt = readline.createInterface({ input: process.stdin, output: process.stdout });
                    stopprompt.on('line', function (input) {
                        process.abort();
                    });
                } else {
                    process.exit();
                }
            });
        });
    });
}

// debug functions
debug = function () {
    self = {
        users: {
            log: async function () {
                error('No database!');
                return 'No database!';
            },
            remove: async function (username) {
                error('No database!');
                return 'No database!';
            },
            reset: async function (username) {
                error('No database!');
                return 'No database!';
            },
            grant: async function (username, id) {
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
                    log('Granted "' + id + '" to "' + username + '".');
                    return 'Granted "' + id + '" to "' + username + '".';
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            revoke: async function (username, id) {
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
                    log('Revoked "' + id + '" from "' + username + '".');
                    return 'Revoked "' + id + '" from "' + username + '".';
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            }
        },
        game: {
            log: async function () {
                var pack = [];
                for (var i in PLAYER_LIST) {
                    pack.push(PLAYER_LIST[i].name);
                    log(PLAYER_LIST[i].name);
                }
                for (var i in BOT_LIST) {
                    pack.push(BOT_LIST[i].name);
                    log(BOT_LIST[i].name);
                }
                return pack;
            },
            start: async function () {
                startGame();
                for (var i in PLAYER_LIST) {
                    PLAYER_LIST[i].ready = false;
                }
            },
            end: async function (name) {
                if (self.findUser(name)) {
                    var localplayer = self.findUser(name);
                    endGame(localplayer.id);
                }
            },
            kick: async function (username) {
                if (self.findUser(username)) {
                    for (var i in SOCKET_LIST) {
                        if (SOCKET_LIST[i].name == username) {
                            SOCKET_LIST[i].emit('disconnected');
                            delete SOCKET_LIST[i];
                            log('Kicked "' + username + '".');
                        }
                    }
                    return 'Kicked "' + username + '".';
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            kickall: async function () {
                io.emit('disconnected');
                log('Kicked all players.');
                return 'Kicked all players.';
            },
            kill: async function (username) {
                if (self.findUser(username)) {
                    self.findUser(username).death();
                    log('Killed "' + username + '".');
                    return 'Killed "' + username + '".';
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            tp: async function (username, xORname2, y) {
                if (self.findUser(username)) {
                    if (self.findUser(xORname2)) {
                        var localplayer = self.findUser(username);
                        var localplayer2 = self.findUser(xORname2);
                        localplayer.x = localplayer2.x;
                        localplayer.y = localplayer2.y;
                        log('Teleported "' + username + '" to "' + xORname2 + '".');
                        return 'Teleported "' + username + '" to "' + xORname2 + '".';
                    } else {
                        if (isNaN(xORname2 * 10)) {
                            error('ERROR: Could not find user "' + xORname2 + '".');
                            return 'ERROR: Could not find user "' + xORname2 + '".';
                        } else {
                            var localplayer = self.findUser(username);
                            localplayer.x = xORname2;
                            localplayer.y = y;
                            log('Teleported "' + username + '" to (' + xORname2 + ',' + y + ').');
                            return 'Teleported "' + username + '" to (' + xORname2 + ',' + y + ').';
                        }
                    }
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            noclip: async function (username) {
                if (self.findUser(username)) {
                    var localplayer = self.findUser(username);
                    localplayer.noclip = !localplayer.noclip;
                    log('Set noclip of "' + username + '" to ' + localplayer.noclip + '.');
                    return 'Set noclip of "' + username + '" to ' + localplayer.noclip + '.';
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            godmode: async function (username) {
                if (self.findUser(username)) {
                    var localplayer = self.findUser(username);
                    localplayer.invincible = !localplayer.invincible;
                    log('Set godmode of "' + username + '" to ' + localplayer.invincible + '.');
                    return 'Set godmode of "' + username + '" to ' + localplayer.invincible + '.';
                } else {
                    error('ERROR: Could not find user "' + username + '".');
                    return 'ERROR: Could not find user "' + username + '".';
                }
            },
            yeet: async function () {
                for (var i in PLAYER_LIST) {
                    PLAYER_LIST[i].yspeed = 50;
                }
                for (var i in BOT_LIST) {
                    BOT_LIST[i].yspeed = 50;
                }
                io.emit('yeet');
                log('Yeeted all players!');
                return 'Yeeted all players!';
            }
        },
        toggleDebugLog: function () {

        },
        findUser: function (username) {
            for (var i in PLAYER_LIST) {
                if (PLAYER_LIST[i].name == username) {
                    return PLAYER_LIST[i];
                }
            }
            for (var i in BOT_LIST) {
                if (BOT_LIST[i].name == username) {
                    return BOT_LIST[i];
                }
            }
            return false;
        },
        findOP: function (username) {
            for (var i in OPS) {
                if (OPS[i] == username) {
                    return true;
                }
            }
            return false;
        },
        TPS: function () {
            log(TPS);
            return TPS;
        }
    }
    return self;
}
SERVER = new debug();
