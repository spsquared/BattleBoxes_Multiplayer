// Copyright (C) 2021 Radioactive64

resourcesloaded++;
PLAYER_LIST = [];
BULLET_LIST = [];
LOOT_BOXES = [];
DEBUG_INFO = [];
HP_Color = ['#FFFFFF', '#FF0000', '#FF9900', '#FFFF00', '#99FF00', '#00FF00'];

// entity
Entity = function(id, x, y, color, docollisions) {
    var self = {
        x: x,
        y: y,
        relx: 0,
        rely: 0,
        id: id,
        color: color,
        collide: docollisions,
        debug:false
    };

    self.update = function(x, y) {
        self.x = x;
        self.y = y;
        self.relx = -(camera.x - self.x);
        self.rely = -(camera.y - self.y);
    }
    self.draw = function() {};

    return self;
}

// player
Player = function(id, name, color) {
    var self = new Entity(id, 0, 0, color);
    self.name = name;
    self.hp = 5;
    self.shield = 0;
    self.score = 0;
    self.alive = true;
    PLAYER_LIST[self.id] = self;
    
    self.update = function(x, y, hp, shield) {
        self.x = x;
        self.y = y;
        self.hp = hp;
        self.shield = shield;
        self.relx = -(camera.x - self.x);
        self.rely = -(camera.y - self.y);
    }
    self.draw = function() {
        if (self.alive) {
            game.fillStyle = '#000000';
            if (self.name == 'null') {
                game.fillStyle = '#FFFFFF00';
            }
            game.textAlign = 'center';
            game.font = '11px Pixel';
            if (self.shield > 0) {
                game.fillText(self.name, self.relx, self.rely-40);
            } else {
                game.fillText(self.name, self.relx, self.rely-32);
            }
            var hpWidth = 60 * (self.hp/5);
            game.fillStyle = HP_Color[self.hp];
            game.fillRect(self.relx-30, self.rely-24, hpWidth, 4);
            var shieldWidth = 60 * (self.shield/5);
            game.fillStyle = '#0080FF';
            game.fillRect(self.relx-30, self.rely-32, shieldWidth, 4);
            game.fillStyle = self.color;
            game.fillRect(self.relx-16, self.rely-16, 32, 32);
        }
    }

    return self;
}
Player.update = function(players) {
    for (var i in players) {
        var localplayer = PLAYER_LIST[players[i].id];
        localplayer.update(players[i].x, players[i].y, players[i].hp, players[i].shield);
    }
}
Player.draw = function() {
    for (var i in PLAYER_LIST) {
        PLAYER_LIST[i].draw();
    }
}

// bullets
Bullet = function(id, x, y, parent, color) {
    var self = new Entity(id, x, y, color);
    self.todelete = false;
    self.parent = parent;
    BULLET_LIST[self.id] = self;

    self.draw = function() {
        game.fillStyle = self.color;
        game.fillRect(self.relx-4, self.rely-4, 8, 8);
    }

    return self;
}
Bullet.update = function(bullets) {
    for (var i in bullets) {
        var localbullet = BULLET_LIST[bullets[i].id];
        localbullet.update(bullets[i].x, bullets[i].y);
    }
}
Bullet.draw = function() {
    for (var i in BULLET_LIST) {
        BULLET_LIST[i].draw();
    }
}

// loot boxes
LootBox = function(id, x, y, effect, obfuscated) {
    var self = new Entity(id, x, y, null);
    self.effect = effect;
    self.obfuscated = obfuscated;
    self.img = new Image(40, 40);
    if (self.obfuscated) {
        self.img.src = './client/img/LootBox_random.png';
    } else {
        self.img.src = './client/img/LootBox_' + self.effect + '.png';
    }
    LOOT_BOXES[self.id] = self;

    self.update = function() {
        self.relx = -(camera.x - self.x);
        self.rely = -(camera.y - self.y);
    }
    self.draw = function() {
        game.drawImage(self.img, self.relx-20, self.rely-20, 40, 40);
    }
}
LootBox.update = function() {
    for (var i in LOOT_BOXES) {
        LOOT_BOXES[i].update();
    }
}
LootBox.draw = function() {
    for (var i in LOOT_BOXES) {
        LOOT_BOXES[i].draw();
    }
}

// game handlers
socket.on('initgame', function(pkg) {
    for (var i in PLAYER_LIST) {
        delete PLAYER_LIST[i];
    }
    for (var i in pkg.players) {
        new Player(pkg.players[i].id, pkg.players[i].name, pkg.players[i].color);
    }
    player = PLAYER_LIST[pkg.self];
});
socket.on('newplayer', function(pkg) {
    if (ingame) new Player(pkg.id, pkg.name, pkg.color);
});
socket.on('deleteplayer', function(id) {
    if (ingame) delete PLAYER_LIST[id];
});
socket.on('newbullet', function(pkg) {
    if (ingame) new Bullet(pkg.id, pkg.x, pkg.y, pkg.parent, pkg.color);
});
socket.on('deletebullet', function(id) {
    if (ingame) delete BULLET_LIST[id];
});
socket.on('newlootbox', function(pkg) {
    if (ingame) new LootBox(pkg.id, pkg.x, pkg.y, pkg.effect, pkg.obfuscated);
});
socket.on('deletelootbox', function(id) {
    if (ingame) delete LOOT_BOXES[id];
});
socket.on('playerdied', function(id) {
    if (ingame) PLAYER_LIST[id].alive = false;
});