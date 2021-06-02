// Copyright (C) 2021 Radioactive64

const Pathfind = require('pathfinding');
PLAYER_LIST = [];
BOT_LIST = [];
BULLET_LIST = [];
COLORS = [['#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF', '#000000', '#AA0000', '#996600', '#EECC33', '#00AA00', '#0088CC', '#8877CC', '#CC77AA'], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
remainingPlayers = 0;

// entity
Entity = function() {
    var self = {
        id: null,
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
                if (((tempx*40)+39) > (self.x-self.halfsize) && (tempy*40) < (self.y+self.halfsize)) {
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
                if (((tempx*40)+1) < (self.x+self.halfsize) && (tempy*40) < (self.y+self.halfsize)) {
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
                if (((tempx*40)+39) > (self.x-self.halfsize) && ((tempy*40)+40) > (self.y-self.halfsize)) {
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
                if (((tempx*40)+1) < (self.x+self.halfsize) && (((tempy*40)+40) > self.y-self.halfsize)) {
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
                }
                self.colliding.center = true;
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
Player = function() {
    var self = new Entity();
    self.id = Math.random();
    self.name = '';
    self.halfsize = 16;
    self.Wpressed = false;
    self.Spressed = false;
    self.Apressed = false;
    self.Dpressed = false;
    self.noclip = false;
    self.invincible = false;
    self.Clicked = false;
    self.maxCPS = 10;
    self.lastclick = 0;
    self.hp = 5;
    self.score = 0;
    self.alive = true;
    self.ready = false;
    self.ingame = false;
    self.trackedData = new Achievements();
    var j = 0;
    for (var i in COLORS[1]) {
        if (COLORS[1][i] == 1) {
            j++;
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
        if (self.hp < 1 && self.alive) {
            self.death();
        }
    }
    self.updatePos = function() {
        if (self.noclip) {
            self.xspeed = 0;
            self.yspeed = 0;
            if (self.Dpressed) {
                self.xspeed = 10;
            }
            if (self.Apressed) {
                self.xspeed = -10;
            }
            if (self.Wpressed) {
                self.yspeed = 10;
            }
            if (self.Spressed) {
                self.yspeed = -10;
            }
        } else {
            if (self.Dpressed) {
                self.xspeed += 1;
            }
            if (self.Apressed) {
                self.xspeed -= 1;
            }
            if (self.Wpressed && self.colliding.bottom && !self.colliding.left && !self.colliding.right) {
                self.yspeed = 15;
            }
            if (self.Wpressed && self.Apressed && self.colliding.left) {
                self.yspeed = 15;
                self.xspeed = 15;
            }
            if (self.Wpressed && self.Dpressed && self.colliding.right) {
                self.yspeed = 15;
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
            remainingPlayers--;
            io.emit('playerdied', self.id);
            Achievements.update();
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
    }
    self.checkAchievements = function() {
        var aqquiredachievements = 0;
        var totalachievements = 0;
        for (var i in self.trackedData.achievements) {
            var localachievement = self.trackedData.achievements[i];
            if (localachievement.id.indexOf('easteregg') != 0) {
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
            pack.push({id:localplayer.id, x:localplayer.x, y:localplayer.y, hp:localplayer.hp, debug:{xspeed:localplayer.xspeed, yspeed:localplayer.yspeed, colliding:{left:localplayer.colliding.left, right:localplayer.colliding.right, bottom:localplayer.colliding.bottom, top:localplayer.colliding.top}}});
        }
    }
    return pack;
}

// bullets
Bullet = function(mousex, mousey, x, y, parent, color, isplayer) {
    var self = Entity();
    self.id = Math.random();
    self.x = x;
    self.y = y;
    self.angle = Math.atan2(-(self.y-mousey-16), -(self.x-mousex-16));
    self.xspeed = Math.cos(self.angle)*20;
    self.yspeed = Math.sin(self.angle)*20;
    self.halfsize = 4;
    self.parent = parent;
    self.parentisPlayer = isplayer;
    self.color = color;
    self.valid = true;
    var pack = {id:self.id, x:self.x, y:self.y, angle:self.angle, parent:self.parent, color:self.color};
    io.emit('newbullet', pack);

    self.update = function() {
        self.updatePos();
        self.collide();
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
                    localplayer.hp--;
                    if (localplayer.hp < 1) {
                        if (self.parentisPlayer) {
                            PLAYER_LIST[self.parent].trackedData.kills++;
                        }
                        Achievements.update();
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
                    localbot.hp--;
                    if (localbot.hp < 1) {
                        if (self.parentisPlayer) {
                            PLAYER_LIST[self.parent].trackedData.kills++;
                        }
                        Achievements.update();
                    }
                    io.emit('deletebullet', self.id);
                    delete BULLET_LIST[self.id];
                }
            }
        }
    }
    
    BULLET_LIST[self.id] = self;
    return self;
}
Bullet.update = function() {
    for (var i in BULLET_LIST) {
        var localbullet = BULLET_LIST[i];
        localbullet.update();
    }
    return;
}

// bots
Bot = function(targetOtherBots) {
    var self = new Entity();
    self.id = Math.random();
    self.halfsize = 16;
    self.Wpressed = false;
    self.Spressed = false;
    self.Apressed = false;
    self.Dpressed = false;
    self.maxCPS = 10;
    self.lastclick = 0;
    self.hp = 5;
    self.score = 0;
    self.alive = true;
    remainingPlayers++;
    var j = 0;
    for (var i in COLORS[1]) {
        if (COLORS[1][i] == 1) {
            j++;
        }
    }
    self.color = COLORS[0][j];
    COLORS[1][j] = 1;
    self.name = 'BOT_' + BOT_LIST.length;
    self.pathfinder = new Pathfind.JumpPointFinder({allowDiagonal:true});
    self.attackBots = targetOtherBots;

    self.update = function() {
        self.collide();
        self.path();
        self.updatePos();
        self.lastclick++;
        if (self.hp < 1 && self.alive) {
            self.death();
        }
    }
    self.updatePos = function() {
        if (self.Dpressed) {
            self.xspeed += 1;
        }
        if (self.Apressed) {
            self.xspeed -= 1;
        }
        if (self.Wpressed && self.colliding.bottom && !self.colliding.left && !self.colliding.right) {
            self.yspeed = 15;
        }
        if (self.Wpressed && self.Apressed && self.colliding.left) {
            self.yspeed = 15;
            self.xspeed = 15;
        }
        if (self.Wpressed && self.Dpressed && self.colliding.right) {
            self.yspeed = 15;
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
            Achievements.update();
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
    }
    self.path = function() {
        var closestplayer = null;
        for (var i in PLAYER_LIST) {
            if (closestplayer == null || self.getDistance(self.x, self.y, PLAYER_LIST[i].x, PLAYER_LIST[i].y) < self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y)) {
                closestplayer = PLAYER_LIST[i];
            }
        }
        if (self.attackBots) {
            for (var i in BOT_LIST) {
                if (closestplayer == null || (self.getDistance(self.x, self.y, BOT_LIST[i].x, BOT_LIST[i].y) < self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y) && i != self.id)) {
                    closestplayer = BOT_LIST[i];
                }
            }
        }
        if (closestplayer != null) {
            if (self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y) < 960) {
                var pathgrid = MAPS[CURRENT_MAP].pfgrid.clone();
                // self.pathfinder.findPath(closestplayer.x, closestplayer.y, pathgrid);
                // convert coordinates to movement
            }
            if (self.getDistance(self.x, self.y, closestplayer.x, closestplayer.y) < 160) {
                // stop moving closer
            }
            if (round.inProgress && self.alive && self.validateLineOfSight(closestplayer.x, closestplayer.y) && self.lastclick > ((1000/self.maxCPS)/(1000/60))) {
                self.lastclick = 0;
                new Bullet(closestplayer.x+(Math.floor(Math.random()*21)-10), closestplayer.y+(Math.floor(Math.random()*21)-10), self.x, self.y, self.id, self.color);
            }
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
            yspeed: 0,
            valid: true
        };
        ray.angle = Math.atan2(-(ray.y-targetx), -(ray.x-targety));
        ray.xspeed = Math.cos(ray.angle)*20;
        ray.yspeed = Math.sin(ray.angle)*20;
        for (var i = 0; i <= 1000; i++) {
            ray.x += ray.xspeed;
            ray.y += ray.yspeed;
            if (self.getDistance(ray.x, ray.y, targetx, targety) <= 16 && ray.valid) {
                break;
            }
            var rx = Math.floor(ray.x/40);
            var ry = Math.floor(ray.y/40);
            if (rx > -1 && rx < (MAPS[CURRENT_MAP].width+1) && ry > -1 && ry < (MAPS[CURRENT_MAP].height+1)) {
                if (MAPS[CURRENT_MAP][ry][rx] == 1) {
                    ray.valid = false;
                    break;
                }
            }
        }
        if (ray.valid) {
            return true;
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
        pack.push({id:localbot.id, x:localbot.x, y:localbot.y, hp:localbot.hp, debug:{xspeed:localbot.xspeed, yspeed:localbot.yspeed, colliding:{left:localbot.colliding.left, right:localbot.colliding.right, bottom:localbot.colliding.bottom, top:localbot.colliding.top}}});
    }
    return pack;
}