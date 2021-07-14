// pathfind source: https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/

PathFind = function() {
    var self = {
        grid: [[]],
        openList: [],
        closedList: [],
        visitedList: []
    };
    self.init = function(array) {
        self.grid = [[]];
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
                        parent: null,
                        visited: false,
                        closed: false,
                        walkable: true
                    };
                    if (array[i][j] == 1) self.grid[i][j].walkable = false;
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
                if (currentNode.x >= neighbor.x - 3 && currentNode.x <= neighbor.x + 3 && currentNode.y <= neighbor.y + 3) {
                    nodeAccessable = true;
                }
                if (currentNode.y <= neighbor.y) {
                    nodeAccessable = true;
                }
                
                // Accessibility checks have been disabled to fix pathfinding.
                // To enable, add " || !nodeAccessable" to the end.
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
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.h = self.heuristic(neighbor.x, neighbor.y, x2, y2);
                    neighbor.f = neighbor.g + neighbor.h;
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
            if (self.grid[y][x-1].walkable) neighbors.push(self.grid[y][x-1]);
        } catch {}
        // right
        try {
            if (self.grid[y][x+1].walkable) neighbors.push(self.grid[y][x+1]);
        } catch {}
        // up
        try {
            if (self.grid[y-1][x].walkable) neighbors.push(self.grid[y-1][x]);
        } catch {}
        // down
        try {
            if (self.grid[y+1][x].walkable) neighbors.push(self.grid[y+1][x]);
        } catch {}
        // upleft
        try {
            if (self.grid[y-1][x-1].walkable && self.grid[y-1][x].walkable && self.grid[y][x-1].walkable) neighbors.push(self.grid[y-1][x-1]);
        } catch {}
        // upright
        try {
            if (self.grid[y-1][x+1].walkable && self.grid[y-1][x].walkable && self.grid[y][x+1].walkable) neighbors.push(self.grid[y-1][x+1]);
        } catch {}
        // downleft
        try {
            if (self.grid[y+1][x-1].walkable && self.grid[y+1][x].walkable && self.grid[y][x-1].walkable) neighbors.push(self.grid[y+1][x-1]);
        } catch {}
        // downright
        try {
            if (self.grid[y+1][x+1].walkable && self.grid[y+1][x].walkable && self.grid[y][x+1].walkable) neighbors.push(self.grid[y+1][x+1]);
        } catch {}
        return neighbors;
    };

    return self;
};