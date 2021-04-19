// Copyright (C) 2021 Radioactive64'

// game initializer
function startgame() {
    if (Math.random > 0.5) {
        CURRENT_MAP = 2;
    } else {
        CURRENT_MAP = 1;
    }
    io.emit('map', CURRENT_MAP);
}
// round functions
function startround() {

}

// handlers