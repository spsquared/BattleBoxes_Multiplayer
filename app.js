// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

console.info('-----------------------------------------------------------------------\nBattleBoxes Multiplayer Server v-1.0.1 Copyright (C) 2021 Radioactive64\nFull license can be found in LICENSE or at https://www.gnu.org/licenses \n-----------------------------------------------------------------------');
// start server
console.log('\nThis server is running BattleBoxes Server v-1.0.1\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
const lineReader = require('line-reader');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('74a3669d-f373-4b26-9ee1-e6d26aa71c0d');
const bcrypt = require('bcrypt');
const salt = 5;
const { Client } = require('pg');
const database = new Client({connectionString: cryptr.decrypt('4dd0a6ee3fedd098427c1ee988bf8bcbc7cb401b422829d0d33545b567424da8aa791317d1edf3ea3b9edf0838a10bdee8845e75da2f29c4f84d13e202e7e29f41167457f4bd0c99c058ffec43c25bd1acbc4dd4e63ccc75350c6886fc6f5bbdcb13f403462f08b465ccd384dfb7963bf46005c5461bb9ab0cf99f71773ee63b3a2d28ac359674cfab687e5b16029fee1ceaacaa022fd6a45e349bb417b7e3bbfe029415fd230e06bad2d04a80a9896f83073a87756f5265a2f5159377c40dedd67e7409ef2d249efde5a55e85fab545659db325f5f26ca16226ad41d442d84d31e04abef22c6af117a8dc041d283cd1b77ac0f0bbb833'), ssl:{rejectUnauthorized:false}});
const Pathfind = require('pathfinding');
const { data } = require('jquery');

require('./server/entity.js');
require('./server/game.js');
MAPS = [];
CURRENT_MAP = 0;

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

// init functions
getMap = function(name, id) {
    var data1 = require('./' + name);
    var data2 = [];
    data2.name = data1.name;
    data2[0] = [];
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
    data2.pfgrid = new Pathfind.Grid(data2);
    data2.spawns = [];
    for (var i in data1.spawns) {
        data2.spawns[i] = {x:null, y:null};
        data2.spawns[i].x = data1.spawns[i].x;
        data2.spawns[i].y = data1.spawns[i].y;
    }
    MAPS[id] = data2;
}

// initialize
console.log('Starting server...');
getMap('./server/Lobby.json', 0);
getMap('./server/Map1.json', 1);
getMap('./server/Map2.json', 2);
getMap('./server/Map3.json', 3);
getMap('./server/Map4.json', 4);
getMap('./server/Map5.json', 5);
SOCKET_LIST = [];
var port;
try {
    database.connect();
} catch (err) {
    console.error('\nFATAL ERROR:');
    console.error(err);
    console.error('STOP.\n');
    prompt.close();
    console.log('Server stopped.');
    process.abort();
}
if (process.env.PORT) {
    port = process.env.PORT;
    server.listen(port);
    console.log('Server started, listening to port ' + port + '.');
} else {
    fs.open('./server/PORTS.txt', 'a+', function(err) {
        if (err) stop(err);
        lineReader.open('./server/PORTS.txt', function (err, reader) {
            if (err) stop(err);
            reader.nextLine(function(err, line) {
                if (err) stop(err);
                if (line >=100) {
                    console.warn('\n--------------------------------------------------------------------------------\nWARNING: YOU HAVE OVER 100 INSTANCES RUNNING. THIS MAY CAUSE ISSUES. STOPPING...\n--------------------------------------------------------------------------------\n');
                    database.end();
                    prompt.close();
                    process.abort();
                }
                ports = parseInt(line)+1;
                console.log('There are ' + ports + ' servers running on this host.');
                var portsstring = ports.toString();
                fs.writeFileSync('./server/PORTS.txt', portsstring);
                var i;
                port = 1000
                for (i = 1; i < ports; i++) {port += 100;}
                server.listen(port);
                console.log('Server started, listening to port ' + port + '.');
            });
        });
    });
}

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
}
async function writeCredentials(username, password, userData) {
    try {
        var encryptedpassword = bcrypt.hashSync(password, salt);
    } catch (err) {
        stop(err);
    }
    database.query('INSERT INTO users (username, password, data) VALUES ($1, $2, $3);', [username, encryptedpassword, userData], function(err, res) {if (err) stop(err);});
}
async function deleteCredentials(username) {
    database.query('DELETE FROM users WHERE username=$1;', [username], function(err, res) {if (err) stop(err);});
}
async function updateCredentials(username, password) {
    database.query('UPDATE users SET password=$2 WHERE username=$1;', [username, password], function(err, res) {if (err) stop(err);});
}

