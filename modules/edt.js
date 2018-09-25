const Discord=require('discord.js');
const dates=require('./dates');

function createEmbed(evts) {
// create the RichEmbed
	let embed=new Discord.RichEmbed();
	embed.setTitle("Emploi du temps");
	embed.setURL("http://edt.univ-lyon1.fr");
	embed.setTimestamp(new Date());

	// sort them by day
	let byDay=[];
	let lastDay;
	evts.forEach(evt => {
		let parts=dates.dateToParts(evt.start);
		let day=parts.day+'/'+parts.month+'/'+parts.year;
		if(day!=lastDay) {
			lastDay=day;
			byDay.push({
				day: day,
				evts: [evt]
			});
		} else {
			byDay[byDay.length-1].evts.push(evt);
		}
	});

	// populate the RichEmbed
	byDay.forEach(day => {
		embed.addField(day.day, day.evts.map(evt => {
			let str='';
			let partsSt=dates.dateToParts(evt.start);
			let partsEd=dates.dateToParts(evt.end);
			str+=partsSt.hour+':'+partsSt.minute+' -> '+partsEd.hour+':'+partsEd.minute+'\t';
			str+='**'+evt.name+'** en '+evt.loc;
			return str;
		}).join('\n'));
	});

	return embed;
}

shared.commands.edt=function(msg, args) {
	if(args.length!=2) {
		return msg.reply("**ERROR**: wrong command format");
	}

	// find calendar
	let cal=shared.calendars[args[0].toLowerCase()];
	if(!cal) return msg.reply("Ce calendrier n\'existe pas");

	// read the calendar
	let evts;
	if(args[1]==='' || args===undefined || args[1]=='week') evts=cal.getForWeek();
	else if(args[1]=='today') evts=cal.getForDay();
	else if(args[1]=='tomorrow') evts=cal.getForDay(new Date(Date.now()+dates.oneDay));
	else if(args[1]=='next') evts=cal.getForWeek(new Date(Date.now()+dates.oneWeek));
	else if(/[0-3]?[0-9]\/[01]?[0-9]\/?[0-9]*/.test(args[1])) {
		let parts=args[1].split('/');
		let date=new Date();
		if(parts[2]!==undefined) date.setFullYear(parts[2]);
		date.setMonth(parts[1]-1);
		date.setDate(parts[0]);
		evts=cal.getForDay(date);
	} else {
		return msg.reply("**ERROR**: wrong date format");
	}

	// check for empty days/weeks
	if(!evts.length) {
		return msg.reply('**PAS DE COURS SUR CETTE PERIODE**');
	}

	// send the embed if available
	return msg.reply(createEmbed(evts));
};

shared.commands.edt.usage=[
	{
		name: 'group',
		required: true,
		desc: "Le groupe dont il faut afficher l'EDT, de la forme **g**n**s**n"
	},
	{
		name: 'time',
		required: false,
		desc: "La plage à afficher. `next` affiche la semaine prochaine, `today` affiche aujourd'hui, `tomorrow` affiche demain, une date explicite affiche le jour en question et `week` affiche la semaine en cours (une semaine commence le dimanche pour le bot)"
	}
];

shared.commands.edt.help={
	name: 'edt',
	desc: "Affiche l'emploi du temps sous la forme d'un RichEmbed. Les emplois du temps sont mis à jour toutes les heures.",
	admin: false,
	category: 'util'
};

module.type='command';
module.unload=() => {
	delete shared.commands.edt;
};

exports.createEmbed=createEmbed;
