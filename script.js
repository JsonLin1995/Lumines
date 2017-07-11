var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");	
var blockWidth = 20;
var FPS = 100;
var blockPerSec = blockWidth/FPS;
var cubePre = [];
var cubeCur = [];

var dropCounter = 0;
var moveCounter = 0;

var rightPressed = false;
var leftPressed = false;
var downPressed = false;
var isSpliting = false;

var grid = [];
var column = 16;
var row = 12;

var rotDir = { CW:1, CCW:0 };
var groupCount = 0;
var lineX = 0;
var lineSpeed = 4;

defaultGrid();
drawGrid();

//declare cubeCur, cubePre as a 2d array
for( var i=0; i<4; i++ ){
	cubeCur[i] = [];
	cubePre[i] = [];
}

resetXy();
setColor();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval( draw, 1000/FPS );

function keyDownHandler(e) {
	if(e.keyCode == 37) {
		if( !isSpliting && cubeCur[0][0] > 0 && ( !grid[ cubeCur[0][0]-1 ][ cubeCur[0][1] ].isFilled && !grid[ cubeCur[1][0]-1 ][ cubeCur[1][1] ].isFilled ) ){
			moveLeft();
			//drawBlock();
			//drawGrid();	
		}	
	}
	else if(e.keyCode == 38) {
		if( !isSpliting ){
			rotate( rotDir.CW );
		}
	}
	else if(e.keyCode == 39) {
		if( !isSpliting && cubeCur[2][0] < 15 && ( !grid[ cubeCur[2][0]+1 ][ cubeCur[2][1] ].isFilled && !grid[ cubeCur[3][0]+1 ][ cubeCur[3][1] ].isFilled ) ){
			moveRight();
			//drawBlock();
			//drawGrid();	
		}					
	}
	else if(e.keyCode == 40) {
		downPressed = true;								
	}
}

function keyUpHandler(e) {
	if(e.keyCode == 37) {
		leftPressed = false;
	}
	else if(e.keyCode == 39) {
		rightPressed = false;
	}
	else if(e.keyCode == 40) {
		downPressed = false;
	}
}

//default value for every block
function defaultGrid(){
	for( var c=0; c<column; c++ ){
		grid[c] = [];
		for( var r=0; r<row; r++ ){
			grid[c][r] = { x:c*blockWidth, y:r*blockWidth, color:"black", 
						   isFilled:false, grouped:false, groupNum:0  };			
		}
	}
}

function resetXy(){
	cubeCur[0][0] = cubeCur[1][0] = cubePre[0][0] = cubePre[1][0] = 7;
	cubeCur[2][0] = cubeCur[3][0] = cubePre[2][0] = cubePre[3][0] = 8;
	cubeCur[0][1] = cubeCur[2][1] = cubePre[0][1] = cubePre[2][1] = 0;
	cubeCur[1][1] = cubeCur[3][1] = cubePre[1][1] = cubePre[3][1] = 1;
	downPressed = false;
}

function setColor(){
	for( var i=0; i<4; i++ ){
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = Math.random()<0.5?"red":"white";
	}
}

function drawBlock(){
	for( var c=0; c<column; c++ ){
		for( var r=0; r<row; r++ ){
			ctx.beginPath();
			if( grid[c][r].grouped ){
				ctx.rect(grid[c][r].x, grid[c][r].y, blockWidth, blockWidth);
			}
			else{
				ctx.rect(grid[c][r].x+1, grid[c][r].y+1, blockWidth-2, blockWidth-2);
			}
			
			ctx.fillStyle = grid[c][r].color;
			ctx.fill();
			ctx.closePath();
		}
	}
}

function drawGrid(){
	for( var c=0; c<column; c++ ){
		for( var r=2; r<row; r++ ){
			if( !grid[c][r].grouped ){
				ctx.beginPath();
				ctx.strokeStyle = "gray";
				ctx.rect(grid[c][r].x, grid[c][r].y, blockWidth, blockWidth);
				ctx.stroke();
				ctx.closePath();
			}
		}
	}
}

function rotate( dir ){
	switch( dir ){
		case rotDir.CW:
			var tmp = grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color;
			grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color = grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color;
			grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color = grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color;
			grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color = grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color;
			grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color = tmp;
			break;
		case rotDir.CCW:
			var tmp = grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color;
			grid[ cubeCur[0][0] ][ cubeCur[0][1] ].color = grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color;
			grid[ cubeCur[2][0] ][ cubeCur[2][1] ].color = grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color;
			grid[ cubeCur[3][0] ][ cubeCur[3][1] ].color = grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color;
			grid[ cubeCur[1][0] ][ cubeCur[1][1] ].color = tmp;
			break;
		default:
			console.log("Rotation error.");
			break;
	}
}

function moveLeft(){
	for( var i=0; i<4; i++ ){
		//console.log( "Cur: ("+cubeCur[i][0]+","+cubeCur[i][1]+") =>" );
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];
		cubeCur[i][0]--;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
		//console.log( "("+cubeCur[i][0]+","+cubeCur[i][1]+")" );
	}
	grid[ cubePre[2][0] ][ cubePre[2][1] ].color = "black";
	grid[ cubePre[3][0] ][ cubePre[3][1] ].color = "black";
}

function moveRight(){
	for( var i=3; i>=0; i-- ){
		//console.log( "Cur: ("+cubeCur[i][0]+","+cubeCur[i][1]+") =>" );
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];
		cubeCur[i][0]++;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
		//console.log( "("+cubeCur[i][0]+","+cubeCur[i][1]+")" );
	}
	grid[ cubePre[0][0] ][ cubePre[0][1] ].color = "black";
	grid[ cubePre[1][0] ][ cubePre[1][1] ].color = "black";
}

