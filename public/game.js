var displayName = undefined;
var socket, key = 0;

function addToDisplay(code) {
	var text = '> ' + code;
	var toInsert = '<div class="code">' + code + '</div>';
	$('.code-display').append(toInsert);
}

$('#join input').on('keyup', function(e) {
	if (e.which == 13) {
		if (!displayName) {
			displayName = this.value;
			sockets(displayName);
			$('#join').hide();
			$('#commands').removeClass('hidden');
			$('#commands input').focus();
		}
	}
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
		// insert the code into the code-display stack
		addToDisplay(rawInput);
		this.value = '';
		socket.on('connect', function() {
			socket.emit('code', rawInput);
		}.bind(this));
	}
});

function sockets(n) {
	socket = io();
	
	$('#join input').val('connected!');

	socket.on('connect', function() {
		socket.emit('handshake?', n);
	});

	socket.on('handshake!', function(key) {
		key = key;
	});
}