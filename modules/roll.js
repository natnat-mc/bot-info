const Discord=require('discord.js');

function roll(dice) {
	if(dice.length>10) throw new Error();
	let rolls=dice.map(die => {
		let [_, n, v, m]=die.match(/(\d+)?d(\d+)(?:-(\d+))?/);
		if(n>100) throw new Error();
		let [min, max]=m!==undefined?[v, m]:[1, v];
		let arr=[];
		for(let i=0; i<(n||1); i++) {
			arr.push(Math.floor(Math.random()*(max-min+1)+min));
		}
		let sum=arr.reduce((a, b) => a+b);
		return {die, arr, sum};
	});
	let sum=rolls.map(r => r.sum).reduce((a, b) => a+b);
	return {rolls, sum};
}

shared.commands.roll=function(msg, args) {
	try {
		let {rolls, sum}=roll(args);
		let embed=new Discord.RichEmbed();
		embed.setTitle("Roll: "+args.join(' '));
		embed.setTimestamp(new Date());
		embed.addField("Total", sum);
		rolls.forEach(roll => {
			embed.addField(roll.die, roll.arr.map(a => '`'+a+'`').join('+')+" = **"+roll.sum+"**");
		});
		return msg.reply(embed);
	} catch(e) {
		return msg.reply("Invalid rolls");
	}
};

shared.commands.roll.usage=[
	{
		name: 'dice',
		required: true,
		desc: "Les dés à lancer, dans le format `[*n*]d*n*`, séparés ou non par des `+`"
	}
];

shared.commands.roll.help={
	name: 'roll',
	desc: "Lance un ou plusieurs dés",
	admin: false,
	category: 'fun'
};

module.type='command';
module.desc="Permet de lancer des dés";
module.unload=() => {
	delete shared.commands.roll;
};
