// Copyright (C) 2021 Radioactive64'

round = {inProgress:false, number:0};
gameinProgress = false;

// game functions
startGame = function() {
    endRound();
    var pack = [];
    for (var i in PLAYER_LIST) {
        PLAYER_LIST[i].score = 0;
        pack.push(PLAYER_LIST[i].name);
    }
    setTimeout(function () {
        io.emit('gamestart', pack);
        gameinProgress = true;
        startRound();
    }, 1000);
}
endGame = function(id) {
    CURRENT_MAP = 0;
    io.emit('map', CURRENT_MAP);
    if (id != null) {
        io.emit('winner', id);
    }
    round.inProgress = false;
    gameinProgress = false;
}
// round functions
startRound = function() {
    if (gameinProgress) {
        switch (Math.floor(Math.random()*3)) {
            case 0:
                CURRENT_MAP = 1;
                break;
            case 1:
                CURRENT_MAP = 2;
                break;
            case 2:
                CURRENT_MAP = 3;
                break;
            default:
                break;
        }
        io.emit('map', CURRENT_MAP);
        var j = 0;
        var pack = [];
        var pack2 = [];
        for (var i in PLAYER_LIST) {
            localplayer = PLAYER_LIST[i];
            localplayer.respawn(MAPS[CURRENT_MAP].spawns[j].x, MAPS[CURRENT_MAP].spawns[j].y);
            pack.push({id:localplayer.id, x:localplayer.x, y:localplayer.y, hp:localplayer.hp, debug:{xspeed:localplayer.xspeed, yspeed:localplayer.yspeed, colliding:{left:localplayer.colliding.left, right:localplayer.colliding.right, bottom:localplayer.colliding.bottom, top:localplayer.colliding.top}}});
            pack2.push({id:localplayer.id, score:localplayer.score});
            j++;
        }
        remainingPlayers = 0;
        for (var i in PLAYER_LIST) {
            if (PLAYER_LIST[i].ingame) {
                remainingPlayers++;
            }
        }
        io.emit('update', pack);
        io.emit('roundstart', pack2);
        round.inProgress = true;
    }
}
endRound = function() {
    io.emit('roundend');
    round.inProgress = false;
    var nextround = true;
    for (var i in PLAYER_LIST) {
        if (PLAYER_LIST[i].alive) {
            PLAYER_LIST[i].score++;
            if (PLAYER_LIST[i].score > 9) {
                endGame(PLAYER_LIST[i].id);
                nextround = false;
                for (var j in PLAYER_LIST) {
                    PLAYER_LIST[j].score = 0;
                }
            }
        }
    }
    if (remainingPlayers != 0 && nextround && gameinProgress) {
        setTimeout(function () {
            startRound();
        }, 1000);
    }
}