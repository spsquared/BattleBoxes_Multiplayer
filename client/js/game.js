// Copyright (C) 2021 Radioactive64

MAPS = [];
CURRENT_MAP = 0;
TRACKED_DATA = {kills:0, deaths:0, wins:0};
ACHIEVEMENTS = [];
BANNERS = [];
var mouseX;
var mouseY;
var shooting = false;
var ingame = false;
var inmenu = false;
var inchat = false;
var canmove = false;
var connected = 0;
var readyforstart = false;
var countdowntext = {text:'', color:'', size:''};
var loaded = false;
var waitingforserver = false;
drawInterval = null;

// update game
socket.on('update', function(pkg) {
    if (ingame) {
        DEBUG_INFO = pkg;
        Player.update(pkg);
        Bullet.update();
        tpsCounter++;
        lastDate = Date.now();
        socket.emit('ping');
        connected = 0;
    }
});

// draw game
function resetFPS() {
    clearInterval(drawInterval);
    drawInterval = setInterval(function() {
        if (ingame) {
            game.clearRect(0, 0, window.innerWidth, window.innerHeight);
            drawMap();
            if (player.debug) {
                for (var i in DEBUG_INFO) {
                    if (DEBUG_INFO[i].id == player.id) {
                        drawDebug(DEBUG_INFO[i], true);
                    } else {
                        drawDebug(DEBUG_INFO[i], false);
                    }
                }
            }
            updateCamera();
            HCBBM();
            Player.draw();
            Bullet.draw();
            drawCountdown();
            drawBanners();
            fpsCounter++;
        }
    }, 1000/settings.fps);
}
function drawMap() {
    game.drawImage(MAPS[CURRENT_MAP], -camera.x, -camera.y, MAPS[CURRENT_MAP].width, MAPS[CURRENT_MAP].height);
}
function updateCamera() {
    // collisions to move camera
    if ((camera.x+(camera.width/2)) > (player.x-16)) {
        camera.x -= (camera.x+(camera.width/2)) - (player.x-16);
    }
    if ((camera.x+(camera.width*(3/2))) < (player.x+16)) {
        camera.x -= (camera.x+(camera.width*(3/2))) - (player.x+16);
    }
    if ((camera.y+(camera.height/2)) > (player.y-16)) {
        camera.y -= (camera.y+(camera.height/2)) - (player.y-16);
    }
    if ((camera.y+(camera.height*(3/2))) < (player.y+16)) {
        camera.y -= (camera.y+(camera.height*(3/2))) - (player.y+16);
    }
    if (camera.x < 0) {
        camera.x = 0;
    }
    if (camera.y < -200) {
        camera.y = -200;
    }
    if ((camera.x+(camera.width*2)) > MAPS[CURRENT_MAP].width) {
        camera.x = (MAPS[CURRENT_MAP].width-(camera.width*2));
    }
    if ((camera.y+(camera.height*2)) > MAPS[CURRENT_MAP].height) {
       camera.y = (MAPS[CURRENT_MAP].height-(camera.height*2));
    }
}
function drawDebug(data, isplayer) {
    if (isplayer) {
        // draw debug headers
        game.fillStyle = '#FFFFFF88';
        game.fillRect(4, 4, 380, 52);
        game.fillRect((window.innerWidth - 200), 4, 196, 70);
        game.fillStyle = '#000000';
        game.font = '16px Pixel';
        game.textAlign = 'left';
        game.fillText('(x:' + (Math.round(player.x)/40) + ', y:' + (Math.round(player.y)/40) + ')', 8, 24);
        game.fillText('(x:' + (Math.floor(player.x/40)) + ', y:' + (Math.floor(player.y/40)) + ')', 172, 24);
        game.fillText('^x:' + Math.round(data.debug.xspeed) + ', ^y:' + Math.round(data.debug.yspeed), 270, 24);
        game.fillText('(x:' + (Math.round(mouseX)/40) + ', y:' + (Math.round(mouseY)/40) + ')', 8, 48);
        game.fillText('Angle:' + (Math.round((Math.atan2(-(player.y-mouseY-16), -(player.x-mouseX))*180)/Math.PI)),176, 48);
        game.font = '24px Pixel';
        game.textAlign = 'right';
        game.fillText('FPS:' + fps, (window.innerWidth-112), 32);
        game.fillText('TPS:' + tps, (window.innerWidth-8), 32);
        game.fillText('Ping:' + ping + 'ms', (window.innerWidth-8), 64);
    }
    // draw collision debug
    game.beginPath();
    var tempx = ((Math.floor(data.x/40)*40)-camera.x);
    var tempy = ((Math.floor(data.y/40)*40)-camera.y);
    if (data.debug.colliding.bottom) {
        game.strokeStyle = '#FF0000';
    } else {
        game.strokeStyle = '#000000';
    }
    game.moveTo(tempx-1, tempy+40);
    game.lineTo(tempx+41, tempy+40);
    game.closePath();
    game.stroke();
    game.beginPath();
    if (data.debug.colliding.top) {
        game.strokeStyle = '#FF0000';
    } else {
        game.strokeStyle = '#000000';
    }
    game.moveTo(tempx-1, tempy);
    game.lineTo(tempx+41, tempy);
    game.closePath();
    game.stroke();
    game.beginPath();
    if (data.debug.colliding.left) {
        game.strokeStyle = '#FF0000';
    } else {
        game.strokeStyle = '#000000';
    }
    game.moveTo(tempx, tempy-1);
    game.lineTo(tempx, tempy+41);
    game.closePath();
    game.stroke();
    game.beginPath();
    if (data.debug.colliding.right) {
        game.strokeStyle = '#FF0000';
    } else {
        game.strokeStyle = '#000000';
    }
    game.moveTo(tempx+40, tempy-1);
    game.lineTo(tempx+40, tempy+41);
    game.closePath();
    game.stroke();
}
function drawCountdown() {
    game.textAlign = 'center';
    game.fillStyle = countdowntext.color;
    game.font = countdowntext.size + 'px Pixel';
    game.fillText(countdowntext.text, (window.innerWidth/2), ((window.innerHeight/2)+(countdowntext.size/2)-(window.innerHeight/10)));
    player = PLAYER_LIST[player.id];
}
socket.on('ping', function() {
    currentDate = Date.now();
    pingCounter = Math.floor(currentDate-lastDate);
});
function drawBanners() {
    for (var i in BANNERS) {
        BANNERS[i].update();
    }
}
// banner init
function Banner(topText, bottomText, color) {
    j = 0;
    for (var i in BANNERS) {
        j++;
    }
    var self = {id:Math.random(), v:-5, x:window.innerWidth, y:(j*64), top:topText, bottom:bottomText, color:color, todelete:false};

    var slidein = setInterval(function() {
        self.v += 0.031;
        self.x += self.v;
    }, 5);
    self.update = function() {
        game.fillStyle = '#222222';
        game.fillRect(self.x, self.y, 400, 60);
        game.fillStyle = '#FFFFFF';
        game.fillStyle = self.color;
        game.fillRect(self.x+4, self.y+4, 392, 52);
        game.fillStyle = '#000000';
        game.textAlign = 'left';
        game.font = '20px Pixel';
        game.fillText(self.top, self.x+8, self.y+28, 384);
        game.font = '16px Pixel';
        game.fillText(self.bottom, self.x+8, self.y+50, 384);
        if (self.x < (window.innerWidth-400)) {
            self.x = (window.innerWidth-400);
            if (!self.todelete) {
                self.todelete = true;
                clearInterval(slidein);
                setTimeout(function() {
                    var slideout = setInterval(function() {
                        self.v += 0.031;
                        self.x += self.v;
                        if (self.x >= window.innerWidth) {
                            clearInterval(slideout);
                            delete BANNERS[self.id];
                        }
                    }, 5);
                }, 5000);
            }
        }
    }

    BANNERS[self.id] = self;
    return self;
}

