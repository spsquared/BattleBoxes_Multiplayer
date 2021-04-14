/* login functions */
function login() {
    if (document.getElementById('usrname').value == '') {
        window.alert('Please provide a Username.');
    } else {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('mainmenuContainer').style.display = 'inline-block';
        socket.emit('login', {usrname: document.getElementById('usrname').value,psword: document.getElementById('psword').value});
    }
}

/* menu functions */
function play() {
    socket.emit('join-game');
    document.getElementById('mainmenuContainer').style.display = 'none';
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

/* handlers */
socket.on('init', function() {
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('gameCanvas').width = window.innerWidth;
    document.getElementById('gameCanvas').height = window.innerHeight;
    document.getElementById('gameCanvas').height -= 1;
    document.getElementById('disconnectedContainer').style.display = 'none';
});
socket.on('getID', function() {
    document.getElementById('loginContainer').style.display = 'inline-block';
});
socket.on('disconnected', function() {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainmenuContainer').style.display = 'none';
    document.getElementById('settingsmenuContainer').style.display = 'none';
    document.getElementById('achievementsmenuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'inline-block'
});