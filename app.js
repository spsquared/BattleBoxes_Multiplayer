// Copyright (C) 2021 Radioactive64
// Go to README.md for more information

console.warn('\nBattleBoxes Multiplayer Server v-0.5.0 Copyright (C) 2021 Radioactive64\nFull license can be found in LICENSE or https://www.gnu.org/licenses/.\n-----------------------------------------------------------------------');
// start server

console.log('\nThis server is running BattleBoxes Server v-0.5.0\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
const lineReader = require('line-reader');
const { createDecipher } = require('crypto');
require('./server/entity.js');
require('./server/game.js');

    //   dbo.createCollection("users", function(err, res) {if (err) throw err;});
   
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
function getMap(name, id) {
    var data1 = require('./server/' + name);
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
getMap('Lobby.json', 0);
getMap('Map1.json', 1);
getMap('Map2.json', 2);
CURRENT_MAP = 0;
var SOCKET_LIST = {};

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
        console.log('Player ' + player.name + ' has disconnected. Player id is ' + socket.id + '.');
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
        console.log('Player ' + player.name + ' timed out.');
        socket.disconnect();
    });
    socket.on('disconnectclient', function() {
        socket.emit('disconnected');
        socket.disconnect();
    });
    //login handlers
    socket.on('login', function(cred) {
        
        player.name = cred.usrname;
        var correct = false;
        fs.readFile('./users.txt','utf-8', function read(err, data) {
            if (err) {
                throw err;
            }
            
            for(i of data.split('|')){
                var UP = i.split("??")

                if(cred.usrname == UP[0] && cred.psword == UP[1]){
                    console.log(UP[0], cred.usrname)
                    console.log(UP[1], cred.psword)
                    socket.emit('login-approved', {correct: true})
                    

                } 
            }
           
           
        });
        if (correct){
            socket.emit('login-approved', {correct: true})
        } else{
            socket.emit('login-approved', {correct: false})
        }

        
        
        
        console.log('Player with username "' + player.name + '" attempted to login. Client ID is ' + socket.id + '.');
        if (cred.usrname.length > 64) {
            socket.emit('disconnected');
        }
    });
    

    // game handlers
    var users;
    var userstring;
    socket.on('signup', function(cred) {
        fs.readFile('users.txt', 'utf8', function (err, data) {
            fs.writeFile('users.txt', data+"|"+cred.username+"??"+cred.password, function(err, result) {
               if(err) console.log('error', err);
             });
           });
        
        
        

    });
    socket.on('join-game', function() {
        console.log('Player ' + player.name + ' attempted to join game.');
        var j = 0;
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame) {
                j++;
            }
        }
        if (j > 15) {
            socket.emit('gamefull');
            console.log(player.name + 'was not able to join; Reason: Game_Full');
            //socket.emit('game-joined');
        } else if (round.inProgress == false) {
            player.ingame = true;
            remainingPlayers++;
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
            socket.emit('map', CURRENT_MAP);
            socket.emit('game-joined');
        } else {
            socket.emit('gamerunning');
            console.log(player.name + 'was not able to join; Reason: Game_Started');
        }
    });
    socket.on('keyPress', function(key) {
        if (key.key == 'W') {player.Wpressed = key.state;}
        if (key.key == 'A') {player.Apressed = key.state;}
        if (key.key == 'D') {player.Dpressed = key.state;}
    });
    socket.on('ready', function() {
        playersready++;
    });
    socket.on('click', function(click) {
        if (click.button == 'left' && round.inProgress && player.alive) {
            if (player.lastclick > ((1000/player.maxCPS)/(1000/60))) {
                player.lastclick = 0;
                var localbullet = Bullet(click.x, click.y, player.x, player.y, player.id, player.color);
                var pack = {id:localbullet.id, x:localbullet.x, y:localbullet.y, angle:localbullet.angle, parent:localbullet.parent, color:localbullet.color};
                io.emit('newbullet', pack);
            }
        }
    });
    socket.on('debug', function() {
        player.debug = !player.debug;
    });
});
    

// server-side tps
setInterval(function() {
    Bullet.update();
    var pack = Player.update();
    io.emit('update', pack);
    var j = 0;
    for (var i in PLAYER_LIST) {
        if (PLAYER_LIST[i].ingame) {
            j++;
        }
    }
    if (playersready > (j-1) && playersready > 1) {
        startGame();
        playersready = 0;
    }
    if (j == 0) {
        endGame();
    }
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
        try {
            input;
        } catch(err) {
            console.error('Error: ' + input + ' is not a valid input.\n> ');
            console.log(err);
        }
    }
});
function queryStop(firstrun) {
    if (firstrun == true) {
        prompt.question('Are you sure you want to stop the server? y/n\n> ', function(answer) {
            if (answer == 'y') {
                console.log('Closing server...');
                endGame();
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
                endGame();
                io.emit('disconnected');
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
