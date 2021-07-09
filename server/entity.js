// Copyright (C) 2021 Radioactive64

const PF = require('pathfinding');
PLAYER_LIST = [];
BOT_LIST = [];
BULLET_LIST = [];
LOOT_BOXES = [];
COLORS = [
    ['#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF', '#000000', '#AA0000', '#996600', '#EECC33', '#00AA00', '#0088CC', '#8877CC', '#CC77AA'],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
];
LOOT_EFFECTS = [
    {effect:'speed', percent:10},
    {effect:'speed2', percent:5},
    {effect:'slowness', percent:5},
    {effect:'jump', percent:10},
    {effect:'heal', percent:10},
    {effect:'damage', percent:5},
    {effect:'shield', percent:10},
    {effect:'homing', percent:10},
    {effect:'firerate', percent:10},
    {effect:'firerate2', percent:5},
    {effect:'special', percent:20}
];
remainingPlayers = 0;

// entity
Entity = function() {
    var self = {
        id: Math.random(),
        x: 0,
        y: 0,
        lastx: 0,
        lasty: 0,
        xspeed: 0,
        yspeed: 0,
        halfsize: null,
        colliding: {bottom:false, top:false, left:false, right:false},
        color: '#000000'
    };

    self.update = function() {
        self.updatePos();
        self.collide();
    }
    self.collide = function() {
        self.colliding.bottom = false;
        self.colliding.left = false;
        self.colliding.right = false;
        self.colliding.top = false;
        self.colliding.center = false;
        var px = Math.floor(self.x/40);
        var py = Math.floor(self.y/40);
        var tempx;
        var tempy;
        // center (to reduce glitching)
        tempx = px;
        tempy = py;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if (self.yspeed <= -10) {
                    self.y += (tempy*40) - (self.y+self.halfsize);
                    self.yspeed = 0;
                    self.colliding.bottom = true;
                } else if (self.yspeed >= 10) {
                    self.y += ((tempy*40)+40) - (self.y-self.halfsize);
                    self.yspeed *= -0.25;
                    self.colliding.top = true;
                } else {
                    self.y += (tempy*40) - (self.y+self.halfsize);
                    self.yspeed = 0;
                    self.colliding.bottom = true;
                }
                self.colliding.center = true;
            }
        }
        px = Math.floor(self.x/40);
        py = Math.floor(self.y/40);
        // bottom
        tempx = px;
        tempy = py+1;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if ((tempx*40) < (self.x+self.halfsize) && ((tempx*40)+40) > (self.x-self.halfsize) && (tempy*40) < (self.y+self.halfsize)) {
                    self.y += (tempy*40) - (self.y+self.halfsize);
                    self.yspeed = 0;
                    self.colliding.bottom = true;
                }
            }
        }
        // bottomleft
        tempx = px-1;
        tempy = py+1;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if (((tempx*40)+38) > (self.x-self.halfsize) && (tempy*40) < (self.y+self.halfsize)) {
                    if (self.lastx-self.x > self.y-self.lasty && self.yspeed > 0) {
                        self.x += ((tempx*40)+40) - (self.x-self.halfsize);
                        self.xspeed = 0;
                        self.yspeed *=0.75;
                        self.colliding.left = true;
                    } else {
                        self.y += (tempy*40) - (self.y+self.halfsize);
                        self.yspeed = 0;
                        self.colliding.bottom = true;
                    }
                }
            }
        }
        // bottomright
        tempx = px+1;
        tempy = py+1;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if (((tempx*40)+2) < (self.x+self.halfsize) && (tempy*40) < (self.y+self.halfsize)) {
                    if (self.x-self.lastx > self.y-self.lasty && self.yspeed > 0) {
                        self.x += (tempx*40) - (self.x+self.halfsize);
                        self.xspeed = 0;
                        self.yspeed *=0.75;
                        self.colliding.right = true;
                    } else {
                        self.y += (tempy*40) - (self.y+self.halfsize);
                        self.yspeed = 0;
                        self.colliding.bottom = true;
                    }
                }
            }
        }
        px = Math.floor(self.x/40);
        py = Math.floor(self.y/40);
        // left
        tempx = px-1;
        tempy = py;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if (((tempx*40)+40) > (self.x-self.halfsize)) {
                    self.x += ((tempx*40)+40) - (self.x-self.halfsize);
                    self.xspeed = 0;
                    self.yspeed *=0.75;
                    self.colliding.left = true;
                }
            }
        }
        // right
        tempx = px+1;
        tempy = py;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if ((tempx*40) < (self.x+self.halfsize)) {
                    self.x += (tempx*40) - (self.x+self.halfsize);
                    self.xspeed = 0;
                    self.yspeed *=0.75;
                    self.colliding.right = true;
                }
            }
        }
        px = Math.floor(self.x/40);
        py = Math.floor(self.y/40);
        // top
        tempx = px;
        tempy = py-1;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if ((tempx*40) < (self.x+self.halfsize) && ((tempx*40)+40) > (self.x-self.halfsize) && ((tempy*40)+40) > (self.y-self.halfsize)) {
                    self.y += ((tempy*40)+40) - (self.y-self.halfsize);
                    self.yspeed *= -0.25;
                    self.colliding.top = true;
                }
            }
        }
        // topleft
        tempx = px-1;
        tempy = py-1;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if (((tempx*40)+38) > (self.x-self.halfsize) && ((tempy*40)+40) > (self.y-self.halfsize)) {
                    if (self.lastx-self.x > self.lasty-self.y && self.yspeed < 0) {
                        self.x += ((tempx*40)+40) - (self.x-self.halfsize);
                        self.xspeed = 0;
                        self.yspeed *=0.75;
                        self.colliding.left = true;
                    } else {
                        self.y += ((tempy*40)+40) - (self.y-self.halfsize);
                        self.yspeed *= -0.25;
                        self.colliding.top = true;
                    }
                }
            }
        }
        // topright
        tempx = px+1;
        tempy = py-1;
        if (tempx > -1 && tempx < (MAPS[CURRENT_MAP].width+1) && tempy > -1 && tempy < (MAPS[CURRENT_MAP].height+1)) {
            if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                if (((tempx*40)+2) < (self.x+self.halfsize) && (((tempy*40)+40) > self.y-self.halfsize)) {
                    if (self.x-self.lastx > self.lasty-self.y && self.yspeed < 0) {
                        self.x += (tempx*40) - (self.x+self.halfsize);
                        self.xspeed = 0;
                        self.yspeed *=0.75;  
                        self.colliding.right = true;
                    } else {
                        self.y += ((tempy*40)+40) - (self.y-self.halfsize);
                        self.yspeed *= -0.25;
                        self.colliding.top = true;
                    }
                }
            }
        }
        self.lastx = self.x;
        self.lasty = self.y;
    }
    self.updatePos = function() {
        self.x += self.xspeed;
        self.y += self.yspeed;
    }

    return self;
}

