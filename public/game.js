var displayName = undefined;
var key = 0;
var socket = io();
var gameData = undefined;

var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var tankImg = new Image();
tankImg.src = 'img/tank.png';
tankImg.loaded = false;

function Tank(x, y, dir) {
    this.x = x;
    this.y = y;
    this.dir = dir;
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
	    ctx.rotate(rad * ( -1 ) );
	    ctx.translate((this.x) * (-1), (this.y) * (-1));
	}
}

var myTank = new Tank(250, 250, 45);

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
	if (myTank.imgLoaded) {
		// clear();
		myTank.draw(50, 50);
	}
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
		gameData = data;
	});

	$('#commands input').on('keyup', function(e) {
		if (e.which == 13) {
			// parse the input first
			// should be in form COMMAND VALUE
			var rawInput = this.value;
			var input = this.value.split(' ');
			valid_commands = [
				'forward',
				'backward',
				'turnleft',
				'turnright',
				'shoot'
			];
			if (input[0] !== 'shoot' && input.length !== 2) {
				// highlight red - error!  too long
				return;
			}
			if (valid_commands.indexOf(input[0]) === -1) {
				// error - invalid command
				return;
			}
			if (input[0] !== 'shoot' && isNaN(input[1])) {
				// error - VALUE is not a number
				return;
			}
			// insert the code into the code-display stack
			addToDisplay(rawInput);
			this.value = '';
			socket.emit('code', rawInput);
		}
	});
});