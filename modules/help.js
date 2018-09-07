const Discord=require('discord.js');

shared.commands.help=function(msg, args) {
	if(args.length!=1) {
		let embed=new Discord.RichEmbed();
		embed.setTitle("Aide: bot");
		embed.setTimestamp(new Date());
		embed.addField("General", "Ce bot est fait pour gérer l'emploi du temps des étudiants de l'IUT Lyon 1, site de la Doua");
		let cmds=[];
		for(let k in shared.commands) {
			if(shared.commands.hasOwnProperty(k)) {
				cmds.push(k);
			}
		}
		embed.addField("Liste des commandes", cmds.join(', '));
		embed.addField("Afficher l'aide d'une commande", config('bot.prefix')+'help <commande>');
		embed.addField("Créateur", "Nathan DECHER \"Codinget\"");
		return msg.reply(embed);
	}
	let command=shared.commands[args[0]];
	if(!command) {
		return msg.reply('**ERROR**: command not found');
	}
	let help=command.help;
	if(!help) {
		return msg.reply('**ERROR**: no help page found');
	}
	let embed=new Discord.RichEmbed();
	embed.setTitle("Aide: "+args[0]);
	embed.setTimestamp(new Date());
	embed.addField('nom', help.name);
	embed.addField('description', help.desc);
	embed.addField('categorie', help.category);
	embed.setFooter("Pour plus d'informations, "+config('bot.prefix')+"usage "+args[0]);
	if(help.admin) {
		embed.setColor('#ff0000');
		embed.setFooter("La commande n'est disponible que pour les administrateurs");
	}
	return msg.reply(embed);
};

shared.commands.help.usage=[
	{
		name: 'commande',
		required: false,
		desc: "Le nom de la commande dont il faut afficher l'aide. Si omis, help affichera l'aide générale"
	}
];

shared.commands.help.help={
	name: 'help',
	desc: "Affiche l'aide d'une commande ou du bot",
	admin: false,
	category: 'core'
};
