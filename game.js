//
// This program draws a maze that the player can navigate with the arrow keys.
// The maze is full of dots that the player can eat points.
// The player is also being chased by monsters!
//

//
// The maze is represented by a string that is formatted into a grid.
// Each cell in the grid represents either:
// - the start point ('A');
// - a wall ('#').
// - a monster ('Z');
// - a power up ('P');
// - a walkable empty space (' ').
//
//         -------------------
var maze = '                 '
         + 'Z# ## ##Z## ## #Z'
         + '   #   ###   #   '
         + ' #   #     #   # '
         + ' ## ## # # ## ## '
         + '  #     A     #  '
         + ' ## ## # # ## ## '
         + ' #   #     #   # '
         + '   #   ###   #   '
         + ' # ## ## ## ## # '
         + 'Z       Z      Z ';
//         -------------------

//         -------------------
var maze2 = '                 '
         + 'Z# ## ##Z## ## #Z'
         + '   #   ###   #   '
         + ' #   #   # #   # '
         + ' ## ## # # ## ## '
         + '  #     A###  #  '
         + ' ##    # # ## ## '
         + ' #   #     #   # '
         + '   #Z  ### Z #   '
         + ' # ## ## ## ## # '
         + 'Z       Z      Z ';
//         -------------------

var mazeCounter = 1;
var columns = 17;
var rows = 11;

var pathColor = 0x95CFB7;
var wallColor = 0xFF823A;
var dotColor = 0xF2F26F;
var monsterColor = 0xF04155; // must be for different monsters
var playerColor = 0xFFF7BD;
var deadColor = 0x000000;

// shorter delays mean faster monsters. a global variable, we need to make these for each monster
var monsterMoveDelayMin = 500;
var monsterMoveDelayMax = 1000;

// ============================================================================

var startLocation; // where the player starts, sub data for rows and columns
var wallStartX, wallStartY, wallSize; // where we start drawing the wall, based on renderer sizes
var dotSize; // how big dots are
var dots = []; // draw some dots
var player; // player
var monsters = []; // number in the brackets is how many monsters we draw (i), but change it in the monster.js
var maxScore; // the maximum dots you can eat
var playerLives = 3;
shouldCheckCollisions = false;

//SOUNDS
var wakaWaka = new Audio("wakaWaka.m4a");
var pacmanDies = new Audio("pacmanDies.m4a");
var startUp = new Audio("startUp.m4a");
var pacmanDies = new Audio("pacmanDies.m4a");
var jesus = new Audio("jesus.m4a");
var loseLife = new Audio("loseLife.m4a");
var playerWin = new Audio("playerWin.m4a");

function setup() { // renders the maze
    renderer.backgroundColor = wallColor;
    buildMaze();
    player = new Player(startLocation.row, startLocation.column);
    startUp.play(); // plays start up sound
    // player2 = new Player(startLocation.row + 1, startLocation.column);
}

function update() { // draw the state of the game
    graphics.clear(); // wipes the graphics
    drawPath();
    drawDots();
    drawPlayer();
    drawMonsters();
    if (shouldCheckCollisions) {
      shouldCheckCollisions = false;
      checkCollisions(); // has the player eaten a dot, have they died?
    }
    updateMonster();
}

function onKeyDown(event) { // moving
    deltaRow = 0;
    deltaColumn = 0;
    switch (event.keyCode) {
        case 37: // Left Arrow
            deltaColumn = -1;
            break;
        case 38: // Up Arrow
            deltaRow = -1;
            break;
        case 39: // Right Arrow
            deltaColumn = +1;
            break;
        case 40: // Down Arrow
            deltaRow = +1;
            break;
        case 76: // L for 'Live Again' -- cheat codes!!!
            if (!player.alive)
                player.resurrect(); // Jesus function
                playerLives = 3;
                jesus.play(); // plays jesus sound
            break;
    }

    if (deltaRow != 0 || deltaColumn != 0) {
        player.move(deltaRow, deltaColumn);
        shouldCheckCollisions = true;
        // player2.move(deltaRow, deltaColumn);

        // check to see if the player is on top of any monsters.
        for (var i in monsters) {
            var monster = monsters[i];
            monster.iHitThePlayer = false;
      }
    }
}

