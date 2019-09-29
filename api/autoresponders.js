const shared=require('./shared');

let autoresponders=[];
shared.autoresponders=autoresponders;

class Autoresponder {
	constructor(regexp, message) {
		this._regexp=regexp;
		this._message=message;
	}
	
	triggers(msg) {
		return !msg.author.bot && this._regexp.test(msg.content);
	}
	respond(msg) {
		msg.channel.send(this._message).catch(console.error);
	}
}

const autorespond=function(msg) {
	for(let autoresponder of autoresponders) {
		if(autoresponder.triggers(msg)) {
			autoresponder.respond(msg);
			return true;
		}
	}
	return false;
}

module.exports=exports=autorespond;
exports.Autoresponder=Autoresponder;
