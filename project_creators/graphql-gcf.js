const colors = require('colors');
const replace = require("replace");
const _ = require('lodash');
const path = require("path");
const u = require('../utilities');
const askQuestion = u.askQuestion;
const createDir = u.createDir;
const copyFolderContent = u.copyFolderContent;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////                                 CONFIG QUESTIONS                                    ///////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const create = () => {
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
            `Google Cloud Function bucket(no spaces): `)
        .then(answer => {
            if (answer)
                fifthQ({ __proto__: options, bucket: answer.toLowerCase().split(" ").join("") });
            else {
                console.log("You must define a bucket!".red);
                fourthQ(options);
            }
        });

    const fifthQ = (options) => askQuestion(
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
                fifthQ(options);
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

                sixthQ(options);
            }
        });

    const sixthQ = (options) => askQuestion(
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



const createFilesAndFolders = ({ projectname, projectversion, projectfn, bucket, trigger, gcfname }) => {
    const src = path.join(__dirname, "../" ,"templates/graphql-gcf");
    const dest = `${process.cwd()}/${projectname}`;

    createDir(dest);
    copyFolderContent(src, dest)
        .then(err => {
            if (err) return console.error(err);
            else {
                const pckjson = `${dest}/package.json`;
                const indexjs = `${dest}/index.js`;
                const deploysh = `${dest}/deploy.sh`;
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
                    regex: "{{project-function}}",
                    replacement: projectfn,
                    paths: [indexjs, deploysh],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{project-bucket}}",
                    replacement: bucket,
                    paths: [deploysh],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{project-tigger}}",
                    replacement: trigger,
                    paths: [deploysh],
                    recursive: true,
                    silent: true,
                });
                replace({
                    regex: "{{gcf-name}}",
                    replacement: gcfname,
                    paths: [deploysh],
                    recursive: true,
                    silent: true,
                });

                console.log(`New GraphQl project '${projectname}' for Google Cloud Functions successfully created.`.green);
            }
        }); 
}

module.exports = {
    create: create
}
