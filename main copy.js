#!/usr/bin/env node
const lineByLine = require('n-readlines');
const path = require('path');
const fs = require('fs');

const testSweet = require('./src/angularTextSweet');

const args = {};
let diSource = false;
let sourceObj = undefined;
let functionFlag = false;
function main(curPath) {
    const directoryPath = path.join(curPath);
    if(args['file'] !== undefined){testSweet
        const outLine = pripareUT(path.join(curPath, args['file']));
        writeSpecFile(outLine, path.join(curPath, args['file']));
    }else{
        fs.readdir(directoryPath, function (err, files) {
            //handling error
            if (err) {
                return console.log('Unable to scan directory: ' + err);
            } 
            //listing all files using forEach
            files.forEach(function (file) {
                if(file !== 'node_modules' && file[0]!="."){
                    if(fs.lstatSync( path.join(curPath, file)).isDirectory()){
                        main(path.join(curPath, file));
                    }
                    if(file.indexOf(".ts")> -1){
                        if(file.indexOf(".spec") < 0){
                            const outLine = pripareUT(path.join(curPath, file));
                            writeSpecFile(outLine, path.join(curPath, file));
                        }
                    }
                }
            });
        });
    }
    return true;
}

function getArgs(argsv){
    argsv.forEach(arg => {
        if(arg.indexOf("=") < 0){
            args['file'] = arg;
        }else{
            arg = arg.split("=");
            args[arg[0]] = arg[1];
        }
    });

    console.log(args)
    return true;
}

function getFileOutline(file){
    const content = [];
    const lines = new lineByLine(file);
    let line;
    while (line = lines.next()) {
        let retObj = checkLineContent(line.toString());
        if(retObj !== false){
            content.push(retObj)
        }
    }

    return content;
}

function checkLineContent(line){
    line = line.replace(";", '');
    line = line.trim();
    
    if(line.indexOf("//") ==0){
        return false;
    }
    if(sourceObj === undefined && (["", ")}","})", "}"].indexOf(line.trim()) >= 0 
        || line.replaceAll(" ", '') == '){}')){
        return false;
    }
    if(sourceObj !== undefined && (line.trim() == "})" 
                                    || line.replaceAll(" ", '') == '){}' 
                                    || line.replaceAll(" ", '') == '){')){
        let data = sourceObj;
        sourceObj = undefined;
        diSource = false;
        return data
    }

    let finalObject = {
        "type": "",
        "line": line
    };
    // imports
    if(line.indexOf("import")>=0){
        const lineBreaks = line.split("from");
        lineBreaks[0] = lineBreaks[0].replace("import", "").trim();
        lineBreaks[0] = lineBreaks[0].replace("{", "").trim();
        lineBreaks[0] = lineBreaks[0].replace("}", "").trim().split(",");
        lineBreaks[0][0].replace("{", "");
        finalObject.type = "import";
        finalObject.from =  lineBreaks[lineBreaks.length-1].replaceAll("'", "").replace(";", "").trim();
        finalObject.imports =  lineBreaks[0];
    }

    // component
    else if(line.indexOf("@")==0){
        sourceObj = finalObject;
        const lineBreaks = line.split("({");
        sourceObj.type = lineBreaks[0].replace("@", "").trim();
        sourceObj.props = {};
    }

    // add components props
    else if(sourceObj !== undefined && line.indexOf("@")<0 && sourceObj.type !== "class"){
        const lineBreaks = line.split(":");
        sourceObj.props[lineBreaks[0].trim()] = lineBreaks[1].replace(",", "").replaceAll("'", "").trim();
    }

    // class
    else if(line.indexOf("export class")==0 || line.indexOf("class")==0){
        sourceObj = finalObject;
        sourceObj.type = "class"
        const lineBreaks = line.split("class ");
        const impls = lineBreaks[1].replace("{", "").trim().split(" implements ");
        sourceObj.class_name = impls[0].replace("{", "").trim();
        if(impls.length >1){
            sourceObj.impls = impls[1].replace("{", "").trim().split(",");
        }
        sourceObj.props = {};
        sourceObj.dis = [];
    }

    // add class props
    else if(sourceObj !== undefined && sourceObj.type === "class" && ((line.indexOf("export class")!==0 && line.indexOf("class")!==0))){
        if(line == "constructor(" || diSource === true){
            diSource = true;
            if(line !== "constructor(" && line.trim() !== ""){
                sourceObj.dis.push(line.replace(",", "").trim());
            }
        }else if(line.trim() !== ""){
            const lineBreaks = line.split("=");
            sourceObj.props[lineBreaks[0].trim()] = (lineBreaks.length ==1)? undefined : lineBreaks[1].replace(",", "").replaceAll("'", "").trim();
        }
    }

    // functions
    if(line.indexOf("*/")>=0){
        functionFlag = true;
    }else if(functionFlag){
        functionFlag = false;
        finalObject.type = "function";
        const lineBreaks = line.split("(");
        finalObject.name =  lineBreaks[0].replaceAll("'", "").trim();
        const props = lineBreaks[1].replaceAll(")", "").trim().split(")");
        finalObject.props = (props.length >1)? props[0].trim().split(",") : [];
    }

    if(finalObject.type == ""){
        finalObject = false;
    };

    return (sourceObj == undefined)? false : finalObject;
}

function pripareUT(file) {
    const fileParts = file.split(".");
    const ext = fileParts[fileParts.length -1];
    fileParts[fileParts.length -1] = "spec";
    fileParts.push(ext);
    console.log({
        "source": file,
        "spec": fileParts.join(".")
    })
    let outline = getFileOutline(file);
    
    return outline;
}

function writeSpecFile(outLine, file) {
    console.log(outLine);
    const fileParts = file.split(".");
    const ext = fileParts[fileParts.length -1];
    fileParts[fileParts.length -1] = "spec";
    fileParts.push(ext);
    file = fileParts.join(".")
    // read existed content
    const lines = new lineByLine(file);
    let lineNum = 0;
    let content = "";
    while (lineNum < 24) {
        let line = lines.next();
        content += line.toString() +"\n";
        lineNum++;
    }
    // fs.writeFile(file, content, (err)=>{
    //     if(err){
    //         console.log(err);
    //     }
    // });
            
    const specfile = fs.createWriteStream(file);
    specfile.once('open', function(fd) {
        specfile.write(content +"\n");
        outLine.forEach(stage => {
            content = pripareSourceCode(stage);
            if(content != ""){
                specfile.write(content+"\n");
            }
        });
        specfile.write("});");
        specfile.end();
    });

}

function pripareSourceCode(stage) {
    let content = "";
    switch (stage.type) {
        case 'function':
            console.log(stage);
            let funSweet = testSweet.functionTest;
            if(stage.from !='@angular/core'){
                content = funSweet.replaceAll("@functionname@", stage.name);
            }
            break;
    
        default:
            content = "";
            break;
    }
    
    return content;
}

getArgs(process.argv.slice(2, process.argv.length))
main(process.cwd());
