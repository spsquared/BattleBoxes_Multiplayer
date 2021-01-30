// start server
console.log('\nThis server is running BattleBoxes Server v-0.2.1\n');
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

/*
function setup() {
    prompt.question('Enter the port you want the server to listen to:\n> ', (answer) => {
        if (answer>0 && answer<65536) {
            port = answer;
            server.listen(port);
            console.log('Server started, listening to port ' + port + '.\nTo play, enter your computers name followed by a ":" and then "' + port + '" in the browser. You can find your computers name by going into the "about" settings in the Windows settings.\n\n------------------------------------------------------------------\n');
        } else {
            console.error('Error: Invalid port');
            setup();
        }
    });
}
setup();
*/
var SOCKET_LIST = {};
var PLAYER_LIST = {};

// player code
var Player = function(id) {
    var self = {
        x:200,
        y:500,
        id:id,
        name:null,
        ingame:false,
        Wpressed:false,
        Apressed:false,
        Dpressed:false,
        Clicked:false,
        xspeed:0,
        yspeed:0
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
        self.x *= 0.9;
        if (self.y > 500) {
            self.y=500;
            self.yspeed=0;
        }
    }
    return self;
}

// enable connection
var io = require('socket.io') (server, {});
io.on('connection', function(socket) {
    socket.emit('init');
    socket.emit('getID');
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
    console.log('Client connection made. Waiting for login...');

    // connection handlers
    socket.on('disconnect', function() {
        console.log('Player "' + PLAYER_LIST[socket.id].name + '" has disconnected. Player id is ' + socket.id + '.');
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
    socket.on('timeout', function() {
        console.log('Player "' + PLAYER_LIST[socket.id].name + '" timed out. Socket id is ' + socket.id + '.');
        socket.disconnect();
    });
    socket.on('disconnectclient', function() {
        socket.emit('disconnected');
        socket.disconnect();
    });

    //login handlers
    socket.on('login', function(cred) {
        console.log('Client with username "' + cred.usrname + '" and password "' + cred.psword + '" attempted to login. Client ID is ' + socket.id + '.');
        PLAYER_LIST[socket.id].name = cred.usrname
    });

    // game handlers
    socket.on('join-game', function() {
        console.log('Player "' + PLAYER_LIST[socket.id].name + '" attempted to join game.');
        player.ingame = true;
        socket.emit('game-joined');
    });
    socket.on('keyPress', function(key) {
        if (key.key == 'W') {player.Wpressed = key.state;}
        if (key.key == 'A') {player.Apressed = key.state;}
        if (key.key == 'D') {player.Dpressed = key.state;}
    });
});

// Server-side tps
setInterval(function() {
    var pack = [];
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        if (localplayer.ingame) {localplayer.updatePos();}
        pack.push({x:localplayer.x, y:localplayer.y, name:PLAYER_LIST[localplayer.id].name});
    }
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