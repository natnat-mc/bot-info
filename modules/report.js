const {getMention}=require('./discord');
const {dateToTime}=require('./dates');

const idReg=/^([0-9]+)$/;
const userReg=/^<@!([0-9]+)>$/;

function report(msg, user, reason) {
	// read the config
	const reportChan=msg.guild.channels.get(config('report.channel'));
	const mentions=config('report.mentions').map(mention => {
		if(typeof(mention)=='string') return '<@&'+mention+'>';
		else if(mention.type=='raw') return mention.value;
		else if(mention.type=='user') return '<@'+mention.value+'>';
		else if(mention.type=='role') return '<@&'+mention.value+'>';
		else return '';
	}).join(', ');
	
	// pin the message and alert the mods
	msg.pin().then(msg => {
		return "pinned message in "+getMention(msg.channel.id, 'channel');
	}, err => {
		if(msg.url) return "message url "+msg.url;
		else return "message id "+msg.id;
	}).then(txt => {
		let message="**Attention** "+mentions+":\n";
		message+=getMention(user.id)+" reported "+txt+"\n";
		message+="at *"+dateToTime(new Date())+"*\n";
		message+="reason: "+reason;
		return reportChan.send(message);
	}).then(() => {
		return msg.channel.send("L'incident a été rapporté. Tout abus sera puni.");
	}).catch(err => {
		console.error(err);
		return msg.channel.send("**ERROR**: couldn't report. Reporting error to "+getMention(config('bot.owner')));
	}).catch(err => {
		console.error(err);
	});
}

shared.commands.report=(msg, args) => {
	// read the arguments
	if(!args.length) return msg.reply("**ERROR**: invalid command format");
	let arg0=args.shift();
	let id=idReg.exec(arg0);
	if(id) id=id[1];
	let user=userReg.exec(arg0);
	if(user) user=user[1];
	if(!(id || user)) return msg.reply("**ERROR**: invalid message spec");
	let reason=args.join(' ');
	if(!reason) reason="No reason given";
	
	// pin the message and react
	if(user) {
		// only a user was given, report the reporting message itself
		return report(msg, msg.author, reason);
	} else if(id) {
		// report a message by its id
		return msg.channel.fetchMessage(id).then(reported => {
			return report(reported, msg.author, reason);
		}).catch(err => {
			return msg.reply("**ERROR**: invalid ID");
		});
	}
};

shared.commands.report.help={
	name: 'report',
	desc: "Quand quelqu'un va trop loin. Tout abus sera puni.",
	admin: false,
	category: 'moderation'
};

shared.commands.report.usage=[
	{
		name: 'mention | messageID',
		required: true,
		desc: "L'utilisateur ou message à rapporter"
	}, {
		name: 'reason',
		required: false,
		desc: "La raison du report"
	}
];

module.type='command';
