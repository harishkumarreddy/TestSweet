const path = require("path");
const fs = require("fs");
const inquirer = require("inquirer");
const chalk = require("chalk");
const lineByLine = require('n-readlines');
const esprima = require('esprima');
const faker = require('@faker-js/faker');

const speach = require("../../../../configs/config");
const config = require("../../../../configs/config");
const util = require("../../../util/comon.util");
const testbody = require("./testbody");

const keywords = ['if','else', 'switch', 'for', 'try', 'catch', 'finally', '}', '=>'];
const skeliton = {
	generate: (script) => {
				
		return new Promise((resolve, reject) => {
			config.currentScript = script;
			config.skeliton[script] = {}
			config['usnittests'] = [];
			try {
				skeliton.getFileOutline(script).then((res) => {
					// console.log(config.skeliton[script]['class']['methods']);
					Object.keys(config.skeliton[script]['class']['methods']).forEach((method) => {
						if (method !== 'constructor' 
							&& config.skeliton[script]['class']['methods'][method]['return_type'] !== 'void') {
							// console.log(method, config.skeliton[script]['class']['methods'][method]['params']);
							switch (config.skeliton[script]['class']['methods'][method]['return_type']) {
								case "boolean":
									switch (config.skeliton[script]['class']['methods'][method]['return'].join(",")) {
										case "true,false":
										case "false,true":
										case "true":
										case "false":
											skeliton.frameTestcase('truefalse', method).then((res_raw) => {
												skeliton.fillParams(config.skeliton[script]['class']['methods'][method]['params'], ('PE')).then((parms_value) => {
													let res = res_raw;
													res = res.replace(/@params@/g, parms_value);
													res = res.replace(/@iteration@/g, 1);
													config['usnittests'].push(res);
													
													skeliton.fillParams(config.skeliton[script]['class']['methods'][method]['params'],  "PO").then((parms_value) => {
														let res = res_raw
														res = res.replace(/@params@/g, parms_value);
														res = res.replace(/@iteration@/g, 2);
														config['usnittests'].push(res);
															resolve(true);
													}).then().catch((err) => {
														throw err;
													});
												}).catch((err) => {
													throw err;
												});
												
											}).catch((err) => {
												throw err;
											});
											break;
									}
									break;
								case 'any':
									skeliton.frameTestcase('default', method).then((res_raw) => {
										skeliton.fillParams(config.skeliton[script]['class']['methods'][method]['params'], ('PE')).then((parms_value) => {
											let res = res_raw;

											let aditional = `
		if((exRes instanceof Error) || (exRes instanceof EvalError)) {
			exRes = "Error";
		}
											`
											res = res.replace(/@params@/g, parms_value);
											res = res.replace(/@iteration@/g, 1);
											res = res.replace(/@aditionalcheck@/g, aditional);
											res = res.replace(/@aditionalcheck@/g, "/t/t/t/t/ttyprof exRes;");
											config['usnittests'].push(res);
											
											skeliton.fillParams(config.skeliton[script]['class']['methods'][method]['params'],  "PO").then((parms_value) => {
												let res = res_raw
												res = res.replace(/@params@/g, parms_value);
												res = res.replace(/@iteration@/g, 2);
												res = res.replace(/@aditionalcheck@/g, "");
												res = res.replace(/@aditionalcheck@/g, "/t/t/t/t/ttyprof exRes;");
												config['usnittests'].push(res);
													resolve(true);
											}).then().catch((err) => {
												throw err;
											});
										}).catch((err) => {
											throw err;
										});
										
									}).catch((err) => {
										throw err;
									});
									break;
								default:
									skeliton.frameTestcase('default', method).then((res_raw) => {
										skeliton.fillParams(config.skeliton[script]['class']['methods'][method]['params'], ('PE')).then((parms_value) => {
											let res = res_raw;
											let aditional = `
		if((exRes instanceof Error) || (exRes instanceof EvalError)) {
			exRes = "Error";
		}
											`
											res = res.replace(/@params@/g, parms_value);
											res = res.replace(/@iteration@/g, 1);
											res = res.replace(/@aditionalcheck@/g, aditional);
											res = res.replace(/@aditionalcheck@/g, "/t/t/t/t/ttyprof exRes;");
											config['usnittests'].push(res);
											
											skeliton.fillParams(config.skeliton[script]['class']['methods'][method]['params'],  "PO").then((parms_value) => {
												let res = res_raw
												res = res.replace(/@params@/g, parms_value);
												res = res.replace(/@iteration@/g, 2);
												res = res.replace(/@aditionalcheck@/g, aditional);
												res = res.replace(/@aditionalcheck@/g, "/t/t/t/t/ttyprof exRes;");
												config['usnittests'].push(res);
													resolve(true);
											}).then().catch((err) => {
												throw err;
											});
										}).catch((err) => {
											throw err;
										});
										
									}).catch((err) => {
										throw err;
									});
									break;
							}
							
						}
					});
				}).catch((err) => {
					reject(err);
				});
			} catch (error) {
				console.log(error);
				reject(err);
			}
		});
	},

	getFileOutline: (file) => {
		// console.log(file);
		return new Promise((resolve, reject) => {
			try {
				const liner = new lineByLine(file);
				let line = liner.next();
				let outline = {};
				let outline_key = "";
				let method_name = "";

				while (line) {
					line = line.toString('ascii');
					if (line.indexOf("//") != 0 && line.trim()!=="") {
						if(line.indexOf('export ') == 0) {
							line = line.replace("export ", "").trim();
						}

						if(line.indexOf('class') == 0) {
							outline_key = "class";
							line = line.replace("class ", "").trim();
							if(outline[outline_key] === undefined) {
								outline[outline_key] = {
									name: null,
									properties: {},
									methods: {}
								};
							}
							outline[outline_key]['name'] = line.split(" ")[0].trim();
						} else if(outline_key == "class") {
							let method = {
								name: "",
								params: [],
								return_type : "void",
								return: []
							};
							

							let newLine = line.replaceAll(" ", "").trim();
							let keyword = line.trim().split(" ")[0].trim();
							if((newLine.indexOf("):") > 0  || newLine.indexOf("){") > 0) && keywords.indexOf(keyword) == -1 ) {
								let lineparts = line.split("(");
								method_name = (lineparts[0].indexOf(" ") > 0) ? lineparts[0].split(" ")[1].trim() : lineparts[0].trim();
								let funcProps = lineparts[1].split(")");
								let params = funcProps[0].trim().replaceAll(" ", "").split(",");
								let return_type = (funcProps[1])? funcProps[1].replaceAll(": ", "").trim() : "void";
								return_type = return_type.split(" ")[0].trim();

								outline[outline_key]['methods'][method_name] = method;
								outline[outline_key]['methods'][method_name]['name'] = method_name;
								outline[outline_key]['methods'][method_name]['params'] = params;
								outline[outline_key]['methods'][method_name]['return_type'] = (return_type == "{")? "void":return_type;
							}else if(line.trim().indexOf('return ') == 0) {
								let retLine = line.replace("return", "").trim().replaceAll(";", "").trim();
								outline[outline_key]['methods'][method_name]['return'].push(retLine);
								outline[outline_key]['methods'][method_name]['return_type'] = (outline[outline_key]['methods'][method_name]['return_type']=='void')? 
									"any" 
									: outline[outline_key]['methods'][method_name]['return_type'];
							}
						}
					}
					line = liner.next();
				}
				config.skeliton[file] = outline;
				resolve(true);
			} catch (error) {
				reject(error);
			}
		});
	},

	fillParams: (params, caseType=null) => {
		return new Promise((resolve, reject) => {
			try {
				let params_out = [];
				params.forEach((param) => {
					if(param.indexOf("=") > 0){
						param = param.split("=")[0].trim();
					}
					let param_type = param.split(":")[1].trim();
					switch (param_type) {
						case "number":
							if(caseType == "PE") {
								let pe = Math.floor(Math.random() * 100);
								params_out.push(Math.floor((pe % 2 == 0) ? pe : pe + 1));
							}else if(caseType == "PO") {
								let po = Math.floor(Math.random() * 100);
								params_out.push(Math.floor((po % 2 == 1) ? po : po + 1));
							}else if(caseType == "D") {
								params_out.push(Math.floor(Math.random() * 10).toFixed(4));
							} if(caseType == "N") {
								params_out.push("-" + Math.floor(Math.random() * 10).toString());
							}
							break;

						case "string":
							let param_name = param.split(":")[0].trim();
							if(param_name.toLocaleLowerCase() == "order") {
								if(caseType == "PE"){
									params_out.push("'asc'");
								}else if(caseType == "PO"){
									params_out.push("'desc'");
								}
							}else {
								if(caseType == "PE"){
									params_out.push("'Test Sweet'");
								}else if(caseType == "PO"){
									params_out.push("'"+(Math.random()*100).toString()+"'");
								}
							}
							break;
						case "boolean":
							if(caseType == "PE"){
								params_out.push(true);
							}else if(caseType == "PO"){
								params_out.push(false);
							}

						default:
							params_out.push(`'' `);
					}
				});
				params_out = params_out.join(", ");
				resolve(params_out);
			} catch (error) {
				reject(error);
			}
		});
	},
	frameTestcase: (bed, method) => {
		return new Promise((resolve, reject) => {
			try {
				let testbed = testbody[`functionBed_${bed}`].replace(/@functionName@/g, method);
				testbed = testbed.replace(/@className@/g, config.skeliton[config.currentScript]['class']['name']);
				
				resolve(testbed);
			} catch (error) {
				reject(error);
			}
		});
	},

	writeSpecFile: () => {
		return new Promise((resolve, reject) => {
			try {
				let scriptname = config.currentScript.split("/");
				scriptname = (scriptname.length == 1) ? config.currentScript.split("\\") : scriptname;
				scriptname = scriptname[scriptname.length -1].replace(".ts", "");
				let spec_imports = `
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ${config.skeliton[config.currentScript]['class']['name']} } from './${scriptname}';

describe('Testing ${config.skeliton[config.currentScript]['class']['name']}', () => {
	let component: ${config.skeliton[config.currentScript]['class']['name']}
	let fixture: ComponentFixture<${config.skeliton[config.currentScript]['class']['name']}>;
	
	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [ RouterTestingModule ],
		declarations: [ ${config.skeliton[config.currentScript]['class']['name']} ]
		})
		.compileComponents();
	});

`;
				config.usnittests.forEach((testcase, i) => {
					spec_imports += "\n\t\t" + testcase;

					if(i == config.usnittests.length - 1) {
						spec_imports += "\n\n});\n";
					}
				});

				fs.writeFile(config.specfilename, spec_imports, function (err) {
					if (err) {
						console.log(err);
						throw err;
					}
					resolve(true);
				}); 
			} catch (error) {
				reject(error);
			}
		});
	}
}

module.exports = skeliton;


			// fs.readFile(file, 'utf8', (err, data) => {
			// 	console.log(data);
			// 	if (err) {
			// 		reject(err);
			// 	} else {
			// 		let ast = esprima.parse(data);

			// 		resolve(ast);
			// 	}
			// });
