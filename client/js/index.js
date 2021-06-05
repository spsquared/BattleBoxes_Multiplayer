// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript('./client/js/game.js');
$.getScript('./client/js/entity.js');
$.getScript('./client/js/menu.js');
if (window.devicePixelRatio) {
    var dpr = window.devicePixelRatio;
} else {
    var dpr = 1;
}
game = document.getElementById('gameCanvas').getContext('2d');
gameCanvas = document.getElementById('gameCanvas');
music = new Audio();
sfx = [new Audio(), new Audio(), new Audio(), new Audio()];
settings = {
    globalvolume: (document.getElementById('globalVolume').value/100),
    musicvolume: (document.getElementById('musicVolume').value/100),
    sfxvolume: (document.getElementById('sfxVolume').value/100),
    fullscreen: false,
    fps: document.getElementById('fpsSelect').value,
    renderQuality: (document.getElementById('renderQuality').value/100)
};
var currentmusic = 1;
tpsCounter = 0;
tps = 0;
fpsCounter = 0;
fps = 0;
ping = 0;
pingCounter = 0;
lastDate = 0;
currentDate = 0;
player = null;
camera = {x:0, y:0, width:window.innerWidth/2, height:window.innerHeight/2};
var firstload = true;

// handlers
socket.on('init', function() {
    if (!firstload) {
        socket.emit('disconnected');
        window.location.reload();
    }
    firstload = false;
    // set up page and canvas
    try {
        new OffscreenCanvas(1, 1);
    } catch (err) {
        window.alert('This game may run slower on your browser. Please switch to a supported browser.\nChrome 69+\nEdge 79+\nOpera 56+');
        console.log('This game may run slower on your browser. Please switch to a supported browser.\nChrome 69+\nEdge 79+\nOpera 56+');
    }
    document.querySelectorAll("input").forEach(function(item){if (item.type != 'text' && item.type != 'password') {item.addEventListener('focus', function(){this.blur();});}});
    document.querySelectorAll("button").forEach(function(item){item.addEventListener('focus', function(){this.blur();});});
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    gameCanvas.width = (window.innerWidth*settings.renderQuality*dpr);
    gameCanvas.height = (window.innerHeight*settings.renderQuality*dpr);
    game.scale((settings.renderQuality*dpr), (settings.renderQuality*dpr));
    gameCanvas.addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('scoreContainer').addEventListener('contextmenu', e => e.preventDefault());
    game.lineWidth = 4;
    game.imageSmoothingEnabled = false;
    game.webkitImageSmoothingEnabled = false;
    game.mozImageSmoothingEnabled = false;
    game.globalAlpha = 1;
    resetFPS();
    document.getElementById('fade').width = window.innerWidth;
    document.getElementById('fade').width = window.innerHeight;
    document.getElementById('loading').style.left = ((window.innerWidth/2)-64) + 'px';
    document.getElementById('ready').style.left = ((window.innerWidth/2)-100) + 'px';
    document.getElementById('scoreTable').style.width = ((window.innerWidth*0.75)-12) + 'px';
    // insert announcements
    document.getElementById('announcementsPage').width = (window.innerWidth-64);
    var announcementsEmbed = document.createElement('div');
    announcementsEmbed.id = 'announcementsEmbed';
    $.get('https://raw.githubusercontent.com/definitely-nobody-is-here/BBmulti_Announcements/master/Announcements.html', function(file) {
        announcementsEmbed.innerHTML = file;
        document.getElementById('announcements-failedLoadimg').style.display = 'none';
        document.getElementById('announcements-failedLoad').style.display = 'none';
        document.getElementById('announcementsPage').appendChild(announcementsEmbed);
    });
    // insert achievements
    $.getJSON('./client/assets/AchievementsList.json', function(data) {
        ACHIEVEMENTS = data.data;
        for (var i in ACHIEVEMENTS) {
            var localachievement = ACHIEVEMENTS[i];
            var achievement = document.createElement('div');
            var achievement2 = document.createElement('div');
            achievement.id = localachievement.id;
            achievement2.id = 'ig' + localachievement.id;
            achievement.className = 'achievementBlock';
            achievement2.className = 'achievementBlock';
            achievement.style.backgroundColor = 'lightgrey';
            achievement2.style.backgroundColor = 'lightgrey';
            if (localachievement.hidden) {
                achievement.style.display = 'none';
            }
            if (localachievement.hidden) {
                achievement2.style.display = 'none';
            }
            achievement.innerHTML = '<p class="achievementBlock-head">' + localachievement.name + '</p><p>' + localachievement.description + '</p>';
            achievement2.innerHTML = '<p class="achievementBlock-head">' + localachievement.name + '</p><p>' + localachievement.description + '</p>';
            document.getElementById('achievementsACHIEVEMENTS').appendChild(achievement);
            document.getElementById('ingameAchievementsACHIEVEMENTS').appendChild(achievement2);
        }
    });
    // show page
    document.getElementById('loginContainer').style.display = 'inline-block';
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'none';
    document.getElementById('menuContainer').style.display = 'block';
    // start music
    music.volume = settings.musicvolume;
    for (var i in sfx) {
        sfx[i].volume = settings.sfxvolume;
    }
    music.src = '/client/sound/Menu.mp3';
    // place focus on username
    document.getElementById('usrname').focus();
});
socket.on('connect_error',function(){
    setTimeout(function(){
        socket.connect();
    },1000);
});
socket.on('disconnected', function() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'inline-block';
    clearInterval(waiting);
});
socket.on('timeout', function() {
    disconnectclient();
});

