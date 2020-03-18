module.type='command';
module.desc="Permet aux professeurs de générer un fichier texte à partir du channel de cours";

const dates=require('./dates');
const Discord=require('discord.js');

shared.commands.savechannel=async (msg, args) =>{
	const chan=msg.channel;
	const messages=[];
	chan.messages.forEach(msg => {
		messages.push(msg);
	});
	let lastId=Infinity;
	messages.forEach(m => {
		if(m.id<lastId) lastId=m.id;
	});
	try {
		const m0=await msg.reply("Chargement des messages");
		while(true) {
			let msgs=await chan.fetchMessages({
				before: lastId
			});
			msgs.forEach(msg => {
				messages.push(msg);
				if(msg.id<lastId) lastId=msg.id;
			});
			if(!msgs.size) break;
		}
		const m1=await msg.reply("Génération du fichier");
		messages.sort((a, b) => a.createdAt-b.createdAt);
		const txt=messages
			.map(m => {
				let parts=dates.dateToParts2(m.createdAt);
				return `[${parts.hour}:${parts.minute}] ${m.member.displayName}: ${m.content}`;
			})
			.join('\n');
		await msg.reply({
			files: [
				new Discord.Attachment().setFile(Buffer.from(txt, 'utf8')).setName(chan.parent.name+'_'+chan.name+'.txt')
			]
		});
		await m0.delete();
		await m1.delete();
	} catch(e) {
		console.error(e);
		await msg.reply("Echec de la sauvegarde du channel");
	}
};

module.unload=() => {
	delete shared.commands.savechannel;
};
