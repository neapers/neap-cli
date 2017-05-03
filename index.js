#!/usr/bin/env node

const program = require('commander');
const colors = require('colors');
const _ = require('lodash');
const graphqlGCF = require('./project_creators/graphql-gcf');
const askQuestion = require('./utilities').askQuestion;


const createProjects = [graphqlGCF];

program
    .version('1.0.0')
    .command('init')
    .action(function() {
        const startQuestions = () => askQuestion(
                "Available project types: \n" +
                " [1] GraphQl hosted on Google Cloud Functions\n" +
                " [2] Something else \n" +
                "Choose one of those: ([1]) ")
            .then(answer => {
                if (answer == "") answer = 1;
                const a = _.toNumber(answer);
                if (a != 1 && a != 2) {
                    console.log(`'${a}' is not a valid project type.`.red);
                    startQuestions();
                } else {
                    createProjects[a - 1].create();
                }
            });

        startQuestions();
    });

program.parse(process.argv); // notice that we have to parse in a new statement.

// NAME
//        neap init - Create a new project.

// SYNOPSIS
//        git init <projecttype> <projectname>

// DESCRIPTION
//        projecttype:
//        - graphql
