var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");	
var blockWidth = 20;
var FPS = 100;
var blockPerSec = blockWidth/FPS;
var cubePre = [];
var cubeCur = [];

var dropCounter = 0;

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
var lineSpeed = 3;

var roundScore = 0;
var roundScoreMax = 0;
var totalScore = 0;

var state = { start:0, counting:1, play:2, over:3 };
var gameState = state.start;
var countTime = 3*FPS;
var gameTime = 90*FPS;
var play;

var nextList = [];
var shiftX = 0;

defaultGrid();
resizeCanvas();

drawWelcome();

$(window).resize(function(){
	resizeCanvas();
});

//drawGrid();

//declare cubeCur, cubePre as a 2d array
for( var i=0; i<4; i++ ){
	cubeCur[i] = [];
	cubePre[i] = [];
	nextList[i] = [];
}

setNextList();
resetXy();
setColor();

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
//draw();
//var play = setInterval( draw, 1000/FPS );

function keyDownHandler(e) {
	if( gameState == state.start ){
		if( e.keyCode ){
			gameState = state.counting;
			play = setInterval( draw, 1000/FPS );
		}
	}
	else if( gameState == state.play ){
		if(e.keyCode == 37) {
			if( !isSpliting && cubeCur[0][0] > 0 && 
				( !grid[cubeCur[0][0]-1][cubeCur[0][1]].isFilled && !grid[cubeCur[1][0]-1][cubeCur[1][1]].isFilled ) ){
				moveLeft();
			}	
		}
		else if(e.keyCode == 38 ) {
			if( !isSpliting ){
				rotate( rotDir.CW );
			}
		}
		else if(e.keyCode == 39) {
			if( !isSpliting && cubeCur[2][0] < 15 && 
				( !grid[cubeCur[2][0]+1][cubeCur[2][1]].isFilled && !grid[cubeCur[3][0]+1][cubeCur[3][1]].isFilled ) ){
				moveRight();
			}					
		}
		else if(e.keyCode == 32) {
			downPressed = true;								
		}
		else if( e.keyCode == 40 ){
			if( !isSpliting ){
				rotate( rotDir.CCW );
			}
		}
	}
	else if( gameState == state.over ){
		if( e.keyCode == 13 ){
			resetGame();
			gameState = state.counting;
			play = setInterval( draw, 1000/FPS );
		}
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

function resizeCanvas() {
	var w_width = $(window).width(), w_height = $(window).height();
	blockWidth = Math.min( Math.floor(w_width/24) , Math.floor(w_height/18) );
	$('#myCanvas').attr("width", blockWidth*24).attr("height", blockWidth*18);
	blockPerSec = blockWidth/FPS;
	
	for( var c=0; c<column; c++ ){
		for( var r=0; r<row; r++ ){
			grid[c][r].x = c*blockWidth+4*blockWidth;
			grid[c][r].y = r*blockWidth+4*blockWidth;			
		}
	}
	
	if( gameState == state.start ){
		drawWelcome();
	}
	if( gameState == state.over ){
		draw();
	}
}

//default value for every block
function defaultGrid(){
	for( var c=0; c<column; c++ ){
		grid[c] = [];
		for( var r=0; r<row; r++ ){
			grid[c][r] = { x:c*blockWidth+4*blockWidth, y:r*blockWidth+4*blockWidth, color:"black", 
						   isFilled:false, deleting:false  };			
		}
	}
}

function setNextList(){
	for( var i=0; i<4; i++ ){
		for( var j=0; j<4; j++ ){
			nextList[i][j] = Math.random()<0.5?"red":"white";
		}
	}
}

function shiftNext(){
	for( var i=0; i<3; i++ ){
		for( var j=0; j<4; j++ ){
			nextList[i][j] = nextList[i+1][j];
		}
	}
	for( var i=0; i<4; i++ ){
			nextList[3][i] = Math.random()<0.5?"red":"white";
		}
	shiftX = -2;
}

function drawNextList( dx ){
	var offsetX = 2;
	var offsetY = 1;
	for( var i=0; i<=10; i++ ){
		for( var j=0; j<=1; j++ ){
			if( i+dx<=10 ){
				var index1 = 3-Math.floor(i/3);
				var index2;
				if( i%3 == 0 ){
					//index1 = 3-(i/3);
					index2 = j;					
				}
				else if( i%3 == 1 ){
					index2 = j+2;
					//console.log(index1+","+index2);
				}
				else{
					break;
				}
				ctx.beginPath();
				ctx.strokeStyle = "black";
				ctx.fillStyle = nextList[index1][index2];
				ctx.rect( (i+dx+offsetX)*blockWidth, (j+offsetY)*blockWidth, blockWidth, blockWidth );
				ctx.fill();
				ctx.stroke();
				ctx.closePath();
			}
		}
	}
	ctx.beginPath();
	ctx.fillStyle = "black";
	ctx.rect( 0, offsetY*blockWidth, 2*blockWidth, 2*blockWidth );
	ctx.fill();
	ctx.closePath();
}

function resetXy(){
	downPressed = false;
	cubeCur[0][0] = cubeCur[1][0] = cubePre[0][0] = cubePre[1][0] = 7;
	cubeCur[2][0] = cubeCur[3][0] = cubePre[2][0] = cubePre[3][0] = 8;
	cubeCur[0][1] = cubeCur[2][1] = cubePre[0][1] = cubePre[2][1] = 0;
	cubeCur[1][1] = cubeCur[3][1] = cubePre[1][1] = cubePre[3][1] = 1;
}

function setColor(){
	for( var i=0; i<4; i++ ){
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = Math.random()<0.5?"red":"white";		
	}
}

function getNext(){
	for( var i=0; i<4; i++ ){
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = nextList[0][i];	
	}	
}

function drawBlock(){
	for( var c=0; c<column; c++ ){
		for( var r=0; r<row; r++ ){
			ctx.beginPath();
			ctx.rect(grid[c][r].x, grid[c][r].y, blockWidth, blockWidth);		
			ctx.fillStyle = grid[c][r].color;
			ctx.strokeStyle = "black";
			ctx.fill();
			ctx.stroke();
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
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];
		cubeCur[i][0]--;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
	}
	grid[ cubePre[2][0] ][ cubePre[2][1] ].color = "black";
	grid[ cubePre[3][0] ][ cubePre[3][1] ].color = "black";
}

function moveRight(){
	for( var i=3; i>=0; i-- ){
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];
		cubeCur[i][0]++;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
	}
	grid[ cubePre[0][0] ][ cubePre[0][1] ].color = "black";
	grid[ cubePre[1][0] ][ cubePre[1][1] ].color = "black";
}

function moveDown(){
	for( var i=3; i>=0; i-- ){
		cubePre[i][0] = cubeCur[i][0];
		cubePre[i][1] = cubeCur[i][1];			
		cubeCur[i][1]++;
		grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = grid[ cubePre[i][0] ][ cubePre[i][1] ].color;
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

function moveDownHandler(){
	//not at the bottom
	if( cubeCur[1][1] < 11 ){
		//2 blocks below are not filled
		if( !grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && !grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ){
			moveDown();
		}
		//one of the blocks below is filled
		else if( !( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled && grid[ cubeCur[3][0] ][ cubeCur[3][1]+1 ].isFilled ) ){
			isSpliting = true;
			//the left one is filled
			if( grid[ cubeCur[1][0] ][ cubeCur[1][1]+1 ].isFilled ){
				for( var i=0; i<2; i++ ){
					if( cubeCur[i][1] < 2 ){
						grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = "black";
					}
					else{
						grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
					}
				}					
				splitSide = 3;
			}
			//the right one is filled
			else{
				for( var i=2; i<4; i++ ){
					if( cubeCur[i][1] < 2 ){
						grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = "black";
					}
					else{
						grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
					}
				}	
				splitSide = 1;
			}
		}
		//2 blocks below are filled
		else{
			if( cubeCur[1][1] == 1 ){
				console.log("Game Over.");
				clearInterval( play );
				gameState = state.over;
			}
			else{
				for( var i=0; i<4; i++ ){
					if( cubeCur[i][1] < 2 ){
						grid[ cubeCur[i][0] ][ cubeCur[i][1] ].color = "black";
					}
					else{
						grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
					}				
				}
				resetXy();
				//setColor();
				getNext();
				shiftNext();
				dropCounter = -10;
			}
			
		}
	}
	else{
		for( var i=0; i<4; i++ ){
			grid[ cubeCur[i][0] ][ cubeCur[i][1] ].isFilled = true;
		}
		resetXy();
		//setColor();
		getNext();
		shiftNext();
		dropCounter = -10;
	}
	dropCounter = -10;
}

function checkGroup( x, y ){
	var dXy = [ {x:0, y:-1}, {x:1, y:-1}, {x:1, y:0} ];
	for( var i=0; i<3; i++ ){
		if( !grid[x+dXy[i].x][y+dXy[i].y].isFilled || grid[x][y].color != grid[x+dXy[i].x][y+dXy[i].y].color ){
			return false;
		}
	}
	return true;
}

function drawGroup(){
	for( var c=column-2; c>0; c-- ){
		for( var r=3; r<row; r++ ){
			if( grid[c][r].isFilled ){
				if( checkGroup( c, r ) ){
					ctx.beginPath();
					ctx.strokeStyle = "yellow";
					ctx.fillStyle = grid[c][r].color;
					ctx.rect( grid[c][r-1].x, grid[c][r-1].y, 2*blockWidth, 2*blockWidth );
					ctx.fill();
					ctx.stroke();
					ctx.closePath();
				}
			}
			
		}
	}
}

function drawTime(){
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.font = 2*blockWidth + "px Arial";
	ctx.textAlign = "right";	
	console.log();
	ctx.fillText( Math.floor(gameTime/FPS), canvas.width-1*blockWidth, 2*blockWidth );	
	ctx.closePath();
}

function drawScore(){
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.font = 1*blockWidth + "px Arial";
	ctx.textAlign = "right";
	//ctx.fillText( roundScore, grid[13][1].x, grid[13][1].y );
	//ctx.fillText( roundScoreMax, grid[14][1].x, grid[14][1].y );
	ctx.fillText( totalScore, canvas.width-1*blockWidth, 5*blockWidth );	
	ctx.closePath();
}

function drawLine(){
	
	ctx.strokeStyle = '#ff0000';
	ctx.lineWidth = 2;
	ctx.beginPath();
	
	ctx.moveTo(lineX+4*blockWidth, 6*blockWidth); ctx.lineTo(lineX+4*blockWidth, 16*blockWidth);
	ctx.stroke();
	ctx.closePath();	
	lineX += lineSpeed * blockPerSec;
	
	if(lineX+4*blockWidth >= 20*blockWidth){
		lineX = 0;
		release( column );
		totalScore += roundScore;
		roundScoreMax = Math.max( roundScore, roundScoreMax );
		roundScore = 0;
	}
	deleteGroup();
}

function release( boundColumn ){
	for( var c=0; c<boundColumn; c++ ){
		for( var r=2; r<row; r++ ){
			if( grid[c][r].deleting ){
				grid[c][r].color = "black";
				grid[c][r].isFilled = false;
				grid[c][r].deleting = false;
			}
		}
	}
}

var preLineColumn = 0;

function deleteGroup(){
	var dXy = [ {x:0, y:-1}, {x:1, y:-1}, {x:0, y:0}, {x:1, y:0} ];
	var lineColumn = Math.floor(lineX/blockWidth);
	//console.log(lineColumn);
	//when lineColumn changes
	if( lineColumn != preLineColumn ){
		//count score
		if( lineColumn > 1 ){
			for( var r=3; r<row; r++ ){
				if( checkGroup( lineColumn-2, r ) ){
					roundScore++;
				}
			}
		}
		//check keep deleting
		var keepDeleting = false;
		var isDeleting = false;		
		if( lineColumn > 0 ){
			for( var r=3; r<row; r++ ){
				if( grid[lineColumn-1][r].deleting ){
					isDeleting = true;
				}
				if( grid[lineColumn][r].deleting ){
					keepDeleting = true;
					break;
				}
			}
		}
		if( isDeleting && !keepDeleting ){
			release( lineColumn );
		}
		preLineColumn = lineColumn;
	}
	//console.log(lineColumn);
	if( lineColumn < 15 ){
		//console.log(lineColumn);
		for( var r=3; r<row; r++ ){
			if( grid[lineColumn][r].isFilled ){
				if( checkGroup( lineColumn, r ) ){
					//lable the blocks going to be deleted
					for( var i=0; i<4; i++ ){
						grid[lineColumn+dXy[i].x][r+dXy[i].y].deleting = true;
					}
				}
			}
			
		}
	}
}

function drawDeleting(){
	for( var c=0; c<column; c++ ){
		for( var r=2; r<row; r++ ){
			if( grid[c][r].deleting ){
				var deleteWidth = Math.min( (lineX+4*blockWidth)-grid[c][r].x, blockWidth );
				if( deleteWidth > 0 ){
					//deleteWidth = deleteWidth<0?0:deleteWidth;
					ctx.beginPath();				
					ctx.rect( grid[c][r].x, grid[c][r].y, deleteWidth, blockWidth );		
					ctx.fillStyle = "black";
					ctx.strokeStyle = "gray";
					ctx.fill();
					ctx.stroke();
					ctx.closePath();
				}
				
			}
		}
	}
}

function gravity(){
	for( var c=0; c<column; c++ ){
		for( var r=row-2; r>1; r-- ){
			if( grid[c][r].isFilled && !grid[c][r+1].isFilled ){
				grid[c][r+1].isFilled = true;
				grid[c][r+1].color = grid[c][r].color;
				grid[c][r].isFilled = false;
				grid[c][r].color = "black";
			}
		}
	}
}

function draw(){
	ctx.clearRect( 0, 0, canvas.width, canvas.height );	
	drawNextList( shiftX );
	drawBlock();
	drawScore();	
	drawGrid();
	drawGroup();
	drawTime();
	
	if( gameState == state.counting ){
		if( countTime > 0 ){
			drawCount();
			countTime--;
		}
		else{
			gameState = state.play;
		}
	}
	
	if( gameState == state.play ){
		if( gameTime > 0 ){
			gameTime--;
		}
		else{
			clearInterval( play );
			gameState = state.over;
		}
		
		if( shiftX < 0 ){
			shiftX += 0.1;
		}
		
		//down pressed
		if( !isSpliting && downPressed ) {
			moveDownHandler();		
		}
		
		if( isSpliting ){
			if( cubeCur[splitSide][1] < 11 && !grid[ cubeCur[splitSide][0] ][ cubeCur[splitSide][1]+1 ].isFilled ){
				moveDownSide( splitSide );
			}
			else{
				isSpliting = false;
				for( var i=0; i<2; i++ ){
					if( cubeCur[splitSide-i][1]<2 ){
						grid[ cubeCur[splitSide-i][0] ][ cubeCur[splitSide-i][1] ].color = "black";
					}
					else{
						grid[ cubeCur[splitSide-i][0] ][ cubeCur[splitSide-i][1] ].isFilled = true;
					}
				}
				
				//grid[ cubeCur[splitSide][0] ][ cubeCur[splitSide][1] ].isFilled = true;
				//grid[ cubeCur[splitSide-1][0] ][ cubeCur[splitSide-1][1] ].isFilled = true;
				resetXy();
				//setColor();
				getNext();
				shiftNext();
				dropCounter = -10;
			}
		}
		
		if( !isSpliting && dropCounter == 2000 ){
			//console.log("go");
			moveDownHandler();
		}
		dropCounter += 10;	
		
		drawDeleting();
		drawLine();
		gravity();
	}
	
	if( gameState == state.over ){
		gameOver();
	}
}

function drawWelcome(){
	ctx.beginPath();
	ctx.fillStyle = "white";
	ctx.font = 4*blockWidth + "px Arial";
	ctx.textAlign = "center";
	ctx.fillText( "Lumines", canvas.width/2, canvas.height/2 );
}

function drawCount(){
	ctx.beginPath();
	ctx.fillStyle = "red";
	ctx.strokeStyle = "white";
	ctx.font = 3*blockWidth + "px Arial";
	ctx.textAlign = "center";
	ctx.fillText( Math.floor(countTime/FPS)+1, canvas.width/2, canvas.height/2 );
	ctx.strokeText( Math.floor(countTime/FPS)+1, canvas.width/2, canvas.height/2 );
}

function gameOver(){	
	var messBarWidth = 180;
	var messBarHeight = 50;
	ctx.beginPath();
	ctx.rect( (canvas.width-messBarWidth)/2, (canvas.height-messBarHeight)/2, messBarWidth, messBarHeight );
	ctx.fillStyle = "gray";
	ctx.strokeStyle = "white";
	ctx.fill();
	ctx.fillStyle = "black";
	ctx.textAlign = "center";
	ctx.font = "30px Arial";
	ctx.fillText( "Score : "+totalScore, canvas.width/2, canvas.height/2 );
	ctx.closePath();
}

function resetGame(){
	dropCounter = 0;
	countTime = 3*FPS;
	gameTime = 90*FPS;
	lineX = 0;
	totalScore = 0;
	roundScore = 0;
	roundScoreMax = 0;
	
	defaultGrid();
	setNextList();
	resetXy();
	setColor();
}