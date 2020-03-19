const Discord=require('discord.js');
const dates=require('./dates');

shared.commands.modules=function(msg, args) {
	let mods=module.loader.list;
	let rpl="```markdown\n";
	rpl+="# Liste des modues\n";
	mods.forEach(function(module) {
		let desc=["## "+module.name];
		desc.push('- type: '+module.type);
		if(module.desc) {
			desc.push('- desc: '+module.desc);
		}
		rpl+=desc.join('\n')+'\n';
	});
	rpl+="```";
	return msg.reply(rpl);
};

shared.commands.modules.usage=[];

shared.commands.modules.help={
	name: 'commands',
	desc: "Liste les modules chargés et affiche leur description",
	admin: false,
	category: 'core'
};

module.type='command';
module.desc="Permet de lister les modules chargés dans le bot";
module.unload=() => {
	delete shared.commands.modules;
};
