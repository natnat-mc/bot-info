const config=require('./config');
const Calendar=require('./calendar');
const dates=require('./dates');
const store=require('./storage');
const shared=require('./shared');

let cmds={}
shared.commands=cmds;

function commands(msg) {
	let text=msg.content.slice(config('bot.prefix').length);
	let args=text.split(/[\t ]+/g);
	let cmd=args.shift();
	console.log(cmd, args);
	if(cmd=='ping') {
		msg.reply('pong '+args.join(' '));
	} else if(cmds[cmd]) {
		cmds[cmd](msg, args);
	} else {
		let keys=[];
		for(let k in cmds) {
			if(cmds.hasOwnProperty(k)) keys.push(k);
		}
		let txt="**ERROR**: Unknown command `"+cmd+"`\n";
		txt+="Available commands: \n";
		txt+=keys.map(a => "**"+a+"**").join(', ');
		msg.reply(txt);
	}
}

cmds.remind=function(msg, args) {
	msg.reply("**ERROR**: Reminder module not loaded, it will take a few seconds to load");
}

store.get('reminders').catch(() => store.createStore('reminders')).then(function() {
	cmds.remind=function(msg, args) {
		let time=args.shift();
		let txt=args.join(' ');
		if(time===undefined) {
			return msg.reply('**Usage**: **_'+config('bot.prefix')+'remind_** _<timeout>_ _<message>_');
		} else if(time.endsWith('s')) {
			time=dates.oneSec*+time.substr(0, time.length-1);
		} else if(time.endsWith('m')) {
			time=dates.oneMin*+time.substr(0, time.length-1);
		} else if(time.endsWith('h')) {
			time=dates.oneHr*+time.substr(0, time.length-1);
		} else if(time.endsWith('d')) {
			time=dates.oneDay*+time.substr(0, time.length-1);
		} else if(time.endsWith('w')) {
			time=dates.oneWeek*+time.substr(0, time.length-1);
		} else {
			return msg.reply('**Error**: unknown time format');
		}
		let date=new Date(Date.now()+time);
		store.get('reminders', msg.channel.id+'.length').catch(function() {
			store.set('reminders', msg.channel.id, []);
			return 0;
		}).then(function(len) {
			store.set('reminders', msg.channel.id+'.'+len, {
				timestamp: date.getTime(),
				message: txt,
				user: msg.author.id
			});
		}).catch(function() {
			msg.reply('**ERROR**: couldn\'t set reminder');
		}).then(function() {
			msg.reply('Rappel enregistré pour '+dates.dateToTime(date));
		});
	}
	setInterval(function() {
		store.get('reminders').then(function(reminders) {
			for(let chanId in reminders) {
				if(reminders.hasOwnProperty(chanId)) {
					store.get('reminders', chanId).then(function(reminders) {
						let remaining=[];
						reminders.forEach(function(reminder) {
							if(reminder.timestamp<=Date.now()) {
								let channel=shared.bot.channels.get(chanId);
								shared.bot.fetchUser(reminder.user).then(function(user) {
									let mention=user.toString();
									let msg=mention+", un rappel est arrivé à expiration:\n"+reminder.message;
									return channel.send(msg);
								}).catch(function(e) {
									console.error(e);
								});
							} else {
								remaining.push(reminder);
							}
						});
						if(remaining.length!=reminders.length) {
							store.set('reminders', chanId, remaining).catch(function(e) {
								console.error(e);
							}).then(function() {
								console.log(reminders.length-remaining.length, 'reminders have been triggered');
							});
						}
					}).catch(function(e) {
						console.error(e);
					});
				}
			}
		}).catch(function(e) {
			console.error(e);
		});
	}, config('reminders.precision'));
	console.log('reminder command loaded');
}).catch(function(e) {
	console.error(e);
});

module.exports=exports=commands;
