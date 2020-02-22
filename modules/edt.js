const Discord=require('discord.js');
const dates=require('./dates');

function createText(evts) {
	// create a text message
	let header="**Emploi du temps**\n";
	header+="http://edt.univ-lyon1.fr\n\n";

	// accumulate events by day
	let byDay=evts.reduce(
			(acc, evt) => {
				let parts=dates.dateToParts(evt.start);
				let day=parts.day+'/'+parts.month+'/'+parts.year;
				if(!acc[day]) acc[day]=[];
				acc[day].push(evt);
				return acc;
			},
			{}
		);
	let days=Object.keys(byDay).sort();

	// represent the events textually
	let body=days.map(
		day => {
			return '**'+
				day+
				'**\n'+
				byDay[day]
				.map(evt => {
					let st=dates.dateToParts(evt.start);
					let ed=dates.dateToParts(evt.end);
					let teacher=evt.desc.match(/^\\n\\n.+\\n(.+)\\n/);
					teacher=teacher?teacher[1]:'Unknown teacher';
					return `${st.hour}:${st.minute} -> ${ed.hour}:${ed.minute}\t**${evt.name}** @${evt.loc} [${teacher}]`;
				})
				.join('\n');
		}
	).join('\n\n');

	return header+body;
}

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
			let teacher=evt.desc.match(/^\\n\\n.+\\n(.+)\\n/);
			let name=evt.name.replace(/Rust/i, "🦀Rust🦀");
			teacher=teacher?teacher[1]:'Unknown teacher';
			str+=partsSt.hour+':'+partsSt.minute+' -> '+partsEd.hour+':'+partsEd.minute+'\t';
			str+='**'+name+'** en '+evt.loc+'\t';
			str+='avec *'+teacher+'*';
			return str;
		}).join('\n'));
	});

	return embed;
}

shared.commands.edt=function(msg, args) {
	let txt=false;
	if(args[0]=='-t') {
		txt=true;
		args.shift();
	}

	let mode='week';
	let date=new Date();
	if(args[0]=='day') {
		mode='day';
	} else if(args[0]=='next') {
		date=new Date(Date.now()+dates.oneWeek);
	} else if(args[0]=='tomorrow') {
		mode='day';
		date=new Date(Date.now()+dates.oneDay);
	} else if(args[0]!='week' && args[0]!==undefined) {
		mode='day';
		date=dates.dateParse(args[0]);
		if(!date) {
			return msg.reply("Date invalide\n*le format de la commande `?edt` a changé: `?edt [-t] [date [groupe]]`*");
		}
	}

	const guild=shared.bot.guilds.get(config('bot.server'));
	const member=guild.members.get(msg.author.id);
	const roles=member.roles.map(r => r.id);
	let group=config('groups').find(g => roles.includes(g.role));
	if(group) group=group.name;
	if(args[1]!==undefined) group=args[1];
	if(group===undefined || group===null || !shared.calendars[group.toLowerCase()]) {
		return msg.reply("Groupe non trouvé");
	}

	const cal=shared.calendars[group.toLowerCase()];
	let evts;
	if(mode=='week') evts=cal.getForWeek(date);
	else evts=cal.getForDay(date);

	let resp;
	if(txt) resp=createText(evts);
	else resp=createEmbed(evts);
	return msg.reply(resp);
}

shared.commands.edt.usage=[
	{
		name: '-t',
		required: false,
		desc: "Passe en mode texte au lieu du mode embed"
	},
	{
		name: 'time',
		required: false,
		desc: "La plage à afficher. `next` affiche la semaine prochaine, `today` affiche aujourd'hui, `tomorrow` affiche demain, une date explicite affiche le jour en question et `week` affiche la semaine en cours (une semaine commence le dimanche pour le bot)"
	},
	{
		name: 'group',
		required: false,
		desc: "Le groupe dont il faut afficher l'EDT, de la forme **g**n**s**n, tente automatiquement de détecter le groupe si non fourni"
	}
];

shared.commands.edt.help={
	name: 'edt',
	desc: "Affiche l'emploi du temps sous la forme d'un RichEmbed ou sous forme d'un texte'. Les emplois du temps sont mis à jour toutes les heures.",
	admin: false,
	category: 'util'
};

module.type='command';
module.unload=() => {
	delete shared.commands.edt;
};

exports.createEmbed=createEmbed;
exports.createText=createText;
