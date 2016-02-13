const chalk = require('chalk');
var last = '';

module.exports = {
	log: function(i) {
		last = i;

		process.stdout.write(
			chalk.bold.grey('[....] ')
			+ i +
			'...\r'
		);
	},

	fail: function() {
		process.stdout.write(
			chalk.bold.red('[fail] ')
			+ last + '\n'
		);
	},

	done: function() {
		process.stdout.write(
			chalk.bold.green('[done] ')
			+ last + '\n'
		);
	},

	warn: function() {
		process.stdout.write(
			chalk.bold.yellow('[warn] ')
			+ last + '\n'
		);
	}
}