const cron=require('./cron');
const dates=require('./dates');

module.type='service';
module.desc="Affiche automatiquement les EDT toutes les semaines";

function printEdt(week) {
	loader.require('edt').then(edt => {
		for(let i=0; i<config('groups.length'); i++) {
			const group=config('groups.'+i);
			const calendar=shared.calendars[group.name];
			const channel=shared.bot.channels.get(group.channel);
			const events=week?calendar.getForWeek():calendar.getForDay(new Date(Date.now()+dates.oneDay));
			const embed=edt.createEmbed(events);
			channel.send(embed).catch(err => console.error(err));
		}
	}).catch(err => console.error(err));
}

const eachWeek=cron('0	9	0	*	0', printEdt.bind(null, true));
const eachDay=cron('0	18	1-4	*	0', printEdt.bind(null, false));

module.unload=function() {
	cron.remove(eachDay);
	cron.remove(eachWeek);
	console.log('unloaded autoedt module and removed crontab entries');
};

exports.printEdt=printEdt;
