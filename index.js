const discord=require('discord.js');
const fs=require('fs');

const shared=require('./api/shared');

const config=require('./api/config');
const commands=require('./api/commands');
const Calendar=require('./api/calendar');

const bot=new discord.Client();
shared.bot=bot;

bot.on('ready', () => {
	console.log("Logged in!");
});

bot.on('message', msg => {
	try {
		if(msg.content.startsWith(config('bot.prefix'))) commands(msg);
	} catch(e) {
		console.error(e);
		msg.reply('ERROR');
	}
});

bot.login(config('bot.token'));

shared.calendars={};
for(let i=0; i<config('groups.length'); i++) {
	let group=config('groups.'+i);
	shared.calendars[group.name]=new Calendar(group.calendar);
	shared.calendars[group.name].update();
	shared.calendars[group.name].on('update', () => console.log('added calendar '+group.name));
}

require('./api/modules')
