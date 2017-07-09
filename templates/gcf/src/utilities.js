const _ = require('lodash')
const shortid = require('shortid')
const parseXml = require('xml2js').parseString

const chain = value => ({ next: fn => chain(fn(value)), val: () => value })
const set = (obj, prop, value, mutateFn) => 
    !obj || !prop ? obj :
    chain(typeof(prop) != 'string' && prop.length > 0).next(isPropArray => isPropArray
        ? prop.reduce((acc, p, idx) => { obj[p] = value[idx]; return obj }, obj)
        : (() => { obj[prop] = value; return obj })())
    .next(updatedObj => {
        if (mutateFn) mutateFn(updatedObj)
        return updatedObj
    })
    .val()
const throwError = (v, msg) => v ? (() => {throw new Error(msg)})() : true
const isScalarType = type => type == 'Int' || type == 'Int!' || type == 'String' || type == 'String!' || type == 'Boolean' || type == 'Boolean!' || 
    type == 'ID' || type == 'ID!' || type == 'Float' || type == 'Float!' || type == 'Enum' || type == 'Enum!'

const log = (msg, name, transformFn) => chain(name ? `${name}: ${typeof(msg) != 'object' ? msg : JSON.stringify(msg)}` : msg)
    /*eslint-disable */
    .next(v => transformFn ? console.log(chain(transformFn(msg)).next(v => name ? `${name}: ${v}` : v).val()) : console.log(v))
    /*eslint-enable */
    .next(() => msg)
    .val()

const newShortId = () => shortid.generate().replace(/-/g, 'r').replace(/_/g, '9')
const removeMultiSpaces = s => s.replace(/ +(?= )/g,'')

/**
 * Parse a non-conventionnal JSON string into a conventional JSON string.
 * 
 * @param  {String} arg e.g. '( where :   {id:  "-KkL9EdTh9abV: 9xAwHUa" page  :1} nickname: "Alla" page : {first: 10})'
 * @return {Object}     
 */
