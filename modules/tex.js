module.type='command';
module.desc="Permet de faire un rendu TeX via l'API Google Charts";

shared.commands.tex=(msg, args) =>
	msg.channel.send(
		'https://chart.apis.google.com/chart?'
		+ 'cht=tx&'
		+ 'chs=40&'
		+ 'chl='+encodeURIComponent(args.join(' ').replace(/`/g, ''))
	);


shared.commands.tex.help={
	name: 'tex',
	desc: "Fait un rendu d'une équation TeX via l'API Google Charts",
	admin: false,
	category: 'util'
};

shared.commands.tex.usage=[
	{
		name: 'equation',
		required: true,
		desc: "L'équation à afficher, entourée par des \` (altGr 7 + espace)"
	}
];

module.unload=() => {
	delete shared.commands.tex;
};
