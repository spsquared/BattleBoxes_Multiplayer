// Copyright (C) 2021 Radioactive64

$.ajaxSetup({cache: true, async:false});
$.getScript('./client/js/game.js');
$.getScript('./client/js/entity.js');
$.getScript('./client/js/menu.js');
var dpr = 1;
if (window.devicePixelRatio) {
    dpr = window.devicePixelRatio;
}
game = document.getElementById('gameCanvas').getContext('2d');
gameCanvas = document.getElementById('gameCanvas');
music = new Audio();
settings = {
    globalvolume: (document.getElementById('globalVolume').value/100),
    musicvolume: (document.getElementById('musicVolume').value/100),
    sfxvolume: (document.getElementById('sfxVolume').value/100),
    fullscreen: false,
    fps: document.getElementById('fpsSelect').value,
    renderQuality: (document.getElementById('renderQuality').value/100)
};
var currentmusic = 1;
camera = {
    x: 0,
    y: 0,
    width: window.innerWidth/2,
    height: window.innerHeight/2
};
gameid = Math.random();
var firstload = true;
var documentloaded = false;
window.onload = function() {
    resourcesloaded++;
    documentloaded = true;
}
init();

// init
socket.on('init', function() {
    if (!firstload) {
        socket.emit('disconnected');
        fadeIn();
        setTimeout(function() {
            window.location.reload();
        }, 500);
    } else {
        firstload = false;
    }
});
function init() {
    document.getElementById('loadingBarOuter').style.display = 'block';
    var isloaded = false;
    var waitforload = setInterval(function() {
        var percent = Math.floor((resourcesloaded/10)*100);
        document.getElementById('loadingBarText').innerText = resourcesloaded + '/10 (' + percent + '%)';
        document.getElementById('loadingBarInner').style.width = percent + '%';
        if (percent == 100 && !isloaded && documentloaded) {
            isloaded = true;
            try {
                new OffscreenCanvas(1, 1);
            } catch (err) {
                window.alert('This game may run slower on your browser. Please switch to a supported browser.\nChrome 69+\nEdge 79+\nOpera 56+');
                console.log('This game may run slower on your browser. Please switch to a supported browser.\nChrome 69+\nEdge 79+\nOpera 56+');
            }
            document.getElementById('loadingnote').style.display = 'none';
            setTimeout(function() {
                // set up page and canvas
                document.querySelectorAll("input").forEach(function(item){if (item.type != 'text' && item.type != 'password') {item.addEventListener('focus', function(){this.blur();});}});
                document.querySelectorAll("button").forEach(function(item){item.addEventListener('focus', function(){this.blur();});});
                document.getElementById('viewport').width = window.innerWidth;
                document.getElementById('viewport').height = window.innerHeight;
                gameCanvas.width = (window.innerWidth*settings.renderQuality*dpr);
                gameCanvas.height = (window.innerHeight*settings.renderQuality*dpr);
                game.scale((settings.renderQuality*dpr), (settings.renderQuality*dpr));
                document.addEventListener('contextmenu', e => e.preventDefault());
                document.getElementById('scoreContainer').addEventListener('contextmenu', e => e.preventDefault());
                game.lineWidth = 4;
                game.imageSmoothingEnabled = false;
                game.webkitImageSmoothingEnabled = false;
                game.mozImageSmoothingEnabled = false;
                game.globalAlpha = 1;
                resetFPS();
                document.getElementById('fade').width = window.innerWidth;
                document.getElementById('fade').width = window.innerHeight;
                document.getElementById('ready').style.left = ((window.innerWidth/2)-100) + 'px';
                document.getElementById('scoreTable').style.width = ((window.innerWidth*0.75)-12) + 'px';
                // load cookies
                try {
                    cookiesettings = JSON.parse(document.cookie.replace('settings=', ''));
                    settings.globalvolume = cookiesettings.globalvolume;
                    settings.musicvolume = cookiesettings.musicvolume;
                    settings.sfxvolume = cookiesettings.sfxvolume;
                    settings.fullscreen = cookiesettings.fullscreen;
                    settings.fps = cookiesettings.fps;
                    settings.renderQuality = cookiesettings.renderQuality;
                    document.getElementById('globalVolume').value = settings.globalvolume*100;
                    document.getElementById('ingameglobalVolume').value = settings.globalvolume*100;
                    document.getElementById('musicVolume').value = settings.musicvolume*100;
                    document.getElementById('ingamemusicVolume').value = settings.musicvolume*100;
                    document.getElementById('sfxVolume').value = settings.sfxvolume*100;
                    document.getElementById('ingamesfxVolume').value = settings.sfxvolume*100;
                    document.getElementById('fpsSelect').value = settings.fps;
                    document.getElementById('ingamefpsSelect').value = settings.fps;
                    document.getElementById('renderQuality').value = settings.renderQuality*100;
                    document.getElementById('ingamerenderQuality').value = settings.renderQuality*100;
                    updateSettings();
                } catch {}
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
                music.src = '/client/sound/Menu.mp3';
                // place focus on username
                document.getElementById('usrname').focus();
                fadeOut();
                document.getElementById('loadingBarOuter').style.display = 'none';
                load.total = 0;
                load.progress = 0;
                clearInterval(waitforload);
            }, 100);
        }
    }, 10);
}

