const Discord=require('discord.js');
const Calendar=require('./calendar');

// load the calendars
if(!shared.rooms) shared.rooms=[];
config('rooms').forEach(room => {
	if(!shared.rooms[room.name]) shared.rooms[room.name]=new Calendar(room.calendar, room.name);
});

// register the command
shared.commands.room=function(msg, args) {
	let time=Date.now();
	let avail=[];
	for(let k in shared.rooms) {
		if(shared.rooms.hasOwnProperty(k)) avail.push(shared.rooms[k]);
	}
	avail.filter(room => {
		let evt=room.getForTime(time);
		console.log(room.name, evt)
		return !evt;
		
	}).map(room => {
		console.log(room.name, 'avail');
		return room.name;
	});
	let embed=new Discord.RichEmbed();
	
	embed.setTitle("Salles informatiques");
	embed.setTimestamp(new Date());
	for(let key in shared.rooms) {
		embed.addField(key, avail.includes(key)?"Disponible":"Occupé", true);
	}
	
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
