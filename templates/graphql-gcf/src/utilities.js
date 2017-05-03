const util = require('util');
const _ = require('lodash');


module.exports = {
    error: (location, msg) => console.error("Error in '" + location + "': " + msg),

    log: (msg, name, toggle = true) => {
        if (toggle) {
            if (name) console.log(name + ':', msg);
            else console.log(msg);
        }
        return msg;
    },

    /**
     * Logs the START and END of function @fn 
     * 
     * @param  {String}   fnName         [description]
     * @param  {Function} fn             [description]
     * @param  {Boolean}  options.res    [description]
     * @param  {Boolean}  options.toggle [description]
     * @return {[type]}                  [description]
     */
    logSE: (fn, fnName, toggle = true) => {
        if (toggle) console.log(`START: ${fnName}`);
        const r = fn();
        if (toggle) console.log(`END: ${fnName}`);
        return r;
    },

    logP: (promise, promiseName, toggle = true) => {
        if (toggle) console.log(`START: ${promiseName}`);
        return promise
        .then(results => {
            if (toggle) console.log(`END: ${promiseName}`);
            return results;
        });
    },

    inspect: obj => util.inspect(obj),

    shortRequest: req => ({
            body: req.body,
            headers: req.headers,  
            url: req.url,
            method: req.method,
            params: req.params,
            query: req.query
        }),

    shortResponse: res => ({
            body: res.body,
            headers: res.headers,  
            url: res.url,
            method: res.method,
            params: res.params,
            query: res.query,
            statusCode: res.statusCode,
            statusMessage: res.statusMessage
        }),

    /**
     * Creates a function that will return a singleton promise. That 
     * allows to execute this function over and over again without risking 
     * to execute an expensive promise multiple times.
     * 
     * @param  {Function} fn Function that returns the expensive promise
     * @return {Function}    Function that returns the singleton expensive promise
     */
    promiseOnce: (fn) => {
        if (fn == null) 
            throw new Error("Error in 'utilities.js'. Method 'promiseOnce' cannot accept a null promise 'fn'.");
        let p = null;
        return () => {
            if (p == null)
                p = fn();
            return p;
        };
    }

    leftJoin: (col_1, col_1_key, col_2, col_2_key, col_2_valuekey) => {
        return _(col_1).reduce((a, b) => {
            const key = `${b[col_1_key]}`;
            const values = _(a.set[key]).map(col_2_valuekey);
            let v = {};
            v[col_1_key] = b[col_1_key];
            v[col_2_valuekey + "s"] = values;
            a.results.push(v);
            return a;
        }, { results: [], set: _(col_2).groupBy(col_2_key).value() }).results;
    }
}