// game init
document.addEventListener('mousedown', function() {
    music.play();
});

// chat init
var chatInput = document.getElementById('chatInput');
var chat = document.getElementById('chat');
var toBlur = false;
chatInput.onkeydown = function(event) {
    if (event.key == 'Enter') {
        if (chatInput.value != '') {
            socket.emit('chatInput', chatInput.value);
            chatInput.value = '';
            toBlur = false;
        } else {
            toBlur = true;
        }
    }
}
chatInput.onkeyup = function(event) {
    if (event.key == 'Enter') {
        if (toBlur) {
            chatInput.blur();
        }
    }
}
chatInput.onfocus = function() {
    inchat = true;
    canmove = false;
    socket.emit('keyPress', {key:'W', state:false});
    socket.emit('keyPress', {key:'A', state:false});
    socket.emit('keyPress', {key:'D', state:false});
}
chatInput.onblur = function() {
    setTimeout(function() {
        inchat = false;
        canmove = true;
    }, 10);
}
socket.on('insertChat', function(msg) {
    if (ingame) {
        message = document.createElement('div');
        message.className = 'ui-darkText';
        if (msg.color == 'server') {
            message.style.color = '#FF0000';
            message.style.fontWeight = 'bold';
        } else if (msg.color == 'rainbow-pulse') {
            message.style.animation = 'rainbow-pulse-text 10s infinite';
            message.style.animationTimingFunction = 'ease-in-out';
        } else {
            message.style.color = msg.color;
        }
        message.innerText = msg.msg;
        var scroll = false;
        if (chat.scrollTop + chat.clientHeight >= chat.scrollHeight - 5) scroll = true;
        chat.appendChild(message);
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
    settings.renderQuality = (document.getElementById('renderQuality').value/100);
    document.getElementById('ingamerenderQuality').value = document.getElementById('renderQuality').value;
    // document.getElementById('renderQuality').value = 150;
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
document.getElementById('ingamefpsSelect').oninput = function() {
    settings.fps = document.getElementById('ingamefpsSelect').value;
    document.getElementById('fpsSelect').value = document.getElementById('ingamefpsSelect').value;
    updateSettings();
}
document.getElementById('ingamerenderQuality').oninput = function() {
    settings.renderQuality = (document.getElementById('ingamerenderQuality').value/100);
    document.getElementById('renderQuality').value = document.getElementById('ingamerenderQuality').value;
    // document.getElementById('ingamerenderQuality').value = 150;
    updateSettings();
}

// connection handlers
socket.on('disconnected', function() {
    ingame = false;
    socket.emit('disconnected');
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'inline-block';
    clearInterval(waiting);
});
socket.on('timeout', function() {
    document.getElementById('menuContainer').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('disconnectedContainer').style.display = 'inline-block';
    clearInterval(waiting);
});

// settings functions
async function updateSettings() {
    music.volume = (settings.globalvolume*settings.musicvolume);
    document.getElementById('GV-label').innerHTML = (Math.floor(settings.globalvolume*100) + '%');
    document.getElementById('MV-label').innerHTML = (Math.floor(settings.musicvolume*100) + '%');
    document.getElementById('EV-label').innerHTML = (Math.floor(settings.sfxvolume*100) + '%');
    document.getElementById('RQ-label').innerHTML = (Math.floor(settings.renderQuality*100) + '%');
    document.getElementById('ingameGV-label').innerHTML = (Math.floor(settings.globalvolume*100) + '%');
    document.getElementById('ingameMV-label').innerHTML = (Math.floor(settings.musicvolume*100) + '%');
    document.getElementById('ingameEV-label').innerHTML = (Math.floor(settings.sfxvolume*100) + '%');
    document.getElementById('ingameRQ-label').innerHTML = (Math.floor(settings.renderQuality*100) + '%');
    gameCanvas.width = (window.innerWidth*settings.renderQuality*dpr);
    gameCanvas.height = (window.innerHeight*settings.renderQuality*dpr);
    game.scale((settings.renderQuality*dpr), (settings.renderQuality*dpr));
    gameCanvas.width = (window.innerWidth*settings.renderQuality*dpr);
    gameCanvas.height = (window.innerHeight*settings.renderQuality*dpr);
    game.scale((settings.renderQuality*dpr), (settings.renderQuality*dpr));
    game.lineWidth = 4;
    game.imageSmoothingEnabled = false;
    game.webkitImageSmoothingEnabled = false;
    game.mozImageSmoothingEnabled = false;
    game.filter = 'url(#remove-alpha)';
    game.globalAlpha = 1;
    resetFPS();
    var cookiestring = JSON.stringify(settings)
    var date = new Date();
    date.setUTCFullYear(date.getUTCFullYear()+10, date.getUTCMonth(), date.getUTCDate())
    document.cookie = 'settings=' + cookiestring + '; expires=' + date + ';';
}

// achievements functions
async function updateAchievements() {
    document.getElementById('aSTATS_kills').innerText = TRACKED_DATA.kills;
    document.getElementById('aSTATS_deaths').innerText = TRACKED_DATA.deaths;
    document.getElementById('aSTATS_wins').innerText = TRACKED_DATA.wins;
    document.getElementById('aSTATS_loottotal').innerText = TRACKED_DATA.lootboxcollections.total;
    document.getElementById('aSTATS_lootlucky').innerText = TRACKED_DATA.lootboxcollections.lucky;
    document.getElementById('aSTATS_lootunlucky').innerText = TRACKED_DATA.lootboxcollections.unlucky;
    document.getElementById('aSTATS_lootspeed').innerText = TRACKED_DATA.lootboxcollections.speed;
    document.getElementById('aSTATS_lootjump').innerText = TRACKED_DATA.lootboxcollections.jump;
    document.getElementById('aSTATS_lootshield').innerText = TRACKED_DATA.lootboxcollections.shield;
    document.getElementById('aSTATS_lootrandom').innerText = TRACKED_DATA.lootboxcollections.random;
    document.getElementById('aSTATS_loothoming').innerText = TRACKED_DATA.lootboxcollections.homing;
    document.getElementById('aSTATS_lootfirerate').innerText = TRACKED_DATA.lootboxcollections.firerate;
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
            achievement.style.animationTimingFunction = 'ease-in-out';
            achievement2.style.animationTimingFunction = 'ease-in-out';
        } else if (localachievement.color == 'red-pulse' && localachievement.aqquired) {
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
music.oncanplay = function() {
    music.play();
}
music.addEventListener('ended', function() {
    if (!ingame) {
        music.play();
    } else {
        currentmusic++;
        if (currentmusic > 5) {
            currentmusic = 1;
        }
        music.src = ('/client/sound/Ingame_' + currentmusic + '.mp3');
    }
});
function playsound(src) {
    var sound = new Audio(src);
    sound.volume = (settings.globalvolume*settings.sfxvolume);
    sound.oncanplay = function() {
        sound.play();
    }
    sound.addEventListener('ended', function() {
        sound.remove();
    });
}

// screen resizing
window.onresize = function() {
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    document.getElementById('viewport').width = window.innerWidth;
    document.getElementById('viewport').height = window.innerHeight;
    if (window.devicePixelRatio) {
        dpr = window.devicePixelRatio;
    }
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

// very important sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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
            hidden: false,
            dragging: false,
            xOffset: 0,
            yOffset: 0,
            x: 0,
            y: 50,
            height: 300
        };
        adminConsole = document.createElement('div');
        adminConsole.style.display = 'none';
        adminConsole.className = 'ui-darkText';
        adminConsole.id = 'adminConsole';
        adminConsole.innerHTML = '<div class="ui-lightText" id="adminConsole-top">ADMIN CONSOLE<span id="adminConsole-hide"><svg viewport="0 0 16 16" width="16" height="16" xmlns="http://www.w3.org/2000/svg" id="adminConsole-svg"><line x1="2" y1="6" x2="14" y2="6" stroke="black" strokeWidth="4"/></svg></div><div id="adminConsole-log"></div><input class="ui-darkText" id="adminConsole-input" autocomplete="off" spellcheck="false">';
        adminConsole.style.transform = 'translate(0px, 50px)';
        document.getElementById('gameContainer').appendChild(adminConsole);
        consoleBar = document.getElementById('adminConsole-top');
        consoleInput = document.getElementById('adminConsole-input');
        consoleLog = document.getElementById('adminConsole-log');
        consoleHide = document.getElementById('adminConsole-hide');
        consoleSVG = document.getElementById('adminConsole-svg');
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
                consolewindow.y = Math.min(Math.max(event.pageY-consolewindow.yOffset, 0), window.innerHeight-consolewindow.height-5);
                renderConsole();
            }
        });
        document.addEventListener('mouseup', function() {
            consolewindow.dragging = false;
        });
        consoleHide.onmouseup = function() {
            consolewindow.hidden = !consolewindow.hidden;
            if (consolewindow.hidden) {
                consoleInput.style.display = 'none';
                consoleSVG.innerHTML = '<line x1="2" y1="6" x2="14" y2="6" stroke="black" strokeWidth="4"/><line x1="8" y1="0" x2="8" y2="12" stroke="black" strokeWidth="4"/>';
                adminConsole.style.height = '30px';
                consolewindow.height = 30;
            } else {
                consoleInput.style.display = '';
                consoleSVG.innerHTML = '<line x1="2" y1="6" x2="14" y2="6" stroke="black" strokeWidth="4"/>';
                adminConsole.style.height = '300px';
                consolewindow.height = 300;
                consolewindow.y = Math.min(Math.max(consolewindow.y-270, 0), window.innerHeight-consolewindow.height-5);
                renderConsole();
            }
        }
        consoleInput.onkeydown = function(event) {
            if (event.key == 'Enter') {
                socket.emit('consoleInput', consoleInput.value);
                consoleHistory.push(consoleInput.value);
                historyIndex = consoleHistory.length;
                log = document.createElement('div');
                log.className = 'ui-darkText';
                log.innerText = '> ' + consoleInput.value;
                var scroll = false;
                if (consoleLog.scrollTop + consoleLog.clientHeight >= consoleLog.scrollHeight - 5) scroll = true;
                consoleLog.appendChild(log);
                if (scroll) consoleLog.scrollTop = consoleLog.scrollHeight;
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
            }
        }
        socket.on('consoleLog', function(msg) {
            log = document.createElement('div');
            log.className = 'ui-darkText';
            log.style.color = msg.color;
            log.innerText = msg.msg;
            var scroll = false;
            if (consoleLog.scrollTop + consoleLog.clientHeight >= consoleLog.scrollHeight - 5) scroll = true;
            consoleLog.appendChild(log);
            if (scroll) consoleLog.scrollTop = consoleLog.scrollHeight;
        });
        console.warn('Admin console opened, you may still not be able to use it');
    } else {
        console.error('No permission to perform this action!');
    }
}