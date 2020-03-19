module.type='command';
module.desc="Permet aux professeurs de s'attribuer une classe";

const professeurs='687955219731972116';

const errSyntax=(msg) => msg.reply("Syntaxe: `?ihave <groupe> <matière>` avec le groupe sous la forme g`n`s`n` ou `aspe`, et la matière telle qu'elle apparait dans l'emploi du temps");

shared.commands.ihave=async (msg, args) => {
	const sender=msg.member;
	const channel=msg.member.voiceChannel;
	if(!sender.roles.find(r => r.id==professeurs)) return await msg.reply("Vous n'êtes pas professeur");

	let group=args.shift();
	if(!group) return await errSyntax(msg);
	group=group.toUpperCase();

	const matiere=args.join('-').replace(/\+/g, 'p').toLowerCase();
	if(!matiere) return await errSyntax(msg);

	const category=msg.guild.channels.find(c => c.type=='category' && c.name==group);
	if(!category) return await msg.reply("Groupe non trouvé: `"+group+"`");

	try {
		await msg.guild.channels.find(c => c.parent==category && c.type=='voice').overwritePermissions(msg.author.id, {'VIEW_CHANNEL': true, 'CONNECT': true});
		await msg.guild.channels.find(c => c.parent==category && c.name==matiere).overwritePermissions(msg.author.id, {'READ_MESSAGES': true});
		await msg.reply("Vous êtes désormais responsable du groupe "+group+" en "+matiere);
	} catch(e) {
		console.error(e);
		await msg.reply("Echec de la commande");
	}
};
shared.commands.ihave.help={
	name: 'ihave',
	desc: "Assigne à un professeur une classe pour un groupe donné",
	admin: false,
	category: 'corona'
};
shared.commands.ihave.usage=[
	{
		name: 'groupe',
		required: true,
		desc: "Groupe à assigner"
	},
	{
		name: 'matière',
		required: true,
		desc: "Matière à assigner, telle qu'elle est nommée dans l'edt"
	}
];

module.unload=() => {
	delete shared.commands.ihave;
};
