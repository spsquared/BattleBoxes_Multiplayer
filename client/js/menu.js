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
    document.getElementById('settingsmenuContainer').style.display = 'inline-block';
}
function achievements() {
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('achievementsmenuContainer').style.display = 'inline-block';
}
function back() {
    document.getElementById('settingsmenuContainer').style.display = 'none';
    document.getElementById('achievementsmenuContainer').style.display = 'none';
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
    document.getElementById('disconnectedContainer').style.display = 'none';
    document.getElementById('menuContainer').style.display = 'block';
    document.getElementById('credits').style.top = (window.innerHeight - 44);
    document.getElementById('githublink').style.top = (window.innerHeight - 26);
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight - 1;
    document.getElementById('gameCanvas').addEventListener('contextmenu', e => e.preventDefault());
    document.getElementById('gameCanvas').onmouseup = function() {shooting = false;};
    document.getElementById('ingameMenu').style.left = (window.innerWidth/2);
    music = $("#music");
    music.src = "/client/sound/Menu.mp3";
    //music.load();
    //music.play();
});
socket.on('getID', function() {
    document.getElementById('loginContainer').style.display = 'inline-block';
});
socket.on('disconnected', function() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'inline-block';
});