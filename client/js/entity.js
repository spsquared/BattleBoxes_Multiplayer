var game = document.getElementById('gameCanvas').getContext('2d');
var PLAYER_LIST = {};
var BULLET_LIST = {};

// entity
var Entity = function() {
    var self = {
        x:0,
        y:0,
        id:"",
        color:"#000000"
    }
    self.update = function() {
        self.draw();
    }
    self.draw = function() {}
    return self;
}

// player
var Player = function(id, name, color) {
    var self = Entity();
    self.id = id;
    self.name = name;
    self.hp = 5;
    self.score = 0;
    self.color = color;
    var HP_Color = ["#FFFFFF", "#FF0000", "#FF9900", "#FFFF00", "#99FF00", "#00FF00"];
    self.draw = function() {
        game.fillStyle = "#000000";
        game.textAlign = "center"
        game.fillText(self.name, self.x, self.y-32);
        var hpWidth = 60* (self.hp/5);
        game.fillStyle = HP_Color[self.hp];
        game.fillRect(self.x-(hpWidth/2), self.y-24, hpWidth, 4)
        game.fillStyle = color;
        game.fillRect(self.x-16, self.y-16, 32, 32);
    }
    return self;
}
Player.update = function(players) {
    for (var i = 0; i < players.length; i++) {
        var localplayer = PLAYER_LIST[players[i].id];
        localplayer.x = players[i].x;
        localplayer.y = players[i].y;
        localplayer.update();
    }
}

// bullets
var Bullet = function(id, x, y, angle, parent, color) {
    var self = Entity();
    self.id = id;
    self.x = x;
    self.y = y;
    self.xspeed = Math.cos(angle)*20;
    self.yspeed = Math.sin(angle)*20;
    self.todelete = false;
    self.parent = parent;
    self.color = color;
    BULLET_LIST[self.id] = self;
    self.update = function() {
        self.x += self.xspeed;
        self.y += self.yspeed;
        self.draw();
    }
    self.draw = function() {
        game.fillStyle = color;
        game.fillRect(self.x-2, self.y-2, 4, 4);
    }
    return self;
}
Bullet.update = function() {
    for (var i in BULLET_LIST) {
        var localbullet = BULLET_LIST[i];
        localbullet.update();
    }
}

// game handlers
socket.on('initgame', function(pkg) {
    for (var i in pkg.players) {
        var localplayer = Player(pkg.players[i].id, pkg.players[i].name, pkg.players[i].color);
        PLAYER_LIST[localplayer.id] = localplayer;
    }
    for (var i in pkg.bullets) {
        var localbullet = Bullet(pkg.bullets[i].id, pkg.bullets[i].x, pkg.bullets[i].y, pkg.bullets[i].angle, pkg.bullets[i].parent, pkg.bullets[i].color);
        BULLET_LIST[localbullet.id] = localbullet;
    }
});
socket.on('newplayer', function(pkg) {
    var localplayer = Player(pkg.id, pkg.name, pkg.color);
    PLAYER_LIST[localplayer.id] = localplayer;
});
socket.on('deleteplayer', function(id) {
    delete PLAYER_LIST[id];
});
socket.on('newbullet', function(pkg) {
    var localbullet = Bullet(pkg.id, pkg.x, pkg.y, pkg.angle, pkg.parent, pkg.color);
    BULLET_LIST[pkg.id] = localbullet;
});