// pathfind source: https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/

PathFind = function() {
    var self = {
        grid: [[]],
        openList: [],
        closedList: [],
        visitedList: [],
        collisionList: []
    };
    self.init = function(array) {
        self.grid = [[]];
        self.collisionList = [];
        for(var i in array) {
            if (i < array.height) {
                self.grid[i] = [];
                for(var j in array[i]) {
                    self.grid[i][j] = {
                        x: parseInt(j),
                        y: parseInt(i),
                        f: 0,
                        g: 0,
                        h: 0,
                        e: 0,
                        parent: null,
                        visited: false,
                        closed: false,
                        direction: 'none',
                        walkable: true
                    };
                    if (array[i][j] == 1) {
                        self.grid[i][j].walkable = false;
                        self.collisionList.push(self.grid[i][j]);
                    }
                }
            }
        }
    };
    self.reset = function() {
        for (var i in self.grid) {
            for (var j in self.grid[i]) {
                self.grid[i][j].f = 0;
                self.grid[i][j].g = 0;
                self.grid[i][j].h = 0;
                self.grid[i][j].e = 0;
                self.grid[i][j].parent = null;
                self.grid[i][j].visited = false;
                self.grid[i][j].closed = false;
            }
        }
        self.openList = [];
        self.closedList = [];
        self.visitedList = [];
    }
    self.path = function(x1, y1, x2, y2) {
        self.reset();
        self.openList.push(self.grid[y1][x1]);

        while (self.openList.length > 0) {
            var lowest = 0;
            for (var i in self.openList) {
                if (self.openList[i].f < self.openList[lowest].f) lowest = i;
            }
            var currentNode = self.openList[lowest];

            if(currentNode.x == x2 && currentNode.y == y2) {
                var curr = currentNode;
                var path = [];
                while (curr.parent) {
                    path.push(curr);
                    curr = curr.parent;
                }
                return path.reverse();
            }

            var removeIndex = self.openList.indexOf(currentNode);
            self.openList.splice(removeIndex, 1);
            currentNode.closed = true;
            self.closedList.push(currentNode);
            
            var neighbors = self.findNeighbors(currentNode.x, currentNode.y);
            for (var i in neighbors) {
                var neighbor = neighbors[i];

                var nodeAccessable = false;
                for (var i in self.collisionList) {
                    var tempnode = self.collisionList[i];
                    if (tempnode.x >= neighbor.x - 2 && tempnode.x <= neighbor.x + 2 && tempnode.y <= neighbor.y + 4 && tempnode.y > neighbor.y) {
                        nodeAccessable = true;
                    }
                }
                if (currentNode.y <= neighbor.y) {
                    nodeAccessable = true;
                }
                
                if (neighbor.closed || !neighbor.walkable || !nodeAccessable) {
                    continue;
                }

                var gScore = currentNode.g+1;
                var bestG = false;
                if (!neighbor.visited) {
                    bestG = true;
                    neighbor.visited = true;
                    self.visitedList.push(neighbor);
                    self.openList.push(neighbor);
                } else if (gScore < neighbor.g) {
                    bestG = true;
                }
                if (bestG) {
                    neighbor.e = 0;
                    var closest = {
                        side1: false,
                        side2: false,
                        above: false,
                        below: false,
                    };
                    for (var i in self.collisionList) {
                        var tempnode = self.collisionList[i];
                        if (tempnode.x >= neighbor.x - 2 && tempnode.x <= neighbor.x + 2) closest.side2 = true;
                        if (tempnode.x >= neighbor.x - 1 && tempnode.x <= neighbor.x + 1) closest.side1 = true;
                        if (tempnode.y == neighbor.y - 1) closest.above = true;
                        if (tempnode.y == neighbor.y + 1) closest.below = true;
                    }
                    if (closest.side2) neighbor.e--;
                    if (closest.side1) neighbor.e--;
                    if (closest.above) neighbor.e++;
                    if (closest.below) neighbor.e--;
                    // if jumping try to have collisions to the side or right underneath
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.h = self.heuristic(neighbor.x, neighbor.y, x2, y2);
                    neighbor.f = neighbor.g + neighbor.h + neighbor.e*2;
                }
            }
        }

        return [];
    };
    self.heuristic = function(x1, y1, x2, y2) {
        return Math.abs(x1-x2) + Math.abs(y1-y2);
    };
    self.findNeighbors = function(x, y) {
        var neighbors = [];
        // left
        try {
            if (self.grid[y][x-1].walkable) {
                self.grid[y][x-1].direction = 'left';
                neighbors.push(self.grid[y][x-1]);
            }
        } catch {}
        // right
        try {
            if (self.grid[y][x+1].walkable) {
                self.grid[y][x-1].direction = 'right';
                neighbors.push(self.grid[y][x+1]);
            }
        } catch {}
        // up
        try {
            if (self.grid[y-1][x].walkable) {
                self.grid[y-1][x].direction = 'up';
                neighbors.push(self.grid[y-1][x]);
            }
        } catch {}
        // down
        try {
            if (self.grid[y+1][x].walkable) {
                self.grid[y+1][x].direction = 'down';
                neighbors.push(self.grid[y+1][x]);
            }
        } catch {}
        // upleft
        try {
            if (self.grid[y-1][x-1].walkable && self.grid[y-1][x].walkable && self.grid[y][x-1].walkable) {
                self.grid[y-1][x].direction = 'up';
                neighbors.push(self.grid[y-1][x-1]);
            }
        } catch {}
        // upright
        try {
            if (self.grid[y-1][x+1].walkable && self.grid[y-1][x].walkable && self.grid[y][x+1].walkable) {
                self.grid[y-1][x+1].direction = 'up';
                neighbors.push(self.grid[y-1][x+1]);
            }
        } catch {}
        // downleft
        try {
            if (self.grid[y+1][x-1].walkable && self.grid[y+1][x].walkable && self.grid[y][x-1].walkable) {
                self.grid[y+1][x-1].direction = 'down';
                neighbors.push(self.grid[y+1][x-1]);
            }
        } catch {}
        // downright
        try {
            if (self.grid[y+1][x+1].walkable && self.grid[y+1][x].walkable && self.grid[y][x+1].walkable) {
                self.grid[y+1][x+1].direction = 'down';
                neighbors.push(self.grid[y+1][x+1]);
            }
        } catch {}
        return neighbors;
    };

    return self;
};