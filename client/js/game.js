// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript("/client/js/entity.js");
$.getScript("/client/js/menu.js");
var game = document.getElementById('gameCanvas').getContext('2d');
game.font = '32px Pixel';
var map = new Image();
map.width = 0;
map.height = 0;
var currentmusic = 1;
var connected = 0;
var mouseX;
var mouseY;
var shooting = false;
var ingame;
var inmenu;

// canvas resizing
window.onresize = function() {
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight - 1;
    camera.w = window.innerWidth/2;
    camera.h = window.innerHeight/2;
}

// game handlers
socket.on('game-joined', function(id) {
    map.src = '/client/img/map' + id + '.png';
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    music.src = ("Ingame_" + currentmusic);
    ingame = true;
});
socket.on('game-full', function() {
    document.getElementById('serverfull').style.display = 'block';
});

// draw game
socket.on('update', function(pkg) {
    if (ingame) {
        game.clearRect(0,0,window.innerWidth,window.innerHeight);
        drawMap();
        updateCamera();
        Bullet.update();
        Player.update(pkg);
        player = PLAYER_LIST[player.id];
        if (player.debug) {
            drawDebug();
        }
        connected = 0;
    }
});
function drawMap() {
    game.drawImage(map, -camera.x, -camera.y);
}
function updateCamera() {
    //collisions to move camera
    if ((camera.w/2) > (player.relx-16)) {
        camera.x -= (camera.w/2) - (player.relx-16);
    }
    if ((camera.w*(3/2)) < (player.relx+16)) {
        camera.x -= (camera.w*(3/2)) - (player.relx+16);
    }
    if ((camera.h/2) > (player.rely-16)) {
        camera.y -= (camera.h/2) - (player.rely-16);
    }
    if ((camera.h*(3/2)) < (player.rely+16)) {
        camera.y -= (camera.h*(3/2)) - (player.rely+16);
    }

}
function drawDebug() {
    game.fillStyle = "#000000";
    game.textAlign = "left";
    game.fillText("(x: " + (player.x/40) + ", y: " + (player.y/40) + ")", 8, 16);
}

// sound
//music.addEventListener('ended', function() {
//    currentmusic++;
//    if (currentmusic > 5) {
//        currentmusic = 1;
//    }
//    music.src = ("Ingame_" + currentmusic);
//    music.load();
//    music.play();
//});

// input sending

document.onkeydown = function(event) {
    if (ingame && !inmenu) {
        if (event.key == 'w' || event.key == 'W') {
            socket.emit('keyPress', {key:'W', state:true});
        }
        if (event.key == 'a' || event.key == 'A') {
            socket.emit('keyPress', {key:'A', state:true});
        }
        if (event.key == 'd' || event.key == 'D') {
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
        if (event.key == 'Escape') {
            if (inmenu) {
                document.getElementById('ingameMenu').style.display = 'none';
                inmenu = false;
            } else {
                document.getElementById('ingameMenu').style.display = 'inline-block';
                inmenu = true;
            }
            
        }
        if (event.code == 'Backslash') {
            if (PLAYER_LIST[player.id].debug) {
                PLAYER_LIST[player.id].debug = false;
            } else {
                PLAYER_LIST[player.id].debug = true;
            }
            //socket.emit('debug');
        }
    }
}
document.onmousedown = function(event) {
    mouseX = camera.x+event.clientX;
    mouseY = camera.y+event.clientY;
    if (ingame && !inmenu) {
        if (!shooting) {
            switch (event.button) {
                case 0:
                    socket.emit('click', {button:'left', x:mouseX, y:mouseY});
                    shooting = true; 
                case 2:
                    socket.emit('click', {button:'right'});
                    shooting = true;
            }
        }
    }
}

// waiting for server
setInterval(function() {
    if (ingame) {
        connected++;
        if (connected >= 10) {
            document.getElementById('loading').style.display = 'inline-block';
            document.getElementById('waiting').style.display = 'inline-block';
        } else {
            document.getElementById('loading').style.display = 'none';
            document.getElementById('waiting').style.display = 'none';
        }
    }
}, 1000/10);