// settings functions
function updateSettings() {
    music.volume = (settings.globalvolume*settings.musicvolume);
    for (var i in sfx) {
        sfx[i].volume = (settings.globalvolume*settings.sfxvolume);
    }
    document.getElementById('GV-label').innerHTML = (Math.floor(settings.globalvolume*100) + '%');
    document.getElementById('MV-label').innerHTML = (Math.floor(settings.musicvolume*100) + '%');
    document.getElementById('EV-label').innerHTML = (Math.floor(settings.sfxvolume*100) + '%');
    document.getElementById('RQ-label').innerHTML = (Math.floor(settings.renderQuality*100) + '%');
    document.getElementById('ingameGV-label').innerHTML = (Math.floor(settings.globalvolume*100) + '%');
    document.getElementById('ingameMV-label').innerHTML = (Math.floor(settings.musicvolume*100) + '%');
    document.getElementById('ingameEV-label').innerHTML = (Math.floor(settings.sfxvolume*100) + '%');
    document.getElementById('ingameRQ-label').innerHTML = (Math.floor(settings.renderQuality*100) + '%');
    // gameCanvas.width = (window.innerWidth*settings.renderQuality*dpr);
    // gameCanvas.height = (window.innerHeight*settings.renderQuality*dpr);
    // game.scale((settings.renderQuality*dpr), (settings.renderQuality*dpr));
    resetFPS();
}

// achievements functions
function updateAchievements() {
    document.getElementById('aSTATS_kills').innerText = TRACKED_DATA.kills;
    document.getElementById('aSTATS_deaths').innerText = TRACKED_DATA.deaths;
    document.getElementById('aSTATS_wins').innerText = TRACKED_DATA.wins;
    document.getElementById('ingameaSTATS_kills').innerText = TRACKED_DATA.kills;
    document.getElementById('ingameaSTATS_deaths').innerText = TRACKED_DATA.deaths;
    document.getElementById('ingameaSTATS_wins').innerText = TRACKED_DATA.wins;
    for (var i in ACHIEVEMENTS) {
        var localachievement = ACHIEVEMENTS[i];
        var achievement = document.getElementById(localachievement.id);
        var achievement2 = document.getElementById('ig'+localachievement.id);
        if (localachievement.color == 'rainbow-pulse' && localachievement.aqquired) {
            achievement.style.animation = 'rainbow-pulse 10s infinite';
            achievement2.style.animation = 'rainbow-pulse 10s infinite';
            achievement.style.animationTimingFunction = 'ease-in-out'
            achievement2.style.animationTimingFunction = 'ease-in-out'
        } else if (localachievement.color == 'pulsing-red' && localachievement.aqquired) {
            achievement.style.animation = 'red-pulse 2s infinite';
            achievement2.style.animation = 'red-pulse 2s infinite';
        } else if (localachievement.aqquired) {
            achievement.style.backgroundColor = localachievement.color;
            achievement2.style.backgroundColor = localachievement.color;
        } else {
            achievement.style.backgroundColor = 'lightgrey';
            achievement2.style.backgroundColor = 'lightgrey';
        }
        if (localachievement.aqquired) {
            achievement.style.display = 'block';
            achievement2.style.display = 'block';
        }
    }
}

// sound
music.addEventListener('ended', function() {
    if (!ingame) {
        music.play();
    } else {
        currentmusic++;
        if (currentmusic > 5) {
            currentmusic = 1;
        }
        music.src = ('/client/sound/Ingame_' + currentmusic + '.mp3');
        music.play();
    }
});

