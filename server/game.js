// Copyright (C) 2021 Radioactive64'

round = {inProgress:false, number:0};
playersready = 0;

// game functions
startGame = function() {
    endRound();
    setTimeout(function () {
        io.emit('gamestart');
        startRound();
    }, 1000);
};
endGame = function() {
    //endRound();
    //starttemp
    round.inProgress = false;
    io.emit('roundend');
    //endtemp
    CURRENT_MAP = 0;
    round.inProgress = false;
}
// round functions
startRound = function() {
    if (Math.random > 0.5) {
        CURRENT_MAP = 2;
    } else {
        CURRENT_MAP = 1;
    }
    io.emit('map', CURRENT_MAP);
    var j = 0;
    var pack = [];
    for (var i in PLAYER_LIST) {
        localplayer = PLAYER_LIST[i];
        localplayer.respawn(MAPS[CURRENT_MAP].spawns[j].x, MAPS[CURRENT_MAP].spawns[j].y);
        if (localplayer.debug) {
            pack.push({id:localplayer.id, x:localplayer.x, y:localplayer.y, hp:localplayer.hp, score:localplayer.score, debug:{xspeed:localplayer.xspeed, yspeed:localplayer.yspeed, colliding:{left:localplayer.colliding.left, right:localplayer.colliding.right, bottom:localplayer.colliding.bottom, top:localplayer.colliding.top}}});
        } else {
            pack.push({id:localplayer.id, x:localplayer.x, y:localplayer.y, hp:localplayer.hp, score:localplayer.score});
        }
        j++;
    }
    io.emit('update', pack);
    io.emit('respawn');
    io.emit('roundstart');
    round.inProgress = true;
};
endRound = function() {
    io.emit('roundend');
    round.inProgress = false;
    for (var i in PLAYER_LIST) {
        if (PLAYER_LIST[i].alive) {
            PLAYER_LIST[i].score++;
        }
    }
    if (true) {
        setTimeout(function () {
            startRound();
        }, 1000);
    }
};

// handlers