// client connection
io = require('socket.io') (server, {});
io.on('connection', function(socket) {
    socket.emit('init');
    socket.id = Math.random();
    var player = new Player();
    SOCKET_LIST[socket.id] = socket;
    console.log('Client connection made.');
    // connection handlers
    socket.on('disconnect', function() {
        for (var i in COLORS[1]) {
            if (COLORS[0][i] == player.color) {
                COLORS[1][i] = 0;
            }
        }
        if (player.ingame && player.alive) {
            remainingPlayers--;
        }
        if (player.name != null) {
            database.query('UPDATE users SET data=$2 WHERE username=$1;', [player.name, player.trackedData], function(err, res) {if (err) console.log(err);});
        }
        io.emit('deleteplayer', player.id);
        console.log('Player "' + player.name + '" has disconnected.');
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[player.id];
        player = null;
    });
    socket.on('timeout', function() {
        console.log('Player "' + player.name + '" timed out.');
        socket.disconnect();
    });
    socket.on('disconnectclient', function() {
        socket.emit('disconnected');
        socket.disconnect();
    });
    //login handlers
    socket.on('login', async function(cred) {
        if (cred.usrname == '' || cred.usrname.length > 20 || cred.usrname.indexOf(' ') > 0 || cred.psword.indexOf(' ') > 0) {
            socket.emit('disconnected');
        } else {
            var fetchedcreds = await getCredentials(cred.usrname);
            if (fetchedcreds == false) {
                socket.emit('loginFailed', 'invalidusrname');
                console.log('Player could not login. Reason:USER_NOT_FOUND');
            } else if (bcrypt.compareSync(cred.psword, fetchedcreds.psword)) {
                var signedin;
                for (var i in PLAYER_LIST) {
                    if (PLAYER_LIST[i].name == cred.usrname) {
                        signedin = true;
                    }
                }
                if (signedin) {
                    socket.emit('loginFailed', 'alreadyloggedin');
                    console.log('Player could not login. Reason:ALREADY_LOGGED_IN');
                } else {
                    player.name = cred.usrname;
                    socket.name = cred.usrname;
                    if (cred.usrname == 'null') {
                        player.color = "#FFFFFF00";
                    }
                    try {
                        // fetch tracked data
                        var data = await database.query('SELECT username, data FROM users');
                        for (var i in data.rows) {
                            if (data.rows[i].username == cred.usrname) {
                                var localtrackedData = data.rows[i].data;
                                try {
                                    var checkfornull = localtrackedData.achievements;
                                    if (checkfornull == null) {
                                        checkfornull = new Achievements().achievements;
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
                                } catch (err) {
                                    console.error('ERROR: Player trackedData was "' + data.rows[i].data + '" during fetch.');
                                    try {
                                        await database.query('UPDATE users SET data=$2 WHERE username=$1;', [player.name, new Achievements()]);
                                        localtrackedData = new Achievements();
                                    } catch (err) {
                                        stop(err);
                                    }
                                }
                                player.trackedData.kills = localtrackedData.kills;
                                player.trackedData.deaths = localtrackedData.deaths;
                                player.trackedData.wins = localtrackedData.wins;
                                for (var j in localtrackedData.achievements) {
                                    var localfetchedachievement = localtrackedData.achievements[j];
                                    for (var k in player.trackedData.achievements) {
                                        var localplayerachievement = player.trackedData.achievements[k];
                                        if (localplayerachievement.id == localfetchedachievement.id) {
                                            localplayerachievement.aqquired = localfetchedachievement.aqquired;
                                        }
                                    }
                                }
                                // player.trackedData.achievements = localtrackedData.achievements;
                            }
                        }
                    } catch (err) {
                        stop(err);
                    }
                    socket.emit('inittrackedData', player.trackedData);
                    socket.emit('loginConfirmed', 'login');
                    console.log('Player with username "' + player.name + '" logged in.');
                }
    
            } else {
                socket.emit('loginFailed', 'incorrect');
                console.log('Player could not login. Reason:INCORRECT_CREDENTIALS');
            }
        }
    });
    socket.on('signup', async function(cred) {
        if (cred.usrname == '' || cred.usrname.length > 20 || cred.usrname.indexOf(' ') > 0 || cred.psword.indexOf(' ') > 0) {
            socket.emit('disconnected');
        } else {
            var fetchedcreds = await getCredentials(cred.usrname);
            if (fetchedcreds != false) {
                socket.emit('loginFailed', 'usrexists');
                console.log('Player could not sign up. Reason:USER_EXISTS');
            } else if (cred.usrname.indexOf(' ') == 0 || cred.usrname.indexOf('\\') == 0 || cred.usrname.indexOf('"') == 0 || cred.psword.indexOf('\\') == 0 || cred.psword.indexOf('"') == 0) {
                socket.emit('disconnected');
            } else {
                player.name = cred.usrname;
                socket.name = cred.usrname;
                if (cred.usrname == 'null') {
                    player.color = "#FFFFFF00";
                    for (var i in player.trackedData.achievements) {
                        var localachievement = player.trackedData.achievements[i];
                        if (localachievement.id == 'null_EasterEgg') {
                            localachievement.aqquired = true;
                            console.log('null got the achievement "' + localachievement.name + '"!');
                            io.emit('achievement_get', {player:player.name, achievement:localachievement.id});
                        }
                    }
                }
                await writeCredentials(cred.usrname, cred.psword, player.trackedData);
                socket.emit('loginConfirmed', 'signup');
                console.log('Player "' + player.name + '" signed up.');
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
                console.error('Error: Could not delete account. Reason:USER_NOT_FOUND');
            } else if (bcrypt.compareSync(cred.psword, fetchedcreds.psword)) {
                deleteCredentials(cred.usrname);
                socket.emit('loginConfirmed', 'deleted');
                socket.emit('disconnected');
                console.log('Player with username "' + player.name + '" deleted their account.');
            } else {
                socket.emit('loginFailed', 'incorrect');
                console.log('Player "' + player.name + '" could not delete account. Reason:INCORRECT_CREDENTIALS');
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
        console.log('Player "' + player.name + '" attempted to join game.');
        var j = 0;
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame) {
                j++;
            }
        }
        if (j > 15) {
            socket.emit('gamefull');
            console.log('"' + player.name + '" was not able to join; Reason:Game_Full');
        } else if (round.inProgress == false) {
            player.ingame = true;
            player.respawn(MAPS[0].spawns[0].x, MAPS[0].spawns[0].y);
            player.invincible = true;
            // send all existing players
            var pack;
            var players = [];
            var bullets = [];
            for (var i in PLAYER_LIST) {
                var localplayer = PLAYER_LIST[i];
                players.push({id:localplayer.id, name:localplayer.name, color:localplayer.color});
            }
            for (var i in BULLET_LIST) {
                var localbullet = BULLET_LIST[i];
                bullets.push({id:localbullet.id, x:localbullet.x, y:localbullet.y, angle:localbullet.angle, parent:localbullet.parent, color:localbullet.color});
            }
            pack = {self:player.id, players:players, bullets:bullets};
            socket.emit('initgame', pack);
            pack = [];
            for (var i in MAPS) {
                pack.push({id:i, width:(MAPS[i].width*40), height:(MAPS[i].height*40)});
            }
            socket.emit('initmap', pack);
            // send new player to all clients
            var pack = {id:player.id, name:player.name, color:player.color};
            io.emit('newplayer', pack);
            
            socket.emit('game-joined');
            console.log('"' + player.name + '" joined the game.');
        } else {
            socket.emit('gamerunning');
            console.log('"' + player.name + '" was not able to join; Reason: Game_Started');
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
            io.emit('deleteplayer', player.id);
            console.log('"' + player.name + '" left the game.');
        }, 1000);
    });
    socket.on('keyPress', function(key) {
        if (key.key == 'W') {player.Wpressed = key.state;}
        if (key.key == 'S') {player.Spressed = key.state;}
        if (key.key == 'A') {player.Apressed = key.state;}
        if (key.key == 'D') {player.Dpressed = key.state;}
    });
    socket.on('ready', function() {
        player.ready = true;
    });
    socket.on('click', function(click) {
        if (click.button == 'left' && round.inProgress && player.alive) {
            if (player.lastclick > ((1000/player.maxCPS)/(1000/60))) {
                player.lastclick = 0;
                var localbullet = new Bullet(click.x, click.y, player.x, player.y, player.id, player.color);
                var pack = {id:localbullet.id, x:localbullet.x, y:localbullet.y, angle:localbullet.angle, parent:localbullet.parent, color:localbullet.color};
                io.emit('newbullet', pack);
            }
        }
    });
    // debug handlers
    socket.on('debug', function() {
        for (var i in player.trackedData.achievements) {
            var localachievement = player.trackedData.achievements[i];
            if (localachievement.id == 'debug_EasterEgg' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                console.log('Player "' + player.name + '" got the achievement "' + localachievement.name + '"!');
                io.emit('achievement_get', {player:player.name, achievement:localachievement.id});
            }
        }
    });
    socket.on('ping', function() {socket.emit('ping');});
});
// server-side tps
setInterval(function() {
    // advance game tick
    Bullet.update();
    var pack = Player.update();
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
    if (k > (j-1) && k > 1) {
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
        setTimeout(function() {endGame(null);}, 1000);
    }
}, 1000/60);