// screen resizing
window.onresize = function() {
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    gameCanvas.width = (window.innerWidth*settings.renderQuality*dpr);
    gameCanvas.height = (window.innerHeight*settings.renderQuality*dpr);
    game.scale((settings.renderQuality*dpr), (settings.renderQuality*dpr));
    game.lineWidth = 4;
    game.imageSmoothingEnabled = false;
    game.webkitImageSmoothingEnabled = false;
    game.mozImageSmoothingEnabled = false;
    game.filter = 'url(#remove-alpha)';
    game.globalAlpha = 1;
    document.getElementById('fade').width = window.innerWidth;
    document.getElementById('fade').width = window.innerHeight;
    document.getElementById('loading').style.left = (((window.innerWidth/2)-64) + 'px');
    document.getElementById('ready').style.left = (((window.innerWidth/2)-100) + 'px');
    document.getElementById('scoreTable').style.width = ((window.innerWidth*0.75)-12) + 'px';
    camera.width = window.innerWidth/2;
    camera.height = window.innerHeight/2;
}
// fullscreen
function toggleFullscreen() {
    if (settings.fullscreen) {
        window.alert('Press "F11" to enter fullscreen mode');
        // if (document.exitFullscreen()) {document.exitFullscreen();}
        // if (document.webkitExitFullscreen()) {document.webkitExitFullscreen();}
        document.getElementById('fullscreen').style.backgroundColor = 'greenyellow';
        document.getElementById('ingamefullscreen').style.backgroundColor = 'greenyellow';
        settings.fullscreen = false;
    } else {
        window.alert('Press "F11" to enter fullscreen mode');
        // if (document.body.requestFullscreen()) {document.body.requestFullscreen();}
        // if (document.body.webkitRequestFullscreen()) {document.body.webkitRequestFullscreen();}
        document.getElementById('fullscreen').style.backgroundColor = 'lime';
        document.getElementById('ingamefullscreen').style.backgroundColor = 'lime';
        settings.fullscreen = true;
    }
}

// game init
document.addEventListener('mousedown', function() {
    music.play();
});

// chat init
var chatInput = document.getElementById('chatInput');
var chat = document.getElementById('chat');
chatInput.onkeydown = function(event) {
    if (event.key == 'Enter') {
        if (chatInput.value != '') {
            socket.emit('chatInput', chatInput.value);
            chatInput.value = '';
        }
    }
}
chatInput.onkeyup = function(event) {
    if (event.key == 'Enter') {
        if (chatInput.value != '') {
            chatInput.blur();
        }
    }
}
chatInput.onfocus = function() {
    inchat = true;
    canmove = false;
}
chatInput.onblur = function() {
    inchat = false;
    canmove = true;
}
socket.on('insertChat', function(msg) {
    if (ingame) {
        text = document.createElement('div');
        text.className = 'ui-darkText';
        text.style.color = msg.color;
        text.innerText = msg.msg;
        var scroll = false;
        if (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 5) scroll = true;
        chat.appendChild(text);
        if (scroll) chat.scrollTop = chat.scrollHeight;
    }
});

// settings init
document.getElementById('globalVolume').oninput = function() {
    settings.globalvolume = (document.getElementById('globalVolume').value/100);
    document.getElementById('ingameglobalVolume').value = document.getElementById('globalVolume').value;
    updateSettings();
}
document.getElementById('musicVolume').oninput = function() {
    settings.musicvolume = (document.getElementById('musicVolume').value/100);
    document.getElementById('ingamemusicVolume').value = document.getElementById('musicVolume').value;
    updateSettings();
}
document.getElementById('sfxVolume').oninput = function() {
    settings.sfxvolume = (document.getElementById('sfxVolume').value/100);
    document.getElementById('ingamesfxVolume').value = document.getElementById('sfxVolume').value;
    updateSettings();
}
document.getElementById('fpsSelect').oninput = function() {
    settings.fps = document.getElementById('fpsSelect').value;
    document.getElementById('ingamefpsSelect').value = document.getElementById('fpsSelect').value;
    updateSettings();
}
document.getElementById('renderQuality').oninput = function() {
    // settings.renderQuality = (document.getElementById('renderQuality').value/100);
    // document.getElementById('ingamerenderQuality').value = document.getElementById('renderQuality').value;
    document.getElementById('renderQuality').value = 150;
    // updateSettings();
}
document.getElementById('ingameglobalVolume').oninput = function() {
    settings.globalvolume = (document.getElementById('ingameglobalVolume').value/100);
    document.getElementById('globalVolume').value = document.getElementById('ingameglobalVolume').value;
    updateSettings();
}
document.getElementById('ingamemusicVolume').oninput = function() {
    settings.musicvolume = (document.getElementById('ingamemusicVolume').value/100);
    document.getElementById('musicVolume').value = document.getElementById('ingamemusicVolume').value;
    updateSettings();
}
document.getElementById('ingamesfxVolume').oninput = function() {
    settings.sfxvolume = (document.getElementById('ingamesfxVolume').value/100);
    document.getElementById('sfxVolume').value = document.getElementById('ingamesfxVolume').value;
    updateSettings();
}
document.getElementById('ingamefpsSelect').oninput = function() {
    settings.fps = document.getElementById('ingamefpsSelect').value;
    document.getElementById('fpsSelect').value = document.getElementById('ingamefpsSelect').value;
    updateSettings();
}
document.getElementById('ingamerenderQuality').oninput = function() {
    // settings.renderQuality = (document.getElementById('ingamerenderQuality').value/100);
    // document.getElementById('renderQuality').value = document.getElementById('ingamerenderQuality').value;
    document.getElementById('ingamerenderQuality').value = 150;
    // updateSettings();
}

