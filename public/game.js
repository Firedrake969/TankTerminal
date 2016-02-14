var socket, key, name = 0;
var joined = false;

$('#join input').on('keyup', function(e) {
	if (e.which == 13) {
		if (!joined) {
			sockets();
			joined = true;
			$('#join').hide();
			$('#commands').removeClass('hidden');
		}
	}
});

$('#commands input').on('keyup', function(e) {
	if (e.which == 13) {
		// parse the input first
		// should be in form COMMAND VALUE
		input = this.value.split(' ');
		valid_commands = [
			'forward',
			'backward',
			'turnleft',
			'turnright',
			'shoot'
		];
		if (input.length !== 2) {
			// highlight red - error!  too long
			return;
		}
		if (valid_commands.indexOf(input[0]) === -1) {
			// error - invalid command
			return;
		}
		if (isNaN(input[1])) {
			// error - VALUE is not a number
			return;
		}
		socket = io();
		socket.on('connect', function() {
			socket.emit('code', this.value);
		}.bind(this));
	}
});

function sockets() {
	name = $('#join input').val();
	socket = io();
	
	$('#join input').val('connected!');

	socket.on('connect', function() {
		socket.emit('handshake?', name);
	});

	socket.on('handshake!', function(key) {
		key = key;
	});
}