const fs=require('fs');

let data;

function get(key) {
	key=key.split('.');
	let obj=data;
	for(let i=0; i<key.length; i++) {
		obj=obj[key[i]];
		if(obj===undefined) throw new Error('Nonexistent key: '+key.join('.'));
	}
	return obj;
}

function reload() {
	data=JSON.parse(fs.readFileSync('./config.json', 'utf8'));
}

reload();

module.exports=exports=get;
exports.reload=reload;
