// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript('./client/js/game.js');
$.getScript('./client/js/entity.js');
$.getScript('./client/js/menu.js');
PLAYER_LIST = {};
BULLET_LIST = {};
MAPS = [];
CURRENT_MAP = 0;
TRACKED_DATA = {kills:0, deaths:0, wins:0};
ACHIEVEMENTS = [];
BANNERS = [];
game = document.getElementById('gameCanvas').getContext('2d');
music = new Audio();
sfx = [new Audio(), new Audio(), new Audio(), new Audio()];
settings = {globalvolume:(document.getElementById('globalVolume').value/100), musicvolume:(document.getElementById('musicVolume').value/100), sfxvolume:(document.getElementById('sfxVolume').value/100)};
var currentmusic = 1;
tpsCounter = 0;
tps = 0;
ping = 0;
pingCounter = 0;
lastDate = 0;
currentDate = 0;
player = null;
camera = {x:0, y:0, width:window.innerWidth/2, height:window.innerHeight/2};
consoleAccess = false;
var firstload = true;
var fullscreen = false;

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
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight;
    document.getElementById('gameCanvas').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('scoreContainer').addEventListener('contextmenu', e => e.preventDefault());
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
    document.getElementById('ingameGV-label').innerHTML = (Math.floor(settings.globalvolume*100) + '%');
    document.getElementById('ingameMV-label').innerHTML = (Math.floor(settings.musicvolume*100) + '%');
    document.getElementById('ingameEV-label').innerHTML = (Math.floor(settings.sfxvolume*100) + '%');
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
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight;
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
    camera.width = window.innerWidth/2;
    camera.height = window.innerHeight/2;
}
// fullscreen
function toggleFullscreen() {
    if (fullscreen) {
        window.alert('Press "F11" to enter fullscreen mode');
        // if (document.exitFullscreen()) {document.exitFullscreen();}
        // if (document.webkitExitFullscreen()) {document.webkitExitFullscreen();}
        document.getElementById('fullscreen').style.backgroundColor = 'greenyellow';
        fullscreen = false;
    } else {
        window.alert('Press "F11" to enter fullscreen mode');
        // if (document.body.requestFullscreen()) {document.body.requestFullscreen();}
        // if (document.body.webkitRequestFullscreen()) {document.body.webkitRequestFullscreen();}
        document.getElementById('fullscreen').style.backgroundColor = 'lime';
        fullscreen = true;
    }
}

// init
document.addEventListener('mousedown', function() {
    music.play();
});
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

// console access
consoleAccess = new URLSearchParams(window.location.search).get('console');
if (consoleAccess == null) {
    consoleAccess = false;
}