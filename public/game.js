var socket, key, name, time = 0;

$('#join input').on('keyup', function(e) {
	if(e.which == 13) {
		if(time == 0) sockets();
		time++;
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