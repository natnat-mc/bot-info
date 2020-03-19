shared.commands.usage=function(msg, args) {
	if(args.length!=1) {
		return msg.reply('**ERROR**: one argument required');
	}
	let command=shared.commands[args[0]];
	if(!command) {
		return msg.reply('**ERROR**: no such command '+args[0]);
	}
	let usage=command.usage;
	if(!usage) {
		return msg.reply('**ERROR**: no usage found for command');
	}
	let text='**'+config('bot.prefix')+args[0]+'** ';
	text+=usage.map(function(arg) {
		if(arg.required) {
			return '<*'+arg.name+'*>';
		} else {
			return '[*'+arg.name+'*]';
		}
	}).join(' ')+'\n';
	usage.forEach(function(arg) {
		text+='\t**'+arg.name+'**:\t'+arg.desc+'\n';
	});
	return msg.reply(text);
};

shared.commands.usage.usage=[
	{
		name: 'commande',
		required: true,
		desc: "La commande dont il faut expliquer l'utilisation"
	}
];

shared.commands.usage.help={
	name: 'usage',
	desc: "Affiche la syntaxe d'une commande",
	admin: false,
	category: 'core'
};

module.type='command';
module.desc="Permet d'afficher la syntaxe d'une commande";
module.unload=() => {
	delete shared.commands.usage;
};
