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
    self.ingame = false;
    self.hp = 5;
    self.score = 0;
    self.color = color;
    self.draw = function() {
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
    self.x = x+16;
    self.y = y+16;
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
socket.on('newplayer', function(pkg) {
    var localplayer = Player(pkg.id, pkg.name, pkg.color);
    PLAYER_LIST[pkg.id] = localplayer;
});
socket.on('newbullet', function(pkg) {
    var localbullet = Bullet(pkg.id, pkg.x, pkg.y, pkg.angle, pkg.parent, pkg.color);
    BULLET_LIST[pkg.id] = localbullet;
});