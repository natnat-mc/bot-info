module.type='command';
module.desc="Permet aux professeurs d'être les seuls à parler en classe";

const professeurs='687955219731972116';

(async () => {
	shared.commands.muteall=async (msg) => {
		const sender=msg.member;
		const channel=msg.member.voiceChannel;
		if(!sender.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");
		if(!channel) return await msg.reply("Vous n'êtes pas dans un channel de cours");
		await Promise.all(channel.members.map(member => {
			if(!member.roles.find(r => r.id==professeurs)) return member.setMute(true).catch(console.error);
			else return Promise.resolve();
		}));
	};
	shared.commands.unmuteall=async (msg) => {
		const sender=msg.member;
		const channel=msg.member.voiceChannel;
		if(!sender.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");
		if(!channel) return await msg.reply("Vous n'êtes pas dans un channel de cours");
		await Promise.all(channel.members.map(member => {
			return member.setMute(false).catch(console.error);
		}));
	};
	module.unload=() => {
		delete shared.commands.muteall;
		delete shared.commands.unmuteall;
	};
})();
