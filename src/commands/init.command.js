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
				message: speach.comand_props.init.msg,
				name: "framework",
				choices: speach.comand_props.init.options,
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

module.exports = (framework) => {
	try {
		let isConfigured = fs.existsSync(
			path.join(process.cwd(), config.configfilename)
		);
		if (isConfigured) {
			const prjConfig = require(path.join(
				process.cwd(),
				config.configfilename
			));

			inquirer
				.prompt([
					{
						type: "list",
						message: `Looks like your project is already configured with ${chalk.cyan(" '"+ prjConfig.framework +"' ")}.\n\tAre you sure, do you want to overwrite the current configuration?`,
						name: "decision",
						choices: ['Yes', 'No'],
					},
				])
				.then(({ decision }) => {
					if (decision === 'Yes') {
                        doInit().then((status) => {
                            console.log(chalk.green.bold("\nStatus: "), status);
                        }).catch((error) => {
                            console.error(chalk.red.bold("\nError: "), error.message);
                        });
                    }
				})
				.catch((error) => {
					throw error;
				});
		} else {
			doInit().then((status) => {
				console.log(chalk.green.bold("\nStatus: "), statuss);
			}).catch((error) => {
				console.error(chalk.red.bold("\nError: "), error.message);
			});
		}
	} catch (error) {
		console.error(error);
	}
};
