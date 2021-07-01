// Copyright (C) 2021 Radioactive64

resourcesloaded++;
MAPS = [];
CURRENT_MAP = 0;
TRACKED_DATA = {
    kills: 0,
    deaths: 0,
    wins: 0,
    lootboxcollections: {
        total: 0,
        lucky: 0,
        unlucky: 0,
        speed: 0,
        jump: 0,
        shield: 0,
        homing: 0,
        firerate: 0,
        random: 0
    }
};
ACHIEVEMENTS = [];
BANNERS = [];
var tpsCounter = 0;
var tps = 0;
var fpsCounter = [];
var fps = 0;
var fpsCounter2 = 0;
var fps2 = 0;
var pingCounter = 0;
var ping = 0;
var lastDate = 0;
var currentDate = 0;
var player = null;
var mouseX;
var mouseY;
var shooting = false;
var ingame = false;
var inmenu = false;
var inchat = false;
var canmove = false;
var connected = 0;
var countdowntext = {
    text: '',
    color: '',
    size: ''
};
var mapname = {
    text:'',
    color: ''
};
var readyforstart = false;
var drawInterval = null;
var waitingforserver = false;
var load = {
    mapsready: false,
    progress: 0,
    total: 0
}
var winOverlay = new Image();
var winOverlay2 = new Image();

// update game
socket.on('update', function(pkg) {
    if (ingame) {
        DEBUG_INFO = pkg.players;
        Player.update(pkg.players);
        Bullet.update(pkg.bullets);
        LootBox.update();
        updateCamera();
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
            HCBBM();
            Player.draw();
            Bullet.draw();
            LootBox.draw();
            drawCountdown();
            if (player.debug) {
                for (var i in DEBUG_INFO) {
                    if (DEBUG_INFO[i].id == player.id) {
                        drawDebug(DEBUG_INFO[i], true);
                    } else {
                        drawDebug(DEBUG_INFO[i], false);
                    }
                }
            }
            fpsCounter2++;
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
        game.fillRect((window.innerWidth - 320), 4, 316, 32);
        game.fillRect((window.innerWidth - 120), 36, 116, 32);
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
        game.fillText('DFPS:' + fps2, (window.innerWidth-208), 30);
        game.fillText('FPS:' + fps, (window.innerWidth-108), 30);
        game.fillText('TPS:' + tps, (window.innerWidth-8), 30);
        game.fillText('Ping:' + ping + 'ms', (window.innerWidth-8), 60);
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
    game.fillStyle = mapname.color;
    game.font = '96px Pixel';
    game.fillText(mapname.text, (window.innerWidth/2), 96);
    game.fillStyle = countdowntext.color;
    game.font = countdowntext.size + 'px Pixel';
    game.fillText(countdowntext.text, (window.innerWidth/2), ((window.innerHeight/2)+(countdowntext.size/2)-(window.innerHeight/10)));
    player = PLAYER_LIST[player.id];
}
socket.on('ping', function() {
    currentDate = Date.now();
    pingCounter = Math.floor(currentDate-lastDate);
});

// banner init
function Banner(topText, bottomText, color, time) {
    var self = {
        id: Math.random(),
        temporary: (topText.indexOf('Buff:') != -1 || topText.indexOf('Secondary:') != -1),
        secondary: topText.indexOf('Secondary:') != -1,
        HTML: document.createElement('div')
    };
    self.HTML.className = 'banner ui-darkText';
    self.HTML.innerHTML = '<div class="banner-textTop">' + topText + '</div><div class="banner-textBottom">' + bottomText + '</div>';
    if (color == 'rainbow-pulse') {
        self.HTML.style.animation = 'rainbow-pulse 10s infinite';
        self.HTML.style.animationTimingFunction = 'ease-in-out';
    } else if (color == 'red-pulse') {
        self.HTML.style.animation = 'red-pulse 2s infinite';
        self.HTML.style.animation = 'red-pulse 2s infinite';
    } else {
        self.HTML.style.backgroundColor = color;
    }
    document.getElementById('bannerContainer').appendChild(self.HTML);
    self.HTML.style.transform = 'translateX(-400px)';
    setTimeout(function() {
        try {
            self.HTML.style.transitionTimingFunction = 'ease-in';
            self.HTML.style.transform = 'translateX(400px)';
            setTimeout(function() {
                self.HTML.remove();
                delete BANNERS[self.id];
            }, 1250);
        } catch (err) {}
    }, (time*1000)+1000);

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
                socket.emit('keyPress', {key:'S', state:false});
                socket.emit('keyPress', {key:'A', state:false});
                socket.emit('keyPress', {key:'D', state:false});
            }
            
        }
        if (event.key == 'Enter') {
            if (!inchat && !inmenu) {
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
                break;
            case 2:
                socket.emit('click', {button:'right', x:mouseX, y:mouseY});
                shooting = true;
                break;
        }
    }
}
document.onmouseup = function() {
    shooting = false;
}
window.onblur = function() {
    socket.emit('keyPress', {key:'W', state:false});
    socket.emit('keyPress', {key:'S', state:false});
    socket.emit('keyPress', {key:'A', state:false});
    socket.emit('keyPress', {key:'D', state:false});
}