// input sending
document.onkeydown = function(event) {
    if (ingame && !inmenu && player.alive && canmove) {
        if (event.key == 'w' || event.key == 'W' || event.key == 'ArrowUp') {
            socket.emit('keyPress', {key:'W', state:true});
        }
        if (event.key == 's' || event.key == 'S' || event.key == 'ArrowDown') {
            socket.emit('keyPress', {key:'S', state:true});
        }
        if (event.key == 'a' || event.key == 'A' || event.key == 'ArrowLeft') {
            socket.emit('keyPress', {key:'A', state:true});
        }
        if (event.key == 'd' || event.key == 'D' || event.key == 'ArrowRight') {
            socket.emit('keyPress', {key:'D', state:true});
        }
    }
}
document.onkeyup = function(event) {
    if (ingame) {
        if (event.key == 'w' || event.key == 'W' || event.key == 'ArrowUp') {
            socket.emit('keyPress', {key:'W', state:false});
        }
        if (event.key == 's' || event.key == 'S' || event.key == 'ArrowDown') {
            socket.emit('keyPress', {key:'S', state:false});
        }
        if (event.key == 'a' || event.key == 'A' || event.key == 'ArrowLeft') {
            socket.emit('keyPress', {key:'A', state:false});
        }
        if (event.key == 'd' || event.key == 'D' || event.key == 'ArrowRight') {
            socket.emit('keyPress', {key:'D', state:false});
        }
        if (event.key == 'Escape') {
            if (inmenu) {
                if (consoleAccess) {
                    document.getElementById('adminConsole').style.display = 'none';
                }
                document.getElementById('ingameMenu').style.display = 'none';
                document.getElementById('credits').style.display = 'none';
                document.getElementById('githublink').style.display = 'none';
                ingameBack();
                inmenu = false;
            } else {
                if (consoleAccess) {
                    document.getElementById('adminConsole').style.display = '';
                }
                document.getElementById('ingameMenu').style.display = 'inline-block';
                document.getElementById('credits').style.display = '';
                document.getElementById('githublink').style.display = '';
                inmenu = true;
                socket.emit('keyPress', {key:'W', state:false});
                socket.emit('keyPress', {key:'A', state:false});
                socket.emit('keyPress', {key:'D', state:false});
            }
            
        }
        if (event.key == 'Enter') {
            if (inchat && !inmenu) {
                document.getElementById('chatInput').blur();
            } else if (!inmenu) {
                document.getElementById('chatInput').focus();
            }
        }
        if (event.code == 'Backslash') {
            player.debug = !player.debug;
            if (PLAYER_LIST[player.id].debug) {
                document.getElementById('versionLabel').style.top = '28px';
            } else {
                document.getElementById('versionLabel').style.top = '0px';
            }
            //socket.emit('debug');
        }
    }
}
document.onmousemove = function(event) {
    mouseX = camera.x+event.clientX-16;
    mouseY = camera.y+event.clientY-16;
}
document.onmousedown = function(event) {
    mouseX = camera.x+event.clientX-16;
    mouseY = camera.y+event.clientY-16;
    if (ingame && !inmenu && canmove && !shooting) {
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
document.onmouseup = function() {
    shooting = false;
}

// game functions
function fadeIn() {
    canmove = false;
    var fadeAmount = 0;
    var audiofade = (settings.musicvolume*settings.globalvolume);
    document.getElementById('loadingContainer').style.display = 'block';
    document.getElementById('fade').style.display = 'block';
    var fadeInterval = setInterval(function() {
        fadeAmount += 0.01;
        audiofade -= ((settings.musicvolume*settings.globalvolume)/100);
        if (audiofade < 0) {
            audiofade = 0;
        }
        if (fadeAmount > 1) {
            clearInterval(fadeInterval);
            document.getElementById('loading').style.display = 'inline-block';
        }
        document.getElementById('fade').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 1);
}
function fadeOut() {
    var fadeAmount = 1;
    var audiofade = 0;
    document.getElementById('loading').style.display = 'none';
    var fadeInterval = setInterval(function() {
        fadeAmount -= 0.01;
        audiofade += ((settings.musicvolume*settings.globalvolume)/100);
        if (fadeAmount < 0) {
            clearInterval(fadeInterval);
            document.getElementById('loadingContainer').style.display = 'none';
            document.getElementById('fade').style.display = 'none';
        }
        document.getElementById('fade').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 1);
}
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
}

// game handlers
socket.on('game-joined', function() {
    for (var i in PLAYER_LIST) {
        PLAYER_LIST[i].alive = true;
    }
    ingame = true;
    canmove = true;
    var waitforload = setInterval(function() {
        if (loaded) {
            document.getElementById('canceljoingame').style.display = 'none';
            gameCanvas.style.display = 'block';
            document.getElementById('gameContainer').style.backgroundColor = 'black';
            document.getElementById('credits').style.display = 'none';
            document.getElementById('githublink').style.display = 'none';
            fadeOut();
            clearInterval(waitforload);
        }
    }, 100);
});
socket.on('gamefull', function() {
    document.getElementById('serverfull').style.display = 'block';
    document.getElementById('canceljoingame').style.display = 'inline-block';
});
socket.on('gamerunning', function() {
    document.getElementById('gamelocked').style.display = 'block';
    document.getElementById('canceljoingame').style.display = 'inline-block';
});
socket.on('initmap', function(maps) {
    for (var i in maps) {
        MAPS[i] = new Image(maps[i].width, maps[i].height);
        if (maps[i].id == 0) {
            MAPS[i].src = '/client/img/Lobby.png';
        } else {
            MAPS[i].src = '/client/img/Map' + maps[i].id + '.png';
        }
    }
    try {
        var maploader = new OffscreenCanvas(192, 108).getContext('2d');
        for (var i in MAPS) {
            maploader.drawImage(MAPS[i], 0, 0);
            game.drawImage(MAPS[i], 0, 0);
        }
        loaded = true;
    } catch (err) {}
});
socket.on('map', function(id) {
    CURRENT_MAP = id;
});
socket.on('gamestart', function(pkg) {
    if (ingame) {
        document.getElementById('ready').style.display = 'none';
        for (var i in pkg) {
            document.getElementById('player' + i).innerText = pkg[i];
        }
        document.getElementById('scoreContainer').style.display = 'inline';
        document.getElementById('gameContainer').style.backgroundColor = '';
    }
});
socket.on('winner', function(id) {
    ingame = false;
    canmove = false;
    document.getElementById('loadingContainer').style.display = 'none';
    var v = -10;
    var x = window.innerWidth;
    var winOverlay = new Image();
    var winOverlay2 = new Image();
    winOverlay.src = './client/img/WinOverlay.png';
    winOverlay2.src = './client/img/WinOverlay2.png';
    if (window.innerWidth/window.innerHeight > 16/9) {
        winOverlay.width = (1920*(window.innerHeight/1080));
        winOverlay2.width = (1920*(window.innerHeight/1080));
        winOverlay.height = window.innerHeight;
        winOverlay2.height = window.innerHeight;
    } else {
        winOverlay.width = window.innerWidth;
        winOverlay2.width = window.innerWidth;
        winOverlay.height = (1080*(window.innerWidth/1920));
        winOverlay2.height = (1080*(window.innerWidth/1920));
    }
    var slide = setInterval(function() {
        if (x < 200) {
            v *= 0.96;
        }
        x += v;
        game.fillStyle = PLAYER_LIST[id].color;
        game.fillRect(x, 0, window.innerWidth, window.innerHeight);
        game.drawImage(winOverlay, x+(window.innerWidth-winOverlay.width), (window.innerHeight-winOverlay.height), winOverlay.width, winOverlay.height);
        game.drawImage(winOverlay2, x, 0, winOverlay.width, winOverlay.height);
        game.fillStyle = '#000000';
        game.save();
        game.translate(x+(550*(window.innerWidth/1536)), 400*(window.innerHeight/864));
        game.rotate(-15.5*(Math.PI/180));
        game.textAlign = 'center';
        game.font = (window.innerHeight/12) + 'px Pixel';
        game.fillText(PLAYER_LIST[id].name, 0, 0);
        game.restore();
        if (x < 0.1) {
            clearInterval(slide);
            game.fillStyle = PLAYER_LIST[id].color;
            game.fillRect(0, 0, window.innerWidth, window.innerHeight);
            game.drawImage(winOverlay, (window.innerWidth-winOverlay.width), (window.innerHeight-winOverlay.height), winOverlay.width, winOverlay.height);
            game.drawImage(winOverlay2, 0, 0, winOverlay.width, winOverlay.height);
            game.fillStyle = '#000000';
            game.save();
            game.translate(550*(window.innerWidth/1536), 400*(window.innerHeight/864));
            game.rotate(-15.5*(Math.PI/180));
            game.textAlign = 'center';
            game.font = (window.innerHeight/12) + 'px Pixel';
            game.fillText(PLAYER_LIST[id].name, 0, 0);
            game.restore();
            document.getElementById('credits').style.display = '';
            document.getElementById('githublink').style.display = '';
            window.addEventListener('resize', function() {
                game.fillStyle = PLAYER_LIST[id].color;
                game.fillRect(0, 0, window.innerWidth, window.innerHeight);
                game.drawImage(winOverlay, (window.innerWidth-winOverlay.width), (window.innerHeight-winOverlay.height), winOverlay.width, winOverlay.height);
                game.drawImage(winOverlay2, 0, 0, winOverlay.width, winOverlay.height);
                game.fillStyle = '#000000';
                game.save();
                game.translate(550*(window.innerWidth/1536), 400*(window.innerHeight/864));
                game.rotate(-15.5*(Math.PI/180));
                game.textAlign = 'center';
                game.font = (window.innerHeight/12) + 'px Pixel';
                game.fillText(PLAYER_LIST[id].name, 0, 0);
                game.restore();
            });
        }
    }, 5);
    var fadeAmount = 1;
    var audiofade = (settings.musicvolume*settings.globalvolume);
    var fadeInterval = setInterval(function() {
        fadeAmount -= 0.01;
        audiofade -= ((settings.musicvolume*settings.globalvolume)/50);
        if (audiofade < 0) {
            audiofade = 0;
        }
        if (fadeAmount < 0.5) {
            clearInterval(fadeInterval);
        }
        document.getElementById('scoreContainer').style.opacity = fadeAmount;
        document.getElementById('chatContainer').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 1);
    setTimeout(function() {
        music.src = '/client/sound/Endscreen.mp3';
        music.play();
        var fadeInterval = setInterval(function() {
            fadeAmount -= 0.01;
            audiofade += ((settings.musicvolume*settings.globalvolume)/50);
            if (audiofade < 0) {
                audiofade = 0;
            }
            if (fadeAmount < 0) {
                document.getElementById('scoreContainer').style.display = 'none';
                clearInterval(fadeInterval);
            }
            document.getElementById('scoreContainer').style.opacity = fadeAmount;
            document.getElementById('chatContainer').style.opacity = fadeAmount;
            music.volume = audiofade;
        }, 1);
    }, 500);
    setTimeout(function() {
        document.getElementById('playAgain').style.opacity = 0;
        document.getElementById('playAgain').style.display = 'inline-block';
        var fadeAmount = 0;
        var fadeInterval = setInterval(function() {
            fadeAmount += 0.01;
            audiofade += ((settings.musicvolume*settings.globalvolume)/50);
            if (audiofade < 0) {
                audiofade = 0;
            }
            if (fadeAmount > 1) {
                clearInterval(fadeInterval);
            }
            document.getElementById('playAgain').style.opacity = fadeAmount;
            music.volume = audiofade;
        }, 1);
    }, 3000);
});
socket.on('gamecut', function() {
    if (ingame) {
        document.getElementById('menuContainer').style.display = 'block';
        document.getElementById('gameContainer').style.display = 'none';
        music.src = ('/client/sound/Menu.mp3');
        music.play();
        ingame = false;
        inmenu = false;
        readyforstart = false;
        document.getElementById('ready').style.opacity = 1;
        document.getElementById('ready').style.display = 'inline-block';
        document.getElementById('scoreContainer').style.display = 'none';
        if (consoleAccess) {
            document.getElementById('adminConsole').style.display = 'none';
        }
        document.getElementById('ingameMenu').style.display = 'none';
        document.getElementById('credits').style.display = 'none';
        document.getElementById('githublink').style.display = 'none';
        ingameBack();
        inmenu = false;
        fadeOut();
    }
});
socket.on('roundstart', function(scores) {
    if (ingame) {
        fadeOut();
        setTimeout(function() {
            canmove = true;
        }, 3000);
        for (var i in PLAYER_LIST) {
            PLAYER_LIST[i].alive = true;
        }
        for (var i in scores) {
            PLAYER_LIST[scores[i].id].score = scores[i].score;
            document.getElementById('score' + i).innerText = scores[i].score;
        }
        sfx[0].src = '/client/sound/Countdown.mp3';
        sfx[0].play();
        var size = 24;
        var opacity = 1;
        countdowntext.text = '3';
        var count3 = setInterval(function() {
            opacity -= 0.005;
            size += 1;
            countdowntext.color = 'rgba(255, 0, 0, ' + opacity + ')';
            countdowntext.size = size;
            if (opacity < 0.005) {
                //countdowntext.text = '';
                clearInterval(count3);
            }
        }, 1);
        setTimeout(function() {
            var size = 24;
            var opacity = 1;
            countdowntext.text = '2';
            var count2 = setInterval(function() {
                opacity -= 0.005;
                size += 1;
                countdowntext.color = 'rgba(255, 0, 0, ' + opacity + ')';
                countdowntext.size = size;
                if (opacity < 0.005) {
                    countdowntext.text = '';
                    clearInterval(count2);
                }
            }, 1);
        }, 1000);
        setTimeout(function() {
            var size = 24;
            var opacity = 1;
            countdowntext.text = '1';
            var count1 = setInterval(function() {
                opacity -= 0.005;
                size += 1;
                countdowntext.color = 'rgba(255, 255, 0, ' + opacity + ')';
                countdowntext.size = size;
                if (opacity < 0.005) {
                    countdowntext.text = '';
                    clearInterval(count1);
                }
            }, 1);
        }, 2000);
        setTimeout(function() {
            var size = 24;
            var opacity = 1;
            countdowntext.text = 'GO';
            var countgo = setInterval(function() {
                opacity -= 0.005;
                size += 1;
                countdowntext.color = 'rgba(0, 150, 0, ' + opacity + ')';
                countdowntext.size = size;
                if (opacity < 0.005) {
                    countdowntext.text = '';
                    clearInterval(countgo);
                }
            }, 1);
        }, 3000);
    }
});
socket.on('roundend', function() {
    if (ingame) {
        fadeIn();
        for (var i in BULLET_LIST) {
            delete BULLET_LIST[i];
        }
    }
});
socket.on('inittrackedData', function(pkg) {
    for (var i in pkg.achievements) {
        var localachievement = pkg.achievements[i];
        for (var j in ACHIEVEMENTS) {
            var superlocalachievement = ACHIEVEMENTS[j];
            if (superlocalachievement.id == localachievement.id) {
                superlocalachievement.aqquired = localachievement.aqquired;
            }
        }
    }
    TRACKED_DATA = {kills:pkg.kills, deaths:pkg.deaths, wins:pkg.wins};
});
socket.on('achievement_get', function(pkg) {
    for (var i in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[i].id == pkg.achievement) {
            Banner(pkg.player + ' Achievement Get!', ACHIEVEMENTS[i].name, ACHIEVEMENTS[i].color);
            ACHIEVEMENTS[i].aqquired = true;
        }
    }
    updateAchievements();
});
socket.on('achievementrevoked', function(pkg) {
    for (var i in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[i].id == pkg.achievement) {
            ACHIEVEMENTS[i].aqquired = false;
        }
    }
    updateAchievements();
});
socket.on('yeet', function() {
    Banner('YEET!', 'You just got yeeted!', 'white');
});

// fps & tps counter
setInterval(function() {
    tps = tpsCounter;
    tpsCounter = 0;
    fps = fpsCounter;
    fpsCounter = 0;
    ping = pingCounter;
}, 1000);

// waiting for server
waiting = setInterval(function() {
    if (ingame) {
        if (connected == 50 && !waiting) {
            waitingforserver = true;
            fadeIn();
            document.getElementById('waiting').style.display = 'inline-block';
        } else if (waitingforserver && connected == 0) {
            waitingforserver = false;
            document.getElementById('waiting').style.display = 'none';
            fadeOut();
        }
        connected++;
    }
}, 1000/10);

function achievementtest() {
    Banner(player.name + ' Achievement Get!', 'Achievements tester');
}