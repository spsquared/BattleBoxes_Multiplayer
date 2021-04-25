// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

console.warn("\nBattleBoxes Multiplayer Server v-0.4.2 Copyright (C) 2021 Radioactive64\nFull license can be found in LICENSE or https://www.gnu.org/licenses/.\n-----------------------------------------------------------------------");
// start server
console.log('\nThis server is running BattleBoxes Server v-0.4.2\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
const lineReader = require('line-reader');
require('./server/entity.js');
require('./server/game.js');
MAPS = [];
CURRENT_MAP = null;

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

var port;

// initialize
console.log('Starting server...');
fs.open('./server/PORTS.txt', 'a+', function(err) {
    if (err) throw err;
    lineReader.open('./server/PORTS.txt', function (err, reader) {
        if (err) throw err;
        reader.nextLine(function(err, line) {
            if (err) throw err;
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
var data1 = require('./server/Map1.json');
var data2 = [];
data2[0] = [];
data2.width = data1.width;
data2.height = data1.height;
data2.spawnx = data1.spawnx;
data2.spawny = data1.spawny;
var j = 0;
for (var i in data1.data) {
    data2[j][i-(j*data1.width)] = data1.data[i];
    if (i-(j*data1.width) > data1.width-2) {
        j++;
        data2[j] = [];
    }
}
MAPS[1] = data2;
var data1 = require('./server/Map2.json');
var data2 = [];
data2[0] = [];
data2.width = data1.width;
data2.height = data1.height;
data2.spawnx = data1.spawnx;
data2.spawny = data1.spawny;
var j = 0;
for (var i in data1.data) {
    data2[j][i-(j*data1.width)] = data1.data[i];
    if (i-(j*data1.width) > data1.width-2) {
        j++;
        data2[j] = [];
    }
}
MAPS[2] = data2;
var SOCKET_LIST = {};

// TEMP
if ((Math.floor(Math.random()*2)) == 1) {
    CURRENT_MAP = 1;
} else {
    CURRENT_MAP = 2;
}
// END TEMP

// enable connection
io = require('socket.io') (server, {});
io.on('connection', function(socket) {
    socket.emit('init');
    socket.id = Math.random();
    var player = Player();
    SOCKET_LIST[socket.id] = socket;
    console.log('Client connection made.');

    // connection handlers
    socket.on('disconnect', function() {
        console.log('Player "' + player.name + '" has disconnected. Player id is ' + socket.id + '.');
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[player.id];
        for (var i in COLORS[1]) {
            if (COLORS[0][i] == player.color) {
                COLORS[1][i] = 0;
            }
        }
        io.emit('deleteplayer', player.id);
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
    socket.on('login', function(cred) {
        player.name = cred.usrname;
        console.log('Player with username "' + player.name + '" attempted to login. Client ID is ' + socket.id + '.');
    });

    // game handlers
    socket.on('join-game', function() {
        console.log('Player "' + player.name + '" attempted to join game.');
        var j = 0;
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame) {
                j++;
            }
        }
        if (j > 15) {
            socket.emit('gamefull');
            console.log(player.name + 'was not able to join; Reason: Game_Full');
            socket.emit('game-joined');
        } else {
            player.ingame = true;
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
            // send new player to all clients
            var pack = {id:player.id, name:player.name, color:player.color};
            io.emit('newplayer', pack);
            console.log(player.name + ' joined the game.');
            socket.emit('game-joined', CURRENT_MAP);
        }
    });
    socket.on('keyPress', function(key) {
        if (key.key == 'W') {player.Wpressed = key.state;}
        if (key.key == 'A') {player.Apressed = key.state;}
        if (key.key == 'D') {player.Dpressed = key.state;}
    });
    socket.on('click', function(click) {
        if (click.button == 'left') {
            if (player.lastclick > ((1000/player.maxCPS)/(1000/60))) {
                player.lastclick = 0;
                var localbullet = Bullet(click.x, click.y, player.x, player.y, player.id, player.color);
                var pack = {id:localbullet.id, x:localbullet.x, y:localbullet.y, angle:localbullet.angle, parent:localbullet.parent, color:localbullet.color};
                io.emit('newbullet', pack);
            }
        }
    });
    socket.on('debug', function() {
        if (player.debug) {
            player.debug = false;
        } else {
            player.debug = true;
        }
    });
});
// server-side tps
setInterval(function() {
    Bullet.update();
    var pack = Player.update();
    io.emit('update', pack);
}, 1000/60);

// console interface
prompt.on('line', function(input) {
    if (input=='stop') {
        queryStop(true);
    } else if (input=='Purple') {
        console.log('Purple exception detected. Purpling...');
        console.log('---------------------------------------------------');
        io.emit('disconnected');
        fs.open('./server/PORTS.txt', 'a+', function(err) {
            lineReader.open('./server/PORTS.txt', function (err, reader) {
                if (err) throw err;
                reader.nextLine(function(err, line) {
                    if (err) throw err;
                    ports = parseInt(line)-1;
                    var portsstring = ports.toString();
                    fs.writeFileSync('./server/PORTS.txt', portsstring);
                });
            });
        });
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
        console.error('Error: ' + input + ' is not a valid input.\n> ');
    }
});
function queryStop(firstrun) {
    if (firstrun == true) {
        prompt.question('Are you sure you want to stop the server? y/n\n> ', function(answer) {
            if (answer == 'y') {
                console.log('Closing server...');
                io.emit('disconnected');
                console.log('Stopping server...');
                fs.open('./server/PORTS.txt', 'a+', function(err) {
                    lineReader.open('./server/PORTS.txt', function (err, reader) {
                        if (err) throw err;
                        reader.nextLine(function(err, line) {
                            if (err) throw err;
                            ports = parseInt(line)-1;
                            var portsstring = ports.toString();
                            fs.writeFileSync('./server/PORTS.txt', portsstring);
                            console.log('Server stopped.');
                            prompt.close();
                            process.exit(0);
                        });
                    });
                });
            } else if (answer == 'n') {
                console.log('Server stop cancelled.\n> ');
            } else {
                console.warn(answer + ' is not a valid answer.\n> ');
                queryStop(false);
            }
        });
    } else {
        prompt.question('Please enter y or n.\n> ', function(answer) {
            if (answer == 'y') {
                console.log('Closing server...');
                // request for positions of players
                io.emit('disconnected');
                console.log('Saving players and projectiles...');
                // save positions, health, velocity of projectiles and players
                console.log('Stopping server...');
                fs.open('./server/PORTS.txt', 'a+', function(err) {
                    if (err) throw err;
                    lineReader.open('./server/PORTS.txt', function (err, reader) {
                        if (err) throw err;
                        reader.nextLine(function(err, line) {
                            if (err) throw err;
                            ports = parseInt(line)-1;
                            var portsstring = ports.toString();
                            fs.writeFileSync('./server/PORTS.txt', portsstring);
                            console.log('Server stopped.');
                            prompt.close();
                            process.exit();
                        });
                    });
                });
            } else if (answer == 'n') {
                console.log('Server stop cancelled.\n> ');
            } else {
                console.warn(answer + ' is not a valid answer.\n> ');
                queryStop(false);
            }
        });
    }
}