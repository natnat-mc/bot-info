const Discord=require('discord.js');
const dates=require('./dates');

shared.commands.edt=function(msg, args) {
	if(args.length!=1 && args.length!=2) {
		return msg.reply("**ERROR**: wrong command format");
	}
	let cal=shared.calendars[args[0].toLowerCase()];
	if(!cal) return msg.reply("Ce calendrier n\'existe pas");
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
