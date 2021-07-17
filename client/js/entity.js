// Copyright (C) 2021 Radioactive64

resourcesloaded++;
PLAYER_LIST = [];
BULLET_LIST = [];
LOOT_BOXES = [];
PARTICLES = [];
DEBUG_INFO = [];
HP_Color = ['#FFFFFF', '#FF0000', '#FF9900', '#FFFF00', '#99FF00', '#00FF00'];

// entity
Entity = function(id, x, y, color) {
    var self = {
        x: x,
        y: y,
        relx: 0,
        rely: 0,
        id: id,
        color: color,
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
    
    self.update = function(x, y, hp, shield) {
        self.x = x;
        self.y = y;
        if (hp < self.hp) new Particle(x, y, 'damage', self.hp-hp);
        if (hp > self.hp) new Particle(x, y, 'heal', hp-self.hp);
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

    PLAYER_LIST[self.id] = self;
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

    self.draw = function() {
        game.fillStyle = self.color;
        game.fillRect(self.relx-4, self.rely-4, 8, 8);
    }

    BULLET_LIST[self.id] = self;
    return self;
}
Bullet.update = function(bullets) {
    for (var i in bullets) {
        try {
            var localbullet = BULLET_LIST[bullets[i].id];
            localbullet.update(bullets[i].x, bullets[i].y);
        } catch (err) {}
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

    self.update = function() {
        self.relx = -(camera.x - self.x);
        self.rely = -(camera.y - self.y);
    }
    self.draw = function() {
        game.drawImage(self.img, self.relx-20, self.rely-20, 40, 40);
    }

    LOOT_BOXES[self.id] = self;
    return self;
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

// particles
Particle = function(x, y, type, value) {
    var self = new Entity(null, x, y, null);
    self.id = Math.random();
    self.xSpeed = Math.random()*20-10;
    self.ySpeed = -Math.random()*10;
    self.opacity = 2;
    if (type == 'damage') {
        self.type = 'text';
        self.value = '-' + value;
        self.color = 'rgba(255,0,0,';
    }
    if (type == 'heal') {
        self.type = 'text';
        self.value = '+' + value;
        self.color = 'rgba(0,255,0,';
    }
    if (type == 'explosion') {
        self.type = 'box';
        self.size = Math.random()*8+8;
        var code = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(value);
        self.color = 'rgba(' + parseInt(code[1], 16) + ',' + parseInt(code[2], 16) + ',' + parseInt(code[3], 16) + ',';
    }

    self.update = function() {
        self.x += self.xSpeed;
        self.y += self.ySpeed;
        self.xSpeed *= 0.9;
        self.ySpeed += 1;
        self.relx = -(camera.x - self.x);
        self.rely = -(camera.y - self.y);
        self.opacity -= 0.1;
        if (self.opacity <= 0) delete PARTICLES[self.id];
    }
    self.draw = function() {
        if (self.type == 'text') {
            game.textAlign = 'center';
            game.font = '20px Pixel';
            if (self.opacity > 1) game.fillStyle = self.color + ')';
            else game.fillStyle = self.color + self.opacity + ')';
            game.fillText(self.value, self.relx, self.rely);
        } else if (self.type == 'box') {
            if (self.opacity > 1) game.fillStyle = self.color + ')';
            else game.fillStyle = self.color + self.opacity + ')';
            game.fillRect(self.relx-self.size/2, self.rely-self.size/2, self.size, self.size);
        } else {
            console.error('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA WHAT');
        }
    }

    PARTICLES[self.id] = self;
    return self;
}
Particle.update = function() {
    for (var i in PARTICLES) {
        PARTICLES[i].update();
    }
}
Particle.draw = function() {
    for (var i in PARTICLES) {
        PARTICLES[i].draw();
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
    if (ingame) {
        PLAYER_LIST[id].alive = false;
        for (var i = 0; i < Math.random()*10+20; i++) {
            new Particle(PLAYER_LIST[id].x, PLAYER_LIST[id].y, 'explosion', PLAYER_LIST[id].color);
        }
        if (id == player.id) {
            deathFadeOpacity = 0;
            var fadein = setInterval(function() {
                deathFadeOpacity += 0.1;
                if (deathFadeOpacity >= 0.5) clearInterval(fadein);
            }, 20);
            setTimeout(function() {
                var fadeout = setInterval(function() {
                    deathFadeOpacity -= 0.1;
                    if (deathFadeOpacity <= 0) clearInterval(fadeout);
                }, 20);
            }, 100);
        }
    }
});