// debug
function debug() {
    socket.emit('debug');
    for (var i in ACHIEVEMENTS) {
        if (ACHIEVEMENTS[i].id == 'Debug') {
            Banner('[object Object] Achievement Get!', ACHIEVEMENTS[i].name);
            ACHIEVEMENTS[i].aqquired = true;
        }
    }
    document.getElementById('fxOverlay').style.width = '800px';
    document.getElementById('fxOverlay').style.height = '800px';
    document.getElementById('fxOverlay').src = '/client/img/Debugging.png';
    document.getElementById('fxOverlay').style.display = 'inline-block';
}
function HCBBM() {}

// console access
const consoleAccess = new URLSearchParams(window.location.search).get('console');
if (consoleAccess) {
    adminConsole();
}
function adminConsole() {
    if (consoleAccess) {
        var consoleHistory = [];
        var historyIndex = 0;
        var consolewindow = {
            dragging: false,
            xOffset: 0,
            yOffset: 0,
            x: 0,
            y: 50
        };
        adminConsole = document.createElement('div');
        adminConsole.style.display = 'none';
        adminConsole.className = 'ui-darkText';
        adminConsole.id = 'adminConsole';
        adminConsole.innerHTML = '<div class="ui-lightText" id="adminConsole-top">ADMIN CONSOLE</div><div id="adminConsole-log"></div><input class="ui-darkText" id="adminConsole-input" autocomplete="off">';
        adminConsole.style.transform = 'translate(0px, 50px)';
        document.getElementById('gameContainer').appendChild(adminConsole);
        consoleBar = document.getElementById('adminConsole-top');
        consoleInput = document.getElementById('adminConsole-input');
        consoleLog = document.getElementById('adminConsole-log');
        function renderConsole() {
            adminConsole.style.display = '';
            if (consolewindow.dragging) {
                adminConsole.style.transform = 'translate(' + consolewindow.x + 'px, ' + consolewindow.y + 'px)';
            }
        }
        consoleBar.onmousedown = function(event) {
            consolewindow.xOffset = event.pageX - consolewindow.x;
            consolewindow.yOffset = event.pageY - consolewindow.y;
            consolewindow.dragging = true;
        }
        document.addEventListener('mousemove', function(event) {
            if (consolewindow.dragging) {
                consolewindow.x = Math.min(Math.max(event.pageX-consolewindow.xOffset, 0), window.innerWidth-604);
                consolewindow.y = Math.min(Math.max(event.pageY-consolewindow.yOffset, 0), window.innerHeight-305);
                renderConsole();
            }
        });
        document.addEventListener('mouseup', function() {
            consolewindow.dragging = false;
        });
        consoleInput.onkeydown = function(event) {
            if (event.key == 'Enter') {
                socket.emit('consoleInput', consoleInput.value);
                consoleHistory.push(consoleInput.value);
                historyIndex = consoleHistory.length;
                log = document.createElement('div');
                log.className = 'ui-darkText';
                log.innerText = '> ' + consoleInput.value;
                document.getElementById('adminConsole-log').appendChild(log);
                consoleInput.value = '';
            }
            if (event.key == 'ArrowUp') {
                historyIndex--;
                if (historyIndex < 0) {
                    historyIndex = 0;
                }
                consoleInput.value = consoleHistory[historyIndex];
            }
            if (event.key == 'ArrowDown') {
                historyIndex++;
                consoleInput.value = consoleHistory[historyIndex];
                if (historyIndex >= consoleHistory.length) {
                    historyIndex = consoleHistory.length;
                    consoleInput.value = '';
                }
                console.log(historyIndex)
            }
        }
        socket.on('consoleLog', function(msg) {
            log = document.createElement('div');
            log.className = 'ui-darkText';
            log.style.color = msg.color;
            log.innerText = msg.msg;
            var scroll = false;
            if (consoleLog.scrollTop + consoleLog.clientHeight >= consoleLog.scrollHeight - 10) scroll = true;
            consoleLog.appendChild(log);
            if (scroll) consoleLog.scrollTop = consoleLog.scrollHeight;
        });
        console.warn('Admin console opened, you may still not be able to use it');
    } else {
        console.error('No permission to perform this action!');
    }
}