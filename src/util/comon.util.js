const path = require("path");
const fs = require("fs");
const chalk = require("chalk");

const speach = require("../../configs/speach");
const config = require("../../configs/config");

const commonUtil = {
    loadConfig: function () {
        return new Promise((resolve, reject) => {
            if(fs.existsSync(path.join(process.cwd(), config.configfilename))){
                let prjConf = require(path.join(process.cwd(), config.configfilename));
                Object.keys(prjConf).forEach((key) => {
                    config.set(key, prjConf[key]);
                });
                resolve(true);
            } else {
                reject(new Error(`Configuration file ${config.configfilename} not found. Looks like you are not in a project directory or not configured with testsweet. \n Please run ${chalk.cyan("testsweet init")} to configure your project.`));
            }
        });
    }
}

module.exports = commonUtil;
