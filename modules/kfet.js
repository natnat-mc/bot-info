const request=require('request');
const {JSDOM}=require('jsdom');
const cron=require('./cron');

if(!shared.kfet) {
	shared.kfet={};
}

/** global KFet array
 * boolean array, from 0-99
 * true if it is done
 */
if(!shared.kfet.avail) {
	shared.kfet.avail=[];
	for(let i=0; i<100; i++) shared.kfet.avail[i]=false;
}

/** global handler array
 * everything in there will be called with an object describing the change
 * if the property once is set, then it will be removed automatically afterwards
 */
if(!shared.kfet.handlers) {
	shared.kfet.handlers=[];
}

/** update KFet data
 * read the DOM from https://iutdoua-web.univ-lyon1.fr/~p1700290/KfetBDE/
 * select everything by ID in range (1-100)
 * find its class, if it's .tdVertConsult it's done
 * store everything in a global array
 */
function reloadKfet() {
	return new Promise((resolve, reject) => {
		// read the raw JSON
		request('https://kfet.bdeinfo.org/?page=api_commandes', (err, head, body) => {
			if(err) {
				return reject(err);
			} else if(head.statusCode!=200) {
				return reject(new Error('status code is '+head.statusCode));
			}
			try {
				resolve(JSON.parse(body));
			} catch(e) {
				reject(e);
			}
		});
	}).then(json => {
		// get their status
		let arr=[];
		for(let i=0; i<100; i++) {
			let part=json[i+1+''];
			arr[i]=part && part.statut=='T' || false;
		}
		return arr;
	}).then(avail => {
		// get a diff
		let diff={
			added: [],
			removed: []
		};
		for(let i=0; i<100; i++) {
			if(avail[i]!=shared.kfet.avail[i]) {
				shared.kfet.avail[i]=avail[i];
				if(avail[i]) diff.added.push(i);
				else diff.removed.push(i);
			}
		}
		return diff;
	}).then(diff => {
		let toRem=[];
		
		// call the handlers
		if(diff.added.length || diff.removed.length) {
			shared.kfet.handlers.forEach((handler, idx) => {
				handler(diff);
				if(handler.once) toRem.unshift(idx);
			});
		}
		
		// remove old handlers
		toRem.forEach(idx => {
			shard.kfet.handlers.splice(idx, 1);
		});
	}).then(() => {
		console.log('Reloaded KFet');
	}).catch(e => {
		console.error('Failed reloading KFet', e);
	});
}

/** KFet getter
 * if called with an int, returns a boolean
 * if called with an array, returns an array of booleans
 */
exports.get=function(idx) {
	if(Array.isArray(idx)) {
		return idx.map(idx => shared.kfet.avail[idx]);
	}
	return shared.kfet.avail[idx];
}

/** install crontab rule
 * every minute (*)
 * starting at 8AM, ending at 3PM (8-15)
 * everyday of week (1-5)
 * every month (*)
 * no particular day of month (0)
 */
const cronID=cron('*	8-15	1-5	*	0', reloadKfet);

// run it at least once
reloadKfet();

module.type='service'
module.unload=() => {
	// uninstall crontab rule
	cron.remove(cronID);
};
