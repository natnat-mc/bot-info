const Discord=require('discord.js');
const discord=require('./discord');
const cron=require('./cron');

// create a waiting list
loader.require('kfet').then(() => {
	if(!shared.kfet.waiting) {
		shared.kfet.waiting=[];
	}
});

/** create a task to clean the waiting list
 * at minute 0
 * at 15h (15)
 * not a particular DoW (0)
 * every month (*)
 * every day (*)
 */
cron('0	15	0	*	*', () => {
	shared.kfet.waiting.forEach(waiting => {
		let channel=shared.bot.channels.get(waiting.channel);
		let mention=discord.getMention(waiting.user, 'user');
		let message=mention + "Votre commande **\\#" + waiting.order + "** n'est pas sortie, elle est donc automatiquement annulée";
		channel.send(message);
	});
	shared.kfet.waiting=[];
});

/** create a passive handler
 * each time something changes, check who the order belongs to
 * then ping that person to tell them that their order is ready
 * then remove them from the waiting list
 */
function handler(diff) {
	let done=[];
	let messages=[];
	let added=diff.added.map(a => a+1);
	
	shared.kfet.waiting.forEach((waiting, idx) => {
		if(added.includes(waiting.order)) {
			// remove the command from the list
			done.unshift(idx);
			
			// send a message
			let channel=shared.bot.channels.get(waiting.channel);
			let mention=discord.getMention(waiting.user, 'user');
			let message=mention + "Votre commande **\\#" + waiting.order + "** vient de sortir";
			messages.push(channel.send(message))
		}
	});
	
	done.forEach(idx => {
		shared.kfet.waiting.splice(idx, 1);
	});
	
	return Promise.all(messages);
}
loader.require('kfet').then(() => {
	shared.kfet.handlers.push(handler);
});

/** add a list of orders to the waiting list
 * don't allow duplicates (user + channel + order tuple)
 */
function addOrders(msg, list) {
	let user=msg.author.id;
	let channel=msg.channel.id;
	return Promise.resolve().then(() => {
		list.forEach(order => {
			shared.kfet.waiting.push({user, channel, order});
		});
	});
}

// list all orders and return them in a RichEmbed
function listOrders(msg, list) {
	return loader.require('kfet').then(kfet => {
		let done=[];
		let notDone=[];
		
		for(let n of list) {
			if(kfet.get(n-1)) {
				done.push(n);
			} else {
				notDone.push(n);
			}
		}
		
		let dtext='';
		for(let i=0; i<done.length; i++) {
			if(i%4==0 && dtext) {
				dtext+="\n";
			}
			dtext+="**`" + done[i] + "`** ";
		}
		let ndtext='';
		for(let i=0; i<notDone.length; i++) {
			if(i%4==0 && ndtext) {
				ndtext+="\n";
			}
			ndtext+="**`" + notDone[i] + "`** ";
		}
		
		let embed=new Discord.RichEmbed();
		embed.setTitle("Commandes sorties");
		embed.setURL("http://kfet.bdeinfo.org");
		embed.setAuthor("KFet BDE");
		embed.addField("Prêt", dtext || "Aucune", true);
		embed.addField("En cours", ndtext || "Aucune", true);
		embed.setTimestamp(new Date());
		
		return msg.reply(embed);
	});
}

// the ?kfet command
shared.commands.kfet=function(msg, args) {
	let orders=[];
	let passive=false;
	
	if(args.length==0) {
		for(let i=1; i<=100; i++) {
			orders.push(i);
		}
	}
	
	if(args[0]=='register') {
		passive=true;
		args.shift();
	}
	
	let illegal=[];
	args.forEach(arg => {
		let order=+arg;
		if(isNaN(order)) {
			illegal.push(arg);
		} else {
			orders.push(order);
		}
	});
	orders.sort((a, b) => a-b);
	
	if(illegal.length) {
		return msg.reply("**ERROR**: illegal argument" + (illegal.length>1?"s":"") + ": " + illegal.join(" "));
	}
	
	if(passive) {
		return loader.require('kfet').then(kfet => {
			let add=addOrders(msg, orders.filter(order => !kfet.get(order)));
			let list=listOrders(msg, orders);
			return Promise.all([add, list]);
		});
	} else {
		return listOrders(msg, orders);
	}
};
shared.commands.kfet.usage=[
	{
		name: '"register"',
		required: false,
		desc: "Si présent, la commande passe en mode passif"
	},
	{
		name: 'order',
		required: false,
		desc: "Numéro (multiple acceptés) de commande. Requis en mode passif"
	}
];
shared.commands.kfet.help={
	name: 'kfet',
	desc: "Affiche les commandes sorties ou non\n"+
	"En mode passif, attend que la commande donnée sorte, et nous @ping",
	admin: false,
	category: 'util'
};

module.type='command';
module.unload=() => {
	// remove the command
	delete shared.commands.kfet;
	
	loader.require('kfet').then(() => {
		// remove the handler
		let idx=shared.kfet.handlers.indexOf(handler);
		if(idx!=-1) {
			shared.kfet.splice(idx, 1);
		}
	});
	
	// remove the crontab
	cron.remove(cronID);
};
