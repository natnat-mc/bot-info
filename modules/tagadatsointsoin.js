shared.commands.tagadatsointsoin=async function(msg, args) {
	let text=args[0] || 'TAGADA TSOINTSOIN';
	let ret=[];
	((s,l)=>Array.from(s,(a,b)=>ret.push(' '.repeat(b>l/2?l-b-1:b)+s.slice(b>l/2?l-b-1:b,b<l/2?l-b:b+1))))(text, text.length);
	return await msg.reply("```"+ret.join('\n')+"```");
};

shared.commands.tagadatsointsoin.usage=[
	{
		name: 'text',
		required: false,
		desc: "Le texte à tagadatsointsoin"
	}
];

shared.commands.tagadatsointsoin.help={
	name: 'tagadatsointsoin',
	desc: "Affiche un texte en tagadatsointsoin",
	admin: false,
	category: 'fun'
};

module.type='command';
module.unload=() => {
	delete shared.commands.tagadatsointsoin;
};
