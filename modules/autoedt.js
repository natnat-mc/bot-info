module.type='service';
module.desc="Affiche automatiquement les EDT toutes les semaines, et affche les modifications en @mention les personnes concernées";

const cleanup=[];

for(let i=0; i<config('groups.length'); i++) {
	const group=config('groups.'+i);
	const calendar=shared.calendars[group.name];
	
	const calendarChanged=function(diff) {
		console.log('calendar has changed', group.name, diff);
	};
	const calendarUpdated=function() {
		console.log('calendar has updated', group.name);
	};
	
	calendar.on('changed', calendarChanged);
	calendar.on('updated', calendarUpdated);
	
	cleanup.push(function() {
		calendar.removeListener('changed', calendarChanged);
		calendar.removeListener('updated', calendarUpdated);
	});
}

module.unload=function() {
	cleanup.forEach(a => a());
	console.log('unloaded autoedt module and removed listeners');
};
