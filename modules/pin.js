module.type='command';
module.desc="Permet à tout le monde de pin un message";

shared.commands.pin=async (msg, args) => {
	let match=args[0].match(/https:\/\/discordapp\.com\/channels\/\d+\/\d+\/(\d+)/);
	if(!match) return await msg.reply("Syntaxe: `?pin [lien du message, obtenu avec clic droit -> copier le lien]");
	const chan=msg.channel;
	try {
		const m=await chan.fetchMessage(match[1]);
		await m.pin();
		await chan.send("Message épinglé par "+msg.author);
	} catch(e) {
		console.error(e);
		await msg.reply("Impossible d'épingler ce message");
	}
};
shared.commands.pin.help={
	name: 'pin',
	desc: "Pin un message",
	admin: false,
	category: 'util'
};
shared.commands.pin.usage=[
	{
		name: 'message',
		required: true,
		desc: "Le lien du message à pin (clic droit -> copier le lien)"
	}
];
shared.commands.unpin=async (msg, args) => {
	let match=args[0].match(/https:\/\/discordapp\.com\/channels\/\d+\/\d+\/(\d+)/);
	if(!match) return await msg.reply("Syntaxe: `?unpin [lien du message, obtenu avec clic droit -> copier le lien]");
	const chan=msg.channel;
	try {
		const m=await chan.fetchMessage(match[1]);
		await m.unpin();
		await chan.send("Message dé-épinglé par "+msg.author);
	} catch(e) {
		console.error(e);
		await msg.reply("Impossible de dé-épingler ce message");
	}
};
shared.commands.unpin.help={
	name: 'unpin',
	desc: "Unpin un message",
	admin: false,
	category: 'util'
};
shared.commands.unpin.usage=[
	{
		name: 'message',
		required: true,
		desc: "Le lien du message à unpin (clic droit -> copier le lien)"
	}
];

module.unload=() => {
	delete shared.commands.pin;
	delete shared.commands.unpin;
};