function buildMaze() {
    // Calculate the best-fit size of a wall block based on the canvas size
    // and number of columns or rows in the grid.
    wallSize = Math.min(renderer.width/(columns+2), renderer.height/(rows+2)); // padding is relative to the number of columns and rows

    // Calculate the starting position when drawing the maze.
    wallStartX = (renderer.width - (wallSize*columns)) / 2;
    wallStartY = (renderer.height - (wallSize*rows)) / 2;

    // The size of a dot is some fraction of the size of a maze spot.
    dotSize = wallSize / 8; // useful for powerups?

    maxScore = 0;
    var monsterSides = 3; // first monster has 3 sides, +1 for every one after

    // Find the player and monster locations, and initialize the dot map.
    // r and c are player location coordinates and columns and rows are defintions of the maze
    for (var r=0; r<rows; r++) { // ?
        for (var c=0; c<columns; c++) { // ?
            var i = (r * columns) + c;
            var ch = maze[i];
            if (ch == 'A') {
                startLocation = {'row':r, 'column':c};
            } else if (ch == 'Z') {
                monsters.push(new Monster(monsterSides, r, c));
                monsterSides += 1;
            }

            if (!isWall(r, c) && ch != 'Z' && ch != 'A') {
                // each clear space in the maze should have a dot in it.
                dots[i] = '.'; // ?
                maxScore += 1; // defines how many points you need to win, parametrically
            } else {
                dots[i] = ' ';
            }
        }
    }
}

function isWall(r, c) { // checks if there's a wall where you're trying to move
    var i = (r * columns) + c;
    var ch = maze[i];
    return ((ch != ' ') && (ch != 'A') && (ch != 'Z'));
}

function canMoveTo(r, c) {
    // is this spot outside the maze?
    if (r < 0 || c < 0 || r >= rows || c >= columns)
        return false;
    // is there a wall in this spot?
    if (isWall(r, c))
        return false;
    return true;
}

// ============================================================================

function drawPath() {
    for (var r=0; r<rows; r++) {
        for (var c=0; c<columns; c++) {
            var i = (r * columns) + c;
            var ch = maze[i];
            // The start and monster locations are also on the path,
            // so check for them too.
            if (ch==' ' || ch=='A' || ch=='Z') {
                var x = wallStartX + c * wallSize;
                var y = wallStartY + r * wallSize;
                drawRect(x, y, wallSize, wallSize, pathColor);
            }
        }
    }
}

function drawDots() {
    for (var r=0; r<rows; r++) {
        for (var c=0; c<columns; c++) {
            var i = (r * columns) + c;
            var ch = dots[i];
            if (ch == '.') {
                var x = wallStartX + c * wallSize + wallSize/2;
                var y = wallStartY + r * wallSize + wallSize/2;
                drawCircle(x, y, dotSize, dotColor);
            }
        }
    }
}

function drawPlayer() {
    player.draw();
    // player2.draw();
}

function drawMonsters() {
    for (var i in monsters) {
        var monster = monsters[i];
        monster.draw();
    }
}

var changeMaze = function(newMaze) {
    maze = newMaze; //changes the maze variable to hold another maze
    mazeCounter +=1;
    buildMaze(); //rebuilds the maze
  }

// ============================================================================

function checkCollisions() {
    // check to see if the player is on top of an edible dot.
    i = player.location.row * columns + player.location.column;
    if (dots[i] == '.') {
        player.score += 1;
        dots[i] = ' ';
        wakaWaka.play(); // plays eating sound

        // update the score display, which is in HTML outside of our canvas.
        var scorediv = document.getElementById('score');
        scorediv.innerHTML = player.score;

        // Did we win yet?
        //Win State!!
        if (player.score == maxScore) {
            player.win();
            scorediv.innerHTML = player.score + " - YOU WIN!";
            changeMaze(maze2);
        }
    }

    // check to see if the player is on top of any monsters.
    for (var i in monsters) {
        var monster = monsters[i];
        if (monster.iHitThePlayer) {
          continue;
        }
        if (player.location.row == monster.location.row && player.location.column == monster.location.column) {
          playerLives -= 1;
          loseLife.play(); // plays eating sound
          monster.iHitThePlayer = true;
          console.log('player lives = ' + playerLives);
        }
        if (playerLives == 0) {
          player.die();
          pacmanDies.play(); // plays dies sound
        }
    }
}

// ============================================================================

function updateMonster() {
    for (var i in monsters) {
        var monster = monsters[i];
        monster.update(player);
    }
}