const jsonify = arg => !arg ? arg : chain((arg || '').replace(/^\(/g, '{').replace(/\)$/g, '}')) // Remove wrapping
    .next(arg => chain(arg.match(/:(\s*?)"(.*?)"/g)).next(strValues => strValues // Escapes prop value wrapper in ""
        ? strValues.reduce((a,v) => 
            chain({ alias: `--${newShortId()}--`, value: v.replace(/^:/, '') })
            .next(({ alias, value }) => set(a, 'arg', a.arg.replace(value, alias), x => x.valueAliases.push({ alias, value: value.trim() }))).val(),
            { arg, valueAliases:[] })
        : { arg, valueAliases: null }).val()) 
    .next(({ arg, valueAliases }) => chain(arg.match(/:(\s*?)'(.*?)'/g)).next(strValues => strValues // Escapes prop value wrapper in ''
        ? strValues.reduce((a,v) => 
            chain({ alias: `--${newShortId()}--`, value: v.replace(/^:/, '') })
            .next(({ alias, value }) => set(a, 'arg', a.arg.replace(value, alias), x => x.valueAliases.push({ alias, value: value.trim() }))).val(),
            { arg, valueAliases: (valueAliases || [])  })
        : { arg, valueAliases }).val()) 
    .next(({ arg, valueAliases }) => ({ arg: escapeEnumValues(arg), valueAliases })) // Makes sure that GraphQL enum values are wrapped between "".
    .next(({ arg, valueAliases }) => ({ arg: arg.replace(/(\s*?):/g, ':'), valueAliases})) // Remove any space between property name and :
    .next(({ arg, valueAliases }) => ({ arg: arg.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": '), valueAliases})) // Make sure all props are wrapped between "" to comply to JSON
    .next(({ arg, valueAliases }) => ({ arg: removeMultiSpaces(arg).replace(/{ "/g, '{"').replace(/, "/g, ',"'), valueAliases})) // Removes useless spaces.
    .next(({ arg, valueAliases }) => ({ arg, props: arg.match(/[^{,](\s*?)"([^"\s]*?)"(\s*?):/g), valueAliases})) // Match the props that need to be prepended with a comma.
    .next(({ arg, props, valueAliases }) => props 
        ?   chain(props.map(prop => prop.split(' ').reverse()[0]).reduce((a, prop) => 
                chain(`--${newShortId()}--`) // we have to use this intermediate step to ensure that we can deal with duplicate 'prop'
                .next(alias => set(a, 'arg', a.arg.replace(prop, `, ${alias}`), x => x.propAliases.push({ alias, value: prop }))).val(), 
                { arg, propAliases: [] }))
            .next(({ arg, propAliases }) => propAliases.reduce((a,p) => a.replace(p.alias, p.value), arg))
            .next(arg => ({ arg, valueAliases }))
            .val()
        :   { arg, valueAliases })
    .next(({ arg, valueAliases }) => valueAliases 
        ? valueAliases.reduce((a,v) => a.replace(v.alias, v.value.replace(/'/g, '"')), arg)
        : arg)
    .next(arg => JSON.parse(arg))
    .val()

/**
 * Merge obj1 with obj2 into a new object. If there are 
 * conflicting properties, the one with a defined value wins. If 
 * they both have a value, obj1 will win.
 * 
 * @param  {object} obj1 Object 1
 * @param  {object} obj2 Object 2
 * @return {object}      New Object
 */
const mergeTwoObjects = (obj1, obj2) => (!obj1 || !obj2) ? (obj1 || obj2) :
    ((o1, o2) => {
        let newObj = {}
        for(let i in o2) 
            newObj[i] = o1[i] != undefined ? o1[i] : o2[i]
        for(let i in o1) 
            newObj[i] = o1[i] != undefined ? o1[i] : o2[i]
        return newObj
    })(obj1, obj2)

const mergeObjects = objs => _(objs).reduce((a,b) => mergeTwoObjects(a,b), {})

const mapToDefault = (obj, defaultObj, mapFn) => {
    const mergedObj = mergeTwoObjects(obj, defaultObj)
    return (mergedObj && mapFn) 
        ? mergeTwoObjects(mapFn(mergedObj), mergedObj)
        : mergedObj
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                             START HTTP                                ///////////////////////////////

const shortRequest = req => ({
    body: req.body,
    headers: req.headers,  
    url: req.url,
    method: req.method,
    params: req.params,
    query: req.query
});

const shortResponse = res => ({
    body: res.body,
    headers: res.headers,  
    url: res.url,
    method: res.method,
    params: res.params,
    query: res.query,
    statusCode: res.statusCode,
    statusMessage: res.statusMessage
});

const getCookieKeyValue = s => {
    const parts = s.split('=');
    return [parts[0], parts.slice(1, parts.length).join('=')];
}
const getCookie = req => (req.headers.cookie || '').split('; ').map(x => getCookieKeyValue(x)).reduce((a,b) => { a[b[0]] = b[1]; return a; },{});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                              END HTTP                                 ///////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                             START CACHE                               ///////////////////////////////

let cache = {};
let cacheClearTTL = { lastUpdate: Date.now() }
const setCache = (key, results, ttl) => { cache[key] = { ttl: ttl, date: Date.now(), results }; return results; }
const getCacheNow = (key, cacheTTL) => {
    let v = cache[key];
    const ttl = v && v.ttl ? v.ttl : cacheTTL
    if (v && ((Date.now() - v.date) > ttl)) v = undefined;
    return { key, value: v ? v.results : undefined };
}
const getCache = cacheTTL => key => Promise.resolve(getCacheNow(key, cacheTTL)).then(v => {
    clearCache(cacheTTL)
    return v
})
const clearCache = cacheTTL => () => {
    const now = Date.now()
    if (now - cacheClearTTL.lastUpdate > cacheTTL) {
        setImmediate(() => {
            for (let i in log(cache, "CACHE", x => { return JSON.stringify(x) })) {
                const v = cache[i]
                const ttl = v.ttl || cacheTTL
                if ((now - v.date) > ttl) delete cache[i]
            }
        })
        cacheClearTTL.lastUpdate = Date.now()
    }
}
const createKey = (obj, fnName) => Promise.resolve(`${fnName}:${_(obj).map((value, key) => `${key}:${value}`).join('-')}`);

const cacheResolve = cacheTTL => (keyObj, fnName, getValue, ttl) => createKey(keyObj, fnName)
    .then(key => getCacheNow(key, cacheTTL))
    .then(cached => cached.value || setCache(cached.key, getValue(), ttl))

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////                              END CACHE                                ///////////////////////////////

const xmlToJson = value => value 
    ?   new Promise((onSuccess, onFailure) => parseXml(value, (err, data) => {
            if (err) onFailure(err)
            else onSuccess(data)}))
    :   Promise.resolve(value)

const hours = h => h * 3600000
const minutes = m => m * 60000
const seconds = s => s * 1000
const millis = s => s

const cacheTTL = 5000
module.exports = {
    chain,
    throwError,
    isScalarType,
    log,
    set,
    newShortId,
    removeMultiSpaces,
    mergeObjects,
    mapToDefault,
    http: {
        shortRequest,
        shortResponse,
        getCookie
    },
    cache: {
        get: getCache(cacheTTL),
        set: setCache,
        clear: clearCache(cacheTTL),
        createKey,
        resolve: cacheResolve(cacheTTL)
    },
    time: {
        hours,
        minutes,
        seconds,
        millis
    },
    cast: {
        xmlToJson,
        jsonify
    }
}