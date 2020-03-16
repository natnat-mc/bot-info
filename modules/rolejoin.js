module.type='command';
module.desc="Permet aux utilisateurs de s'attribuer automatiquement les rôles correspondant aux groupes";

let handler=async (msg) => {
	const nouveauVenu=shared.bot.guilds.get('687953396808155137').roles.get('688331886333919234');
	let rmatch=msg.content.match(/^[?!]\s*(g\ds\d)/i);
	if(rmatch) {
		let name=rmatch[1];
		let role=msg.guild.roles.find(r => r.name.toLowerCase()==name.toLowerCase());
		if(role) {
			try {
				if(msg.member.roles.find(r => r==nouveauVenu)) {
					await msg.member.addRole(role);
					await msg.reply("Vous êtes désormais dans le groupe "+role.name);
					await msg.member.removeRole(nouveauVenu);
				} else {
					await msg.reply("Vous êtes déjà dans un groupe, contactez un administrateur en cas de problème");
				}
			} catch(e) {
				console.error(e);
			}
		}
	}
};
shared.bot.on('message', handler);
module.unload=() => shared.bot.removeListener('message', handler);