// 5 minute autosave
setInterval(function() {
    for (var i in PLAYER_LIST) {
        database.query('UPDATE users SET data=$2 WHERE username=$1;', [PLAYER_LIST[i].name, PLAYER_LIST[i].trackedData], function(err, res) {if (err) stop(err);});
    }
}, 300000);

// console interface
prompt.on('line', async function(input) {
    if (input=='stop') {
        queryStop(true);
    } else if (input=='Purple') {
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
        }, 1000);
    } else {
        try {
            var command = Function('return (' + input + ')')();
            command;
        } catch (err) {
            console.error('Error: "' + input + '" is not a valid input.');
            console.error(err + '\n');
        }
    }
});
function queryStop(firstrun) {
    if (firstrun == true) {
        prompt.question('Are you sure you want to stop the server? y/n\n> ', function(answer) {
            if (answer == 'y') {
                stop(null);
            } else if (answer == 'n') {
                console.log('Server stop cancelled.\n> ');
            } else {
                console.warn(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    } else {
        prompt.question('Please enter y or n.\n> ', function(answer) {
            if (answer == 'y') {
                stop(null);
            } else if (answer == 'n') {
                console.log('Server stop cancelled.\n> ');
            } else {
                console.warn(answer + ' is not a valid answer.\n> ');
                queryStop(false);
            }
        });
    }
}
function stop(stoperr) {
    if (stoperr) {
        console.error('\nFATAL ERROR:');
        console.error(stoperr);
        console.error('STOP.\n');
    }
    console.log('Closing server...');
    endGame();
    io.emit('disconnected');
    console.log('Saving user data...');
    for (var i in PLAYER_LIST) {
        database.query('UPDATE users SET data=$2 WHERE username=$1;', [PLAYER_LIST[i].name, PLAYER_LIST[i].trackedData], function(err, res) {if (err) console.log(err);});
    }
    console.log('Stopping server...');
    fs.open('./server/PORTS.txt', 'a+', function(err) {
        if (err) console.error(err);
        lineReader.open('./server/PORTS.txt', function (err, reader) {
            if (err) console.error(err);
            reader.nextLine(function(err, line) {
                if (err) console.error(err);
                ports = parseInt(line)-1;
                var portsstring = ports.toString();
                fs.writeFileSync('./server/PORTS.txt', portsstring);
                database.end();
                prompt.close();
                console.log('Server stopped.');
                if (stoperr) {
                    console.log('Press ENTER to exit.');
                    const stopprompt = readline.createInterface({input: process.stdin, output: process.stdout});
                    stopprompt.on('line', function(input) {
                        process.exit();
                    });
                } else {
                    process.exit();
                }
            });
        });
    });
}

// debug functions
debug = function() {
    self = {
        users: {
            log: async function() {
                stop('YOU ARE NOT ALLOWED TO USE THIS FEATURE!');
                // database.query('SELECT username FROM users', function(err, res) {if (err) stop(err); console.log(res.rows);});
            },
            remove: async function(username) {
                stop('YOU ARE NOT ALLOWED TO USE THIS FEATURE!');
                // database.query('DELETE FROM users WHERE username=$1;', [username], function(err, res) {if (err) stop(err); console.log('Removed "' + username + '".');});
            },
            reset: async function(username) {
                stop('YOU ARE NOT ALLOWED TO USE THIS FEATURE!');
                // database.query('UPDATE users SET data=$2 WHERE username=$1;', [username, new Achievements()], function(err, res) {if (err) stop(err); console.log('Reset "' + username + '".');});
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
                    console.log('Granted "' + id + '" to "' + username + '".');
                } else {
                    console.error('ERROR:Could not find user "' + username + '".');
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
                    console.log('Revoked "' + id + '" from "' + username + '".');
                } else {
                    console.error('ERROR:Could not find user "' + username + '".');
                }
            }
        },
        game: {
            log: async function() {
                for (var i in PLAYER_LIST) {
                    console.log(PLAYER_LIST[i].name);
                }
            },
            kick: async function(username) {
                for (var i in SOCKET_LIST) {
                    if (SOCKET_LIST[i].name == username) {
                        SOCKET_LIST[i].emit('disconnected');
                        console.log('Kicked "' + username + '".');
                    }
                }
            },
            kickall: async function() {
                io.emit('disconnected');
                console.log('Kicked all players.');
            },
            kill: async function(username) {
                if (self.findUser(username)) {
                    self.findUser(username).death();
                    console.log('Killed "' + username + '".');
                } else {
                    console.error('ERROR:Could not find user "' + username + '".');
                }
            },
            noclip: async function(username) {
                if (self.findUser(username)) {
                    var localplayer = self.findUser(username);
                    localplayer.noclip = !localplayer.noclip;
                    console.log('Set noclip of "' + username + '" to ' + localplayer.noclip + '.');
                } else {
                    console.error('ERROR:Could not find user "' + username + '".');
                }
            },
            godmode: async function(username) {
                if (self.findUser(username)) {
                    var localplayer = self.findUser(username);
                    localplayer.invincible = !localplayer.invincible;
                    console.log('Set godmode of "' + username + '" to ' + localplayer.invincible + '.');
                } else {
                    console.error('ERROR:Could not find user "' + username + '".');
                }
            },
            yeet: async function() {
                for (var i in PLAYER_LIST) {
                    PLAYER_LIST[i].yspeed = 50;
                }
                io.emit('yeet');
                console.log('Yeeted all players!');
            }
        },
        findUser: function(username) {
            for (var i in PLAYER_LIST) {
                if (PLAYER_LIST[i].name == username) {
                    return PLAYER_LIST[i];
                }
            }
            return false;
        }
    }
    return self;
}
SERVER = new debug();