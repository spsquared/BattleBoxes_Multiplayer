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
        game.fillRect(self.x, self.y, 32, 32);
    }
    return self;
}
Player.update = function(data) {
    for (var i = 0; i < data.length; i++) {
        var localplayer = PLAYER_LIST[data[i].id];
        console.log(data[i].id);
        localplayer.update();
    }
}
