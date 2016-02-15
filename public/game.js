var displayName = undefined;
var key = 0;

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
			// insert the code into the code-display stack
			addToDisplay(rawInput);
			this.value = '';
			socket.emit('code', rawInput);
		}
	});

	function sockets(n) {
		$('#join input').val('connected!');

		socket.emit('handshake?', n);

		socket.on('handshake!', function(key) {
			key = key;
		});
	}
});