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

module.exports=exports=commands;
