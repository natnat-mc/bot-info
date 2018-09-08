const Discord=require('discord.js');
const dates=require('./dates');

shared.commands.modules=function(msg, args) {
	let mods=module.loader.list;
	let embed=new Discord.RichEmbed();
	embed.setTitle('Liste des modules');
	embed.setTimestamp(new Date());
	mods.forEach(function(module) {
		let desc=[];
		if(module.type) {
			desc.push('type: '+module.type);
		}
		if(module.desc) {
			desc.push('description: '+module.desc);
		}
		if(module.loadTime) {
			desc.push('date de chargement: '+dates.dateToTime(module.loadTime));
		}
		if(!desc.length) {
			desc.push("[PAS D'INFORMATIONS DISPONIBLES]");
		}
		embed.addField(module.name, desc.join('\n'));
	});
	return msg.reply(embed);
};

shared.commands.modules.usage=[];

shared.commands.modules.help={
	name: 'commands',
	desc: "Liste les modules chargés et affiche leur description",
	admin: false,
	category: 'core'
};

module.type='command';
