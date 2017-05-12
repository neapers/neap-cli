#!/usr/bin/env node
// Copyright (c) 2017, Neap pty ltd.
// All rights reserved.
// This source code is licensed under the BSD-style license found in the
// LICENSE file in the root directory of this source tree.

const program = require('commander');
const colors = require('colors');
const _ = require('lodash');
const graphqlGCF = require('./src/graphql-gcf/cli-form');
const firebase = require('./src/firebase/index');
const askQuestion = require('./utilities').askQuestion;


const createProjects = [graphqlGCF, firebase];

program
    .version('1.0.0')
    .command('Create Neap projects, i.e. projects built using Firebase, GraphQl and the Google Cloud Platform.')
    .action(function() {
        const startQuestions = () => askQuestion(
                "Available project types: \n" +
                " [1] GraphQl hosted on Google Cloud Functions\n" +
                " [2] Firebase DB Manager \n" +
                "Choose one of those: ([1]) ")
            .then(answer => {
                if (answer == "") answer = 1;
                const a = _.toNumber(answer);
                if (a != 1 && a != 2) {
                    console.log(`'${a}' is not a valid project type.`.red);
                    startQuestions();
                } else {
                    createProjects[a - 1].startForm();
                }
            });

        startQuestions();
    });

firebase.addCommands(program);

program.parse(process.argv); // notice that we have to parse in a new statement.

// NAME
//        neap init - Create a new project.

// SYNOPSIS
//        git init <projecttype> <projectname>

// DESCRIPTION
//        projecttype:
//        - graphql
