const options = require('./options.json');
const request = require('request');
const Nedb = require('nedb');
const db = new Nedb();

const out = require('./console.js');

function post(msg) {
	try {
		request.post(options.webhook, {
			json: {
				message: msg
			}
		});
	} catch(e) {}
}

module.exports = function(io) {
	post('Server restart!\nListening **[here](http://multiplayerthing-158778.nitrousapp.com/)**...');
	
	io.on('connection', function(socket) {
		var id = '';
		var name = 'anon';
		
		socket.on('handshake?', function(u) {
			name = u || 'anon';
			
			db.insert({
				name: name,
				stack: []
			}, function(err, doc) {
				if(err) return;
				id = doc._id;
				socket.emit('handshake!', doc._id);
				post('*' + name + '* connected.');
			});
		});

		socket.on('code', function(u) {
			post('**' + u + '** was sent.');
			// how to get user from the socket?
		});
		
		socket.on('disconnect', function() {
			db.remove({
				_id: id
			});
			
			post('*' + name + '* disconnected.');
		});
	});
}