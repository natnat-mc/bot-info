shared.commands.order=function(msg, args) {
	loader.require('kfet').then(kfet => {
		if(args.length==0) {
			let text='';
			
			for(let n=0; n<10; n++) {
				let numbers=[];
				for(let i=n*10; i<n*10+10; i++) {
					numbers.push(i);
				}
				let orders=kfet.get(numbers);
				let table=[];
				table.push(numbers.map(n => n+1).map(n => (n<10)?(' '+1+' '):((n==100)?n:(' '+n))).join(' | '));
				table.push(numbers.map(n => '---').join(' | '));
				table.push(orders.map(o => o?'oui':'non').join(' | '));
				if(text) text+='\n';
				text+='```markdown\n'+table.join('\n')+'```';
			}
			
			return msg.reply(text);
		}
		return msg.reply("**ERROR**: wrong syntax for command");
	});
};

module.type='command';
module.unload=() => {
	delete shared.commands.order;
};
