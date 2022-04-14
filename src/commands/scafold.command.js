const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");

const speach = require("../../configs/speach");
const config = require("../../configs/config");
const util = require("../util/comon.util");

config.set("skeliton", {});

module.exports = (script = null) => {
	// load skeliton maker form language breds
	try {
		util.loadConfig().then((res) => {
			const skeliton = require(path.join(path.dirname(__dirname), "breds", `${config.get("framework")}${path.sep}lib${path.sep}skeliton.js`));
			if (script !== null) {
				let fileParts = script.split(".");
				fileParts[fileParts.length -1] = config['testfile-ext'];
				config['specfilename'] = fileParts.join(".").replace(/\.\./g, ".");
				skeliton.generate(script).then((status) => {
					// console.log(config);
					if (status) {
						skeliton.writeSpecFile().then((res) => {
							if(res) {
								console.log(chalk.bold.bgGreen(" SUCCESS: "), chalk.green(config['specfilename']));
							}else{
								throw new Error("Error in writing spec file");
							}
						}).catch((err) => {
							console.log(chalk.bold.bgRed(" ERROR: "), chalk.red("["+config['specfilename']+"]"), "Unable to write the spec file");
						});
					} else {
						console.log(chalk.bold.bgRed(" ERROR: "), chalk.red(config['specfilename']));
					}
				}).catch((err) => {
					throw err;
				});
			} else {
				// scan through the directory and get the list of scripts recursively.
				console.log(chalk.bold.bgRed(" ERROR: "), "Please provide the script name to generate the test file");
			}

			// console.log(chalk.bold.cyan("Unit test generation completed."));
		}).catch((err) => {
			console.log(err);
		});
	} catch (error) {
		console.log(err);
		return false;
	}
	
};
