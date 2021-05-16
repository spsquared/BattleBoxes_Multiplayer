// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript('./client/js/game.js');
$.getScript('./client/js/entity.js');
$.getScript('./client/js/menu.js');
PLAYER_LIST = {};
BULLET_LIST = {};
MAPS = [];
CURRENT_MAP = 0;
ACHIEVEMENTS = [];
BANNERS = [];
game = document.getElementById('gameCanvas').getContext('2d');
music = new Audio();
sfx = [new Audio(), new Audio(), new Audio(), new Audio()];
settings = {globalvolume:(document.getElementById('globalVolume').value/100), musicvolume:(document.getElementById('musicVolume').value/100), sfxvolume:(document.getElementById('sfxVolume').value/100)};
var currentmusic = 1;
var fpsCounter = 0;
var fps = 0;
player = null;
camera = {x:0, y:0, width:window.innerWidth/2, height:window.innerHeight/2};
consoleAccess = false;

// handlers
socket.on('init', function() {
    document.getElementById('disconnectedContainer').style.display = 'none';
    document.getElementById('menuContainer').style.display = 'block';
    document.getElementById('loginContainer').style.display = 'inline-block';
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.querySelectorAll("input").forEach(function(item){if (item.type != 'text' && item.type != 'password') {item.addEventListener('focus', function(){this.blur();});}});
    document.querySelectorAll("button").forEach(function(item){item.addEventListener('focus', function(){this.blur();});});
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight - 1;
    document.getElementById('gameCanvas').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('scoreContainer').addEventListener('contextmenu', e => e.preventDefault());
    game.lineWidth = 4;
    game.webkitImageSmoothingEnabled = false;
    game.imageSmoothingEnabled = false;
    game.filter = 'url(#remove-alpha)';
    document.getElementById('fade').width = window.innerWidth;
    document.getElementById('fade').width = window.innerHeight;
    document.getElementById('loading').style.left = (((window.innerWidth/2)-64) + 'px');
    document.getElementById('ready').style.left = (((window.innerWidth/2)-100) + 'px');
    $.getJSON('./client/assets/AchievementsList.json', function(data) {
        ACHIEVEMENTS = data.data;
    });
    document.getElementById('announcementsPage').width = (window.innerWidth-64);
    try {
        document.getElementById('announcementsEmbed').remove();
    } catch (error) {}
    var announcementsEmbed = document.createElement('div');
    announcementsEmbed.id = 'announcementsEmbed';
    $.get('https://raw.githubusercontent.com/definitely-nobody-is-here/BBmulti_Announcements/master/Announcements.html', function(file) {
        announcementsEmbed.innerHTML = file;
        document.getElementById('announcements-failedLoadimg').style.display = 'none';
        document.getElementById('announcements-failedLoad').style.display = 'none';
    });
    document.getElementById('announcementsPage').appendChild(announcementsEmbed);
    music.volume = settings.musicvolume;
    for (var i in sfx) {
        sfx[i].volume = settings.sfxvolume;
    }
    music.src = '/client/sound/Menu.mp3';
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
    document.getElementById('gameCanvas').height = window.innerHeight - 1;
    game.lineWidth = 4;
    game.imageSmoothingEnabled = false;
    game.webkitImageSmoothingEnabled = false;
    game.mozImageSmoothingEnabled = false;
    game.filter = 'url(#remove-alpha)';
    document.getElementById('fade').width = window.innerWidth;
    document.getElementById('fade').width = window.innerHeight;
    document.getElementById('loading').style.left = (((window.innerWidth/2)-64) + 'px');
    document.getElementById('ready').style.left = (((window.innerWidth/2)-100) + 'px');
    camera.width = window.innerWidth/2;
    camera.height = window.innerHeight/2;
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

function debug() {
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