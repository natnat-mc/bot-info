const discord=require('discord.js');
const fs=require('fs');

const config=require('./api/config');
const commands=require('./api/commands');
const Calendar=require('./api/calendar');

const bot=new discord.Client();

bot.on('ready', () => {
	console.log("Logged in!");
});

bot.on('message', msg => {
	try {
		if(msg.content.startsWith(config('bot.prefix'))) commands(msg);
	} catch(e) {
		console.error(e);
	}
});

bot.login(config('bot.token'));

for(let i=0; i<config('groups.length'); i++) {
	let group=config('groups.'+i);
	Calendar[group.name]=new Calendar(group.calendar);
	Calendar[group.name].update();
	console.log('added calendar '+group.name);
}
