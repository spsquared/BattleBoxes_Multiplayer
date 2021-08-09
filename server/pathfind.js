// pathfind source: https://briangrinstead.com/blog/astar-search-algorithm-in-javascript/
// binary heap source: https://eloquentjavascript.net/1st_edition/appendix2.html

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
    };
    self.path = function(x1, y1, x2, y2) {
        if (x1 >= 0 && x1 <= self.grid[0].length && y1 >= 0 && y1 <= self.grid.length && x2 >= 0 && x2 <= self.grid[0].length && y2 >= 0 && y2 <= self.grid.length) {
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
                        curr = self.closedList[curr.parent];
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
                    
                    if (neighbor.closed || !neighbor.walkable) {
                        continue;
                    }

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
                    
                    if (!nodeAccessable) {
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
                        if (closest.side2) neighbor.e -= 1;
                        if (closest.side1) neighbor.e -= 1;
                        if (closest.above) neighbor.e += 4;
                        if (closest.below) neighbor.e -= 2;
                        neighbor.parent = self.closedList.indexOf(currentNode);
                        neighbor.g = gScore;
                        neighbor.h = self.heuristic(neighbor.x, neighbor.y, x2, y2);
                        neighbor.f = neighbor.g + neighbor.h + neighbor.e;
                    }
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
                self.grid[y][x+1].direction = 'right';
                neighbors.push(self.grid[y][x+1]);
            }
        } catch {}
        // up
        try {
            if (self.grid[y+1][x].walkable) {
                self.grid[y+1][x].direction = 'up';
                neighbors.push(self.grid[y+1][x]);
            }
        } catch {}
        // down
        try {
            if (self.grid[y-1][x].walkable) {
                self.grid[y-1][x].direction = 'down';
                neighbors.push(self.grid[y-1][x]);
            }
        } catch {}
        // upleft
        try {
            if (self.grid[y+1][x-1].walkable && self.grid[y+1][x].walkable && self.grid[y][x-1].walkable) {
                self.grid[y+1][x-1].direction = 'up';
                neighbors.push(self.grid[y+1][x-1]);
            }
        } catch {}
        // upright
        try {
            if (self.grid[y+1][x+1].walkable && self.grid[y+1][x].walkable && self.grid[y][x+1].walkable) {
                self.grid[y+1][x+1].direction = 'up';
                neighbors.push(self.grid[y+1][x+1]);
            }
        } catch {}
        // downleft
        try {
            if (self.grid[y-1][x-1].walkable && self.grid[y-1][x].walkable && self.grid[y][x-1].walkable) {
                self.grid[y-1][x].direction = 'down';
                neighbors.push(self.grid[y-1][x-1]);
            }
        } catch {}
        // downright
        try {
            if (self.grid[y-1][x+1].walkable && self.grid[y-1][x].walkable && self.grid[y][x+1].walkable) {
                self.grid[y-1][x+1].direction = 'down';
                neighbors.push(self.grid[y-1][x+1]);
            }
        } catch {}
        return neighbors;
    };

    return self;
};

function BinaryHeap() {
    this.content = [];
    this.scoreFunction = function(node) {return node.f};
};

BinaryHeap.prototype = {
    push: function (element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function () {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function (node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            } else {
                this.bubbleUp(i);
            }
        }
    },
    size: function () {
        return this.content.length;
    },
    rescoreElement: function (node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function (n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1;
            var parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function (n) {
        // Look up the target element and its score.
        var length = this.content.length;
        var element = this.content[n];
        var elemScore = this.scoreFunction(element);

        while (true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1;
            var child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null;
            var child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore) {
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N];
                var child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};