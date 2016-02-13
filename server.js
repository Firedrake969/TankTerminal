const options = require('./options.json');
const out = require('./console.js');

const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const chalk = require('chalk');
const Nedb = require('nedb');

const db = new Nedb();

function init() {
	app.use(express.static('public'));
	
	require('./io.js')(io);
	
	out.log('Listening on port ' + chalk.cyan(options.server.port));
	
	http.listen(options.server.port, function() {
		out.done();
	});
}

init();
