// Copyright (C) 2021 Radioactive64

var music;

// login functions
function login() {
    if (document.getElementById('usrname').value == '') {
        window.alert('Please provide a Username.');
    } else {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainmenuContainer').style.display = 'inline-block';
        socket.emit('login', {usrname: document.getElementById('usrname').value,psword: document.getElementById('psword').value});
    }
}

// menu functions
function play() {
    socket.emit('join-game');
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'inline-block';
    document.getElementById('loading').style.display = 'inline-block';
};
function settings() {
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'inline-block';
}
function announcements() {
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('announcementsContainer').style.display = 'inline-block';
}
function achievements() {
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('achievementsContainer').style.display = 'inline-block';
}
function back() {
    document.getElementById('settingsContainer').style.display = 'none';
    document.getElementById('announcementsContainer').style.display = 'none';
    document.getElementById('achievementsContainer').style.display = 'none';
    document.getElementById('mainmenuContainer').style.display = 'inline-block';
}
function disconnectclient() {
    socket.emit('disconnectclient', {id: document.getElementById('usrname').value});
}

// ingame menu functions
function resume() {
    document.getElementById('ingameMenu').style.display = 'none';
    inmenu = false;
}
function ingameSettings() {

}
function ingameAchievements() {

}
function quittoMenu() {

}

// handlers
socket.on('init', function() {
    // set up page
    document.getElementById('disconnectedContainer').style.display = 'none';
    document.getElementById('menuContainer').style.display = 'block';
    document.getElementById('loginContainer').style.display = 'inline-block';
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('credits').style.top = (window.innerHeight - 76) + 'px';
    document.getElementById('githublink').style.top = (window.innerHeight - 58) + 'px';
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight - 1;
    document.getElementById('gameCanvas').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('gameCanvas').onmouseup = function() {shooting = false;};
    document.getElementById('gameCanvas').getContext('2d').lineWidth = 2;
    document.getElementById('ingameMenu').style.left = (window.innerWidth/2);
    var announcementsEmbed = document.createElement('div');
    $.get('https://raw.githubusercontent.com/definitely-nobody-is-here/BBmulti_Announcements/master/Announcements.html', function(file) {
        announcementsEmbed.innerHTML = file;
    });
    document.getElementById('announcementsPage').appendChild(announcementsEmbed);
    music = $("#music");
    music.src = "/client/sound/Menu.mp3";
    //music.load();
    //music.play();
});
socket.on('disconnected', function() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'inline-block';
});