const chalk = require('chalk');
var last = '';

module.exports = {
	log: function(i) {
		last = i;

		process.stdout.write(
			chalk.bold(
				chalk.grey('[....] ')
				+ i +
				' \r'
			)
		);
	},

	fail: function() {
		process.stdout.write(
			chalk.bold(
				chalk.red('[fail] ')
				+ last + '\n'
			)
		);
	},

	done: function() {
		process.stdout.write(
			chalk.bold(
				chalk.green('[done] ')
				+ last + '\n'
			)
		);
	},

	warn: function() {
		process.stdout.write(
			chalk.bold(
				chalk.yellow('[warn] ')
				+ last + '\n'
			)
		);
	}
}