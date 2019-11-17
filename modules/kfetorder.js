const Discord=require('discord.js');
const discord=require('./discord');

(async () => {
	// load kfet module
	const kfet=await loader.require('kfet');
	
	// register list
	const registered=Object.create(null);
	const registerOrder=(order, channel, user) => {
		registered[order+':'+channel+':'+user]='waiting';
	};
	const unregisterOrder=(order, channel, user) => {
		delete registered[order+':'+channel+':'+user];
	};
	const isOrderRegistered=(order, channel, user) => {
		return (order+':'+channel+':'+user) in registered;
	};
	
	// state change trigger
	const stateChangeTrigger=async (state, id) => {
		for(let k in registered) {
			let [order, channel, user]=k.split(':');
			if(order==id) {
				registered[k]=state;
				try {
					await shared.bot.channels.get(channel).send(discord.getMention(user, 'user')+', your order **#'+order+'** entered state *'+state+'*');
				} catch(e) {
					console.error(e);
				}
			}
		}
	};
	const okTrigger=stateChangeTrigger.bind(null, 'ok');
	const koTrigger=stateChangeTrigger.bind(null, 'ko');
	const waitingTrigger=stateChangeTrigger.bind(null, 'waiting');
	
	// clear trigger
	const clearTrigger=async () => {
		// warn users that their registered orders are lost
		for(let k in registered) {
			if(registered[k]=='waiting') {
				let [order, channel, user]=k.split(':');
				try {
					await shared.bot.channels.get(channel).send(discord.getMention(user, 'user')+', your order **#'+order+'** has been automatically discarded');
				} catch(e) {
					console.error(e);
				}
			}
		}
		
		// delete all registered orders
		for(let k in registered) {
			delete registered[k];
		}
	};
	
	// attach triggers to global emitter
	shared.kfet.emitter.on('ok', okTrigger);
	shared.kfet.emitter.on('ko', koTrigger);
	shared.kfet.emitter.on('waiting', waitingTrigger);
	shared.kfet.emitter.on('clear', clearTrigger);
	
	// command interface
	shared.commands.kfet=async (msg, args) => {
		// read subcommand
		let mode='get';
		let argmode='list';
		if(args[0]=='register') {
			mode=args.shift();
		} else if(args[0]=='unregister') {
			mode=args.shift();
		} else if(args[0]=='get') {
			mode=args.shift();
		} else if(args[0]=='set') {
			mode=args.shift();
			argmode='kv';
		} else if(args.length!=0 && isNaN(+args[0])) {
			return msg.reply("**ERROR**: Available subcommands: `get`, `register`, `unregister`");
		}
		
		// get channel and user ID
		let channel=msg.channel.id;
		let user=msg.author.id;
		
		// parse remaining arguments
		if(argmode=='list') {
			args=args.map(a => +a);
			if(args.some(a => isNaN(a)||a%1||a<1)) {
				return msg.reply("**ERROR**: Order IDs are strictly positive integers");
			}
		} else if(argmode=='kv') {
			args[0]=+args[0];
			if(isNaN(args[0]) || args[0]%1 || args[0]<1) {
				return msg.reply("**ERROR**: Order IDs are strictly positive integers");
			}
			args[1]=args[1].toLowerCase();
			if(args[1]!='ok' && args[1]!='ko' && args[1]!='waiting') {
				return msg.reply("**ERROR**: State must be one of 'ok', 'ko' or 'waiting'");
			}
		}
		
		// 'get' subcommand
		if(mode=='get') {
			// if no order is specified, list them all
			if(args.length==0) {
				args=kfet.list().map(a => +a);
			}
			
			// build a RichEmbed based on the orders
			let embed=new Discord.RichEmbed();
			embed.setTitle("Available orders");
			embed.setURL("http://kfet.bdeinfo.org");
			embed.setTimestamp(new Date());
			let orders={ok: [], ko: [], waiting: []};
			args.forEach(id => orders[kfet.get(id)].push(id));
			for(let k in orders) {
				embed.addField(k, orders[k].length==0?'None': orders[k].map(a => '**`'+a+'`**').join(' '));
			}
			
			// send the generated RichEmbed back
			return msg.reply(embed);
		}
		
		// 'set' subcommand
		else if(mode=='set') {
			// make sure we have the permission to do that
			if(!config('kfet.writeAccess').includes(user)) {
				return msg.reply("**ERROR**: Insufficient permissions");
			}
			
			kfet.set(args[0], args[1]);
			await msg.reply("successfuly updated order **#"+args[0]+"**");
		}
		
		// 'register' subcommand
		else if(mode=='register') {
			// if no order is specified, that's an error
			if(args.length==0) {
				return msg.reply("**ERROR**: At least one order must be supplied");
			}
			
			let alreadyRegistered=args.filter(a => isOrderRegistered(a, channel, user));
			let notRegistered=args.filter(a => !isOrderRegistered(a, channel, user));
			if(alreadyRegistered.length!=0) {
				await msg.reply("Orders "+alreadyRegistered.join(',')+" were already registered, ignoring.");
			}
			notRegistered.forEach(a => registerOrder(a, channel, user));
			if(notRegistered.length!=0) {
				await msg.reply("Orders "+notRegistered.join(',')+" successfuly registered.");
			}
		}
		
		// 'unregister' subcommand
		else if(mode=='unregister') {
			// if no order is specified, that's an error
			if(args.length==0) {
				return msg.reply("**ERROR**: At least one order must be supplied");
			}
			
			let alreadyRegistered=args.filter(a => isOrderRegistered(a, channel, user));
			let notRegistered=args.filter(a => !isOrderRegistered(a, channel, user));
			if(notRegistered.length!=0) {
				await msg.reply("Orders "+notRegistered.join(',')+" were not registered, ignoring.");
			}
			alreadtRegistered.forEach(a => unregisterOrder(a, channel, user));
			if(alreadyRegistered.length!=0) {
				await msg.reply("Orders "+alreadyRegistered.join(',')+" successfuly unregistered.");
			}
		}
	};
	
	// cleanup
	module.unload=async () => {
		// detach all triggers
		shared.kfet.emitter.removeListener('ok', okTrigger);
		shared.kfet.emitter.removeListener('ko', koTrigger);
		shared.kfet.emitter.removeListener('waiting', waitingTrigger);
		shared.kfet.emitter.removeListener('clear', clearTrigger);
		
		// warn users that their registered orders are lost
		for(let k in registered) {
			if(registered[k]=='waiting') {
				let [order, channel, user]=k.split(':');
				try {
					await shared.bot.channels.get(channel).send(discord.getMention(user, 'user')+', the bot is reloading; please re-register your order **#'+order+'** or it will be lost');
				} catch(e) {
					console.error(e);
				}
			}
		}
	};
})();
