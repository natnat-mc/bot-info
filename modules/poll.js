module.type='command';
module.desc="Permet de crééer un sondage";

shared.commands.poll=async (msg, args) => {
	let text="Sondage de "+msg.author+": "+args.shift();
	args.forEach((t, i) => text+="\n"+String.fromCodePoint(0x1f1e6+i)+": "+t);
	let poll=await msg.channel.send(text);
	for(let i=0; i<args.length; i++) {
		await poll.react(String.fromCodePoint(0x1f1e6+i));
	}
};

shared.commands.poll.help={
	name: 'poll',
	desc: "Créé un sondage basé sur les réactions",
	admin: false,
	category: 'util'
};

shared.commands.poll.usage=[
	{
		name: 'question',
		required: true,
		desc: "La question à poser, entourée par des \""
	}, {
		name: 'réponses',
		required: true,
		desc: "Les réponses possibles, entourées par des \" et séparées par des espaces"
	}
];

module.unload=() => {
	delete shared.commands.poll;
};
