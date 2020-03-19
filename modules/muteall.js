module.type='command';
module.desc="Permet aux professeurs d'être les seuls à parler en classe";

const professeurs='687955219731972116';

shared.commands.muteall=async (msg) => {
	const sender=msg.member;
	const channel=msg.member.voiceChannel;
	if(!sender.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");
	if(!channel) return await msg.reply("Vous n'êtes pas dans un channel de cours");
	await Promise.all(channel.members.map(member => {
		if(!member.roles.find(r => r.id==professeurs)) return member.setMute(true).catch(console.error);
		else return Promise.resolve();
	}));
	await msg.reply("Les élèves ne peuvent désormais plus parler, `?unmuteall` pour leur rendre la parole");
};
shared.commands.unmuteall=async (msg) => {
	const sender=msg.member;
	const channel=msg.member.voiceChannel;
	if(!sender.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");
	if(!channel) return await msg.reply("Vous n'êtes pas dans un channel de cours");
	await Promise.all(channel.members.map(member => {
		return member.setMute(false).catch(console.error);
	}));
	await msg.reply("Les élèves peuvent de nouveau parler, `?muteall` pour les rendre muets");
};

shared.commands.muteall.help={
	name: 'muteall',
	desc: "Permet de rendre muets tous les élèves dans la classe",
	admin: false,
	category: 'corona'
};
shared.commands.unmuteall.help={
	name: 'unmuteall',
	desc: "Permet de retirer le statut muet de tous les élèves dans la classe",
	admin: false,
	category: 'corona'
};
shared.commands.muteall.usage=[];
shared.commands.unmuteall.usage=[];

module.unload=() => {
	delete shared.commands.muteall;
	delete shared.commands.unmuteall;
};
