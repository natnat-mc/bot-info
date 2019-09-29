const Discord=require('discord.js');
const fs=require('fs');

const shared=require('./api/shared');

const config=require('./api/config');
const commands=require('./api/commands');
const autorespond=require('./api/autoresponders');
const Calendar=require('./api/calendar');
const Loader=require('./api/loader');

const bot=new Discord.Client();
shared.bot=bot;

bot.on('ready', () => {
	bot.user.setActivity(config('bot.prefix')+'help');
	console.log("Logged in!");
});

bot.on('warning', (warn) => {
	console.error('Bot warning', warn);
});

bot.on('error', (err) => {
	console.error('Bot error', err);
});

if(config('bot.debug')) {
	bot.on('debug', (txt) => {
		console.error('Bot debug', txt);
	});
}

bot.on('message', msg => {
	try {
		if(msg.content.startsWith(config('bot.prefix')) && !msg.author.bot && msg.content!=config('bot.prefix')) {
			commands(msg);
		}
		autorespond(msg);
	} catch(e) {
		console.error(e);
		msg.reply('ERROR');
	}
});

bot.login(config('bot.token'));

shared.calendars={};
for(let i=0; i<config('groups.length'); i++) {
	let group=config('groups.'+i);
	shared.calendars[group.name]=new Calendar(group.calendar, group.name);
	shared.calendars[group.name].on('update', () => console.log('updated calendar '+group.name));
}

let loader=new Loader('./modules');
loader.loadAll().then(() => {
	console.log('Loaded all modules');
}).catch((e) => {
	console.error(e);
});

let repl=require('repl').start('> ');
repl.context.shared=shared;
repl.context.config=config;
repl.context.bot=bot;
repl.context.loader=loader;