// game functions
function fadeIn() {
    canmove = false;
    var fadeAmount = 0;
    var audiofade = (settings.musicvolume*settings.globalvolume);
    document.getElementById('loadingContainer').style.display = 'block';
    var fadeInterval = setInterval(function() {
        fadeAmount += 0.04;
        audiofade -= ((settings.musicvolume*settings.globalvolume)/25);
        if (audiofade < 0) {
            audiofade = 0;
        }
        if (fadeAmount > 1) {
            clearInterval(fadeInterval);
            document.getElementById('loading').style.display = 'inline-block';
        }
        document.getElementById('loadingContainer').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 20);
}
function fadeOut() {
    var fadeAmount = 1;
    var audiofade = 0;
    document.getElementById('loading').style.display = 'none';
    var fadeInterval = setInterval(function() {
        fadeAmount -= 0.04;
        audiofade += ((settings.musicvolume*settings.globalvolume)/25);
        if (fadeAmount < 0) {
            clearInterval(fadeInterval);
            document.getElementById('loadingContainer').style.display = 'none';
        }
        document.getElementById('loadingContainer').style.opacity = fadeAmount;
        music.volume = audiofade;
    }, 20);
}
function ready() {
    if (!readyforstart) {
        socket.emit('ready');
        var fadeAmount = 1;
        var fadeInterval = setInterval(function() {
            fadeAmount -= 0.04;
            document.getElementById('ready').style.opacity = fadeAmount;
            if (fadeAmount < 0.5) {
                clearInterval(fadeInterval);
            }
        }, 20); 
        readyforstart = true;
    }
}

// join/leave handlers
socket.on('game-joined', async function() {
    ingame = true;
    document.getElementById('chat').innerHTML = '';
    CURRENT_MAP = 0;
    for (var i in BULLET_LIST) {
        delete BULLET_LIST[i];
    }
    for (var i in BANNERS) {
        BANNERS[i].HTML.remove();
        delete BANNERS[i];
    }
    // load
    var isloaded = false;
    var readybuttonalreadyloaded = false;
    load.total++;
    document.getElementById('loadingBarText').innerText = '0/' + load.total + ' (0%)';
    document.getElementById('loadingBarInner').style.width = '0%';
    document.getElementById('loadingBarOuter').style.display = 'block';
    var waitforload = setInterval(function() {
        if (readybuttonloaded && !readybuttonalreadyloaded) {
            load.progress++;
            readybuttonalreadyloaded = true;
        }
        var percent = Math.floor((load.progress/load.total)*100);
        document.getElementById('loadingBarText').innerText = load.progress + '/' + load.total + ' (' + percent + '%)';
        document.getElementById('loadingBarInner').style.width = percent + '%';
        if (percent == 100 && !isloaded) {
            isloaded = true;
            setTimeout(function() {
                // init
                document.getElementById('canceljoingame').style.display = 'none';
                document.getElementById('playAgain').style.display = 'none';
                gameCanvas.style.display = 'block';
                document.getElementById('gameContainer').style.backgroundColor = 'black';
                document.getElementById('credits').style.display = 'none';
                document.getElementById('githublink').style.display = 'none';
                for (var i in PLAYER_LIST) {
                    PLAYER_LIST[i].alive = true;
                }
                canmove = true;
                for (var i in LOOT_BOXES) {
                    delete LOOT_BOXES[i];
                }
                music.src = ('/client/sound/Ingame_' + currentmusic + '.mp3');
                music.play();
                fadeOut();
                document.getElementById('loadingBarOuter').style.display = 'none';
                load.total = 0;
                clearInterval(waitforload);
            }, 500);
        }
    }, 10);
    try {
        var maploader = new OffscreenCanvas(192, 108).getContext('2d');
    } catch (err) {
        var maploader = new CanvasRenderingContext2D(192, 108).getContext('2d');
    }
    load.progress = 0;
    async function loadImage(img) {
        try {
            await sleep(Math.random()*10);
            maploader.drawImage(img, 0, 0);
            load.progress++;
        } catch (err) {
            await loadImage(img);
        }
    }
    load.total += 7;
    setTimeout(async function() {
        async function loadMaps() {
            if (load.mapsready) {
                for (var i in MAPS) {
                    await loadImage(MAPS[i]);
                }
            } else {
                await loadMaps();
            }
        }
        await loadMaps();
        var lootboximage = new Image();
        lootboximage.src = './client/img/LootBox_random.png';
        await loadImage(lootboximage);
        lootboximage.src = './client/img/LootBox_speed.png';
        await loadImage(lootboximage);
        lootboximage.src = './client/img/LootBox_jump.png';
        await loadImage(lootboximage);
        lootboximage.src = './client/img/LootBox_shield.png';
        await loadImage(lootboximage);
        lootboximage.src = './client/img/LootBox_heal.png';
        await loadImage(lootboximage);
        lootboximage.src = './client/img/LootBox_homing.png';
        await loadImage(lootboximage);
        lootboximage.src = './client/img/LootBox_firerate.png';
        await loadImage(lootboximage);
    }, 100);
});
socket.on('gamefull', async function() {
    document.getElementById('serverfull').style.display = 'block';
    document.getElementById('canceljoingame').style.display = 'inline-block';
});
socket.on('gamerunning', async function() {
    document.getElementById('gamelocked').style.display = 'block';
    document.getElementById('canceljoingame').style.display = 'inline-block';
});
// map handlers
socket.on('initmap', async function(maps) {
    for (var i in maps) {
        MAPS[i] = new Image(maps[i].width, maps[i].height);
        if (maps[i].id == 0) {
            MAPS[i].src = '/client/img/Lobby.png';
        } else {
            MAPS[i].src = '/client/img/Map' + maps[i].id + '.png';
        }
        MAPS[i].name = maps[i].name;
        load.total++;
    }
    load.mapsready = true;
});
socket.on('map', async function(id) {
    CURRENT_MAP = id;

});
// game handlers
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
    if (ingame) {
        if (consoleAccess) {
            document.getElementById('adminConsole').style.display = 'none';
        }
        document.getElementById('ingameMenu').style.display = 'none';
        document.getElementById('credits').style.display = 'none';
        document.getElementById('githublink').style.display = 'none';
        ingameBack();
        inmenu = false;
        var color = PLAYER_LIST[id].color;
        var name = PLAYER_LIST[id].name;
        ingame = false;
        canmove = false;
        document.getElementById('loadingContainer').style.display = 'none';
        var v = -20;
        var x = window.innerWidth;
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
                v *= 0.95;
            }
            x += v;
            game.fillStyle = color;
            game.fillRect(x, 0, window.innerWidth, window.innerHeight);
            game.drawImage(winOverlay, x+(window.innerWidth-winOverlay.width), (window.innerHeight-winOverlay.height), winOverlay.width, winOverlay.height);
            game.drawImage(winOverlay2, x, 0, winOverlay.width, winOverlay.height);
            game.fillStyle = '#000000';
            game.save();
            game.translate(x+(550*(window.innerWidth/1536)), 400*(window.innerHeight/864));
            game.rotate(-15.5*(Math.PI/180));
            game.textAlign = 'center';
            game.font = (window.innerHeight/12) + 'px Pixel';
            game.fillText(name, 0, 0);
            game.restore();
            if (x < 0.1) {
                clearInterval(slide);
                game.fillStyle = color;
                game.fillRect(0, 0, window.innerWidth, window.innerHeight);
                game.drawImage(winOverlay, (window.innerWidth-winOverlay.width), (window.innerHeight-winOverlay.height), winOverlay.width, winOverlay.height);
                game.drawImage(winOverlay2, 0, 0, winOverlay.width, winOverlay.height);
                game.fillStyle = '#000000';
                game.save();
                game.translate(550*(window.innerWidth/1536), 400*(window.innerHeight/864));
                game.rotate(-15.5*(Math.PI/180));
                game.textAlign = 'center';
                game.font = (window.innerHeight/12) + 'px Pixel';
                game.fillText(name, 0, 0);
                game.restore();
                document.getElementById('credits').style.display = '';
                document.getElementById('githublink').style.display = '';
                var currentId = gameid;
                window.addEventListener('resize', function() {
                    if (gameid == currentId) {
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
                        game.fillStyle = color;
                        game.fillRect(0, 0, window.innerWidth, window.innerHeight);
                        game.drawImage(winOverlay, (window.innerWidth-winOverlay.width), (window.innerHeight-winOverlay.height), winOverlay.width, winOverlay.height);
                        game.drawImage(winOverlay2, 0, 0, winOverlay.width, winOverlay.height);
                        game.fillStyle = '#000000';
                        game.save();
                        game.translate(550*(window.innerWidth/1536), 400*(window.innerHeight/864));
                        game.rotate(-15.5*(Math.PI/180));
                        game.textAlign = 'center';
                        game.font = (window.innerHeight/12) + 'px Pixel';
                        game.fillText(name, 0, 0);
                        game.restore();
                    }
                });
            }
        }, 20);
        var fadeAmount = 1;
        var audiofade = (settings.musicvolume*settings.globalvolume);
        var fadeInterval = setInterval(function() {
            fadeAmount -= 0.04;
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
        }, 20);
        setTimeout(function() {
            music.src = '/client/sound/Endscreen.mp3';
            music.play();
            var fadeInterval = setInterval(function() {
                fadeAmount -= 0.04;
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
            }, 20);
        }, 500);
        setTimeout(function() {
            document.getElementById('playAgain').style.opacity = 0;
            document.getElementById('playAgain').style.display = 'inline-block';
            var fadeAmount = 0;
            var fadeInterval = setInterval(function() {
                fadeAmount += 0.04;
                audiofade += ((settings.musicvolume*settings.globalvolume)/50);
                if (audiofade < 0) {
                    audiofade = 0;
                }
                if (fadeAmount > 1) {
                    clearInterval(fadeInterval);
                }
                document.getElementById('playAgain').style.opacity = fadeAmount;
                music.volume = audiofade;
            }, 20);
        }, 3000);
    }
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
        gameid = Math.random();
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
// round handlers
socket.on('roundstart', function(scores) {
    if (ingame) {
        mapname.text = MAPS[CURRENT_MAP].name;
        mapname.color = 'rgb(0, 100, 255)';
        fadeOut();
        setTimeout(function() {
            canmove = true;
        }, 3000);
        for (var i in BANNERS) {
            if (BANNERS[i].temporary) {
                BANNERS[i].HTML.remove();
                delete BANNERS[i];
            }
        }
        for (var i in PLAYER_LIST) {
            PLAYER_LIST[i].alive = true;
        }
        for (var i in BULLET_LIST) {
            delete BULLET_LIST[i];
        }
        for (var i in scores) {
            PLAYER_LIST[scores[i].id].score = scores[i].score;
            document.getElementById('score' + i).innerText = scores[i].score;
        }
        playsound('/client/sound/Countdown.mp3');
        var size = 24;
        var opacity = 1;
        countdowntext.text = '3';
        var count3 = setInterval(function() {
            opacity -= 0.02;
            size += 4;
            countdowntext.color = 'rgba(255, 0, 0, ' + opacity + ')';
            countdowntext.size = size;
            if (opacity < 0.005) {
                clearInterval(count3);
            }
        }, 20);
        setTimeout(function() {
            var size = 24;
            var opacity = 1;
            countdowntext.text = '2';
            var count2 = setInterval(function() {
                opacity -= 0.02;
                size += 4;
                countdowntext.color = 'rgba(255, 0, 0, ' + opacity + ')';
                countdowntext.size = size;
                if (opacity < 0.005) {
                    clearInterval(count2);
                }
            }, 20);
        }, 1000);
        setTimeout(function() {
            var size = 24;
            var opacity = 1;
            countdowntext.text = '1';
            var count1 = setInterval(function() {
                opacity -= 0.02;
                size += 4;
                countdowntext.color = 'rgba(255, 255, 0, ' + opacity + ')';
                countdowntext.size = size;
                if (opacity < 0.005) {
                    clearInterval(count1);
                }
            }, 20);
        }, 2000);
        setTimeout(function() {
            var size = 24;
            var opacity = 1;
            countdowntext.text = 'GO';
            var countgo = setInterval(function() {
                opacity -= 0.02;
                size += 4;
                countdowntext.color = 'rgba(0, 150, 0, ' + opacity + ')';
                countdowntext.size = size;
                if (opacity < 0.005) {
                    countdowntext.text = '';
                    clearInterval(countgo);
                }
            }, 20);
        }, 3000);
        setTimeout(function() {
            var opacity = 1;
            var fade = setInterval(function() {
                opacity -= 0.04;
                mapname.color = 'rgba(0, 100, 255, ' + opacity + ')';
                if (opacity < 0.01) {
                    mapname.text = '';
                    clearInterval(fade);
                }
            }, 20);
        }, 5000);
    }
});
socket.on('roundend', function() {
    if (ingame) {
        fadeIn();
        setTimeout(function() {
            for (var i in LOOT_BOXES) {
                delete LOOT_BOXES[i];
            }
        }, 500);
    }
});
// tracked data handlers
socket.on('inittrackedData', async function(pkg) {
    for (var i in pkg.achievements) {
        var localachievement = pkg.achievements[i];
        for (var j in ACHIEVEMENTS) {
            var superlocalachievement = ACHIEVEMENTS[j];
            if (superlocalachievement.id == localachievement.id) {
                superlocalachievement.aqquired = localachievement.aqquired;
            }
        }
    }
    TRACKED_DATA.kills = pkg.kills;
    TRACKED_DATA.deaths = pkg.deaths;
    TRACKED_DATA.wins = pkg.wins;
    TRACKED_DATA.lootboxcollections.total = pkg.lootboxcollections.total;
    TRACKED_DATA.lootboxcollections.lucky = pkg.lootboxcollections.lucky;
    TRACKED_DATA.lootboxcollections.unlucky = pkg.lootboxcollections.unlucky;
    TRACKED_DATA.lootboxcollections.speed = pkg.lootboxcollections.speed;
    TRACKED_DATA.lootboxcollections.jump = pkg.lootboxcollections.jump;
    TRACKED_DATA.lootboxcollections.shield = pkg.lootboxcollections.shield;
    TRACKED_DATA.lootboxcollections.homing = pkg.lootboxcollections.homing;
    TRACKED_DATA.lootboxcollections.firerate = pkg.lootboxcollections.firerate;
    TRACKED_DATA.lootboxcollections.random = pkg.lootboxcollections.random;
});
socket.on('achievement_get', async function(pkg) {
    for (var i in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[i].id == pkg.achievement) {
            Banner(pkg.player + ' Achievement Get!', ACHIEVEMENTS[i].name, ACHIEVEMENTS[i].color, 5);
            ACHIEVEMENTS[i].aqquired = true;
        }
    }
    updateAchievements();
});
socket.on('achievementrevoked', async function(pkg) {
    for (var i in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[i].id == pkg.achievement) {
            ACHIEVEMENTS[i].aqquired = false;
        }
    }
    updateAchievements();
});
socket.on('updateTrackedData',async  function(pkg) {
    for (var i in pkg) {
        try {
            if (pkg[i].id == player.id) {
                TRACKED_DATA.kills = pkg[i].kills;
                TRACKED_DATA.deaths = pkg[i].deaths;
                TRACKED_DATA.wins = pkg[i].wins;
                TRACKED_DATA.lootboxcollections.total = pkg[i].lootboxcollections.total;
                TRACKED_DATA.lootboxcollections.lucky = pkg[i].lootboxcollections.lucky;
                TRACKED_DATA.lootboxcollections.unlucky = pkg[i].lootboxcollections.unlucky;
                TRACKED_DATA.lootboxcollections.speed = pkg[i].lootboxcollections.speed;
                TRACKED_DATA.lootboxcollections.jump = pkg[i].lootboxcollections.jump;
                TRACKED_DATA.lootboxcollections.shield = pkg[i].lootboxcollections.shield;
                TRACKED_DATA.lootboxcollections.homing = pkg[i].lootboxcollections.homing;
                TRACKED_DATA.lootboxcollections.firerate = pkg[i].lootboxcollections.firerate;
                TRACKED_DATA.lootboxcollections.random = pkg[i].lootboxcollections.random;
                updateAchievements();
            }
        } catch {}
    }
});
// other handlers
socket.on('effect', async function(effect) {
    switch (effect) {
        case 'speed':
            Banner('Buff: SPEED', '+20% movespeed 10s', '#FFFF00', 10);
            break;
        case 'speed2':
            Banner('Buff: SPEED 2', '+50% movespeed 10s', '#FFFF00', 10);
            break;
        case 'slowness':
            Banner('DeBuff: SLOWNESS', '-25% movespeed 5s', '#FFFFFF', 5);
            break;
        case 'jump':
            Banner('Buff: JUMP BOOST', '+20% jump height 10s', '#FF9900', 10);
            break;
        case 'heal':
            Banner('Buff: HEAL', 'You were healed!', '#008000', 5);
            break;
        case 'damage':
            Banner('DeBuff: Damage', '-2 HP', '#AA00FF', 5);
            break;
        case 'shield':
            Banner('Buff: SHIELD', 'Shield Get!', '#0080FF', 5);
            break;
        case 'homing':
            Banner('Buff: HOMING BULLETS', 'Homing bullets 20s', '#00FF00', 10);
            break;
        case 'firerate':
            Banner('Buff: MACHINE GUN', 'x2 bullet rate 10s', '#FF0000', 10);
            break;
        case 'firerate2':
            Banner('Buff: MINIGUN', 'x3 bullet rate 10s', '#FF0000', 10);
            break;
        case 'goldenbullet':
            Banner('Buff: GOLDEN BULLET', '1 Shot kill', '#FFDD00', 5);
            break;
        case 'superbullets':
            Banner('Buff: SUPER BULLETS', 'x2 bullet damage', '#FFFFAA', 1000000);
            break;
        case 'noclipbullet':
            for (var i in BANNERS) {
                if (BANNERS[i].secondary) {
                    BANNERS[i].HTML.remove();
                    delete BANNERS[i];
                }
            }
            Banner('Secondary: LASER BULLETS', 'Bullets can go through walls', '#FF0000', 1000000);
            break;
        case 'pathfindbullets':
            for (var i in BANNERS) {
                if (BANNERS[i].secondary) {
                    BANNERS[i].HTML.remove();
                    delete BANNERS[i];
                }
            }
            Banner('Secondary: SMART BULLETS', 'Path finding smart bullets', '#00AAFF', 1000000);
            break;
        case 'yeet':
            for (var i in BANNERS) {
                if (BANNERS[i].secondary) {
                    BANNERS[i].HTML.remove();
                    delete BANNERS[i];
                }
            }
            Banner('Secondary: YEET', 'Yeets players', '#00AA00', 1000000);
            break;
        default:
            Banner('Buff: ERR:INVALIDBUFF', 'NaN\'s\'', '#FFFFFF', 60);
            break;
    }
});
socket.on('yeet', async function() {
    Banner('YEET!', 'You just got yeeted!', '#FFFFFF', 5);
});

// fps & tps counter
setInterval(async function() {
    tps = tpsCounter;
    tpsCounter = 0;
    fps = fpsCounter.length;
    fpsCounter = [];
    ping = pingCounter;
    fps2 = fpsCounter2;
    fpsCounter2 = 0;
}, 1000);
function fpsLoop() {
    window.requestAnimationFrame(function() {
        fpsCounter.push(0);
        fpsLoop();
    });
}
fpsLoop();

// waiting for server
waiting = setInterval(async function() {
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
    Banner(player.name + ' Achievement Get!', 'Achievements tester', 5);
}