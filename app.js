// start server
var express = require('express');
var app = express();
var server = require('http').Server(app);

app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

server.listen(2000);
console.log('Server started, listening to port 2000.\n');

var SOCKET_LIST = {};

// enable connection
var io = require('socket.io') (server, {});
io.on('connection', function(socket) {
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
