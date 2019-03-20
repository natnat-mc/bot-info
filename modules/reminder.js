const dates=require('./dates');
const store=require('./storage');
const cron=require('./cron');
const discord=require('./discord');

shared.commands.remind=function(msg, args) {
	msg.reply("**ERROR**: Reminder module is still loading, it will be ready in a few seconds");
};

let tabID;
store.ensureStore('reminders').then(function() {
	shared.commands.remind=async function(msg, args) {
		// parse arguments
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
		
		// load 'up' reminder
		if(txt=='up') {
			try {
				txt=await store.get('reminders', 'up'+msg.author.id);
			} catch(e) {
				return await msg.reply("You don't have an `up` reminder");
			}
		}
		
		// create reminder
		let date=new Date(Date.now()+time);
		let len;
		try {
			len=await store.get('reminders', msg.channel.id+'.length');
		} catch(e) {
			await store.set('reminders', msg.channel.id, []);
		}
		try {
			await store.set('reminders', msg.channel.id+'.'+len, {
				timestamp: date.getTime(),
				message: txt,
				user: msg.author.id
			});
		} catch(e) {
			msg.reply('**ERROR**: couldn\'t set reminder');
		}
		msg.reply('Rappel enregistré pour '+dates.dateToTime(date));
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
			desc: "Le texte qui va être envoyé par le bot quand le temps sera écoulé; `up` répètera le dernier rappel déclenché"
		}
	];
	shared.commands.remind.help={
		name: 'remind',
		desc: "Ajoute un rappel",
		admin: false,
		category: 'util'
	};
	
	tabID=cron.add(config('reminders.crontab'), async () => {
		try {
			const now=Date.now();
			
			// iterate all channels
			const channels=await store.get('reminders');
			const keys=Object.keys(channels).filter(a => !a.startsWith('up'));
			for(let chanID of keys) {
				
				// get channel object and reminders
				let reminders=channels[chanID];
				let channel=shared.bot.channels.get(chanID);
				if(!reminders.length) {
					delete channels[chanID];
					console.log('purged channel', chanID);
					await store.writeStore('reminders', true);
				}
				
				// trigger reminders
				let triggered=reminders.filter(a => a.timestamp<=now);
				for(let reminder of triggered) {
					let msg=discord.getMention(reminder.user)+', you have a new reminder:\n'+reminder.message;
					await channel.send(msg);
					await store.set('reminders', 'up'+reminder.user, reminder.message)
				}
				
				// drop used reminders
				if(triggered.length) {
					console.log(triggered.length, 'reminders triggered for channel', chanID);
					reminders=reminders.filter(a => !triggered.includes(a));
					await store.set('reminders', chanID, reminders);
				}
			}
		} catch(err) {
			console.error(err);
		}
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
