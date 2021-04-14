$.ajaxSetup({cache: true});
$.getScript("/client/js/entity.js");
var game = document.getElementById('gameCanvas').getContext('2d');
var connected = 0;
var mouseX;
var mouseY;
var ingame;

socket.on('game-joined', function(data) {
    document.getElementById('gameCanvas').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('gameCanvas').onmousedown = firebullet;
    document.getElementById('gameCanvas').onmouseup = function() {shooting = false;};
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    ingame = true;
});

// game handlers
socket.on('newplayer', function(pkg) {
    var localplayer = Player(pkg.id, pkg.name, pkg.color);
    PLAYER_LIST[pkg.id] = localplayer;
    console.log(pkg.id);
});

// render game
socket.on('pkg', function(pkg) {
    game.clearRect(0,0,window.innerWidth,window.innerHeight);
    Player.update(pkg.players);
    for (var i = 0; i < pkg.bullets.length; i++) {
        game.fillRect(pkg.bullets[i].x-2, pkg.bullets[i].y-2,4,4);
    }
    connected = 0;
});

// input sending
var shooting = false;
document.onkeydown = function(event) {
    if (ingame) {
        if (event.key == 'w') {
            socket.emit('keyPress', {key:'W', state:true});
        }
        if (event.key == 'a') {
            socket.emit('keyPress', {key:'A', state:true});
        }
        if (event.key == 'd') {
            socket.emit('keyPress', {key:'D', state:true});
        }
    }
}
document.onkeyup = function(event) {
    if (ingame) {
        if (event.key == 'w') {
            socket.emit('keyPress', {key:'W', state:false});
        }
        if (event.key == 'a') {
            socket.emit('keyPress', {key:'A', state:false});
        }
        if (event.key == 'd') {
            socket.emit('keyPress', {key:'D', state:false});
        }
    }
}
document.onmousemove = function(event) {mouseX = event.clientX; mouseY = event.clientY;}
firebullet = function(event) {
    if (ingame) {
        if (!shooting) {
            switch (event.which) {
                case 1:
                    console.log('click');
                    socket.emit('click', {button:'left', x:mouseX, y:mouseY});
                    shooting = true; 
                case 3:
                    socket.emit('click', {button:'right'});
                    shooting = true;
            }
        }
    }
}

// waiting for server
setInterval(function() {
    connected++;
    if (connected >= 10) {
        document.getElementById('loading').style.display = 'inline-block';
        document.getElementById('waiting').style.display = 'inline-block';
    } else {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('waiting').style.display = 'none';
    }
}, 1000/10);
