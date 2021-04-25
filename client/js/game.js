// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript("/client/js/entity.js");
$.getScript("/client/js/menu.js");
PLAYER_LIST = {};
BULLET_LIST = {};
player = null;
game = document.getElementById('gameCanvas').getContext('2d');
map = new Image();
map.width = 0;
map.height = 0;
camera = {x:0, y:0, w:window.innerWidth/2, h:window.innerHeight/2};
var currentmusic = 1;
var fpsCounter = 0;
var fps = 0;
var mouseX;
var mouseY;
var shooting = false;
var ingame;
var inmenu;
var consoleAccess = false;
var connected = 0;

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
        game.clearRect(0, 0, window.innerWidth, window.innerHeight);
        drawMap();
        updateCamera();
        if (player.debug) {
            for (var i in pkg) {
                if (pkg[i].id == player.id) {
                    drawDebug(pkg[i].debug);
                }
            }
        }
        Bullet.update();
        Player.update(pkg);
        player = PLAYER_LIST[player.id];
        connected = 0;
        fpsCounter++;
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
function drawDebug(debugInfo) {
    game.fillStyle = "#FFFFFF88";
    game.fillRect(4, 4, 380, 48);
    game.fillRect((window.innerWidth - 94), 4, 90, 32)
    game.fillStyle = "#000000";
    game.font = '16px Pixel';
    game.textAlign = "left";
    game.fillText("(x:" + (Math.round(player.x)/40) + ", y:" + (Math.round(player.y)/40) + ")", 8, 24);
    game.fillText("(x:" + (Math.floor(player.x/40)) + ", y:" + (Math.floor(player.y/40)) + ")", 172, 24);
    game.fillText("^x:" + Math.round(debugInfo.xspeed) + ", ^y:" + Math.round(debugInfo.yspeed), 270, 24);
    game.fillText("(x:" + (Math.round(mouseX)/40) + ", y:" + (Math.round(mouseY)/40) + ")", 8, 48);
    game.fillText("Angle:" + (Math.round((Math.atan2(-(player.y-mouseY-16), -(player.x-mouseX))*180)/Math.PI)),176, 48);
    game.font = '24px Pixel';
    game.textAlign = "right";
    game.fillText("TPS:" + fps, (window.innerWidth-8), 32);
    var tempx = (Math.floor(player.relx/40)*40);
    var tempy = (Math.floor(player.rely/40)*40);
    if (debugInfo.colliding.bottom) {
        game.strokeStyle = "FF9900";
    } else {
        game.strokeStyle = "000000";
    }
    game.moveTo(tempx, tempy+40);
    game.lineTo(tempx+40, tempy+40);
    //game.stroke();
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
                socket.emit('keyPress', {key:'W', state:false});
                socket.emit('keyPress', {key:'A', state:false});
                socket.emit('keyPress', {key:'D', state:false});
                inmenu = true;
            }
            
        }
        if (event.code == 'Backslash') {
            if (PLAYER_LIST[player.id].debug) {
                socket.emit('debug');
                PLAYER_LIST[player.id].debug = false;
                document.getElementById('versionLabel').style.top = '0px';
            } else {
                socket.emit('debug');
                PLAYER_LIST[player.id].debug = true;
                document.getElementById('versionLabel').style.top = '28px';
            }
            //socket.emit('debug');
        }
    }
}
document.onmousemove = function(event) {
    mouseX = camera.x+event.clientX;
    mouseY = camera.y+event.clientY;
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

// fps counter
setInterval(function() {
    fps = fpsCounter;
    fpsCounter = 0;
}, 1000);

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

// console access
consoleAccess = URLSearchParams(window.location.search).get('console');
console.log(consoleAccess)