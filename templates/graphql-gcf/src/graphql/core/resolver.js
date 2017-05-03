const _ = require('lodash');
const u = require("../../utilities");
const defaultVal = require('../../default');

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

// [WRITE YOUR SQL FUNCTIONS HERE]

/**
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 *                                       HELPER FUNCTIONS
 * ///////////////////////////////////////////////////////////////////////////////////////////////
 */

const getFirst = ({ first }) => (first && first > 0) ? first : defaultVal.PAGE_SIZE;
const getSkip = ({ skip }) => (skip && skip > 0) ? skip : 0;
const getCurrent = (args) => {
    const f = getFirst(args);
    const a = getSkip(args);
    return _.ceil((a + f)/f);
};
const getTotal = (args) => {
    const f = getFirst(args);
    if (args.getTotalSize)
        return args.getTotalSize().then(size => { return { size: size, pages: _.ceil(size/f) } });
    else
        throw new Error(`Error in 'core/resolver.js': 'args' in method 'getTotal' does not define a 'getTotalSize' function.`);
};

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
            dummyPage(root, args, context) {
                return Promise.resolve({ first: 10, skip: 20, getTotalSize: () => Promise.resolve(320) });
            }
        }
    },

    dependencies: {
        Page: {
            first(root, args, context) { return Promise.resolve(getFirst(root)); },
            skip(root, args, context) { return Promise.resolve(getSkip(root)); },
            current(root, args, context) { return Promise.resolve(getCurrent(root)); },
            total(root, args, context) { return getTotal(root); },
        }
    }
}