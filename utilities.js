const fs = require('fs');
const colors = require('colors');
const readline = require('readline');
const _ = require('lodash');
const ncp = require('ncp').ncp;
ncp.limit = 16; // nbr of concurrent process allocated to copy your files

const askQuestion = (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return (new Promise((resolve, reject) => rl.question(question, resolve)))
        .then(answer => {
            rl.close();
            return answer;
        });
}

const createDir = (dirname) => {
    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname);
    }
}

const copyFolderContent = (src, dest) => {
    return new Promise((onSuccess, onFailure) => ncp(src, dest, onSuccess));
}

module.exports = {
    askQuestion: askQuestion,
    copyFolderContent: copyFolderContent,
    createDir: createDir
}


