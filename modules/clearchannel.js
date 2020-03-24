module.type='command';
module.desc="Permet aux professeurs de nettoyer un channel";

const dates=require('./dates');
const professeurs='687955219731972116';
const Discord=require('discord.js');

shared.commands.clearchannel=async (msg, args) => {
	if(!msg.member.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");
	let firstId=args[0] || '0';
	if(firstId.match(/https:\/\/discordapp\.com\/channels\/\d+\/\d+\/\d+/)) firstId=firstId.split(/\//g).pop();
	if(!firstId.match(/^\d+$/)) return await msg.reply("Syntaxe: `?clearchannel [id du premier message, obtenu avec clic droit -> copier l'ID ou copier le lien]");
	const chan=msg.channel;
	let lastId=Infinity;
	let count=0;
	await Promise.all(chan.messages.map(msg => {
		if(msg.id<lastId) lastId=msg.id;
		if(!msg.pinned) {
			count++;
			return msg.delete();
		}
	}));
	try {
		while(lastId>firstId) {
			let msgs=await chan.fetchMessages({
				before: lastId,
			});
			await Promise.all(msgs.map(msg => {
				if(msg.id<lastId) lastId=msg.id;
				if(!msg.pinned) {
					count++;
					return msg.delete();
				}
			}));
			if(!msgs.size) break;
		}
		await msg.reply(count+" messages supprimés");
	} catch(e) {
		console.error(e);
		await msg.reply("Echec de la sauvegarde du channel");
	}
};
shared.commands.clearchannel.help={
	name: 'clearchannel',
	desc: "Nettoie un channel en ne laissant que les messages épinglés",
	admin: false,
	category: 'corona'
};
shared.commands.clearchannel.usage=[
	{
		name: 'début',
		required: false,
		desc: "Le lien (ou ID) du premier message à supprimer (clic droit -> copier le lien)"
	}
];

module.unload=() => {
	delete shared.commands.clearchannel;
};
