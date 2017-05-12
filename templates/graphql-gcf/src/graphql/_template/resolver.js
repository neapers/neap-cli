const _ = require('lodash');
const u = require("../../utilities");
const mapper = require('./mapper');
const defaultVal = require('../../default');
const core = require('../core/core.js');
const _enum = require('../enum/enum.js');

/*************************************************************************************************
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 *
 *                                          FUNCTIONS
 * 
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 */

/**
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 *                                        SQL FUNCTIONS
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 */

const getSomeResults = (args, context) => getSomeDataInAPromise(args, context)
.then(
    results => _(results).map(mapper),
    err => { throw err }
);

const getSomeOtherResults = (args, context) => getSomeOtherDataInAPromise(args, context)
.then(
    results => _(results).map(mapper),
    err => { throw err }
);

const countItems = (args, context) => countDataInAPromise(args, context)
.then(.then(
    results => _(results).map('Count').first(),
    err => { throw err }
);

/**
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 *                                       HELPER FUNCTIONS
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 */

// [WRITE YOUR HELPER FUNCTIONS HERE]

/*************************************************************************************************
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 *
 *                                          MODULE EXPORT
 * 
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 */

module.exports = {

    root: {
        Query: {
            newModelById(root, args, context) {
                return getSomeResults();
            },

            newModels(root, args, context) {
                return getSomeOtherResults(args, context)
                .then(results => {
                        const getTotalSize = () => countItems(args);
                        return { __proto__: results, page: core.Page(args, getTotalSize) };
                    }
                );
            }
        }
    },

    dependencies: {
        NewPagedModels: {
            data(root, args, context){
                return Promise.resolve(root);
            },
            page(root, args, context) {
                return Promise.resolve(root.page);
            }
        }
    }
}