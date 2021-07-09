// pathfind source: https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/

PathFind = function() {
    var self = {
        grid: [[]],
        openList: [],
        closedList: []
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
    }
    self.path = function(x1, y1, x2, y2) {
        self.reset();
        self.openList = [];
        self.openList.push(self.grid[y1][x1]);

        while (self.openList.length > 0) {
            var lowest = 0;
            for (var i in self.openList) {
                if (self.openList[i].f < self.openList[lowest].f) lowest = i;
            }
            var currentNode = self.openList[lowest];

            // Close node if cannot access

            // check if there is a node in the closed list:
            //     with a y value maximum 4 nodes away
            //     with an x value maximum 3 nodes away
            //     or a node above in the closed list
            // If not, close the node.
            if (false) {

            }
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
            
            var neighbors = self.findNeighbors(currentNode.x, currentNode.y);
            for (var i in neighbors) {
                var neighbor = neighbors[i];
                
                if (!neighbor.closed && neighbor.walkable) {
                // if (neighbor.closed) {
                    continue;
                }

                var gScore = currentNode.g+1;
                var bestG = false;
                if (!neighbor.visited) {
                    bestG = true;
                    neighbor.h = self.heuristic(neighbor.x, neighbor.y, x2, y2);
                    neighbor.visited = true;
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
        // This is the Manhattan distance
        var d1 = Math.abs(x2 - x1);
        var d2 = Math.abs(y2 - y1);
        return d1 + d2;
    };
    self.findNeighbors = function(x, y) {
        var ret = [];
        var x = x;
        var y = y;

        // left
        if (self.grid[x-1]) if (self.grid[x-1][y]) ret.push(self.grid[x-1][y]);
        // right
        if (self.grid[x+1]) if (self.grid[x+1][y]) ret.push(self.grid[x+1][y]);
        // up
        if (self.grid[x]) if (self.grid[x][y-1]) ret.push(self.grid[x][y-1]);
        // down
        if (self.grid[x]) if (self.grid[x][y+1]) ret.push(self.grid[x][y+1]);
        // upleft
        if (self.grid[x-1]) if (self.grid[x-1][y-1]) ret.push(self.grid[x-1][y-1]);
        // upright
        if (self.grid[x+1]) if (self.grid[x+1][y-1]) ret.push(self.grid[x+1][y-1]);
        // downleft
        if (self.grid[x-1]) if (self.grid[x-1][y+1]) ret.push(self.grid[x-1][y+1]);
        // downright
        if (self.grid[x+1]) if (self.grid[x+1][y+1]) ret.push(self.grid[x+1][y+1]);
        return ret;
    };

    return self;
}