// player
Player = function(socketid) {
    var self = new Entity();
    self.socketid = socketid;
    self.name = '';
    self.halfsize = 16;
    self.Wpressed = false;
    self.Spressed = false;
    self.Apressed = false;
    self.Dpressed = false;
    self.noclip = false;
    self.invincible = false;
    self.maxCPS = 10;
    self.lastclick = 0;
    self.secondary = {
        id: null,
        maxCPS: 0,
        lastclick: 0
    };
    self.hp = 5;
    self.shield = 0;
    self.score = 0;
    self.alive = true;
    self.modifiers = {
        moveSpeed: 1,
        jumpHeight: 1,
        bulletSpeed: 1,
        bulletRate: 1,
        bulletDamage: 1,
        homingBullets: false
    };
    self.ready = false;
    self.ingame = false;
    self.trackedData = new TrackedData();
    var j = 0;
    for (var i in COLORS[1]) {
        if (COLORS[1][i] == 1) {
            j++;
        } else {
            break;
        }
    }
    self.color = COLORS[0][j];
    COLORS[1][j] = 1;

    self.update = function() {
        self.updatePos();
        if (!self.noclip) {
            self.collide();
        }
        self.lastclick++;
        self.secondary.lastclick++;
        if (self.hp < 1 && self.alive) self.death();
    }
    self.updatePos = function() {
        if (self.noclip) {
            self.xspeed = 0;
            self.yspeed = 0;
            if (self.Dpressed) {
                self.xspeed = 10*self.modifiers.moveSpeed;
            }
            if (self.Apressed) {
                self.xspeed = -10*self.modifiers.moveSpeed;
            }
            if (self.Wpressed) {
                self.yspeed = 10*self.modifiers.moveSpeed;
            }
            if (self.Spressed) {
                self.yspeed = -10*self.modifiers.moveSpeed;
            }
        } else {
            if (self.Dpressed) {
                self.xspeed += 1*self.modifiers.moveSpeed;
            }
            if (self.Apressed) {
                self.xspeed -= 1*self.modifiers.moveSpeed;
            }
            if (self.Wpressed && self.colliding.bottom && !self.colliding.left && !self.colliding.right) {
                self.yspeed = 15*self.modifiers.jumpHeight;
            }
            if (self.Wpressed && self.Apressed && self.colliding.left) {
                self.yspeed = 15*self.modifiers.jumpHeight;
                self.xspeed = 15;
            }
            if (self.Wpressed && self.Dpressed && self.colliding.right) {
                self.yspeed = 15*self.modifiers.jumpHeight;
                self.xspeed = -15;
            }
            self.yspeed -= 0.75;
            self.xspeed *= 0.9;
            if (self.yspeed < -30) {
                self.yspeed = -30;
            }
        }
        if (self.x < 16) {
            self.x = 16;
            self.xspeed = 0;
        }
        if (self.x+16 > (MAPS[CURRENT_MAP].width*40)) {
            self.x = MAPS[CURRENT_MAP].width*40-16;
            self.xspeed = 0;
        }
        if (self.y+32 > (MAPS[CURRENT_MAP].height*40)+40) {
            if (self.invincible) {
                self.respawn(MAPS[CURRENT_MAP].spawns[0].x, MAPS[CURRENT_MAP].spawns[0].y);
            } else {
                self.death();
                self.xspeed = 0;
                self.yspeed = 0;
            }
        }
        self.x += self.xspeed;
        self.y -= self.yspeed;
    }
    self.death = function() {
        if (self.alive && !self.invincible) {
            self.trackedData.deaths++;
            self.alive = false;
            self.Wpressed = false;
            self.Spressed = false;
            self.Apressed = false;
            self.Dpressed = false;
            remainingPlayers--;
            io.emit('playerdied', self.id);
            insertChat(self.name + ' died.', '#FF0000');
            TrackedData.update();
            if (remainingPlayers < 2 && round.inProgress) {
                endRound();
            }
        }
    }
    self.respawn = function(x, y) {
        self.Wpressed = false;
        self.Spressed = false;
        self.Apressed = false;
        self.Dpressed = false;
        self.xspeed = 0;
        self.yspeed = 0;
        self.x = x;
        self.y = y;
        self.alive = true;
        self.hp = 5;
        self.shield = 0;
        self.modifiers = {
            moveSpeed: 1,
            jumpHeight: 1,
            bulletSpeed: 1,
            bulletRate: 1,
            bulletDamage: 1,
            homingBullets: false
        };
        self.secondary = {
            id: null,
            maxCPS: 0,
            lastclick: 0
        };
    }
    self.shoot = function(x, y) {
        if (self.lastclick > ((1000/self.maxCPS)/(1000/TPS))) {
            self.lastclick = 0;
            new Bullet(x, y, self.x, self.y, self.id, self.color, true, self.modifiers.bulletSpeed, self.modifiers.bulletDamage, self.modifiers.homingBullets, false, false);
            if (self.modifiers.bulletDamage == 100) self.modifiers.bulletDamage = 1;
        }
    }
    self.secondaryAttack = function(x, y) {
        if (self.secondary.lastclick > ((1000/self.secondary.maxCPS)/(1000/TPS))) {
            self.secondary.lastclick = 0;
            switch (self.secondary.id) {
                case 'noclipbullets':
                    new Bullet(x, y, self.x, self.y, self.id, self.color, true, self.modifiers.bulletSpeed, self.modifiers.bulletDamage, self.modifiers.homingBullets, true, false);
                    if (self.modifiers.bulletDamage == 100) self.modifiers.bulletDamage = 1;
                    break;
                case 'pathfindbullets':
                    new Bullet(x, y, self.x, self.y, self.id, self.color, true, self.modifiers.bulletSpeed, self.modifiers.bulletDamage, self.modifiers.homingBullets, false, true);
                    if (self.modifiers.bulletDamage == 100) self.modifiers.bulletDamage = 1;
                    break;
                case 'yeet':
                    for (var i in PLAYER_LIST) {
                        PLAYER_LIST[i].yspeed = 50;
                    }
                    for (var i in BOT_LIST) {
                        BOT_LIST[i].yspeed = 50;
                    }
                    io.emit('yeet');
                    break;
                default:
                    break;
            }
        }
    }
    self.checkAchievements = function() {
        var aqquiredachievements = 0;
        var totalachievements = 0;
        for (var i in self.trackedData.achievements) {
            var localachievement = self.trackedData.achievements[i];
            if (localachievement.id.includes('easteregg')) {
                totalachievements++;
            }
            if (localachievement.aqquired == true && localachievement.id != 'all_achievements') {
                aqquiredachievements++;
            }
            if (localachievement.id == self.trackedData.wins + '_Wins' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.kills + '_Kills' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.deaths + '_Deaths' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.total + 'total_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.lucky + 'lucky_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.unlucky + 'unlucky_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.speed + 'speed_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.jump + 'jump_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.shield + 'shield_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.random + 'random_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.homing + 'homing_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (localachievement.id == self.trackedData.lootboxcollections.firerate + 'firerate_Lootboxes' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
            if (aqquiredachievements >= totalachievements && localachievement.id == 'all_achievements' && localachievement.aqquired == false) {
                self.trackedData.grant(self.name, localachievement);
            }
        }
    }

    PLAYER_LIST[self.id] = self;
    return self;
}
Player.update = function() {
    var pack = [];
    for (var i in PLAYER_LIST) {
        var localplayer = PLAYER_LIST[i];
        if (localplayer.ingame) {
            localplayer.update();
            pack.push({
                id: localplayer.id,
                x: localplayer.x,
                y: localplayer.y, 
                hp: localplayer.hp,
                shield: localplayer.shield,
                debug: {
                    xspeed: localplayer.xspeed,
                    yspeed: localplayer.yspeed,
                    colliding: {
                        left: localplayer.colliding.left,
                        right: localplayer.colliding.right,
                        bottom: localplayer.colliding.bottom,
                        top: localplayer.colliding.top
                    }
                }
            });
        }
    }
    return pack;
}

// bullets
Bullet = function(mousex, mousey, x, y, parent, color, isplayer, speedModifier, damageModifier, homing, noclip, pathfind) {
    var self = new Entity();
    self.x = x;
    self.y = y;
    self.angle = Math.atan2(-(self.y-mousey-16), -(self.x-mousex-16));
    self.xspeed = Math.cos(self.angle)*20*speedModifier;
    self.yspeed = Math.sin(self.angle)*20*speedModifier;
    self.halfsize = 4;
    self.parent = parent;
    self.parentisPlayer = isplayer;
    self.damage = damageModifier;
    self.homing = homing;
    self.noclip = noclip;
    self.pathfind = pathfind;
    self.color = color;
    self.valid = true;
    try {
        self.pathfinder = new PF.AStarFinder({
            allowDiagonal: true,
            dontCrossCorners: true
        });
        self.grid = new PF.Grid(Object.create(MAPS[CURRENT_MAP]));
        for (var i in MAPS[CURRENT_MAP]) {
            for (var j in MAPS[CURRENT_MAP][i]) {
                if (MAPS[CURRENT_MAP][i][j] == 1) {
                    self.grid.setWalkableAt(j, i, false);
                }
            }
        }
    } catch (err) {
        error(err);
    }
    var pack = {
        id: self.id,
        x: self.x,
        y: self.y,
        parent: self.parent,
        color: self.color
    };
    io.emit('newbullet', pack);

    self.update = function() {
        self.updatePos();
        if (!self.noclip) self.collide();
        if (self.colliding.top || self.colliding.left || self.colliding.right || self.colliding.bottom || self.colliding.center || self.x < -500 || self.x > ((MAPS[CURRENT_MAP].width*40)+500) || self.y < -500 || self.y > ((MAPS[CURRENT_MAP].height*40)+500)) {
            self.valid = false;
            io.emit('deletebullet', self.id);
            delete BULLET_LIST[self.id];
        }
        for (var i in PLAYER_LIST) {
            var localplayer = PLAYER_LIST[i];
            if (localplayer.id != self.parent && localplayer.alive) {
                if (Math.abs(self.x - localplayer.x) < 16 && Math.abs(self.y - localplayer.y) < 16 && self.valid && !localplayer.invincible) {
                    self.valid = false;
                    if (localplayer.shield > 0) {
                        localplayer.shield -= self.damage;
                    } else {
                        localplayer.hp -= self.damage;
                    }
                    if (self.damage == 100) localplayer.hp = 0;
                    if (localplayer.hp < 1) {
                        if (self.parentisPlayer) {
                            PLAYER_LIST[self.parent].trackedData.kills++;
                            TrackedData.update();
                        }
                        TrackedData.update();
                    }
                    io.emit('deletebullet', self.id);
                    delete BULLET_LIST[self.id];
                }
            }
        }
        for (var i in BOT_LIST) {
            var localbot = BOT_LIST[i];
            if (localbot.id != self.parent && localbot.alive) {
                if (Math.abs(self.x - localbot.x) < 16 && Math.abs(self.y - localbot.y) < 16 && self.valid) {
                    self.valid = false;
                    if (localbot.shield > 0) {
                        localbot.shield -= self.damage;
                    } else {
                        localbot.hp -= self.damage;
                    }
                    if (self.damage == 100) localbot.hp = 0;
                    if (localbot.hp < 1) {
                        if (self.parentisPlayer) {
                            PLAYER_LIST[self.parent].trackedData.kills++;
                            TrackedData.update();
                        }
                        TrackedData.update();
                    }
                    io.emit('deletebullet', self.id);
                    delete BULLET_LIST[self.id];
                }
            }
        }
    }
    self.updatePos = function() {
        if (self.pathfind) {
            var closestplayer = self.findClosestPlayer();
            if (closestplayer) {
                try {
                    var gridbackup = self.grid.clone();
                    var path = self.pathfinder.findPath(Math.floor(self.x/40), Math.floor(self.y/40), Math.floor(closestplayer.x/40), Math.floor(closestplayer.y/40), self.grid);
                    var waypoints = path;
                    self.grid = gridbackup;
                    self.angle = Math.atan2(-(self.y-(waypoints[1][1]*40))+16, -(self.x-(waypoints[1][0]*40))+16);
                    self.xspeed = Math.cos(self.angle)*20*speedModifier;
                    self.yspeed = Math.sin(self.angle)*20*speedModifier;
                } catch (err) {}
            }
        } else if (self.homing) {
            var closestplayer = self.findClosestPlayer();
            if (closestplayer) {
                self.angle = Math.atan2(-(self.y-closestplayer.y), -(self.x-closestplayer.x));
                self.xspeed = Math.cos(self.angle)*20*speedModifier;
                self.yspeed = Math.sin(self.angle)*20*speedModifier;
                // if (self.xspeed > 20*speedModifier) {
                //     self.xspeed = 20*speedModifier;
                // }
                // if (self.xspeed < -20*speedModifier) {
                //     self.xspeed = -20*speedModifier;
                // }
                // if (self.yspeed > 20*speedModifier) {
                //     self.yspeed = 20*speedModifier;
                // }
                // if (self.yspeed < -20*speedModifier) {
                //     self.yspeed = -20*speedModifier;
                // }
            }
        }
        self.x += self.xspeed;
        self.y += self.yspeed;
    }
    self.findClosestPlayer = function() {
        var closestplayer = null;
        var players = [];
        for (var i in PLAYER_LIST) {
            if (i != self.parent && PLAYER_LIST[i].alive) {
                players.push(PLAYER_LIST[i]);
            }
        }
        for (var i in BOT_LIST) {
            if (BOT_LIST[i].id != self.parent && BOT_LIST[i].alive) {
                players.push(BOT_LIST[i]);
            }
        }
        for (var i in players) {
            if (closestplayer == null) {
                closestplayer = players[i];
            } else if (self.getDistance(self.x, self.y, players[i].x, players[i].y) < self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y) && players[i].alive && players[i].id != self.parent) {
                closestplayer = players[i];
            }
        }
        if (closestplayer != null) return closestplayer;
        else return false;
    }
    self.getDistance = function(x1, y1, x2, y2) {
        return Math.sqrt((Math.pow(Math.abs(x1-x2), 2)) + (Math.pow(Math.abs(y1-y2), 2)));
    }

    BULLET_LIST[self.id] = self;
    return self;
}
Bullet.update = function() {
    var pack = [];
    for (var i in BULLET_LIST) {
        var localbullet = BULLET_LIST[i];
        localbullet.update();
        pack.push({
            id: localbullet.id,
            x: localbullet.x,
            y: localbullet.y
        });
    }
    return pack;
}

// bots
Bot = function(targetOtherBots) {
    var self = new Entity();
    self.halfsize = 16;
    self.Wpressed = false;
    self.Spressed = false;
    self.Apressed = false;
    self.Dpressed = false;
    self.maxCPS = 10;
    self.lastclick = 0;
    self.secondary = {
        id: null,
        maxCPS: 0,
        lastclick: 0
    };
    self.hp = 5;
    self.score = 0;
    self.alive = true;
    self.invincible = false;
    self.modifiers = {
        moveSpeed: 1,
        jumpHeight: 1,
        bulletSpeed: 1,
        bulletRate: 1,
        bulletDamage: 1,
        homingBullets: false
    };
    var j = 0;
    for (var i in COLORS[1]) {
        if (COLORS[1][i] == 1) {
            j++;
        }
    }
    self.color = COLORS[0][j];
    COLORS[1][j] = 1;
    var k = 0;
    for (var i in BOT_LIST) {
        k++;
    }
    self.name = 'BOT_' + k;
    var pack = {
        id: self.id,
        name: self.name,
        color: self.color
    };
    io.emit('newplayer', pack);
    try {
        self.pathfinder = new PathFind();
        // self.pathfinder.init(MAPS[CURRENT_MAP]);
    } catch(err) {
        error(err);
    }
    self.attackBots = targetOtherBots;
    self.lastpath = 0;
    self.debugPath = [];

    self.update = function() {
        self.collide();
        if (self.alive && self.lastpath > 100/(1000/TPS)) self.path();
        self.updatePos();
        self.lastclick++;
        self.lastpath++;
        if (self.hp < 1 && self.alive) self.death();
    }
    self.updatePos = function() {
        if (self.Dpressed) {
            self.xspeed += 1*self.modifiers.moveSpeed;
        }
        if (self.Apressed) {
            self.xspeed -= 1*self.modifiers.moveSpeed;
        }
        if (self.Wpressed && self.colliding.bottom && !self.colliding.left && !self.colliding.right) {
            self.yspeed = 15*self.modifiers.jumpHeight;
        }
        if (self.Wpressed && self.Apressed && self.colliding.left) {
            self.yspeed = 15*self.modifiers.jumpHeight;
            self.xspeed = 15;
        }
        if (self.Wpressed && self.Dpressed && self.colliding.right) {
            self.yspeed = 15*self.modifiers.jumpHeight;
            self.xspeed = -15;
        }
        self.yspeed -= 0.75;
        self.xspeed *= 0.9;
        if (self.yspeed < -30) {
            self.yspeed = -30;
        }
        if (self.x < 16) {
            self.x = 16;
            self.xspeed = 0;
        }
        if (self.x+16 > (MAPS[CURRENT_MAP].width*40)) {
            self.x = MAPS[CURRENT_MAP].width*40-16;
            self.xspeed = 0;
        }
        if (self.y+32 > (MAPS[CURRENT_MAP].height*40)+40) {
            if (self.invincible) {
                self.respawn(MAPS[CURRENT_MAP].spawns[0].x, MAPS[CURRENT_MAP].spawns[0].y);
            } else {
                self.death();
            }
        }
        self.x += self.xspeed;
        self.y -= self.yspeed;
    }
    self.death = function() {
        if (self.alive) {
            self.alive = false;
            remainingPlayers--;
            io.emit('playerdied', self.id);
            insertChat(self.name + ' died.', '#FF0000');
            TrackedData.update();
            if (remainingPlayers < 2 && round.inProgress) {
                endRound();
            }
        }
    }
    self.respawn = function(x, y) {
        self.Wpressed = false;
        self.Spressed = false;
        self.Apressed = false;
        self.Dpressed = false;
        self.xspeed = 0;
        self.yspeed = 0;
        self.x = x;
        self.y = y;
        self.alive = true;
        self.hp = 5;
        self.modifiers = {
            moveSpeed: 1,
            jumpHeight: 1,
            bulletSpeed: 1,
            bulletRate: 1,
            bulletDamage: 1,
            homingBullets: false
        };
        self.secondary = {
            id: null,
            maxCPS: 0,
            lastclick: 0
        };
        try {
            self.pathfinder.init(MAPS[CURRENT_MAP]);
        } catch (err) {
            error(err);
        }
        setTimeout(function() {
            self.alive = true;
        }, 3000);
    }
    self.shoot = function(player) {
        if (round.inProgress && self.alive && self.lastclick > ((1000/self.maxCPS)/(1000/TPS))) {
            self.lastclick = 0;
            new Bullet(player.x+(Math.floor(Math.random()*21)-10), player.y+(Math.floor(Math.random()*21)-10), self.x, self.y, self.id, self.color, false, self.modifiers.bulletSpeed, self.modifiers.bulletDamage, self.modifiers.homingBullets, false, false);
            if (self.modifiers.bulletDamage == 100) self.modifiers.bulletDamage = 1;
        }
    }
    self.path = function() {
        self.lastpath = 0;
        var closestplayer = null;
        var players = [];
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame && PLAYER_LIST[i].alive) players.push(PLAYER_LIST[i]);
        }
        if (self.attackBots) {
            for (var i in BOT_LIST) {
                if (BOT_LIST[i].alive) players.push(BOT_LIST[i]);
            }
        }
        for (var i in players) {
            if (closestplayer == null || self.getDistance(self.x, self.y, players[i].x, players[i].y) < self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y)) {
                if (players[i].id != self.id) closestplayer = players[i];
            }
        }
        self.Wpressed = false;
        self.Apressed = false;
        self.Dpressed = false;
        self.debugPath = [];
        if (closestplayer) {
            if (self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y) < 1920) {
                try {
                    var path = self.pathfinder.path(Math.floor(self.x/40), Math.floor(self.y/40), Math.floor(closestplayer.x/40), Math.floor(closestplayer.y/40));
                    // console.log(path)
                    self.debugPath = path;
                    var waypoints = path;
                    if (waypoints[1]) {
                        var px = Math.floor(self.x/40);
                        var py = Math.floor(self.y/40);
                        if (waypoints[1].y < py) {
                            self.Wpressed = true;
                        }
                        if (waypoints[1].x < px) {
                            self.Apressed = true;
                        }
                        if (waypoints[1].x > px) {
                            self.Dpressed = true;
                        }
                        
                        if (self.colliding.left) {
                            Apressed = true;
                            Wpressed = true;
                        }
                        if (self.colliding.right) {
                            Dpressed = true;
                            Wpressed = true;
                        }
                    }
                } catch (err) {
                    console.error(err)
                }
                // Old pathfinding
                /*
                try {
                    var gridbackup = self.grid.clone();
                    var path = self.pathfinder.findPath(Math.floor(self.x/40), Math.floor(self.y/40), Math.floor(closestplayer.x/40), Math.floor(closestplayer.y/40), self.grid);
                    var waypoints = Pathfind.Util.compressPath(path);
                    // var waypoints = path;
                    self.grid = gridbackup;
                    if (waypoints[0]) {
                        self.Wpressed = false;
                        self.Apressed = false;
                        self.Dpressed = false;
                        var px = Math.floor(self.x/40);
                        var py = Math.floor(self.y/40);
                        if (waypoints[1][1] < py) {
                            self.Wpressed = true;
                        }
                        if (waypoints[1][0] < px) {
                            self.Apressed = true;
                        }
                        if (waypoints[1][0] > px) {
                            self.Dpressed = true;
                        }
                        // var tempx = px-3;
                        // var tempy = py;
                        // if (tempx > -1) if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                        //     self.Apressed = true;
                        //     self.Wpressed = true;
                        // }
                        // var tempx = px-2;
                        // var tempy = py;
                        // if (tempx > -1) if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                        //     self.Apressed = true;
                        //     self.Wpressed = true;
                        // }
                        // var tempx = px-1;
                        // var tempy = py;
                        // if (tempx > -1) if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                        //     self.Apressed = true;
                        //     self.Wpressed = true;
                        // }
                        // var tempx = px+1;
                        // var tempy = py;
                        // if (tempx > -1) if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                        //     self.Dpressed = true;
                        //     self.Wpressed = true;
                        // }
                        // var tempx = px+2;
                        // var tempy = py;
                        // if (tempx > -1) if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                        //     self.Dpressed = true;
                        //     self.Wpressed = true;
                        // }
                        // var tempx = px+3;
                        // var tempy = py;
                        // if (tempx > -1) if (MAPS[CURRENT_MAP][tempy][tempx] == 1) {
                        //     self.Dpressed = true;
                        //     self.Wpressed = true;
                        // }
                        if (self.colliding.left) {
                            Apressed = true;
                            Wpressed = true;
                        }
                        if (self.colliding.right) {
                            Dpressed = true;
                            Wpressed = true;
                        }
                    }
                } catch (err) {
                    // console.error(err);
                }
                */
            }
            // if (self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y) < 10) {
            //     self.Apressed = false;
            //     self.Dpressed = false;
            //     self.Wpressed = false;
            // }
            self.shoot(closestplayer);
        }
    }
    self.getDistance = function(x1, y1, x2, y2) {
        return Math.sqrt((Math.pow(x1-x2, 2)) + (Math.pow(y1-y2, 2)));
    }
    self.validateLineOfSight = function(targetx, targety) {
        var ray = {
            x: self.x,
            y: self.y,
            xspeed: 0,
            yspeed: 0
        };
        ray.angle = Math.atan2(-(ray.y-targetx), -(ray.x-targety));
        ray.xspeed = Math.cos(ray.angle)*20;
        ray.yspeed = Math.sin(ray.angle)*20;
        for (var i = 0; i <= 1000; i++) {
            ray.x += ray.xspeed;
            ray.y += ray.yspeed;
            if (self.getDistance(ray.x, ray.y, targetx, targety) <= 16) {
                return true;
            }
            var rx = Math.floor(ray.x/40);
            var ry = Math.floor(ray.y/40);
            if (rx > -1 && rx < (MAPS[CURRENT_MAP].width+1) && ry > -1 && ry < (MAPS[CURRENT_MAP].height+1)) {
                if (MAPS[CURRENT_MAP][ry][rx] == 1) {
                    return false;
                }
            }
        }
        return false;
    }
    
    BOT_LIST[self.id] = self;
    return self;
}
Bot.update = function() {
    var pack = [];
    for (var i in BOT_LIST) {
        var localbot = BOT_LIST[i];
        localbot.update();
        pack.push({
            id: localbot.id,
            x: localbot.x,
            y: localbot.y,
            hp: localbot.hp,
            debug: {
                xspeed: localbot.xspeed,
                yspeed: localbot.yspeed,
                colliding: {
                    left: localbot.colliding.left,
                    right: localbot.colliding.right,
                    bottom: localbot.colliding.bottom,
                    top: localbot.colliding.top
                },
                path: localbot.debugPath
            }
        });
    }
    return pack;
}

