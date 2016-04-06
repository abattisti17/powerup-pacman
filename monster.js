
// Create a new Monster and initialize it.
var Monster = function(sides, row, column) {
    this.sides = sides; // shape
    this.location = {
        'row': row,
        'column': column,
    };
    this.direction = { // might be useful for vector change
        'row': 0,
        'column': 0,
    };
    this.angle = Math.map(Math.random(), 0, 1, 0, 360); // angle that they rotate
    this.rotation = Math.map(Math.random(), 0, 1, -2, 2); // rotation
    this.moveDelay = Math.map(Math.random(), 0, 1, monsterMoveDelayMin, monsterMoveDelayMax); // how long until they move again, within a range?
    this.moveTime = 0; // how long it takes them to move
}

// Draw monster to the canvas.
Monster.prototype.draw = function() {
    var x = wallStartX + this.location.column * wallSize + wallSize/2;
    var y = wallStartY + this.location.row * wallSize + wallSize/2;
    this.angle += this.rotation;
    drawPolygon(x, y, wallSize/3, this.sides, this.angle, monsterColor);
}

// Check to see if it's time for me to move.
Monster.prototype.update = function(player) {
    if (gameTime > this.moveTime) {
        this.moveTime = gameTime + this.moveDelay;
        this.move(player);
    }
}

// Figure out which direction I should move in, and change my location appropriately.
// make different monsters
Monster.prototype.move = function(player) {
    // If I can see the player, I should chase them. Otherwise, just walk around.
    var chasingPlayer = this.chasePlayer(player);
    if (!chasingPlayer) {
        // this.walkWherever();
        this.walkOnEdges();
    }

    // That was all just to decide what direction I should move in. Now I actually move!
    this.location.row += this.direction.row;
    this.location.column += this.direction.column;
}

// Try to move in the direction of the player, if possible.
Monster.prototype.chasePlayer = function(player) {
    if (!player.alive)
        return false;
    var pathClear = true;

    // I can 'see' the player if it's in the same row or column as me AND I
    // have a clear path to them. If this is the case, move directly toward
    // the player.
    if (player.location.row == this.location.row) {
        if (player.location.column < this.location.column) {
            // the player is to my west
            // look at each spot between me an the player. If any spot is blocked by a wall, do nothing.
            for (var c=this.location.column-1; c>=player.location.column; c--) {
                if (!canMoveTo(this.location.row, c)) {
                    pathClear = false;
                    break;
                }
            }
            if (pathClear) {
                this.direction = {'row': 0, 'column':-1};
            }

        } else {
            // the player is to my east
            for (var c=this.location.column-1; c<player.location.column; c++) {
                if (!canMoveTo(this.location.row, c)) {
                    pathClear = false;
                    break;
                }
            }
            if (pathClear) {
                this.direction = {'row': 0, 'column':+1};
            }
        }

    } else if (player.location.column == this.location.column) {
        if (player.location.row < this.location.row) {
            // the player is to my north
            for (var r=this.location.row-1; r>=player.location.row; r--) {
                if (!canMoveTo(r, this.location.column)) {
                    pathClear = false;
                    break;
                }
            }
            if (pathClear) {
                this.direction = {'row':-1, 'column':0};
            }

        } else {
            // the player is to my south
            for (var r=this.location.row-1; r<player.location.row; r++) {
                if (!canMoveTo(r, this.location.column)) {
                    pathClear = false;
                    break;
                }
            }
            if (pathClear) {
                this.direction = {'row':+1, 'column':0};
            }
        }

    } else {
        pathClear = false;
    }

    return pathClear;
}

// Move semi-randomly.
Monster.prototype.walkWherever = function() {
    // Look in all four directions and see which ones are clear for me to walk to.
    var openDirections = [];
    if (canMoveTo(this.location.row-1, this.location.column)) {
        openDirections.push({'row':-1, 'column':0});
    }
    if (canMoveTo(this.location.row, this.location.column+1)) {
        openDirections.push({'row':0, 'column':+1});
    }
    if (canMoveTo(this.location.row+1, this.location.column)) {
        openDirections.push({'row':+1, 'column':0});
    }
    if (canMoveTo(this.location.row, this.location.column-1)) {
        openDirections.push({'row':0, 'column':-1});
    }

    // Try to keep moving in whatever direction I was heading in. But if I'm
    // hitting a wall or I'm at a fork in the maze, move in a new direction.
    var isMoving = (this.direction.row != 0 || this.direction.column != 0);
    var pathIsClear = canMoveTo(this.location.row+this.direction.row, this.location.column+this.direction.column);
    var atFork = (openDirections.length > 2);

    if (!isMoving || !pathIsClear || atFork) {
        // To pick a new direction, Pick randomly from the array of possible locations.
        if (openDirections.length > 0) {
            var j = Math.floor(Math.random() * openDirections.length);
            this.direction.row = openDirections[j].row;
            this.direction.column = openDirections[j].column;
        }
    }
}

// Move around the edges.
Monster.prototype.walkOnEdges = function() {
    // Look in all four directions and see which ones are clear for me to walk to.
    // var openDirections2 = [];
    if ((canMoveTo(this.location.row-1, this.location.column)) && (canMoveTo(this.location.row, this.location.column-1))) { // looks up & left
      console.log('move me right! ' + 'direction row= ' + this.direction.row + 'direction row= ' + this.direction.column);
        // openDirections.push({'row':-1, 'column':0});
    // }
    // if (canMoveTo(this.location.row, this.location.column+1)) {
    //     openDirections.push({'row':0, 'column':+1}); // right
    // }
    // if (canMoveTo(this.location.row+1, this.location.column)) {
    //     openDirections.push({'row':+1, 'column':0}); // looks down
    // }
    // if (canMoveTo(this.location.row, this.location.column-1)) {
    //     openDirections.push({'row':0, 'column':-1}); // left
    // }

    // Try to keep moving in whatever direction I was heading in. But if I'm
    // hitting a wall or I'm at a fork in the maze, move in a new direction.
    var isMoving = (this.direction.row != 0 || this.direction.column != 0);
    var pathIsClear = canMoveTo(this.location.row+this.direction.row, this.location.column+this.direction.column);
    var atFork = (openDirections.length > 2);

    if (!isMoving || !pathIsClear || atFork) {
        // To pick a new direction, Pick randomly from the array of possible locations.
        if (openDirections.length > 0) {
            var j = Math.floor(Math.random() * openDirections.length);
            this.direction.row = openDirections[j].row;
            this.direction.column = openDirections[j].column;
        }
        if
    }
}
