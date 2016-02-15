const options = require('./options.json');
const request = require('request');
const Nedb = require('nedb');
const db = new Nedb({ filename: 'db.json', autoload: true });;

const out = require('./console.js');

/*
	Proposal of DB structure...
	DB
		User object
      _id // _id is pre-populated by NeDB, it's unique
			Room(?) ID
			tank object
				pos, dir, etc
			Stack (array)
				command1
				command2
				etc
*/

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
				tank: {
					x: 50,
					y: 50,
					dir: 45,
					expected: {

					}
				},
				bullets: [],
				stack: []
			}, function(err, doc) {
				if (err) return;
				id = doc._id;
				socket.emit('handshake!', doc);
				post('*' + name + '* connected.');
			});
		});

		socket.on('code', function(u) {
			post('**' + u + '** was sent by *' + name + '*.');
			// we should probably validate the code first lol
			db.update({
				_id: id
			}, {
				$push: {
					stack: u
				}
			}, {}, function(err, thing) {
				if (err) return;
				db.findOne({
					_id: id
				}, function(err, doc) {
					// doc should have necessary data
					// calculate tank's next expected pos/dir here?
					socket.emit('updatePositions', {
						me: doc,
						others: []
					});
				});
			});
		});
		
		socket.on('disconnect', function() {
			db.remove({
				_id: id
			});
			
			post('*' + name + '* disconnected.');
		});
	});
}