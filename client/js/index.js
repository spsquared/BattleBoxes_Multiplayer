// Copyright (C) 2021 Radioactive64

music = new Audio();
sfx = [new Audio(), new Audio(), new Audio(), new Audio()];
settings = {globalvolume:(document.getElementById('globalVolume').value/100), musicvolume:(document.getElementById('musicVolume').value/100), sfxvolume:(document.getElementById('sfxVolume').value/100)};
var currentmusic = 1;
var fpsCounter = 0;
var fps = 0;

// handlers
socket.on('init', function() {
    document.getElementById('disconnectedContainer').style.display = 'none';
    document.getElementById('menuContainer').style.display = 'block';
    document.getElementById('loginContainer').style.display = 'inline-block';
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight - 1;
    document.getElementById('gameCanvas').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('gameCanvas').onmouseup = function() {shooting = false;};
    document.getElementById('gameCanvas').getContext('2d').lineWidth = 2;
    document.getElementById('fade').width = window.innerWidth;
    document.getElementById('fade').width = window.innerHeight;
    document.getElementById('loading').style.left = (((window.innerWidth/2)-64) + 'px');
    document.getElementById('ready').style.left = (((window.innerWidth/2)-100) + 'px');
    document.getElementById('announcementsPage').width = (window.innerWidth-64);
    var announcementsEmbed = document.createElement('div');
    $.get('https://raw.githubusercontent.com/definitely-nobody-is-here/BBmulti_Announcements/master/Announcements.html', function(file) {
        announcementsEmbed.innerHTML = file;
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
    document.getElementById('fade').width = window.innerWidth;
    document.getElementById('fade').width = window.innerHeight;
    document.getElementById('loading').style.left = (((window.innerWidth/2)-64) + 'px');
    document.getElementById('ready').style.left = (((window.innerWidth/2)-100) + 'px');
    camera.w = window.innerWidth/2;
    camera.h = window.innerHeight/2;
};
// init
document.addEventListener('mousedown', function() {
    music.play();
});
document.getElementById('globalVolume').oninput = function() {
    settings.globalvolume = (document.getElementById('globalVolume').value/100);
    updateSettings();
}
document.getElementById('musicVolume').oninput = function() {
    settings.musicvolume = (document.getElementById('musicVolume').value/100);
    updateSettings();
}
document.getElementById('sfxVolume').oninput = function() {
    settings.sfxvolume = (document.getElementById('sfxVolume').value/100);
    updateSettings();
}