// loot boxes
LootBox = function(x, y) {
    var self = new Entity();
    self.halfsize = 20;
    self.x = x;
    self.y = y;
    self.roundId = round.id;
    self.obfuscated = false;
    var random = Math.ceil(Math.random()*100);
    for (var i in LOOT_EFFECTS) {
        var min = 0;
        var max = 0;
        if (i == 0) {
            min = 0;
            max = LOOT_EFFECTS[i].percent;
        } else {
            max += LOOT_EFFECTS[0].percent;
            for (var j = 0; j < i; j++) {
                min += LOOT_EFFECTS[j].percent;
                max += LOOT_EFFECTS[j+1].percent;
            }
        }
        if (random >= min && random <= max) {
            self.effect = LOOT_EFFECTS[i].effect;
            break;
        }
    }
    if (Math.random() < 0.5 || self.effect == 'speed2' || self.effect == 'slowness' || self.effect == 'damage' || self.effect == 'firerate2' || self.effect == 'special') {
        self.obfuscated = true;
    }
    self.valid = true;
    var pack = {
        id: self.id,
        x: self.x,
        y: self.y,
        effect: self.effect,
        obfuscated: self.obfuscated
    };
    io.emit('newlootbox', pack);

    self.update = function() {
        for (var i in PLAYER_LIST) {
            var localplayer = PLAYER_LIST[i];
            if (Math.abs(self.x-localplayer.x) < 36 && Math.abs(self.y-localplayer.y) < 36) {
                switch (self.effect) {
                    case 'speed':
                        localplayer.modifiers.moveSpeed *= 1.2;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'speed');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.moveSpeed *= (5/6);
                        }, 10000);
                        localplayer.trackedData.lootboxcollections.speed++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'speed2':
                        localplayer.modifiers.moveSpeed *= 1.5;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'speed2');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.moveSpeed *= (2/3);
                        }, 10000);
                        localplayer.trackedData.lootboxcollections.speed++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'slowness':
                        localplayer.modifiers.moveSpeed *= 0.75;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'slowness');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.moveSpeed *= (4/3);
                        }, 5000);
                        localplayer.trackedData.lootboxcollections.unlucky++;
                        break;
                    case 'jump':
                        localplayer.modifiers.jumpHeight *= 1.2;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'jump');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.jumpHeight *= (5/6);
                        }, 10000);
                        localplayer.trackedData.lootboxcollections.jump++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'heal':
                        localplayer.hp = 5;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'heal');
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'damage':
                        localplayer.hp -= 2;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'damage');
                        localplayer.trackedData.lootboxcollections.unlucky++;
                        break;
                    case 'shield':
                        localplayer.shield = 5;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'shield');
                        localplayer.trackedData.lootboxcollections.shield++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'homing':
                        localplayer.modifiers.homingBullets = true;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'homing');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.homingBullets = false;
                        }, 20000);
                        localplayer.trackedData.lootboxcollections.homing++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;   
                    case 'firerate':
                        localplayer.modifiers.bulletRate *= 2;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'firerate');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.bulletRate *= (1/2);
                        }, 10000);
                        localplayer.trackedData.lootboxcollections.firerate++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'firerate2':
                        localplayer.modifiers.bulletRate *= 3;
                        SOCKET_LIST[localplayer.socketid].emit('effect', 'firerate');
                        setTimeout(function() {
                            if (round.id == self.roundId) localplayer.modifiers.bulletRate *= (1/3);
                        }, 10000);
                        localplayer.trackedData.lootboxcollections.firerate++;
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    case 'special':
                        var random = Math.random();
                        if (random <= 0.1) {
                            localplayer.modifiers.bulletDamage = 100;
                            SOCKET_LIST[localplayer.socketid].emit('effect', 'goldenbullet');
                            var localachievement = localplayer.trackedData.locate(localplayer, 'aqquire_goldenbullet');
                            if (localachievement) {
                                if (localachievement.aqquired == false) localplayer.trackedData.grant(localplayer.name, localachievement);
                            }
                        } else if (random <= 0.4) {
                            localplayer.modifiers.bulletDamage = 2;
                            SOCKET_LIST[localplayer.socketid].emit('effect', 'superbullets');
                        } else if (random <= 0.7) {
                            localplayer.modifiers.bulletSpeed = 1.5;
                            localplayer.secondary.id = 'noclipbullets';
                            localplayer.secondary.maxCPS = 1;
                            SOCKET_LIST[localplayer.socketid].emit('effect', 'noclipbullet');
                        } else if (random <= 0.8) {
                            localplayer.secondary.id = 'pathfindbullets';
                            localplayer.secondary.maxCPS = 0.5;
                            SOCKET_LIST[localplayer.socketid].emit('effect', 'pathfindbullets');
                        } else {
                            localplayer.secondary.id = 'yeet';
                            localplayer.secondary.maxCPS = 0.05;
                            SOCKET_LIST[localplayer.socketid].emit('effect', 'yeet');
                        }
                        localplayer.trackedData.lootboxcollections.lucky++;
                        break;
                    default:
                        stop('ERROR: INVALID LOOTBOX');
                        break;
                }
                localplayer.trackedData.lootboxcollections.total++;
                if (self.obfuscated) {
                    localplayer.trackedData.lootboxcollections.random++;
                }
                TrackedData.update();
                io.emit('deletelootbox', self.id);
                self.valid = false;
                setTimeout(function() {
                    if (round.id == self.roundId) {
                        new LootBox(self.x, self.y);
                        delete LOOT_BOXES[self.id];
                    }
                }, 30000);
            }
        }
        for (var i in BOT_LIST) {
            var localbot = BOT_LIST[i];
            if (Math.abs(self.x-localbot.x) < 36 && Math.abs(self.y-localbot.y) < 36) {
                switch (self.effect) {
                    case 'speed':
                        localbot.modifiers.moveSpeed *= 1.2;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.moveSpeed *= (5/6);
                        }, 10000);
                        break;
                    case 'speed2':
                        localbot.modifiers.moveSpeed *= 1.5;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.moveSpeed *= (2/3);
                        }, 10000);
                        break;
                    case 'slowness':
                        localbot.modifiers.moveSpeed *= 0.75;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.moveSpeed *= (4/3);
                        }, 5000);
                        break;
                    case 'jump':
                        localbot.modifiers.jumpHeight *= 1.2;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.jumpHeight *= (5/6);
                        }, 10000);
                        break;
                    case 'heal':
                        localbot.hp = 5;
                        break;
                    case 'damage':
                        localbot.hp -= 2;
                        break;
                    case 'shield':
                        localbot.shield = 5;
                        break;
                    case 'homing':
                        localbot.modifiers.homingBullets = true;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.homingBullets = false;
                        }, 20000);
                        break;   
                    case 'firerate':
                        localbot.modifiers.bulletRate *= 2;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.bulletRate *= (1/2);
                        }, 10000);
                        break;
                    case 'firerate2':
                        localbot.modifiers.bulletRate *= 3;
                        setTimeout(function() {
                            if (round.id == self.roundId) localbot.modifiers.bulletRate *= (1/3);
                        }, 10000);
                        break;
                    case 'special':
                        var random = Math.random();
                        if (random <= 0.1) {
                            localbot.modifiers.bulletDamage = 100;

                        } else if (random <= 0.4) {
                            localbot.modifiers.bulletDamage = 2;
                        } else if (random <= 0.7) {
                            localbot.modifiers.bulletSpeed = 1.5;
                            localbot.secondary.id = 'noclipbullets';
                            localbot.secondary.maxCPS = 1;
                        } else if (random <= 0.8) {
                            localbot.secondary.id = 'pathfindbullets';
                            localbot.secondary.maxCPS = 0.5;
                        } else {
                            localbot.secondary.id = 'yeet';
                            localbot.secondary.maxCPS = 0.05;
                        }
                        break;
                    default:
                        stop('ERROR: INVALID LOOTBOX');
                        break;
                }
                io.emit('deletelootbox', self.id);
                self.valid = false;
                setTimeout(function() {
                    if (round.id == self.roundId) {
                        new LootBox(self.x, self.y);
                        delete LOOT_BOXES[self.id];
                    }
                }, 30000);
            }
        }
    }

    LOOT_BOXES[self.id] = self;
    return self;
}
LootBox.update = function() {
    for (var i in LOOT_BOXES) {
        var locallootbox = LOOT_BOXES[i];
        if (locallootbox.valid) locallootbox.update();
    }
}