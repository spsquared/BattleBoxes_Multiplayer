// Copyright (C) 2021 Radioactive64

// login functions
function login() {
    if (document.getElementById('usrname').value == '') {
        window.alert('Please provide a Username.');
    } else if (document.getElementById('usrname').value.length > 64) {
        window.alert('Your username must be 64 or less characters.')
    } else if (document.getElementById('usrname').value == '64 or less characters') {
        socket.emit('disconnectclient');
    } else {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainmenuContainer').style.display = 'inline-block';
        socket.emit('login', {usrname: document.getElementById('usrname').value,psword: document.getElementById('psword').value});
    }
}
function signup() {
    socket.emit('disconnectclient');
}

// menu functions
function play() {
    sfx[0].src = ('/client/sound/Play.mp3');
    sfx[0].play();
    fadeIn();
    setTimeout(function() {
        socket.emit('joingame');
        document.getElementById('menuContainer').style.display = 'none';
        document.getElementById('gameContainer').style.display = 'inline-block';
        music.src = ('/client/sound/Ingame_' + currentmusic + '.mp3');
        music.play();
    }, 1000);

}
function openSettings() {
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('settingsContainer').style.display = 'inline-block';
}
function openAnnouncements() {
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('announcementsContainer').style.display = 'inline-block';
}
function openAchievements() {
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
    socket.emit('leavegame');
    sfx[0].src = ('/client/sound/Leave.mp3');
    sfx[0].play();
    fadeIn();
    setTimeout(function() {
        document.getElementById('menuContainer').style.display = 'block';
        document.getElementById('gameContainer').style.display = 'none';
        music.src = ('/client/sound/Menu.mp3');
        music.play();
        ingame = false;
        inmenu = false;
        readyforstart = false;
        document.getElementById('ready').style.opacity = 1;
        document.getElementById('ready').style.display = 'inline-block';
        document.getElementById('ingameMenu').style.display = 'none';
        fadeOut();
    }, 1000);
}