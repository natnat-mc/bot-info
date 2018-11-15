const kfet=loader.require('kfet');

shared.commands.order=function(msg, args) {
	if(args.length==0) {
		let numbers=[];
		for(let i=0; i<100; i++) {
			numbers.push(i);
		}
		let orders=kfet.get(numbers);
		let table=[];
		table.push(numbers.map(n -> n+1).map(n -> (n<10)?('  '+1):((n==100)?n:(' '+n))).join(' | '));
		table.push(numbers.map(n -> '---').join(' | '));
		table.push(orders.map(o -> o?'oui':'non').join(' | '));
		let text='```markdown\n'+table.join('\n')+'```';
		return msg.reply(text);
	}
	return msg.reply("**ERROR**: wrong syntax for command");
};

module.type='command';
module.unload=() -> {
	delete shared.commands.order;
};
