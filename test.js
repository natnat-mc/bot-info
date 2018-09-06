#!/usr/bin/env node
const config=require('./api/config');
const storage=require('./api/storage');

storage.get('calendar.g5s1').then(function(data) {
	console.log(data);
	return storage.get('calendar.g5s1', 'list');
}).then(function(list) {
	console.log(list);
	return storage.set('calendar.g5s1', 'list', []);
}).then(function() {
	console.log('all done!');
}).catch(function(err) {
	console.error(err);
});

setTimeout(storage.writeStore, 1000, 'calendar.g5s1');
