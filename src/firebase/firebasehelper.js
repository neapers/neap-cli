const fs = require('fs');
const axios = require('axios');
const _ = require('lodash');
const admin = require("firebase-admin");
const firebase = require("firebase");
const path = require('path');
const colors = require('colors');

const push = (db) => (location, obj) => {
	return db.ref(location).push(obj);
}

const set = (db) => (location, obj) => {
	return db.ref(location).set(obj);
}

const rm = (db) => (location) => {
	return db.ref(location).remove();
}

const pushMany = (db) => (location, col) => {
	if (col && col.length > 0) {
		const p = push(db);
		const allPromises = _(col).map(i => p(location, i));
		return Promise.all(allPromises);
	}
	else
		return [Promise.resolve(null)];
}

const getChildren = (db, dbsecret) => location => {
    const uri = `${db.ref(location).toString()}.json?shallow=true&auth=${dbsecret}`;
    return axios.get(uri)
    .then(res => {
    	if (res && res.data)
    		return Object.keys(res.data);
    	else
    		return [];
    });
}

const addOrderByQuery = (ref, orderbykey, orderbychild) => {
	if (orderbykey)
		return ref.orderByKey();
	else if (orderbychild)
		return ref.orderByChild(orderbychild);
	else
		return ref;
}

const addLimitQuery = (ref, first, last) => {
	if (first)
		return ref.limitToFirst(first);
	else if (last)
		return ref.limitToLast(last);
	else
		return ref;
}

const addLocationQuery = (ref, startat, endat, equal) => {
	if (startat)
		return ref.startAt((_.startsWith(startat, '--') ? _.replace(startat, '--', '-') : startat));
	else if (endat)
		return ref.endAt((_.startsWith(endat, '--') ? _.replace(endat, '--', '-') : endat));
	else if (equal)
		return ref.equalTo((_.startsWith(equal, '--') ? _.replace(equal, '--', '-') : equal));
	else
		return ref;
}

const getData = (db) => (location, { orderbykey, orderbychild, first, last, equal, startat, endat }) => {
	return addLocationQuery(
		addLimitQuery(
			addOrderByQuery(db.ref(location), orderbykey, orderbychild), 
			first, last), 
		startat, endat, equal)
	.once('value');
}

const getConfig = () => {
	const secretFolder = path.join(process.cwd(), 'secret');
	const secretfile = path.join(secretFolder, 'serviceaccountkey.json');
	const dbfile = path.join(secretFolder, 'database.json');

	if (!fs.existsSync(secretFolder)) {
		console.log((
			"Cannot find the folder named 'secret' that is supposed to contain your Google Firebase auth. details. \n" +
			"Use the command " + "neap firebase --help".bold + " to learn how to fix that issue.").red);
		process.exit(1)
	}

	if (!fs.existsSync(secretfile)) {
		console.log((
			"Cannot find the 'serviceaccountkey.json' file that is supposed to contain your Google Firebase auth. details. \n" +
			"To get that file:\n" +
			"1. Login to your firebase console (" + "https://console.firebase.google.com".bold +"). \n" +
			"2. Go to " + "Project settings".italic + " -> " + "Service Accounts".italic + " -> " + "Generate New Private Key".italic + ". This will download the json file you need.\n" + 
			"3. Drop that json file under your 'secret' folder, and rename it 'serviceaccountkey.json'.").red);
		process.exit(1)
	}

	if (!fs.existsSync(dbfile)) {
		console.log((
			"Cannot find the 'database.json' file that is supposed to contain your Google Firebase database details. \n" +
			"To generate that file, use the command " + "neap firebase init".bold).red);
		process.exit(1)
	}

    const dbjson = fs.readFileSync(dbfile)
	const config = JSON.parse(dbjson.toString());

	return { __proto__: config, secretfile };
}

const setupFirebase = (isAdmin) => {
	const config = getConfig();

	if (isAdmin) {
	    const serviceAccount = require(config.secretfile);

	    admin.initializeApp({
	        credential: admin.credential.cert(serviceAccount),
	        databaseURL: config.databaseURL
	    });

	    return { firebase: admin, config };
	} else {
	    firebase.initializeApp(config);

	    return { firebase, config };
	}
}
module.exports = {
	getMethods: (fb, config) => {
		const db = fb.database();
		return {
			push: push(db),
			pushMany: pushMany(db),
			set: set(db),
			rm: rm(db),
			getChildren: getChildren(db, config.databaseSecret),
			getData: getData(db)
		}
	},
	setupFirebase: setupFirebase
}