#!/usr/bin/env node
const config=require('./api/config');
const Calendar=require('./api/calendar');
const store=require('./api/storage');

for(let i=0; i<config('groups.length'); i++) {
	const group=config('groups.'+i);
	let cal=new Calendar(group.calendar, group.name);
	cal.update();
	cal.on('update', function() {
		store.writeStore('calendar.'+group.name, true);
	});
}
