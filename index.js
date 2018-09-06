const discord=require('discord.js');
const fs=require('fs');

const config=require('./api/config');

const bot=new discord.Client();

bot.on('ready', () => {
	console.log("Logged in!");
});

bot.on('message', msg => {
	console.log(msg);
});

bot.login(config('bot.token'));
