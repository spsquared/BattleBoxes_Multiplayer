// start server
console.log('\nThis server is running BattleBoxes Server v-0.3.2\n');
const express = require('express');
const app = express();
const server = require('http').Server(app);
const os = require('os');
const fs = require('fs');
const readline = require('readline');
const prompt = readline.createInterface({input: process.stdin, output: process.stdout});
const lineReader = require('line-reader');

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

var port;

// initialize
fs.open('./server/PORTS.txt', 'a+', function(err) {
    if (err) throw err;
    lineReader.open('./server/PORTS.txt', function (err, reader) {
        if (err) throw err;
        reader.nextLine(function(err, line) {
            if (err) throw err;
            if (line >=100) {
                console.warn('\n------------------------------------------------------------------------------------------------------\nWARNING: YOU HAVE OVER 100 INSTANCES RUNNING. THIS MAY CAUSE ISSUES. STOPPING...\n------------------------------------------------------------------------------------------------------\n');
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

var SOCKET_LIST = {};
var PLAYER_LIST = {};
var BULLET_LIST = {};
var COLORS = ["#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF", "#9900FF", "#FF00FF", "#000000", "#AA0000", "#996600", "#EECC33", "#00AA00", "#0088CC", "#8877CC", "#CC77AA"];

// entity
var Entity = function() {
    var self = {
        x:0,
        y:0,
        xspeed:0,
        yspeed:0,
        id:"",
        color:"#000000"
    }

    self.update = function() {
        self.updatePos();
    }
    self.updatePos = function() {
        self.x += self.xspeed;
        self.y += self.yspeed;
    }

    return self;
}

// player
var Player = function(id, name) {
    var self = Entity();
    self.id = id;
    self.name = name;
    self.ingame = false;
    Wpressed = false;
    Apressed = false;
    Dpressed = false;
    Clicked = false;
    self.hp = 5;
    self.score = 0;
    PLAYER_LIST[self.id] = self;
    var j = 0;
    for (i in PLAYER_LIST) {
        self.color = COLORS[j];
        j++;
    }

    self.updatePos = function() {
        if (self.Dpressed) {
            self.xspeed += 2;
        }
        if (self.Apressed) {
            self.xspeed -= 2;
        }
        if (self.Wpressed) {
            //collisions
            self.yspeed = 10;
        }
        self.x += self.xspeed;
        self.y -= self.yspeed;
        self.yspeed -= 1;
        self.xspeed *= 0.9;
        if (self.y > 600) {
            self.y=600;
            self.yspeed=0;
        }
    }
    self.respawn = function() {
        self.xspeed = 0;
        self.yspeed = 0;
    }

    return self;
}
Player.update = function() {
    var pack = [];
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        if (localplayer.ingame) {
            localplayer.update();
            pack.push({id:localplayer.id, x:localplayer.x, y:localplayer.y, name:localplayer.name, hp:localplayer.hp, score:localplayer.score});
        }
    }
    return pack;
}

// bullets
var Bullet = function(mousex, mousey, x, y, parent, color) {
    var self = Entity();
    self.id = Math.random();
    self.x = x;
    self.y = y;
    self.angle = Math.atan2(-(self.y-mousey-16), -(self.x-mousex-16));
    self.xspeed = Math.cos(self.angle)*20;
    self.yspeed = Math.sin(self.angle)*20;
    self.todelete = false;
    self.parent = parent;
    self.color = color;
    BULLET_LIST[self.id] = self;

    return self;
}
Bullet.update = function() {
    var pack = [];
    for (var i in BULLET_LIST) {
        var localbullet = BULLET_LIST[i];
        localbullet.updatePos();
        if (Bullet.todelete) {
            delete BULLET_LIST[i];
            socket.emit('deletebullet', localbullet.id);
        }
    }
    return pack;
}

// enable connection
var io = require('socket.io') (server, {});
io.on('connection', function(socket) {
    socket.emit('init');
    socket.emit('getID');
    socket.id = Math.random();
    var player = Player(socket.id, null, null);
    SOCKET_LIST[socket.id] = socket;
    console.log('Client connection made. Waiting for login...');

    // connection handlers
    socket.on('disconnect', function() {
        console.log('Player "' + player.name + '" has disconnected. Player id is ' + socket.id + '.');
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[player.id];
        for (var i in SOCKET_LIST) {
            var localsocket = SOCKET_LIST[i];
            localsocket.emit('deleteplayer', player.id);
        }
    });
    socket.on('timeout', function() {
        console.log('Player "' + player.name + '" timed out. Socket id is ' + socket.id + '.');
        socket.disconnect();
    });
    socket.on('disconnectclient', function() {
        socket.emit('disconnected');
        socket.disconnect();
    });

    //login handlers
    socket.on('login', function(cred) {
        player.name = cred.usrname;
        console.log('Client with username "' + player.name + '" attempted to login. Client ID is ' + socket.id + '.');
    });

    // game handlers
    socket.on('join-game', function() {
        console.log('Player "' + player.name + '" attempted to join game.');
        var j = 0;
        for (var i in PLAYER_LIST) {j++;}
        if (j > 15) {
            socket.emit('gamefull');
            console.log(player.name + 'was not able to join, Reason: Game_Full');
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
            pack = {players:players, bullets:bullets};
            socket.emit('initgame', pack);
            // send new player to all clients
            var pack = {id:player.id, name:player.name, color:player.color};
            for (var i in SOCKET_LIST) {
                var localsocket = SOCKET_LIST[i];
                localsocket.emit('newplayer', pack);
            }
            console.log(player.name + 'joined the game.')
            socket.emit('game-joined');
        }
    });
    socket.on('keyPress', function(key) {
        if (key.key == 'W') {player.Wpressed = key.state;}
        if (key.key == 'A') {player.Apressed = key.state;}
        if (key.key == 'D') {player.Dpressed = key.state;}
    });
    socket.on('click', function(click) {
        if (click.button == 'left') {
            var localbullet = Bullet(click.x, click.y, player.x, player.y, player.id, player.color);
            var pack = {id:localbullet.id, x:localbullet.x, y:localbullet.y, angle:localbullet.angle, parent:localbullet.parent, color:localbullet.color};
            for (var i in SOCKET_LIST) {
                var localsocket = SOCKET_LIST[i];
                localsocket.emit('newbullet', pack);
            }
        }
    });
});

// Server-side tps
setInterval(function() {
    var pack = Player.update();
    for (var i in SOCKET_LIST) {
        var localsocket = SOCKET_LIST[i];
        localsocket.emit('pkg', pack);
    }
}, 1000/30);

// Stop server code
prompt.on('line', (input) => {
    if (input=='stop') {
        queryStop(true);
    } else if (input=='Purple') {
        console.log('Purple exception detected. Purpling...')
        console.log('---------------------------------------------------');
        setTimeout(function() {}, 1000/20);
        while (true) {
            console.log('purple');
            console.warn('purple');
            console.error('purple');
        }
    } else if (input=='disconnect') {
        for (var i in SOCKET_LIST) {
            var localsocket = SOCKET_LIST[i];
            localsocket.emit('disconnected');
        }
        console.log('Clients disconnected');
    } else {
        console.error('Error: ' + input + ' is not a valid input.');
    }
});
function queryStop(firstrun) {
    if (firstrun==true) {
        prompt.question('\nAre you sure you want to stop the server? y/n\n> ', (answer) => {
            if (answer=='y') {
                console.log('Closing server...');
                // request for positions of players
                io.emit('disconnected');
                console.log('Saving players and projectiles...');
                // save positions, health, velocity of projectiles and players
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
                            process.exit();
                        });
                    });
                });
            } else if (answer=='n') {
                console.log('Server stop cancelled.\n');
            } else {
                console.warn(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    } else {
        prompt.question('Please enter y or n.\n> ', (answer) => {
            if (answer=='y') {
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
                            process.exit();
                        });
                    });
                });
            } else if (answer=='n') {
                console.log('Server stop cancelled.\n');
            } else {
                console.warn(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    }
}