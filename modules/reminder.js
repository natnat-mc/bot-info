const dates=require('./dates');
const store=require('./storage');
const cron=require('./cron');
const discord=require('./discord');

shared.commands.remind=function(msg, args) {
	msg.reply("**ERROR**: Reminder module is still loading, it will be ready in a few seconds");
};

let tabID;
store.ensureStore('reminders').then(function() {
	shared.commands.remind=function(msg, args) {
		let time=args.shift();
		let txt=args.join(' ');
		if(time===undefined) {
			return msg.reply('**Usage**: **_'+config('bot.prefix')+'remind_** _<timeout>_ _<message>_');
		} else if(!/^[0-9]{1,5}[a-z]$/.test(time)) {
			return msg.reply('**ERROR**: wrong time format');
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
			return msg.reply('**ERROR**: unknown suffix format');
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
		}).catch(function() {
			msg.reply("Genre vraiment?");
		});
	};
	
	shared.commands.remind.usage=[
		{
			name: 'time',
			required: true,
			desc: "Le temps avant le rappel, un nombre avec un suffixe entre `s`, `m`, `h`, `d` et `w`"
		},
		{
			name: 'text',
			required: true,
			desc: "Le texte qui va être envoyé par le bot quand le temps sera écoulé"
		}
	];
	shared.commands.remind.help={
		name: 'remind',
		desc: "Ajoute un rappel",
		admin: false,
		category: 'util'
	};
	
	tabID=cron.add(config('reminders.crontab'), () => {
		const now=Date.now();
		store.get('reminders').then(channels => {
			return [channels, Object.keys(channels)];
		}).then([channels, keys] => {
			return Promise.all(keys.map(chanID => {
				let reminders=channels[chanID];
				let channel=shared.bot.channels.get(chanID);
				if(!reminders.length) {
					delete channels[key];
					return store.writeStore('reminders');
				}
				let triggered=reminders.filter(reminder => {
					return reminder.timestamp<=now;
				});
				let promises=triggered.map(reminder => {
					let msg=discord.getMention(reminder.user)+', you have a new reminder:\n';
					msg+=reminder.message;
					return channel.send(msg);
				});
				Promise.all(promises).then(() => {
					console.log(triggered.length, 'reminders triggered for channel', chanID);
				}).catch(err => {
					console.error(err);
				});
				if(triggered.length) {
					reminders=reminders.filter(a => {
						return !triggered.includes(a);
					});
					return store.set('reminders', chanID, reminders);
				}
				return Promise.resolve(true);
			}).catch(err => {
				console.error(err);
			});
		});
	});
		console.log('reminder command loaded');
}).catch(function(e) {
	console.error(e);
});

module.type='command';
module.unload=() => {
	delete shared.commands.remind;
	store.writeStore('reminders').catch(console.error);
	cron.remove(tabID);
};
