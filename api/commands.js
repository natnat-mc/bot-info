const config=require('./config');
const Calendar=require('./calendar');
const dates=require('./dates');
const store=require('./storage');
const shared=require('./shared');

let cmds={}
shared.commands=cmds;

const reg=/^([^ ]+) (.+)$/m;

function commands(msg) {
	const parsed=parse(msg.content);
	if(!parsed) return;
	const {cmd, args}=parsed;
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

/** Parses a command string, removing the prefix and returning the command and arguments.
 * If the string isn't a command string, returns null.
 * The values are returned as an object {cmd, args}.
 * This code allows for several escape sequences:
 * 	\n => newline
 * 	\t => tabulation
 * 	\' => single quote
 * 	\" => double quote
 * 	\\ => backslash
 * 	\  => space
 * 	",'=> long argument
 * 	`  => parse as-is
 * The backslash character by itself is invalid.
 */
function parse(str) {
	// handle special conditions
	if(!str.startsWith(config('bot.prefix'))) return null;
	str=str.slice(config('bot.prefix').length);
	
	// read command
	let found=reg.exec(str);
	if(!found) {
		return {
			cmd: str.toLowerCase(),
			args: []
		};
	}
	const cmd=found[1].toLowerCase();
	const rawArgs=found[2];
	
	// read arguments
	let args=[];
	let quote=null;
	let escaped=false;
	let current='';
	for(let i=0; i<rawArgs.length; i++) {
		let char=rawArgs[i];
		if(quote=='`') {
			if(char=='`') quote=null;
			else current+=char;
		} else if(escaped) {
			// handle escape sequences
			switch(char) {
				case 'n':
					current+='\n';
					break;
				case 't':
					current+='\t';
					break;
				case '\'':
					current+='\'';
					break;
				case '\"':
					current+='\"';
					break;
				case '\\':
					current+='\\';
					break;
				case ' ':
					current+=' ';
					break;
				default:
					throw new Error("Unknown escape sequence \"\\"+current+"\"");
			}
			escaped=false;
		} else if(char=='\\') {
			// backslash starts an escape sequence
			escaped=true;
		} else if(char=='\'' || char=='\"' || char=='`') {
			// handle quotes
			if(quote==char) {
				quote=null;
			} else if(quote) {
				current+=char;
			} else {
				quote=char;
			}
		} else if(!quote && (char==' ' || char=='\t')) {
			// split arguments on space or tabulation
			if(current) {
				args.push(current);
				current='';
			}
		} else {
			current+=char;
		}
	}
	if(current) args.push(current);
	if(quote) throw new Error("Unmatched quote");
	if(escaped) throw new Error("Unfinished escape sequence");
	
	// return a result
	return {
		cmd, args
	};
}

module.exports=exports=commands;
exports.parse=parse;
