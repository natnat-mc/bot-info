const dates=require('./dates');
const store=require('./storage');

shared.commands.remind=function(msg, args) {
	msg.reply("**ERROR**: Reminder module is still loading, it will be ready in a few seconds");
};

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

module.type='command';
