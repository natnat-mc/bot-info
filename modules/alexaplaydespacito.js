const {Autoresponder}=require('./autoresponders');

let alexaplaydespacito=new Autoresponder(/Alexa\s+play\s+despacito/i, "Now playing: Luis Fonsi - Despacito");
shared.autoresponders.push(alexaplaydespacito);

module.type='autoresponder';
module.desc="This is so sad, Alexa play Despacito";
module.unload=() => {
	shared.autoresponders.splice(shared.autoresponders.indexOf(alexaplaydespacito), 1);
};
