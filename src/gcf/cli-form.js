/**
 * Copyright (c) 2017, Neap Pty Ltd.
 * All rights reserved.
 * 
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree.
*/
const colors = require('colors');
const replace = require("replace");
const _ = require('lodash');
const path = require("path");
const u = require('../../utilities');
const askQuestion = u.askQuestion;
const createDir = u.createDir;
const copyFolderContent = u.copyFolderContent;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////                                 CONFIG QUESTIONS                                    ///////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const startForm = () => {
    const firstQ = () => askQuestion(
            "name: ")
        .then(answer => {
            if (answer)
                secondQ({ projectname: answer });
            else {
                console.log("You must choose a name!".red);
                firstQ();
            }
        });

    const secondQ = (options) => askQuestion(
            "version: (1.0.0) ")
        .then(answer => {
            if (!answer || answer == "")
                options.projectversion = "1.0.0";
            else
                options.projectversion = answer;

            thirdQ(options);
        });

    const thirdQ = (options) => askQuestion(
            `Google Cloud Function function name (no spaces, no hyphens): (${options.projectname.replace(" ", "").replace("-", "")}) `)
        .then(answer => {
            if (!answer || answer == "")
                options.projectfn = options.projectname.replace(" ", "").replace("-", "");
            else
                options.projectfn = answer;

            fourthQ(options);
        });

    const fourthQ = (options) => askQuestion(
            `Google Cloud Project(no spaces): `)
        .then(answer => {
            if (!answer || answer == "") {
                console.log("You must define a Google Cloud Project!".red);
                fourthQ(options);
            }
            else
                options.gcp = answer;

            fifthQ(options);
        });

    const fifthQ = (options) => askQuestion(
            `Google Cloud Function bucket(no spaces): `)
        .then(answer => {
            if (answer)
                sixthQ({ __proto__: options, bucket: answer.toLowerCase().split(" ").join("") });
            else {
                console.log("You must define a bucket!".red);
                fifthQ(options);
            }
        });

    const sixthQ = (options) => askQuestion(
            "Google Cloud Function trigger: \n" +
            "  [1] HTTP \n" +
            "  [2] Pub/Sub \n" +
            "  [3] Storage \n" +
            "Choose one of the above: ([1]): ")
        .then(answer => {
            if (!answer || answer == "")
                answer = 1;

            const a = _.toNumber(answer);
            if (a != 1 && a != 2 && a != 3) {
                console.log(`'${a}' is not a valid trigger.`.red);
                sixthQ(options);
            } else {
                switch (a) {
                    case 1:
                        options.trigger = '--trigger-http'
                        break;
                    case 2:
                        options.trigger = '--trigger-topic'
                        break;
                    case 3:
                        options.trigger = '--trigger-bucket'
                        break;
                }

                seventhQ(options);
            }
        });

    const seventhQ = (options) => askQuestion(
            `Google Cloud Function name : (${options.projectname.toLowerCase().split(' ').join("-")}) `)
        .then(answer => {
            if (answer)
                options.gcfname = answer;
            else
                options.gcfname = options.projectname.toLowerCase().split(' ').join("-");

            createFilesAndFolders(options);

        });

    firstQ();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////                              CREATE FILES & FOLDERS                                 ///////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



const createFilesAndFolders = ({ projectname, projectversion, projectfn, bucket, trigger, gcfname, gcp }) => {
    const src = path.join(__dirname, "../../" ,"templates/gcf");
    const dest = `${process.cwd()}/${projectname}`;

    createDir(dest);
    copyFolderContent(src, dest)
        .then(err => {
            if (err) return console.error(err);
            else {
                const pckjson = `${dest}/package.json`;
                const indexjs = `${dest}/index.js`;
                const deployjs = `${dest}/deploy.js`;
                replace({
                    regex: "{{project-name}}",
                    replacement: projectname,
                    paths: [pckjson],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{project-version}}",
                    replacement: projectversion,
                    paths: [pckjson],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{GCFmainFunc}}",
                    replacement: projectfn,
                    paths: [indexjs, deployjs],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{GCPbucket}}",
                    replacement: bucket,
                    paths: [deployjs],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{GCFtrigger}}",
                    replacement: trigger,
                    paths: [deployjs],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{GCFname}}",
                    replacement: gcfname,
                    paths: [deployjs],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{GCPproject}}",
                    replacement: gcp,
                    paths: [deployjs],
                    recursive: true,
                    silent: true,
                });

                console.log(`New Google Cloud Function project '${projectname.italic.bold}' successfully created.`.green);
                process.exit(1);
            }
        }); 
}

module.exports = {
    startForm: startForm
}
