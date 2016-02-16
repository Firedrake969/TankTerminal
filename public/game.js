var displayName = undefined;
var key = 0;
var socket = io();
var gameData = undefined;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var tankImg = new Image();
tankImg.src = 'img/tank.png';
tankImg.loaded = false;


// MOVEMENT PLAN
// CALCULATE EXPECTED POSITION
// MOVE UNTIL EXPECTED POSITION IS FOUND
// GO TO NEXT COMMAND
// ETC
// ON SERVER
// SEND POSITION AND MAKE SURE IT'S ON LINE / ROTATING CORRECTLY?

function Tank(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
    this.stack = []; // last - newest, first - oldest (evaluate and pop)
    this.executing = false;
    this.expectedPos = {
    	x: x,
    	y: y,
    	dir: dir
    };
    this.img = new Image();
    this.img.src = 'img/tank.png';
	this.imgLoaded = false;
    this.img.onload = function() {
    	this.imgLoaded = true;
    }.bind(this);
    this.draw = function(width, height) {
	    var rad = this.dir * Math.PI / 180;
	    ctx.translate(this.x, this.y);
	    ctx.rotate(rad);
	    ctx.drawImage(this.img, width / 2 * (-1), height / 2 * (-1), width, height);
	    ctx.rotate(rad * -1);
	    ctx.translate((this.x) * (-1), (this.y) * (-1));
	};
	this.calculateCommand = function(cmd) {
		if (!validCommand(cmd)) {
			return false;
		}
		cmd = cmd.split(' ');
		var commandType = cmd[0];
		if (commandType !== 'shoot') {
			switch (cmd[0]) {
				case 'forward':
					var dist = cmd[1];
					var dX = dist * Math.cos(this.dir * Math.PI/180)
					var dY = dist * Math.sin(this.dir * Math.PI/180)
					this.expectedPos = {
						x: Math.round(this.x + dX),
						y: Math.round(this.y - dY),
						dir: this.dir
					};
					break;
				case 'backward':
					var dist = -cmd[1];
					var dX = dist * Math.cos(this.dir * Math.PI/180)
					var dY = dist * Math.sin(this.dir * Math.PI/180)
					this.expectedPos = {
						x: Math.round(this.x + dX),
						y: Math.round(this.y - dY),
						dir: this.dir
					};
					break;
				case 'turnright':
					this.expectedPos = {
						x: this.x,
						y: this.y,
						dir: this.dir + Math.round(cmd[1])
					}
					break;
				case 'turnleft':
					this.expectedPos = {
						x: this.x,
						y: this.y,
						dir: this.dir - Math.round(cmd[1])
					}
					break;
				default:
					// nothing - this should not occur
			}
		} else {
			// not implemented yet
		}
	};
	this.executeCommand = function(cmd) {
		if (!validCommand(cmd)) {
			return false;
		}
		cmd = cmd.split(' ')[0];
		switch (cmd) {
			case 'forward':
				var dX = this.expectedPos.x - this.x;
				var dY = this.expectedPos.y - this.y;
				if (dX > 0) {
					this.x++;
				} else if (dX < 0) {
					this.x--;
				}
				if (dY > 0) {
					this.y++;
				} else if (dY < 0) {
					this.y--;
				}
				break;
			case 'backward':
				var dX = this.expectedPos.x - this.x;
				var dY = this.expectedPos.y - this.y;
				if (dX > 0) {
					this.x++;
				} else if (dX < 0) {
					this.x--;
				}
				if (dY > 0) {
					this.y++;
				} else if (dY < 0) {
					this.y--;
				}
				break;
			case 'turnright':
				this.dir++;
				break;
			case 'turnleft':
				this.dir--;
				break;
			default:
				// nothing - this should not occur
		}
		gameData.me.tank.x = this.x;
		gameData.me.tank.y = this.y;
		gameData.me.tank.dir = this.dir;
	}
}

var myTank = new Tank(50, 50, 45);

function clear() {
	ctx.fillStyle = "rgba(255, 255, 255, .25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawData() {
	requestAnimationFrame(drawData);
	// what data will be passed in?
	// format:  {me: {tank data, bullets: [bullet data]}, others: [{tank data, bullets: [bullet data]}, etc]}
	myTank.x = gameData.me.tank.x;
	myTank.y = gameData.me.tank.y;
	myTank.dir = gameData.me.tank.dir;
	clear();
	if (myTank.imgLoaded) {
		myTank.draw(50, 50);
	}

	// Should the below be in a setInterval loop since it's game logic?
	if (myTank.stack.length) {
		if (myTank.executing) { // check if it's completed executing - continue execution if not
			myTank.executeCommand(myTank.executing);
		}
		if (myTank.x == myTank.expectedPos.x
			&& myTank.y == myTank.expectedPos.y
			&& myTank.dir == myTank.expectedPos.dir) {
			// if the tank position is equal to expected, the execution is done
			myTank.executing = myTank.stack[0]; //set it to the next stack
			myTank.calculateCommand(myTank.stack[0]);
			myTank.stack.shift();
		}
	} else if (myTank.executing) { // no more commands, but it's still executing
		// keep executing
		myTank.executeCommand(myTank.executing);
		// do the check
		if (myTank.x == myTank.expectedPos.x
			&& myTank.y == myTank.expectedPos.y
			&& myTank.dir == myTank.expectedPos.dir) {
			myTank.executing = false; //set it to the next stack
		}
	} else {
		// nothing - nothing in stack and not executing anything
	}
}

function validCommand(cmd) {
	cmd = cmd.split(' ')
	valid_commands = [
		'forward',
		'backward',
		'turnleft',
		'turnright',
		'shoot'
	];
	if (cmd[0] !== 'shoot' && cmd.length !== 2) {
		// highlight red - error!  too long
		return false;
	}
	if (valid_commands.indexOf(cmd[0]) === -1) {
		// error - invalid command
		return false;
	}
	if (cmd[0] !== 'shoot' && isNaN(cmd[1])) {
		// error - VALUE is not a number
		return false;
	}
	return true;
}

socket.on('connect', function() {
	function addToDisplay(code) {
		var text = '> ' + code;
		var toInsert = '<div class="code">' + text + '</div>';
		$('.code-display').append(toInsert);
	}

	$('#join input').on('keyup', function(e) {
		if (e.which == 13) {
			if (!displayName) {
				displayName = this.value;
				$('#join').hide();
				$('#commands').removeClass('hidden');
				$('#commands input').focus();
				socket.emit('handshake?', displayName);
				socket.on('handshake!', function(data) {
					key = data._id;
					gameData = {
						me: data,
						others: [] // ADD THIS LATER
					}
					drawData();
				});
			}
		}
	});

	socket.on('updatePositions', function(data) {
		// gameData = data;
	});

	$('#commands input').on('keyup', function(e) {
		if (e.which == 13) {
			// parse the input first
			// should be in form COMMAND VALUE
			var rawInput = this.value;
			if (!validCommand(rawInput)) {
				return;
			}
			// insert the code into the code-display stack
			addToDisplay(rawInput);
			myTank.stack.push(rawInput);
			this.value = '';
			socket.emit('code', rawInput);
		}
	});
});