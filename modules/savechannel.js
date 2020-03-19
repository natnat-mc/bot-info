module.type='command';
module.desc="Permet aux professeurs de générer un fichier texte à partir du channel de cours";

const dates=require('./dates');
const professeurs='687955219731972116';
const Discord=require('discord.js');

shared.commands.savechannel=async (msg, args) => {
	if(!msg.member.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");
	let firstId=args[0] || '0';
	if(firstId.match(/https:\/\/discordapp\.com\/channels\/\d+\/\d+\/\d+/)) firstId=firstId.split(/\//g).pop();
	if(!firstId.match(/^\d+$/)) return await msg.reply("Syntaxe: `?savechannel [id du premier message, obtenu avec clic droit -> copier l'ID ou copier le lien]");
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
		while(lastId>firstId) {
			let msgs=await chan.fetchMessages({
				before: lastId,
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
			.filter(m => m.id>=firstId)
			.map(m => {
				let parts=dates.dateToParts2(m.createdAt);
				return `[${parts.hour}:${parts.minute}] ${m.member.displayName}: ${m.content}`;
			})
			.join('\n');
		const filename=(chan.parent?chan.parent.name+'_':'')+chan.name+'.txt';
		await msg.reply({
			files: [
				new Discord.Attachment().setFile(Buffer.from(txt, 'utf8')).setName(filename)
			]
		});
		await m0.delete();
		await m1.delete();
	} catch(e) {
		console.error(e);
		await msg.reply("Echec de la sauvegarde du channel");
	}
};
shared.commands.savechannel.help={
	name: 'savechannel',
	desc: "Enregistre un channel sous la forme d'un fichier texte",
	admin: false,
	category: 'corona'
};
shared.commands.savechannel.usage=[
	{
		name: 'début',
		required: false,
		desc: "Le lien (ou ID) du premier message à sauvegarder (clic droit -> copier le lien)"
	}
];

module.unload=() => {
	delete shared.commands.savechannel;
};
