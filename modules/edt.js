const Discord=require('discord.js');
const dates=require('./dates');

shared.commands.edt=function(msg, args) {
	if(args.length!=1 && args.length!=2) {
		return msg.reply("**Usage**: **_"+config('bot.prefix')+"edt_** _<group>_ _[time/period]_\n\tgroup:\tthe group, in __g__*n*__s__*n* format\n\ttime/period:\tnothing for the current week, `next` for next week, `today`, `tomorrow` or an explicit date in `DD/MM[/AAAA]` format");
	}
	let cal=shared.calendars[args[0].toLowerCase()];
	if(!cal) return msg.reply("Ce calendrier n\'existe pas");
	let evts=cal.getForWeek();
	if(args[1]=='today') evts=cal.getForDay();
	else if(args[1]=='tomorrow') evts=cal.getForDay(new Date(Date.now()+dates.oneDay));
	else if(args[1]=='next') evts=cal.getForWeek(new Date(Date.now()+dates.oneWeek));
	else if(args[1].match('[0-3]?[0-9]/[01]?[0-9]/?[0-9]*')) {
		let parts=args[1].split('/');
		let date=new Date();
		if(parts[2]!==undefined) date.setFullYear(parts[2]);
		date.setMonth(parts[1]-1);
		date.setDate(parts[0]);
		evts=cal.getForDay(date);
	} else if(args[1]!==undefined) {
		return msg.reply("**ERROR**: wrong date format");
	}
	/*
	let prevDate;
	let text='';
	evts.forEach(function(a) {
		text+='\n';
		let date=dates.dateToParts(a.start);
		let day=date.day+'/'+date.month+'/'+date.year;
		if(prevDate!=day) {
			text+='**['+day+']**\n';
			prevDate=day;
		}
		text+='*'+date.hour+':'+date.minute;
		if(a.end) {
			let endDate=dates.dateToParts(a.end);
			text+=' -> '+endDate.hour+':'+endDate.minute;
		}
		text+='*: ';
		text+='**'+a.name+'**';
		if(a.loc) text+=' @ '+a.loc;
	});
	if(text=='') text='Pas de cours sur cette période';
	return msg.reply(text);
	*/
	let embed=new Discord.RichEmbed();
	embed.setTitle("Emploi du temps");
	embed.setURL("http://edt.univ-lyon1.fr");
	embed.setTimestamp(new Date());
	evts.forEach(function(evt) {
		let info=dates.datesToRange(evt.start, evt.end);
		info+=' @ '+evt.loc;
		embed.addField(evt.name, info);
	});
	return msg.reply(embed);
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
		desc: "La plage à afficher. `next` affiche la semaine prochaine, `today` affiche aujourd'hui, `tomorrow` affiche demain, une date explicite affiche le jour en question et rien affiche la semaine en cours (une semaine commence le dimanche pour le bot)"
	}
];

shared.commands.edt.help={
	name: 'edt',
	desc: "Affiche l'emploi du temps sous la forme d'un RichEmbed. Les emplois du temps sont mis à jour toutes les heures.",
	admin: false,
	category: 'util'
};