const Discord=require('discord.js');

const _0=s=>{let o=[],i,t;s.replace(/(\d*)d(\d+)/g,(k,a,b)=>{if(a>50)throw new Error('Too many dice');t=[];for(i=a||1;i;i--)t[i-1]=Math.floor(Math.random()*b)+1;o.push({command:k,values:t})});return o};

shared.commands.roll=async function(msg, args) {
	let rolls;
	try {
		rolls=_0(args.join(' '));
	} catch(e) {
		return await msg.reply("Too many dice");
	}
	
	let embed=new Discord.RichEmbed();
	embed.setTitle("Roll");
	embed.setTimestamp(new Date());
	rolls.forEach(roll => embed.addField(roll.command, roll.values.map(a => '`'+a+'`').join(' ')));
	return await msg.reply(embed);
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
module.unload=() => {
	delete shared.commands.roll;
};
