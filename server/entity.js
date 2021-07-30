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
        gridx: 0,
        gridy: 0,
        xspeed: 0,
        yspeed: 0,
        halfsize: null,
        colliding: {bottom:false, top:false, left:false, right:false},
        color: '#000000'
    };

    self.update = function() {
        self.updatePos();
        self.collide();
    };
    self.collide = function() {
        self.colliding.bottom = false;
        self.colliding.left = false;
        self.colliding.right = false;
        self.colliding.top = false;
        self.colliding.center = false;
        var tempx;
        var tempy;
        // center (to reduce glitching)
        tempx = self.gridx;
        tempy = self.gridy;
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
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
        // bottom
        tempx = self.gridx;
        tempy = self.gridy+1;
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
        tempx = self.gridx-1;
        tempy = self.gridy+1;
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
        tempx = self.gridx+1;
        tempy = self.gridy+1;
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
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
        // left
        tempx = self.gridx-1;
        tempy = self.gridy;
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
        tempx = self.gridx+1;
        tempy = self.gridy;
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
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
        // top
        tempx = self.gridx;
        tempy = self.gridy-1;
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
        tempx = self.gridx-1;
        tempy = self.gridy-1;
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
        tempx = self.gridx+1;
        tempy = self.gridy-1;
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
    };
    self.updatePos = function() {
        self.x += self.xspeed;
        self.y += self.yspeed;
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
    };

    return self;
};

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
    };
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
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
    };
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
    };
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
    };
    self.shoot = function(x, y) {
        if (self.lastclick > ((1000/self.maxCPS)/(1000/TPS))) {
            self.lastclick = 0;
            new Bullet(x, y, self.x, self.y, self.id, self.color, true, self.modifiers.bulletSpeed, self.modifiers.bulletDamage, self.modifiers.homingBullets, false, false);
            if (self.modifiers.bulletDamage == 100) self.modifiers.bulletDamage = 1;
        }
    };
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
    };
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
    };

    PLAYER_LIST[self.id] = self;
    return self;
};
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
};

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
    };
    self.updatePos = function() {
        if (self.pathfind) {
            var closestplayer = self.findClosestPlayer();
            if (closestplayer) {
                try {
                    var gridbackup = self.grid.clone();
                    var path = self.pathfinder.findPath(self.gridx, self.gridy, closestplayer.gridx, closestplayer.gridy, self.grid);
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
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
    };
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
    };

    BULLET_LIST[self.id] = self;
    return self;
};
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
};

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
    self.canmove = false;
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
    self.ai = {
        waypoints: [],
        currentNode: 0,
        jumping: false,
        wallJumping: false,
        target: null,
        direction: null
    };
    self.attackBots = targetOtherBots;
    self.lastpath = 0;
    self.debugPath = [];

    self.update = function() {
        self.collide();
        self.path();
        self.updatePos();
        self.lastclick++;
        self.lastpath++;
        if (self.hp < 1 && self.alive) self.death();
    };
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
        self.gridx = Math.floor(self.x/40);
        self.gridy = Math.floor(self.y/40);
    };
    self.death = function() {
        if (self.alive) {
            self.alive = false;
            self.canmove = false;
            remainingPlayers--;
            io.emit('playerdied', self.id);
            insertChat(self.name + ' died.', '#FF0000');
            TrackedData.update();
            if (remainingPlayers < 2 && round.inProgress) {
                endRound();
            }
        }
    };
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
        self.canmove = false;
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
            self.canmove = true;
        }, 3000);
    };
    self.shoot = function(player) {
        if (round.inProgress && self.alive && self.lastclick > ((1000/self.maxCPS)/(1000/TPS))) {
            self.lastclick = 0;
            new Bullet(player.x+(Math.floor(Math.random()*21)-10), player.y+(Math.floor(Math.random()*21)-10), self.x, self.y, self.id, self.color, false, self.modifiers.bulletSpeed, self.modifiers.bulletDamage, self.modifiers.homingBullets, false, false);
            if (self.modifiers.bulletDamage == 100) self.modifiers.bulletDamage = 1;
        }
    };
    self.path = function() {
        // find path
        if (self.alive && self.canmove && self.lastpath > 500/(1000/TPS)) {
            try {
                self.lastpath = 0;
                self.ai.target = null;
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
                    if (self.ai.target == null || self.getDistance(self.x, self.y, players[i].x, players[i].y) < self.getDistance(self.x, self.y, self.ai.target.x, self.ai.target.y)) {
                        if (players[i].id != self.id) self.ai.target = players[i];
                    }
                }
                self.debugPath = [];
                if (self.ai.target) {
                    if (self.getDistance(self.x, self.y, self.ai.target.x, self.ai.target.y) < 1280) {
                        var path = self.pathfinder.path(self.gridx, self.gridy, self.ai.target.gridx, self.ai.target.gridy);
                        self.debugPath = path;
                        self.ai.waypoints = path;
                        self.ai.currentNode = 1;
                    }
                }
            } catch (err) {error(err);}
        }
        // path to next node
        try {
            self.Wpressed = false;
            self.Apressed = false;
            self.Dpressed = false;
            if (self.ai.waypoints[self.ai.currentNode]) {
                // navigate to next node
                if (self.ai.waypoints[self.ai.currentNode].y < self.gridy) self.Wpressed = true;
                if (self.ai.waypoints[self.ai.currentNode].x < self.gridx) self.Apressed = true;
                if (self.ai.waypoints[self.ai.currentNode].x > self.gridx) self.Dpressed = true;
                // wall jump
                if (self.ai.waypoints[self.ai.currentNode].direction == 'up') {
                    if (MAPS[CURRENT_MAP][self.gridy][self.gridx-1] == 1) {
                        self.Dpressed = false;
                        self.Apressed = true;
                        self.Wpressed = true;
                    }
                    if (MAPS[CURRENT_MAP][self.gridy][self.gridx+1] == 1) {
                        self.Apressed = false;
                        self.Dpressed = true;
                        self.Wpressed = true;
                    }
                    if (MAPS[CURRENT_MAP][self.gridy][self.gridx-2] == 1) {
                        self.Dpressed = false;
                        self.Apressed = true;
                        self.Wpressed = true;
                    }
                    if (MAPS[CURRENT_MAP][self.gridy][self.gridx+2] == 1) {
                        self.Apressed = false;
                        self.Dpressed = true;
                        self.Wpressed = true;
                    }
                } else if (self.ai.waypoints[self.ai.currentNode].direction == 'none') error('Current Node\'s direction is "none".');
                // advance to next node
                for (var i in self.ai.waypoints) {
                    if (i >= self.ai.currentNode && self.gridx == self.ai.waypoints[i].x && self.gridy == self.ai.waypoints[i].y) {
                        self.ai.currentNode = parseInt(i) + 1;
                    }
                }
            }
            // check target distance
            if (self.ai.target) {
                if (self.getDistance(self.x, self.y, self.ai.target.x, self.ai.target.y) < 20) {
                    self.Apressed = false;
                    self.Dpressed = false;
                    self.Wpressed = false;
                }
                self.shoot(self.ai.target);
            }
        } catch (err) {error(err);}
    };
    self.getDistance = function(x1, y1, x2, y2) {
        return Math.sqrt((Math.pow(x1-x2, 2)) + (Math.pow(y1-y2, 2)));
    };
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
                    break;
                }
            }
        }
        return false;
    };
    
    BOT_LIST[self.id] = self;
    return self;
};
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
                keys: {
                    up: localbot.Wpressed,
                    down: localbot.Spressed,
                    left: localbot.Apressed,
                    right: localbot.Dpressed
                },
                path: localbot.debugPath
            }
        });
    }
    return pack;
};

