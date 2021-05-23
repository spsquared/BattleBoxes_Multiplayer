// Copyright (C) 2021 Radioactive64

// login functions
function login() {
    if (document.getElementById('usrname').value == '') {
        window.alert('Please provide a Username.');
    } else if (document.getElementById('usrname').value.length > 64) {
        window.alert('Your username must be 64 or less characters.')
    } else if (document.getElementById('usrname').value == '64 or less characters') {
        socket.emit('disconnectclient');
    } else if (document.getElementById('usrname').value.indexOf(' ') > 0) {
        window.alert('Your username cannot contain whitespaces');
    } else {
        socket.emit('login', {usrname: document.getElementById('usrname').value,psword: document.getElementById('psword').value});
    }
}
function signup() {
    if (document.getElementById('usrname').value == '') {
        window.alert('Please provide a Username.');
    } else if (document.getElementById('usrname').value.length > 64) {
        window.alert('Your username must be 64 or less characters.')
    } else if (document.getElementById('usrname').value == '64 or less characters') {
        socket.emit('disconnectclient');
    } else if (document.getElementById('usrname').value.indexOf(' ') == 0) {
        window.alert('Your username cannot contain whitespaces');
    } else if (document.getElementById('usrname').value.indexOf('\\') == 0 || document.getElementById('usrname').value.indexOf('"') == 0) {
        window.alert('Your username cannot contain any of these special characters:\n\\  "');
    } else if (document.getElementById('psword').value.indexOf('\\') == 0 || document.getElementById('psword').value.indexOf('"') == 0) {
        window.alert('Your password cannot contain any of these special characters:\n\\  "');
    } else {
        socket.emit('signup', {usrname: document.getElementById('usrname').value,psword: document.getElementById('psword').value});
    }
}
function deleteAccount(state) {
    if (state == 1) {
        document.getElementById('deleteAccount').innerHTML = ' ARE YOU SURE? ';
        document.getElementById('deleteAccount').addEventListener('mouseup', function() {
            document.getElementById('deleteAccount').onclick = deleteAccount(2);
        });
    } else {
        answer = window.prompt('Type in your password to confirm:');
        socket.emit('deleteAccount', {usrname:document.getElementById('usrname').value, psword:answer});
    }
}
function changePassword() {
    var input1 = window.prompt('Please enter your current password:');
    if (input1 == document.getElementById('psword').value) {
        var input2 = window.prompt('Please enter your new password');
        document.getElementById('psword').value = input2;
        socket.emit('changePassword', {usrname: document.getElementById('usrname').value, psword:input1, newpsword:input2});
    } else {
        window.alert('Incorrect password.');
    }
}
socket.on('loginConfirmed', function(state) {
    if (state == 'signup') {
        window.alert('Successfully signed up.');
    }
    if (state == 'deleted') {
        window.alert('Your account has been successfully deleted');
        window.location.reload();
    }
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainmenuContainer').style.display = 'inline-block';
});
socket.on('loginFailed', function(state) {
    if (state == 'invalidusrname') {
        window.alert('No user with username "' + document.getElementById('usrname').value + '" found. Please check your spelling or sign up.');
    } else if (state == 'incorrect') {
        window.alert('Incorrect username or password. Please try again.');
        document.getElementById('deleteAccount').innerHTML = ' DELETE ACCOUNT ';
    } else if (state == 'usrexists') {
        window.alert('User with username "' + document.getElementById('usrname').value + '" already exists. Please choose a different username.');
    } else if (state == 'alreadyloggedin') {
        window.alert('User with username "' + document.getElementById('usrname').value + '" is already logged in. You cannot login twice.');
    }
});

// menu functions
function play() {
    sfx[0].src = ('/client/sound/Play.mp3');
    sfx[0].play();
    document.getElementById('canceljoingame').style.display = 'none';
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
    updateAchievements();
    navStatistics();
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
function canceljoin() {
    document.getElementById('menuContainer').style.display = 'block';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('canceljoingame').style.display = 'none';
    document.getElementById('serverfull').style.display = 'none';
    document.getElementById('gamelocked').style.display = 'none';
    music.src = ('/client/sound/Menu.mp3');
    music.play();
    fadeOut();
}

// achievements menu functions
function navStatistics() {
    document.getElementById('achievementsACHIEVEMENTS').style.display = 'none';
    document.getElementById('achievementsSTATISTICS').style.display = 'inline-block';
    document.getElementById('navStatistics').style.backgroundColor = 'grey';
    document.getElementById('navStatistics').style.borderBottom = 'grey 4px solid';
    document.getElementById('navAchievements').style.backgroundColor = '';
    document.getElementById('navAchievements').style.borderBottom = '';
}
function navAchievements() {
    document.getElementById('achievementsSTATISTICS').style.display = 'none';
    document.getElementById('achievementsACHIEVEMENTS').style.display = 'inline-block';
    document.getElementById('navAchievements').style.backgroundColor = 'grey';
    document.getElementById('navAchievements').style.borderBottom = 'grey 4px solid';
    document.getElementById('navStatistics').style.backgroundColor = '';
    document.getElementById('navStatistics').style.borderBottom = '';
}

// ingame menu functions
function resume() {
    document.getElementById('ingameMenu').style.display = 'none';
    inmenu = false;
}
function openingameSettings() {
    document.getElementById('ingameMainMenuContainer').style.display = 'none';
    document.getElementById('ingameSettingsContainer').style.display = 'inline-block';
}
function openingameAchievements() {
    updateAchievements();
    document.getElementById('ingameMainMenuContainer').style.display = 'none';
    document.getElementById('ingameAchievementsContainer').style.display = 'inline-block';
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
        document.getElementById('scoreContainer').style.display = 'none';
        ingameBack();
        document.getElementById('ingameMenu').style.display = 'none';
        fadeOut();
    }, 1000);
}
function ingameBack() {
    document.getElementById('ingameSettingsContainer').style.display = 'none';
    document.getElementById('ingameAchievementsContainer').style.display = 'none';
    document.getElementById('ingameMainMenuContainer').style.display = 'inline-block';
}