function moveDown(){
	for( var i=3; i>=0; i-- ){
		//console.log( "Cur: ("+cubeCur[i][0]+","+cubeCur[i][1]+") =>" );
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];			
		cubeCur[i][1]++;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
		//console.log( "("+cubePre[i][0]+","+cubePre[i][1]+") => ("+cubeCur[i][0]+","+cubeCur[i][1]+") "+grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color );
		//console.log( "("+cubeCur[i][0]+","+cubeCur[i][1]+")" );
	}
	grid[ cubePre[0][0] ][ cubePre[0][1] ].color = "black";
	grid[ cubePre[2][0] ][ cubePre[2][1] ].color = "black";
}

function moveDownSide( splitSide ){
	for( var i=0; i<2; i++ ){
		cubePre[splitSide-i][0] = cubeCur[splitSide-i][0];
		cubePre[splitSide-i][1] = cubeCur[splitSide-i][1];
		cubeCur[splitSide-i][1]++;
		grid[ cubeCur[splitSide-i][0] ][ cubeCur[splitSide-i][1] ].color = grid[ cubePre[splitSide-i][0] ][ cubePre[splitSide-i][1] ].color;
	}
	grid[ cubePre[splitSide-1][0] ][ cubePre[splitSide-1][1] ].color = "black";
}

function checkGroup( index ){	
	var xTmp = cubeCur[index][0];
	var yTmp = cubeCur[index][1];
	var temp = [];
	var skip = false;
	//check bottom-left
	if( xTmp-1 >= 0 && yTmp+1 <= 11 ){
		temp[0] = grid[xTmp-1][yTmp];
		temp[1] = grid[xTmp-1][yTmp+1];
		temp[2] = grid[xTmp][yTmp];
		temp[3] = grid[xTmp][yTmp+1];
		for( var i=0; i<4; i++ ){
			if( temp[i].isFilled != true || temp[i].color != temp[2].color ){
				console.log("No bottom-left.");
				skip = true;
			}
		}
		if( !skip ){
			groupCount++;
			console.log( "Group "+groupCount+" found. (bottom-left)" );
			for( var i=0; i<4; i++ ){
				if( !temp[i].grouped ){
					temp[i].grouped = true;
					temp[i].groupNum = groupCount;
				}
			}
		}
		skip = false;
		
	}
}

function drawLine(){
	
	ctx.strokeStyle = '#ff0000';
	ctx.lineWidth = 2;
	ctx.beginPath();
	
	ctx.moveTo(lineX, 0); ctx.lineTo(lineX, 240);
	ctx.stroke();
	ctx.closePath();
	lineX += lineSpeed * blockPerSec;
	if(lineX >= 320) lineX = 0;
}

function draw(){
	ctx.clearRect( 0, 0, canvas.width, canvas.height );
	drawBlock();
	drawGrid();
	
	if( !isSpliting && downPressed ) {
		if( cubeCur[1][1] < 11 ){
			if( !grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && !grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ){
				moveDown();
			}
			else if( !( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ) ){
				isSpliting = true;
				if( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled ){
					grid[ cubeCur[0][0] ][ cubeCur[0][1] ].isFilled = true;
					grid[ cubeCur[1][0] ][ cubeCur[1][1] ].isFilled = true;					
					checkGroup(1);
					
					splitSide = 3;
				}
				else{
					grid[ cubeCur[2][0] ][ cubeCur[2][1] ].isFilled = true;
					grid[ cubeCur[3][0] ][ cubeCur[3][1] ].isFilled = true;
					splitSide = 1;
				}
			}
			else{
				for( var i=0; i<4; i++ ){
					grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
				}
				resetXy();
				setColor();
				dropCounter = -10;
			}
		}
		else{
			for( var i=0; i<4; i++ ){
				grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
			}
			resetXy();
			setColor();
			dropCounter = -10;
		}		
	}
	
	if( isSpliting ){
		if( cubeCur[splitSide][1] < 11 && !grid[ cubeCur[splitSide][0] ][ cubeCur[splitSide][1]+1 ].isFilled ){
			moveDownSide( splitSide );
		}
		else{
			isSpliting = false;
			grid[ cubeCur[splitSide][0] ][ cubeCur[splitSide][1] ].isFilled = true;
			grid[ cubeCur[splitSide-1][0] ][ cubeCur[splitSide-1][1] ].isFilled = true;
			resetXy();
			setColor();
			dropCounter = -10;
		}
	}
	
	if( !isSpliting && dropCounter == 2000 ){
		if( cubeCur[1][1] < 11 ){
			if( !grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && !grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ){
				moveDown();
			}
			else if( !( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ) ){
				isSpliting = true;
				if( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled ){
					grid[ cubeCur[0][0] ][ cubeCur[0][1] ].isFilled = true;
					grid[ cubeCur[1][0] ][ cubeCur[1][1] ].isFilled = true;
					splitSide = 3;
				}
				else{
					grid[ cubeCur[2][0] ][ cubeCur[2][1] ].isFilled = true;
					grid[ cubeCur[3][0] ][ cubeCur[3][1] ].isFilled = true;
					splitSide = 1;
				}
			}
			else{
				for( var i=0; i<4; i++ ){
					grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
				}
				resetXy();
				setColor();
				dropCounter = -10;
			}		
		}
		else{
			for( var i=0; i<4; i++ ){
				grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
			}
			resetXy();
			setColor();
		}
		dropCounter = -10;
	}
	dropCounter += 10;
	
	
	drawLine();
}