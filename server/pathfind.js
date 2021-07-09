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
            self.grid[i] = [];
            for(var j in array[i]) {
                self.grid[i][j] = {
                    x: j,
                    y: i,
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

            var nodeAccessable = false;
            for (var i in self.visitedList) {
                var closedNode = self.visitedList[i];
                if (closedNode.walkable && closedNode.x >= currentNode.x - 3 && closedNode.x <= currentNode.x + 3 && closedNode.y <= currentNode.y + 3) {
                    nodeAccessable = true;
                }
                if (closedNode.walkable && closedNode.y <= currentNode.y) {
                    nodeAccessable = true;
                }
            }

            if(!nodeAccessable && self.closedList.length > 4){
                var removeIndex = self.openList.indexOf(currentNode);
                self.openList.splice(removeIndex, 1);
                currentNode.closed = true;
                self.closedList.push(currentNode);
                continue;
            }

            if(currentNode.x == x2 && currentNode.y == y2) {
                var curr = currentNode;
                var path = [];
                while (curr.parent) {
                    path.push(curr);
                    curr = curr.parent;
                }

                // return path.reverse();
                return path;
            }

            var removeIndex = self.openList.indexOf(currentNode);
            self.openList.splice(removeIndex, 1);
            currentNode.closed = true;
            self.closedList.push(currentNode);
            
            var neighbors = self.findNeighbors(currentNode.x, currentNode.y);
            for (var i in neighbors) {
                var neighbor = neighbors[i];
                
                if (neighbor.closed || !neighbor.walkable) {
                    continue;
                }

                var gScore = currentNode.g+1;
                var bestG = false;
                if (!neighbor.visited) {
                    bestG = true;
                    neighbor.h = self.heuristic(neighbor.x, neighbor.y, x2, y2);
                    neighbor.visited = true;
                    self.visitedList.push(neighbor);
                    self.openList.push(neighbor);
                } else if (gScore < neighbor.g) {
                    bestG = true;
                }
                if (bestG) {
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                }
            }
        }
        return [];
    };
    self.heuristic = function(x1, y1, x2, y2) {
        return Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2);
    };
    self.findNeighbors = function(x, y) {
        var ret = [];

        // left
        if (self.grid[y-1]) if (self.grid[y-1][x]) if (self.grid[y-1][x].walkable) ret.push(self.grid[y-1][x]);
        // right
        if (self.grid[y+1]) if (self.grid[y+1][x]) if (self.grid[y+1][x].walkable) ret.push(self.grid[y+1][x]);
        // up
        if (self.grid[y]) if (self.grid[y][x-1]) if (self.grid[y][x-1].walkable) ret.push(self.grid[y][x-1]);
        // down
        if (self.grid[y]) if (self.grid[y][x+1]) if (self.grid[y][x+1].walkable) ret.push(self.grid[y][x+1]);
        // upleft
        if (self.grid[y-1]) if (self.grid[y-1][x-1]) if (self.grid[y-1][x].walkable && self.grid[y][x-1].walkable && self.grid[y-1][x-1].walkable) ret.push(self.grid[y-1][x-1]);
        // upright
        if (self.grid[y+1]) if (self.grid[y+1][x-1]) if (self.grid[y+1][x].walkable && self.grid[y][x-1].walkable && self.grid[y+1][x-1].walkable) ret.push(self.grid[y+1][x-1]);
        // downleft
        if (self.grid[y-1]) if (self.grid[y-1][x+1]) if (self.grid[y-1][x].walkable && self.grid[y][x+1].walkable && self.grid[y-1][x+1].walkable) ret.push(self.grid[y-1][x+1]);
        // downright
        if (self.grid[y+1]) if (self.grid[y+1][x+1]) if (self.grid[y+1][x].walkable && self.grid[y][x+1].walkable && self.grid[y+1][x+1].walkable) ret.push(self.grid[y+1][x+1]);
        return ret;
    };

    return self;
}
