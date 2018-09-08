shared.commands.reload=function(msg, args) {
	if(msg.author.id!=config('bot.owner')) {
		return msg.reply('**ERROR**: You do not possess sufficient rights');
	}
	config.reload();
	module.loader.reloadAll().then(module.loader.loadAll.bind(module.loader)).then(function() {
		return msg.reply("Modules rechargés!");
	}).catch(function(e) {
		console.error(e);
		return msg.reply('**ERROR**: Failed to reload modules');
	});
};

shared.commands.reload.usage=[];

shared.commands.reload.help={
	name: 'reload',
	desc: "Recharge la configuration et les modules",
	admin: true,
	category: 'core'
};

module.type='command';
