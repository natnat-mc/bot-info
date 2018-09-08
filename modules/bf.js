shared.commands.brainfuck=function(msg, args) {
	let tape=new Uint8Array(config('brainfuck.length'));
	let register=0;
	let ptr=0;
	const prog=args.join(' ');
	let pos=0;
	let result='';
	for(let i=0; i<config('brainfuck.max'); i++) {
		switch(prog.substr(pos++, 1)) {
			case '+':
				tape[ptr]++;
				break;
			case '-':
				tape[ptr]--;
				break;
			case '>':
				ptr++;
				ptr%=tape.length;
				break;
			case '<':
				ptr--;
				if(ptr<0) ptr=tape.length-1;
				break;
			case '.':
				result+=String.fromCharCode(tape[ptr]);
				break;
			case '[':
				if(!tape[ptr]) {
					let lvl=1;
					while(lvl) {
						switch(prog.substr(pos++, 1)) {
							case '[':
								lvl++;
								break;
							case ']':
								lvl--;
								break;
							case '':
								return msg.reply('Syntax error: unbalanced `[`\n'+result);
						}
					}
					break;
				} else break;
			case ']':
				if(tape[ptr]) {
					let lvl=1;
					pos--;
					while(lvl) {
						switch(prog.substr(--pos, 1)) {
							case '[':
								lvl--;
								break;
							case ']':
								lvl++;
								break;
							case '':
								return msg.reply('Syntax error: unbalanced `]`\n'+result);
						}
					}
					pos++;
					break;
				} else break;
			case '$':
				register=tape[ptr];
				break;
			case '!':
				tape[ptr]=register;
				break;
			case '@':
			case '':
				if(result.length>1000) {
					return msg.reply('Success, but output is too long and has been truncated to 1000 characters\n'+result.substr(0, 1000));
				}
				return msg.reply('Success\n'+result);
		}
	}
	return msg.reply('The code took too long to execute\n'+result);
};

shared.commands.brainfuck.usage=[
	{
		name: 'code',
		required: true,
		desc: "Le code BrainFuck à executer"
	}
];

shared.commands.brainfuck.help={
	name: 'brainfuck',
	desc: "Execute du BrainFuck",
	admin: false,
	category: 'fun'
};

module.type='command';
