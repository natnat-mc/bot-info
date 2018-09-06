const fs=require('fs');

const data=JSON.parse(fs.readFileSync('../config.json', 'utf8'));

function get(key) {
	key=key.split('.');
	let obj=data;
	for(i=0; i<key.length; i++) {
		obj=obj[key[i]];
		if(obj===undefined) throw new Error('Nonexistent key: '+key.join('.'));
	}
	return obj;
}

module.exports=exports=get;
