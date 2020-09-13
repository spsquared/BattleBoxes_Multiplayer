// start server
console.log('\nThis server is running BattleBoxes Server v-0.1.1');
const { time } = require('console');
var express = require('express');
const { abort } = require('process');
var app = express();
var server = require('http').Server(app);
const readline = require('readline');
const prompt = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

app.get('/', function(req, res) {res.sendFile(__dirname + '/client/index.html');});
app.use('/client',express.static(__dirname + '/client'));

server.listen(2000);
console.log('Server started, listening to port 2000.\n');

var SOCKET_LIST = {};

// enable connection
var io = require('socket.io') (server, {});
io.on('connection', function(socket) {
    socket.emit('init');
    socket.emit('getID');
    socket.id = Math.random();
    console.log('Client connection made. Waiting for login...\n');

    // connection handlers
    socket.on('disconnect', function() {
        console.log('Client disconnected.\n');
    });
    socket.on('timeout', function() {
        console.log('socket ' + socket.id + 'timed out.')
        socket.disconnect();
    })
    socket.on('disconnectclient', function(data) {
        socket.emit('disconnected');
        console.log('Client ' + data.id + ' has disconnected.');
        socket.disconnect();
    });

    //login handlers
    socket.on('login', function(data) {
        console.log('Client with username "' + data.usrname + '" and password "' + data.psword + '" attempted to login.');
        console.log('Client ID is ' + data.usrname + '.\n');
        SOCKET_LIST[socket.id] = data.id;
    });

    // game handlers
    socket.on('join-game',function(data) {
        console.log('Player ' + data.id + ' attempted to join game.\n');
        socket.emit('game joined', {pos: 'position'});
    });
});

// Server-side tps
setInterval(function() {
    for (var i in SOCKET_LIST) {
        var socket = SOCKET_LIST[i]
    }
}, 1000/20);

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
    } else {
        console.error('Error: ' + input + ' is not a valid input.\n');
    }
});
function queryStop(firstrun) {
    if (firstrun==true) {
        prompt.question('\nAre you sure you want to stop the server? y/n\n', (answer) => {
            if (answer=='y') {
                console.log('\nClosing server...');
                // request for velocity and positions of players
                io.emit('disconnected');
                // disconnect all players
                console.log('Saving players and bullets...');
                // save positions, health, velocity of bullets and players
                console.log('Stopping server...');
                console.log('Server stopped.');
                process.exit();
            } else if (answer=='n') {
                console.log('Server stop cancelled.\n');
            } else {
                console.warn(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    } else {
        prompt.question('Please enter y or n.\n', (answer) => {
            if (answer=='y') {
                console.log('Closing server...');
                // request for velocity and positions of players
                io.emit('disconnected');
                // disconnect all players
                console.log('Saving players and bullets...');
                // save positions, health, velocity of bullets and players
                console.log('Stopping server...');
                console.log('Server stopped.');
                process.exit();
            } else if (answer=='n') {
                console.log('Server stop cancelled.\n');
            } else {
                console.warn(answer + ' is not a valid answer.');
                queryStop(false);
            }
        });
    }
}