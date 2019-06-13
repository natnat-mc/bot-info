const Discord=require('discord.js');
const fs=require('fs');

const bot=new Discord.Client();
bot.login(JSON.parse(fs.readFileSync('config.json')).bot.token);

let repl=require('repl').start('> ');
repl.context.bot=bot;
