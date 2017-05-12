#!/usr/bin/env node

const colors = require('colors');
const _ = require("lodash");
const fh = require('./firebasehelper');
const u = require('./utilities');
const startForm = require('./cli-form').startForm;

const exit = u.exit;
const loadData = u.loadData;

const isAdmin = true;

const getFirebaseMethods = () => {
    const setup = fh.setupFirebase(isAdmin);

    const firebaseMethods = fh.getMethods(setup.firebase, setup.config);
    return {
        push: firebaseMethods.push,
        pushMany: firebaseMethods.pushMany,
        set: firebaseMethods.set,
        rm: firebaseMethods.rm,
        getChildren: firebaseMethods.getChildren,
        getData: firebaseMethods.getData
    }
}

const addCommands = (program) => {

    program
    .command('db:push <location> <file>')
    .action(function(location, file) {
        const fb = getFirebaseMethods();
        loadData(file)
            .then(data => {
                if (data) {
                    const values = JSON.parse(data);
                    if (values.length) {
                        const chrono = u.getChrono().start();
                        fb.pushMany(location + prefix, values)
                            .then(results => {
                                const ellaspsedTime = chrono.measure();
                                exit(console.log(`The ${results.length} objects contained in the '${file}' have been successfully added under the '${location}' in ${ellaspsedTime} ms.`.green));
                            })
                            .catch(err => exit(console.log(`Error when processing results from 'pushMany': ${err}`.red)));
                    } else
                        exit(console.log(`File ${file.bold} does not contain an array of objects.`.red));
                } else
                    exit(console.log(`File ${file.bold} does not contain any data.`.red));
            })
            .catch(err => exit(console.log(`Error while processing data from ${file}: ${JSON.stringify(err)}`.red)));
    });

    program
    .command('db:set <location> <file>')
    .action(function(location, file) {
        const fb = getFirebaseMethods();
        loadData(file)
            .then(data => {
                if (data) {
                    const values = JSON.parse(data);
                    if (values.length) {
                        const chrono = u.getChrono().start();
                        fb.set(location, values)
                            .then(results => {
                                const ellaspsedTime = chrono.measure();
                                exit(console.log(`The array object contained in '${file}' has been successfully added under the '${location}' firebase node in ${ellaspsedTime} ms.`.green))
                            }).catch(err => exit(console.log(`Error when processing results from 'set': ${err}`.red)));
                    } else
                        exit(console.log(`File ${file.bold} does not contain an array of objects.`.red));
                } else
                    exit(console.log(`File ${file.bold} does not contain any data.`.red));
            })
            .catch(err => exit(console.log(`Error while processing data from ${file}: ${JSON.stringify(err)}`.red)));
    });

    program
    .command('db:rm <location>')
    .action(function(location) {
        const fb = getFirebaseMethods();
        const chrono = u.getChrono().start();
        fb.rm(location)
            .then(results => {
                const ellaspsedTime = chrono.measure();
                exit(console.log(`Location '${location}' has been successfully deleted from firebase node in ${ellaspsedTime} ms.`.green))
            }).catch(err => exit(console.log(`Error when processing results from 'rm': ${err}`.red)));
    });

    program
    .command('db:ls <location>')
    .action(function(location) {
        const fb = getFirebaseMethods();
        const chrono = u.getChrono().start();
        fb.getChildren(location)
            .then(results => {
                const ellaspsedTime = chrono.measure();
                const count = results.length > 0 ? results.length : 0;
                _(results).forEach(r => console.log(r));
                exit(console.log(`${count} items have been found under location '${location}' in ${ellaspsedTime} ms.`.green))
            }).catch(err => exit(console.log(`Error when processing results from 'ls': ${err}`.red)));
    });

    program
    .command('db:get <location>')
    .usage('<location> [option]   WARNING: When using firebase keys to query your DB, prefix it with an hyphen \'-\' \n' +
        '                                   ' +
        '(e.g. replace \'-KjM0clGqdy-TMlsp_kv\' with \'--KjM0clGqdy-TMlsp_kv\'). Otherwise, \n' +
        '                                   ' +
        'the single hyphen will confuse the command, thinking this is an option.')
    .option('-k, --orderbykey', 'Order by key')
    .option('-c, --orderbychild <child>', 'Order by child')
    .option('-f, --first <limit>', 'Limit results to first x items', parseInt)
    .option('-l, --last <limit>', 'Limit results to last x items', parseInt)
    .option('-w, --equal <value>', 'Object\'s key must equal that value. Equivalent to SQL where')
    .option('-s, --startat <value>', 'Skipping the first items whose value specified by the \'order\' strategyare less than this value')
    .option('-e, --endat <value>', 'Ignoring the next items whose value specified by the \'order\' strategy are above this value')
    .action(function(location, options) {
        const fb = getFirebaseMethods();
        const chrono = u.getChrono().start();
        fb.getData(location, options)
            .then(snapshot => {
                const ellaspsedTime = chrono.measure();
                const results = snapshot ? snapshot.val() : [];
                console.log("KEY:".blue);
                console.log(snapshot.key);
                console.log("VALUE(S):".blue);
                console.log(snapshot.val());
                if (results)
                    exit(console.log(`${Object.keys(results).length} items found under location '${location}' in ${ellaspsedTime} ms.`.green))
                else
                    exit(console.log(`No items found under location '${location}' in ${ellaspsedTime} ms.`.green));
            }).catch(err => exit(console.log(`Error when processing results from 'get': ${err}`.red)));
    });

    return program;
}

module.exports = {
    addCommands: addCommands,
    startForm: startForm
}
