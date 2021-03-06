const fs=require('fs');
const config=require('./config');

let store={}

try {
	fs.mkdirSync('./data');
} catch(e) {}

/** store getter
 * returns a store as a Promise
 * if it is already in RAM, then return it
 * fail if it doesn't exist
 */
function getStore(name) {
	return new Promise(function(ok, fail) {
		if(store[name]) {
			return ok(store[name].data);
		}
		fs.readFile('./data/'+name+'.json', 'utf8', function(err, data) {
			if(err) return fail(err);
			else {
				data=JSON.parse(data);
				store[name]={
					data: data,
					written: 0
				};
				setInterval(writeStore, config('store.saveInterval'), name);
				setInterval(writeStore, config('store.forceSaveInterval'), name, true);
				return ok(data);
			}
		});
	});
}

/** store writer
 * persists a store to disk
 * may not actually do anything to avoid using too much disk IO
 * can be forced with the second argument
 */
function writeStore(name, force) {
	return new Promise(function(ok, fail) {
		if(!store[name]) {
			return fail(new Error('Storage unit doesn\'t exist yet'));
		} else if(store[name].written||force) {
			return fs.writeFile('./data/'+name+'.json', JSON.stringify(store[name].data), function(err) {
				if(err) return fail(err);
				else {
					store[name].written=0;
					return ok();
				}
			});
		} else {
			return ok();
		}
	});
}

/** store maker
 * creates a store and writes it to disk
 * fails if it already exists
 */
function createStore(name) {
	return new Promise(function(ok, fail) {
		if(store[name]) {
			return fail(new Error('Storage unit already exists'));
		} else {
			getStore(name).then(function() {
				return fail(new Error('Storage unit already exists'));
			}).catch(function() {
				store[name]={
					data: {},
					written: 1
				};
				writeStore(name);
				return ok(getStore(name).then(() => true));
			});
		}
	})
}

/** store ensure
 * makes sure a store exists, and returns true if it created it
 */
function ensureStore(name) {
	return createStore(name).catch(() => false).then(() => true);
}

/** data getter
 * returns a single piece of data from a store
 * you shouldn't write there yourself unless you know what you're doing
 */
function get(name, key) {
	return getStore(name).then(function(data) {
		if(key===undefined) {
			if(store[name]) {
				return store[name].data;
			} else {
				throw new Error('Storage unit not found');
			}
		} else {
			let parts=key.split('.');
			for(let i=0; i<parts.length; i++) {
				data=data[parts[i]];
				if(data===undefined) throw new Error('Key not found');
			}
			return data;
		}
	});
}

/** data setter
 * writes data into a store
 * may trigger automatic writing
 */
function set(name, key, value) {
	return getStore(name).then(function(data) {
		if(key===undefined) {
			throw new Error('Key is undefined');
		} else {
			let parts=key.split('.');
			for(let i=0; i<parts.length-1; i++) {
				data=data[parts[i]];
				if(data===undefined) throw new Error('Key not found');
			}
			data[parts.pop()]=value;
			store[name].written++;
			if(store[name].written>=config('store.directSaveThreshold')) {
				return writeStore(name);
			}
		}
	});
}

exports.writeStore=writeStore;
exports.createStore=createStore;
exports.ensureStore=ensureStore;
exports.get=get;
exports.set=set;
