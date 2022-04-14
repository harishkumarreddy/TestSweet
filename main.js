#!/usr/bin/env node

const lineByLine = require("n-readlines");
const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const { program } = require("commander");
const yargs = require("yargs");
const figlet = require("figlet");

const speach = require("./configs/speach");
const config = require("./configs/config");

const clear = console.clear;
const log = console.log;

// Clear console
clear();

// Figlet
console.log(
	chalk.bold.cyan(
		figlet.textSync("  testsweet ", {
			horizontalLayout: "default",
			verticalLayout: "default",
			width: 80,
			whitespaceBreak: true,
		})
	)
);

// configuring the commands.
program
	.name("testsweet")
	.description("CLI to generate unit tests for your project.")
	.version("1.0.0");
speach.commands.forEach((command) => {
	eval(
		`command.script = require('./src/commands/${command.script}.command');`
	);
	if(command.arguments) {
		program
			.command(command.command)
			.description(command.desc)
			.action(command.script)
			.argument(`[${(command.command == 'scafold')? 'scriptfile' : 'model'}]`, `Full/relative path to the ${(command.command == 'scafold')? 'script file. (optional)' : 'model file.'} `);
	} else {
		program
			.command(command.command)
			.description(command.desc)
			.action(command.script);
	}
});
program.usage(speach.lables.usage);
program.parse();