// loot boxes
LootBox = function(x, y) {
    var self = new Entity();
    self.halfsize = 200;
    self.x = x;
    self.y = y;
    self.roundId = round.id;
    self.playerid = null;
    self.obfuscated = false;
    var random = Math.ceil(Math.random()*100);
    var min = 0;
    var max = 0;
    for (var i in LOOT_EFFECTS) {
        max += LOOT_EFFECTS[i].percent;
        if (random >= min && random <= max) {
            self.effect = LOOT_EFFECTS[i].effect;
            break;
        }
        min += LOOT_EFFECTS[i].percent;
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
            if (Math.abs(self.x-PLAYER_LIST[i].x) < 36 && Math.abs(self.y-PLAYER_LIST[i].y) < 36) {
                self.roundId = round.id;
                self.playerid = i;
                try {
                    switch (self.effect) {
                        case 'speed':
                            PLAYER_LIST[self.playerid].modifiers.moveSpeed *= 1.2;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'speed');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.moveSpeed *= (5/6);
                                } catch {}
                            }, 10000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.speed++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'speed2':
                            PLAYER_LIST[self.playerid].modifiers.moveSpeed *= 1.5;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'speed2');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.moveSpeed *= (2/3);
                                } catch {}
                            }, 10000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.speed++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'slowness':
                            PLAYER_LIST[self.playerid].modifiers.moveSpeed *= 0.75;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'slowness');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.moveSpeed *= (4/3);
                                } catch {}
                            }, 5000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.unlucky++;
                            break;
                        case 'jump':
                            PLAYER_LIST[self.playerid].modifiers.jumpHeight *= 1.2;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'jump');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.jumpHeight *= (5/6);
                                } catch {}
                            }, 10000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.jump++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'heal':
                            PLAYER_LIST[self.playerid].hp = 5;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'heal');
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'damage':
                            PLAYER_LIST[self.playerid].hp -= 2;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'damage');
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.unlucky++;
                            break;
                        case 'shield':
                            PLAYER_LIST[self.playerid].shield = 5;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'shield');
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.shield++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'homing':
                            PLAYER_LIST[self.playerid].modifiers.homingBullets = true;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'homing');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.homingBullets = false;
                                } catch {}
                            }, 20000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.homing++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;   
                        case 'firerate':
                            PLAYER_LIST[self.playerid].modifiers.bulletRate *= 2;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'firerate');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.bulletRate *= (1/2);
                                } catch {}
                            }, 10000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.firerate++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'firerate2':
                            PLAYER_LIST[self.playerid].modifiers.bulletRate *= 3;
                            SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'firerate');
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) PLAYER_LIST[self.playerid].modifiers.bulletRate *= (1/3);
                                } catch {}
                            }, 10000);
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.firerate++;
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        case 'special':
                            var random = Math.random();
                            if (random <= 0.1) {
                                PLAYER_LIST[self.playerid].modifiers.bulletDamage = 100;
                                SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'goldenbullet');
                                var localachievement = PLAYER_LIST[self.playerid].trackedData.locate(PLAYER_LIST[self.playerid], 'aqquire_goldenbullet');
                                if (localachievement) {
                                    if (localachievement.aqquired == false) PLAYER_LIST[self.playerid].trackedData.grant(PLAYER_LIST[self.playerid].name, localachievement);
                                }
                            } else if (random <= 0.4) {
                                PLAYER_LIST[self.playerid].modifiers.bulletDamage = 2;
                                SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'superbullets');
                            } else if (random <= 0.7) {
                                PLAYER_LIST[self.playerid].modifiers.bulletSpeed = 1.5;
                                PLAYER_LIST[self.playerid].secondary.id = 'noclipbullets';
                                PLAYER_LIST[self.playerid].secondary.maxCPS = 1;
                                SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'noclipbullet');
                            } else if (random <= 0.8) {
                                PLAYER_LIST[self.playerid].secondary.id = 'pathfindbullets';
                                PLAYER_LIST[self.playerid].secondary.maxCPS = 0.5;
                                SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'pathfindbullets');
                            } else {
                                PLAYER_LIST[self.playerid].secondary.id = 'yeet';
                                PLAYER_LIST[self.playerid].secondary.maxCPS = 0.05;
                                SOCKET_LIST[PLAYER_LIST[self.playerid].socketid].emit('effect', 'yeet');
                            }
                            PLAYER_LIST[self.playerid].trackedData.lootboxcollections.lucky++;
                            break;
                        default:
                            stop('ERROR: INVALID LOOTBOX');
                            break;
                    }
                    PLAYER_LIST[self.playerid].trackedData.lootboxcollections.total++;
                    if (self.obfuscated) {
                        PLAYER_LIST[self.playerid].trackedData.lootboxcollections.random++;
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
                } catch (err) {error(err);}
            }
        }
        for (var i in BOT_LIST) {
            if (Math.abs(self.x-BOT_LIST[i].x) < 36 && Math.abs(self.y-BOT_LIST[i].y) < 36) {
                self.playerid = i;
                try {
                    switch (self.effect) {
                        case 'speed':
                            BOT_LIST[self.playerid].modifiers.moveSpeed *= 1.2;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.moveSpeed *= (5/6);
                                } catch {}
                            }, 10000);
                            break;
                        case 'speed2':
                            BOT_LIST[self.playerid].modifiers.moveSpeed *= 1.5;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.moveSpeed *= (2/3);
                                } catch {}
                            }, 10000);
                            break;
                        case 'slowness':
                            BOT_LIST[self.playerid].modifiers.moveSpeed *= 0.75;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.moveSpeed *= (4/3);
                                } catch {}
                            }, 5000);
                            break;
                        case 'jump':
                            BOT_LIST[self.playerid].modifiers.jumpHeight *= 1.2;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.jumpHeight *= (5/6);
                                } catch {}
                            }, 10000);
                            break;
                        case 'heal':
                            BOT_LIST[self.playerid].hp = 5;
                            break;
                        case 'damage':
                            BOT_LIST[self.playerid].hp -= 2;
                            break;
                        case 'shield':
                            BOT_LIST[self.playerid].shield = 5;
                            break;
                        case 'homing':
                            BOT_LIST[self.playerid].modifiers.homingBullets = true;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.homingBullets = false;
                                } catch {}
                            }, 20000);
                            break;   
                        case 'firerate':
                            BOT_LIST[self.playerid].modifiers.bulletRate *= 2;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.bulletRate *= (1/2);
                                } catch {}
                            }, 10000);
                            break;
                        case 'firerate2':
                            BOT_LIST[self.playerid].modifiers.bulletRate *= 3;
                            setTimeout(function() {
                                try {
                                    if (round.id == self.roundId) BOT_LIST[self.playerid].modifiers.bulletRate *= (1/3);
                                } catch {}
                            }, 10000);
                            break;
                        case 'special':
                            var random = Math.random();
                            if (random <= 0.1) {
                                BOT_LIST[self.playerid].modifiers.bulletDamage = 100;
    
                            } else if (random <= 0.4) {
                                BOT_LIST[self.playerid].modifiers.bulletDamage = 2;
                            } else if (random <= 0.7) {
                                BOT_LIST[self.playerid].modifiers.bulletSpeed = 1.5;
                                BOT_LIST[self.playerid].secondary.id = 'noclipbullets';
                                BOT_LIST[self.playerid].secondary.maxCPS = 1;
                            } else if (random <= 0.8) {
                                BOT_LIST[self.playerid].secondary.id = 'pathfindbullets';
                                BOT_LIST[self.playerid].secondary.maxCPS = 0.5;
                            } else {
                                BOT_LIST[self.playerid].secondary.id = 'yeet';
                                BOT_LIST[self.playerid].secondary.maxCPS = 0.05;
                            }
                            break;
                        default:
                            stop('ERROR: INVALID LOOTBOX');
                            break;
                    }
                } catch (err) {stop(err)}
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
};
LootBox.update = function() {
    for (var i in LOOT_BOXES) {
        var locallootbox = LOOT_BOXES[i];
        if (locallootbox.valid) locallootbox.update();
    }
};