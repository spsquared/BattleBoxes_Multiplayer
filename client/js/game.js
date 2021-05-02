// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript('/client/js/index.js');
$.getScript('/client/js/entity.js');
$.getScript('/client/js/menu.js');
game = document.getElementById('gameCanvas').getContext('2d');
PLAYER_LIST = {};
BULLET_LIST = {};
player = null;
map = new Image();
map.width = 0;
map.height = 0;
camera = {x:0, y:0, w:window.innerWidth/2, h:window.innerHeight/2};
var mouseX;
var mouseY;
var shooting = false;
var ingame;
var inmenu;
var canmove = false;
var consoleAccess = false;
var connected = 0;
var readyforstart = false;

// game handlers
socket.on('game-joined', function() {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('gameCanvas').style.display = 'block';
    ingame = true;
    canmove = true;
    fadeOut();
});
socket.on('gamefull', function() {
    document.getElementById('serverfull').style.display = 'block';
});
socket.on('gamerunning', function() {
    document.getElementById('gamelocked').style.display = 'block';
});
socket.on('map', function(id) {
    if (id == 0) {
        map.src = '/client/img/Lobby.png';
    } else {
        map.src = '/client/img/map' + id + '.png';
    }
});
socket.on('gamestart', function() {
    document.getElementById('ready').style.display = 'none';
});
socket.on('roundstart', function() {
    if (ingame) {
        fadeOut();
        setTimeout(function() {
            canmove = true;
        }, 3000);
        sfx[0].src = '/client/sound/Countdown.mp3';
        sfx[0].play();
    }
});
socket.on('roundend', function() {
    if (ingame) {
        fadeIn();
    }
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
};
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

};
function drawDebug(debugInfo) {
    game.fillStyle = '#FFFFFF88';
    game.fillRect(4, 4, 380, 48);
    game.fillRect((window.innerWidth - 94), 4, 90, 32)
    game.fillStyle = '#000000';
    game.font = '16px Pixel';
    game.textAlign = 'left';
    game.fillText('(x:' + (Math.round(player.x)/40) + ', y:' + (Math.round(player.y)/40) + ')', 8, 24);
    game.fillText('(x:' + (Math.floor(player.x/40)) + ', y:' + (Math.floor(player.y/40)) + ')', 172, 24);
    game.fillText('^x:' + Math.round(debugInfo.xspeed) + ', ^y:' + Math.round(debugInfo.yspeed), 270, 24);
    game.fillText('(x:' + (Math.round(mouseX)/40) + ', y:' + (Math.round(mouseY)/40) + ')', 8, 48);
    game.fillText('Angle:' + (Math.round((Math.atan2(-(player.y-mouseY-16), -(player.x-mouseX))*180)/Math.PI)),176, 48);
    game.font = '24px Pixel';
    game.textAlign = 'right';
    game.fillText('TPS:' + fps, (window.innerWidth-8), 32);
    var tempx = (Math.floor(player.relx/40)*40);
    var tempy = (Math.floor(player.rely/40)*40);
    if (debugInfo.colliding.bottom) {
        game.strokeStyle = 'FF9900';
    } else {
        game.strokeStyle = '000000';
    }
    game.moveTo(tempx, tempy+40);
    game.lineTo(tempx+40, tempy+40);
    //game.stroke();
};

// input sending
document.onkeydown = function(event) {
    if (ingame && !inmenu && player.alive && canmove) {
        if (event.key == 'w' || event.key == 'W' || event.key == 'ArrowUp') {
            socket.emit('keyPress', {key:'W', state:true});
        }
        if (event.key == 'a' || event.key == 'A' || event.key == 'ArrowLeft') {
            socket.emit('keyPress', {key:'A', state:true});
        }
        if (event.key == 'd' || event.key == 'D' || event.key == 'ArrowRight') {
            socket.emit('keyPress', {key:'D', state:true});
        }
    }
};
document.onkeyup = function(event) {
    if (ingame) {
        if (event.key == 'w' || event.key == 'W' || event.key == 'ArrowUp') {
            socket.emit('keyPress', {key:'W', state:false});
        }
        if (event.key == 'a' || event.key == 'A' || event.key == 'ArrowLeft') {
            socket.emit('keyPress', {key:'A', state:false});
        }
        if (event.key == 'd' || event.key == 'D' || event.key == 'ArrowRight') {
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
            player.debug = !player.debug;
            socket.emit('debug');
            if (PLAYER_LIST[player.id].debug) {
                document.getElementById('versionLabel').style.top = '0px';
            } else {
                document.getElementById('versionLabel').style.top = '28px';
            }
            //socket.emit('debug');
        }
    }
};
document.onmousemove = function(event) {
    mouseX = camera.x+event.clientX;
    mouseY = camera.y+event.clientY;
};
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
};

// game functions
function fadeIn() {
    canmove = false;
    var fadeAmount = 0;
    var audiofade = (settings.musicvolume*settings.globalvolume);
    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('fade').style.display = 'block';
    var fadeInterval = setInterval(function() {
        fadeAmount += 0.01;
        audiofade -= (settings.musicvolume/100);
        if (fadeAmount > 1) {
            clearInterval(fadeInterval);
            document.getElementById('loading').style.display = 'inline-block';
        }
        document.getElementById('fade').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 1);
};
function fadeOut() {
    var fadeAmount = 1;
    var audiofade = 0;
    var fadeInterval = setInterval(function() {
        fadeAmount -= 0.01;
        audiofade += ((settings.musicvolume*settings.globalvolume)/100);
        if (fadeAmount < 0) {
            clearInterval(fadeInterval);
            document.getElementById('loadingContainer').style.display = 'none';
            document.getElementById('fade').style.display = 'none';
            document.getElementById('loading').style.display = 'none';
        }
        document.getElementById('fade').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 1);
};
function ready() {
    if (!readyforstart) {
        socket.emit('ready');
        var fadeAmount = 1;
        var fadeInterval = setInterval(function() {
            fadeAmount -= 0.01;
            document.getElementById('ready').style.opacity = fadeAmount;
            if (fadeAmount < 0.5) {
                clearInterval(fadeInterval);
            }
        }, 1); 
        readyforstart = true;
    }
};

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