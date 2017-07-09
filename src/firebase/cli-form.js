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
            "api key \n" + 
            `(It is under ${"Project settings".italic} -> ${"GENERAL".italic} in your Firebase console (${"https://console.firebase.google.com".underline})) \n` +
            ": ")
        .then(answer => {
            if (answer)
                thirdQ({ __proto__: options, apikey: answer });
            else {
                console.log("You must provide a valid api key!".red);
                secondQ(options);
            }
        });

    const thirdQ = (options) => askQuestion(
            "project ID \n" + 
            `(It is under ${"Project settings".italic} -> ${"GENERAL".italic} in your Firebase console (${"https://console.firebase.google.com".underline})) \n` +
            ": ")
        .then(answer => {
            if (answer)
                fourthQ({ __proto__: options, projectid: answer });
            else {
                console.log("You must provide a valid project id!".red);
                thirdQ(options);
            }
        });

    const fourthQ = (options) => askQuestion(
            "database secret \n" + 
            `(It is under ${"Project settings".italic} -> ${"SERVICE ACCOUNT".italic} under ${"Legacy credentials".italic} in your Firebase console (${"https://console.firebase.google.com".underline})) \n` +
            ": ")
        .then(answer => {
            if (answer)
                createFilesAndFolders({ __proto__: options, dbsecret: answer });
            else {
                console.log("You must provide a valid database secret!".red);
                fourthQ(options);
            }
        });

    firstQ();
}


///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////                              CREATE FILES & FOLDERS                                 ///////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////



const createFilesAndFolders = ({ projectname, apikey, projectid, dbsecret }) => {
    const src = path.join(__dirname, "../../" ,"templates/firebase");
    const dest = `${process.cwd()}/${projectname}`;

    createDir(dest);
    copyFolderContent(src, dest)
        .then(err => {
            if (err) return console.error(err);
            else {
                const dbjson = `${dest}/secret/database.json`;
                replace({
                    regex: "{{api-key}}",
                    replacement: apikey,
                    paths: [dbjson],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{project-id}}",
                    replacement: projectid,
                    paths: [dbjson],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{db-secret}}",
                    replacement: dbsecret,
                    paths: [dbjson],
                    recursive: true,
                    silent: true,
                });

                console.log(
                    `New Firebase project '${projectname}' successfully created. You can now start querying your DB from this console. \n`.green +
                    `Before you get started, you need to add into a 'serviceaccountkey.json' file into the 'secret' folder. This file is required to access your account with admin priviliges.\n`.magenta + 
                    "To get that file:\n".magenta +
                    ("1. Login to your firebase console (" + "https://console.firebase.google.com".bold +"). \n").magenta +
                    ("2. Go to " + "Project settings".italic + " -> " + "Service Accounts".italic + " -> " + "Generate New Private Key".italic + ". This will download the json file you need.\n").magenta + 
                    "3. Drop that json file under your 'secret' folder, and rename it 'serviceaccountkey.json'.".magenta
                    );
                process.exit(1);
            }
        }); 
}        

module.exports = {
    startForm: startForm
}
