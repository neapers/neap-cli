const fs = require('fs');
const Spinner = require('cli-spinner').Spinner;
 
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');


const loadData = (jsonFile) => (new Promise((onSuccess, onFail) => fs.readFile(jsonFile, 'utf-8', (err, data) => {
    if (err) onFail(err);
    else onSuccess(data);
})));

const exit = (fn) => process.exit(1);

const getChrono = () => {
    return {
        start: () => {
            spinner.start();
            let start = Date.now();
            let result = null;
            return {
                measure: () =>  {
                    spinner.stop(true);
                    return (Date.now() - start);
                },
                stop: () => {
                    spinner.stop(true);
                    if (result == null)
                        result = Date.now() - start;
                    return result;
                },
                reset: () => {
                    result = null;
                    start = Date.now();
                }
            }
        }
    }
}

module.exports = {
    loadData: loadData,
    exit: exit,
    getChrono: getChrono
}
