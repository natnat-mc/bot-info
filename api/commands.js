const config=require('./config');
const Calendar=require('./calendar');
const dates=require('./dates');

function commands(msg) {
	let text=msg.content.slice(config('bot.prefix').length);
	let args=text.split(/[\t ]+/g);
	let cmd=args.shift();
	console.log(cmd, args);
	if(cmd=='ping') {
		return msg.reply('pong '+args.join(' '));
	} else if(cmd=='edt') {
		let cal=Calendar[args[0]];
		if(!cal) return msg.reply('ce calendrier n\'existe pas');
		let evts=cal.getForWeek();
		if(args[1]=='today') evts=cal.getForDay();
		else if(args[1]=='tomorrow') evts=cal.getForDay(new Date(Date.now()+dates.oneDay));
		else if(args[1]=='next') evts=cal.getForWeek(new Date(Date.now()+dates.oneWeek));
		let text=evts.map(a => a.short).join('\n');
		return msg.reply('Cours demandés:\n'+text);
	}
}

module.exports=exports=commands;
