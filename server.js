const options = require('./options.json');
const out = require('./console.js');

const app = require('express')();
const chalk = require('chalk');
const r = require('rethinkdb');

function init() {
	out.log('Connecting to DB');

 	r.connect(options.database, function(err, conn) {
 		if(err) {
			out.fail();
			throw err;
 		}
    
		out.done();
		
		routes();
		
		out.log('Listening on port ' + options.server.port);
		app.listen(options.server.port, function() {
			out.done();
		});
 	});
}

function routes() {
	app.get('/', function(req, res) {
		res.json({
			msg: 'Hello World!'
		});
	});
}

init();
