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
                return path;
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
                if (neighbor.closed || !neighbor.walkable) {
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
        if (self.grid[y]) if (self.grid[y][x-1]) if (self.grid[y][x-1].walkable) neighbors.push(self.grid[y][x-1]);
        // right
        if (self.grid[y]) if (self.grid[y][x+1]) if (self.grid[y][x+1].walkable) neighbors.push(self.grid[y][x+1]);
        // up
        if (self.grid[y-1]) if (self.grid[y-1][x]) if (self.grid[y-1][x].walkable) neighbors.push(self.grid[y-1][x]);
        // down
        if (self.grid[y+1]) if (self.grid[y+1][x]) if (self.grid[y+1][x].walkable) neighbors.push(self.grid[y+1][x]);
        // upleft
        if (self.grid[y-1]) if (self.grid[y-1][x-1]) if (self.grid[y-1][x].walkable && self.grid[y][x-1].walkable && self.grid[y-1][x-1].walkable) neighbors.push(self.grid[y-1][x-1]);
        // upright
        if (self.grid[y-1]) if (self.grid[y-1][x+1]) if (self.grid[y-1][x].walkable && self.grid[y][x+1].walkable && self.grid[y-1][x+1].walkable) neighbors.push(self.grid[y-1][x+1]);
        // downleft
        if (self.grid[y+1]) if (self.grid[y+1][x-1]) if (self.grid[y+1][x].walkable && self.grid[y][x-1].walkable && self.grid[y+1][x-1].walkable) neighbors.push(self.grid[y+1][x-1]);
        // downright
        if (self.grid[y+1]) if (self.grid[y+1][x+1]) if (self.grid[y+1][x].walkable && self.grid[y][x+1].walkable && self.grid[y+1][x+1].walkable) neighbors.push(self.grid[y+1][x+1]);
        return neighbors;
    };

    return self;
};

var astar = {
    init: function(grid) {
        for(var x = 0, xl = grid.length; x < xl; x++) {
            for(var y = 0, yl = grid[x].length; y < yl; y++) {
                var node = grid[x][y];
                node.f = 0;
                node.g = 0;
                node.h = 0;
                node.cost = node.type;
                node.visited = false;
                node.closed = false;
                node.parent = null;
            }
        }
    },
    heap: function() {
        return new BinaryHeap(function(node) {
            return node.f;
        });
    },
    search: function(grid, start, end, diagonal, heuristic) {
        astar.init(grid);
        heuristic = heuristic || astar.manhattan;
        diagonal = !!diagonal;

        var openHeap = astar.heap();

        openHeap.push(start);

        while(openHeap.size() > 0) {

            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                var curr = currentNode;
                var ret = [];
                while(curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }
                return ret.reverse();
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbors.
            currentNode.closed = true;

            // Find all neighbors for the current node. Optionally find diagonal neighbors as well (false by default).
            var neighbors = astar.neighbors(grid, currentNode, diagonal);

            for(var i=0, il = neighbors.length; i < il; i++) {
                var neighbor = neighbors[i];

                if(neighbor.closed || neighbor.isWall()) {
                    // Not a valid node to process, skip to next neighbor.
                    continue;
                }

                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbor.cost;
                var beenVisited = neighbor.visited;

                if(!beenVisited || gScore < neighbor.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbor.visited = true;
                    neighbor.parent = currentNode;
                    neighbor.h = neighbor.h || heuristic(neighbor.pos, end.pos);
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbor);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbor);
                    }
                }
            }
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    manhattan: function(pos0, pos1) {
        // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html

        var d1 = Math.abs (pos1.x - pos0.x);
        var d2 = Math.abs (pos1.y - pos0.y);
        return d1 + d2;
    },
    neighbors: function(grid, node, diagonals) {
        var ret = [];
        var x = node.x;
        var y = node.y;

        // West
        if(grid[x-1] && grid[x-1][y]) {
            ret.push(grid[x-1][y]);
        }

        // East
        if(grid[x+1] && grid[x+1][y]) {
            ret.push(grid[x+1][y]);
        }

        // South
        if(grid[x] && grid[x][y-1]) {
            ret.push(grid[x][y-1]);
        }

        // North
        if(grid[x] && grid[x][y+1]) {
            ret.push(grid[x][y+1]);
        }

        if (diagonals) {

            // Southwest
            if(grid[x-1] && grid[x-1][y-1]) {
                ret.push(grid[x-1][y-1]);
            }

            // Southeast
            if(grid[x+1] && grid[x+1][y-1]) {
                ret.push(grid[x+1][y-1]);
            }

            // Northwest
            if(grid[x-1] && grid[x-1][y+1]) {
                ret.push(grid[x-1][y+1]);
            }

            // Northeast
            if(grid[x+1] && grid[x+1][y+1]) {
                ret.push(grid[x+1][y+1]);
            }

        }

        return ret;
    }
};