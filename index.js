#!/usr/bin/env node
'use strict';

const program = require('commander');
const fh = require('./file-helper');

program
    .version('1.0.0')
    .command('init <projectname>')
    .action(function(projectname) {
        fh.createGraphQl_4_GCF_project(projectname);
    });

program.parse(process.argv); // notice that we have to parse in a new statement.