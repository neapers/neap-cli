'use strict'
const fs = require('fs');
var colors = require('colors');
const ncp = require('ncp').ncp;
ncp.limit = 16; // nbr of concurrent process allocated to copy your files

const createDir = (dirname) => {
	if (!fs.existsSync(dirname)){
	    fs.mkdirSync(dirname);
	}
}

const createGraphQl_4_GCF_project = (projectname) => {
	const src = `${__dirname}/templates/graphql-gcf`;
	const dest = `${process.cwd()}/${projectname}`;
    createDir(dest);
    ncp(src, dest, function(err) {
        if (err) {
            return console.error(err);
        }
        console.log(`New project '${projectname}' successfully created.`.green);
    });
}

module.exports = {
	createGraphQl_4_GCF_project: createGraphQl_4_GCF_project
}
