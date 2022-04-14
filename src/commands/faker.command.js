const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");

const speach = require("../../configs/speach");
const config = require("../../configs/config");

function doInit() {
    return new Promise((resolve, reject) => {
	inquirer
		.prompt([
			{
				type: "list",
				message: speach.commands.cmd_init.cmd_msg,
				name: "framework",
				choices: speach.commands.cmd_init.cmd_options,
			},
		])
		.then(({ framework }) => {
			fs.readFile(path.join(path.dirname(__dirname), 'breds', `${framework}${path.sep}${config.configfilename}`), (err, data) => {
				if (err) {
					reject(err);
				} else {
					fs.writeFile(
						path.join(process.cwd(), config.configfilename),
						data,
						(err) => {
							if (err) {
								reject(err);
							} else {
								resolve("Done. Configuration file cerated successfully.");
							}
						}
					);
				}
			});
		})
		.catch((error) => {
			reject(error);
		});
    });
}

module.exports = (script = null) => {
	console.log(console.log(chalk.green.bold(`SUCCESS: Mock data and Fack API is generated for the model/service successfully.`)));
};
