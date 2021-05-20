// Copyright (C) 2021 Radioactive64

PLAYER_LIST = [];
BULLET_LIST = [];
COLORS = [['#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF', '#000000', '#AA0000', '#996600', '#EECC33', '#00AA00', '#0088CC', '#8877CC', '#CC77AA'], [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
remainingPlayers = 0;

// entity
Entity = function() {
    var self = {id:null, x:0, y:0, xspeed:0, yspeed:0, halfsize:null, colliding:{bottom:false, top:false, left:false, right:false}, id:'', color:'#000000'};

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
                    if (self.Wpressed && self.Apressed && !self.colliding.top) {
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
                    if (self.Wpressed && self.Dpressed && !self.colliding.top) {
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
                    if (self.Wpressed && self.Apressed && !self.colliding.top) {
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
                    if (self.Wpressed && self.Dpressed && !self.colliding.top) {
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
    self.name = null;
    self.halfsize = 16;
    self.Wpressed = false;
    self.Apressed = false;
    self.Dpressed = false;
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
        self.collide();
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
            self.death();
        }
        self.x += self.xspeed;
        self.y -= self.yspeed;
    }
    self.death = function() {
        if (self.alive) {
            self.trackedData.deaths++;
            self.alive = false;
            remainingPlayers--;
            io.emit('playerdied', self.id);
            if (remainingPlayers < 2 && round.inProgress) {
                endRound();
            }
            Achievements.update();
        }
    }
    self.respawn = function(x, y) {
        self.xspeed = 0;
        self.yspeed = 0;
        self.x = x;
        self.y = y;
        self.alive = true;
        self.hp = 5;
    };
    self.checkAchievements = function() {
        for (var i in self.trackedData.achievements) {
            var localachievement = self.trackedData.achievements[i];
            if (localachievement.id == self.trackedData.wins + '_Wins' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                io.emit('achievement_get', {player:self.name, achievement:localachievement.id});
                console.log('Player "' + self.name + '" got the achievement "' + localachievement.name + '"!');
            }
            if (localachievement.id == self.trackedData.kills + '_Kills' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                io.emit('achievement_get', {player:self.name, achievement:localachievement.id});
                console.log('Player "' + self.name + '" got the achievement "' + localachievement.name + '"!');
            }
            if (localachievement.id == self.trackedData.deaths + '_Deaths' && localachievement.aqquired == false) {
                localachievement.aqquired = true;
                io.emit('achievement_get', {player:self.name, achievement:localachievement.id});
                console.log('Player "' + self.name + '" got the achievement "' + localachievement.name + '"!');
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
Bullet = function(mousex, mousey, x, y, parent, color) {
    var self = Entity();
    self.id = Math.random();
    self.x = x;
    self.y = y;
    self.angle = Math.atan2(-(self.y-mousey-16), -(self.x-mousex-16));
    self.xspeed = Math.cos(self.angle)*20;
    self.yspeed = Math.sin(self.angle)*20;
    self.halfsize = 4;
    self.parent = parent;
    self.color = color;
    self.valid = true;

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
                if (Math.abs(self.x - localplayer.x) < 16 && Math.abs(self.y - localplayer.y) < 16 && self.valid) {
                    self.valid = false;
                    localplayer.hp--;
                    if (localplayer.hp < 1) {
                        PLAYER_LIST[self.parent].trackedData.kills++;
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