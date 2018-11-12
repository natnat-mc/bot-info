const Discord=require('discord.js');
const Calendar=require('./calendar');
const dates=require('./dates');

// regex
const reg=/^(\+|\-)([0-9]+)$/;

// load the calendars
if(!shared.rooms) shared.rooms=[];
config('rooms').forEach(room => {
	if(!shared.rooms[room.name]) shared.rooms[room.name]=new Calendar(room.calendar, room.name);
});

// register the command
shared.commands.room=function(msg, args) {
	let time=Date.now();
	// parse argument
	if(args.length==1 && reg.test(args[0])) {
		let [_, sign, disp]=reg.exec(args[0]);
		disp=((sign=='-')?-1:1)*(+disp)*dates.oneHour;
		time+=disp;
	} else if(args.length!=0 || isNaN(time)) {
		return msg.reply("**ERROR**: Failed to calculate time displacement");
	}
	
	// get available rooms
	let avail=[];
	for(let k in shared.rooms) {
		if(shared.rooms.hasOwnProperty(k)) avail.push(shared.rooms[k]);
	}
	avail=avail.filter(room => {
		let evt=room.getForTime(time);
		console.log(room.name, evt)
		return !evt;	
	}).map(room => {
		console.log(room.name, 'avail');
		return room.name;
	});
	
	// create result embed
	let embed=new Discord.RichEmbed();
	embed.setTitle("Salles informatiques");
	embed.setTimestamp(time);
	for(let key in shared.rooms) {
		embed.addField(key, (avail.indexOf(key)!=-1)?"Disponible":"Occupé", true);
	}
	
	// return the result
	return msg.reply(embed);
};

// command help
shared.commands.room.help={
	name: 'room',
	desc: "Affiche les salles informatiques disponibles",
	admin: false,
	category: 'util'
};
shared.commands.room.usage=[];

module.type='command';
module.unload=() => {
	// unregister the command
	delete shared.commands.room;
};
