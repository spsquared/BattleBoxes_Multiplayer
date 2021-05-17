// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

console.info('-----------------------------------------------------------------------\nBattleBoxes Multiplayer Server v-0.7.1 Copyright (C) 2021 Radioactive64\nFull license can be found in LICENSE or https://www.gnu.org/licenses/.\n-----------------------------------------------------------------------');
// start server
console.log('\nThis server is running BattleBoxes Server v-0.7.1\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
const lineReader = require('line-reader');
const { Client } = require('pg');
const database = new Client({connectionString: 'postgres://wwiupyglrcpguu:c2c6fb4c268287b595a05026db98bd45cc419f7459ebe3e941447ce84bcde038@ec2-54-87-112-29.compute-1.amazonaws.com:5432/dc145r7tq09fjv', ssl:{rejectUnauthorized:false}});
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
var SOCKET_LIST = {};
var port;
try {
    database.connect();
} catch (err) {
    console.error('\nFATAL ERROR:');
    console.error(err);
    console.error('STOP.\n');
    prompt.close();
    console.log('Server stopped.');
    process.exit();
}
fs.open('./server/PORTS.txt', 'a+', function(err) {
    if (err) stop(err);
    lineReader.open('./server/PORTS.txt', function (err, reader) {
        if (err) stop(err);
        reader.nextLine(function(err, line) {
            if (err) stop(err);
            if (line >=100) {
                console.warn('\n--------------------------------------------------------------------------------\nWARNING: YOU HAVE OVER 100 INSTANCES RUNNING. THIS MAY CAUSE ISSUES. STOPPING...\n--------------------------------------------------------------------------------\n');
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

// user login data handlers
async function getCredentials(username) {
    try {
        var data = await database.query('SELECT username, password FROM users;');
        for (var i in data.rows) {
            if (data.rows[i].username == username) {
                return {usrname:data.rows[i].username, psword:data.rows[i].password};
            }
        }
        return false;
    } catch (err) {
        stop(err);
    }
}
async function writeCredentials(username, password, userData) {
    database.query('INSERT INTO users (username, password, data) VALUES ($1, $2, $3);', [username, password, userData], function(err, res) {if (err) stop(err);});
}
async function deleteCredentials(username) {
    database.query('DELETE FROM users WHERE username=$1;', [username], function(err, res) {if (err) stop(err);});
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
        database.query('UPDATE users SET data=$2 WHERE username=$1;', [player.name, player.trackedData], function(err, res) {if (err) console.log(err);});
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[player.id];
        io.emit('deleteplayer', player.id);
        console.log('Player "' + player.name + '" has disconnected.');
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
        if (cred.usrname.length > 64) {
            socket.emit('disconnected');
        }
        var filecred = await getCredentials(cred.usrname);
        if (filecred == false) {
            socket.emit('loginFailed', 'invalidusrname');
            console.log('Player could not login. Reason:USER_NOT_FOUND');
        } else if (filecred.psword == cred.psword) {
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
                if (cred.usrname == 'null') {
                    player.color = "#FFFFFF00";
                    player.name = '';
                }
                database.query('SELECT username, data FROM users', function(err, res) {
                    if (err) stop(err);
                    try {
                        for (var i in res.rows) {
                            if (res.rows[i].username == cred.usrname) {
                                player.trackedData = res.rows[i].data;
                            }
                        }
                    } catch (err) {
                        stop(err);
                    }
                });
                socket.emit('inittrackedData', player.trackedData);
                socket.emit('loginConfirmed', 'login');
                console.log('Player with username "' + player.name + '" logged in.');
            }

        } else {
            socket.emit('loginFailed', 'incorrect');
            console.log('Player could not login. Reason:INCORRECT_CREDENTIALS');
        }
    });
    socket.on('signup', async function(cred) {
        if (cred.usrname.length > 64) {
            socket.emit('disconnected');
        }
        var filecred = await getCredentials(cred.username);
        if (filecred != false) {
            socket.emit('loginFailed', 'usrexists');
            console.log('Player could not sign up. Reason:USER_EXISTS');
        } else if (cred.usrname.indexOf(' ') == 0 || cred.usrname.indexOf('\\') == 0 || cred.usrname.indexOf('"') == 0 || cred.psword.indexOf('\\') == 0 || cred.psword.indexOf('"') == 0) {
            socket.emit('disconnected');
        } else {
            player.name = cred.usrname;
            if (cred.usrname == 'null') {
                player.color = "#FFFFFF00";
                player.name = '';
            }
            socket.emit('loginConfirmed', 'signup');
            writeCredentials(cred.usrname, cred.psword, player.trackedData);
            console.log('Player "' + cred.usrname + '" signed up.');
            
        }
    });
    socket.on('deleteAccount', async function(cred) {
        if (cred.usrname.length > 64) {
            socket.emit('disconnected');
        }
        var filecred = await getCredentials(cred.usrname);
        if (filecred == false) {
            socket.emit('disconnected');
            console.error('Error: Could not delete account. Reason:USER_NOT_FOUND');
        } else if (filecred.psword == cred.psword) {
            deleteCredentials(cred.usrname);
            console.log('Player with username "' + player.name + '" deleted their account.');
            socket.emit('disconnected');
        } else {
            socket.emit('disconnected');
            console.log('something')
        }
    });
    socket.on('changePassword', async function(cred) {
        deleteCredentials(cred.usrname);
        writeCredentials(cred.usrname, cred.psword);
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
            console.log('"' + player.name + '" was not able to join; Reason: Game_Full');
            //socket.emit('game-joined');
        } else if (round.inProgress == false) {
            player.ingame = true;
            player.respawn(MAPS[0].spawns[0].x, MAPS[0].spawns[0].y);
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
            if (localachievement.id == 'Debug' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                console.log('Player "' + player.name + '" got the achievement "' + localachievement.name + '"!');
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
    if (j < 1 && gameinProgress) {
        endRound();
        endGame(null);
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
    } else if (input=='disconnect') {
        io.emit('disconnected');
        console.log('Clients disconnected.');
    } else {
        try {
            var command = Function('return (' + input + ')')();
            command;
            console.log('Successfully ran command.');
        } catch (err) {
            console.error('Error: "' + input + '" is not a valid input.\n');
            console.error(err);
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
function stop(err) {
    if (err) {
        console.error('\nFATAL ERROR:');
        console.error(err);
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
                process.exit();
            });
        });
    });
}