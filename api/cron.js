const dates=require('./dates');

let crontab=[];
let lastID=0;

const reg={
	modulo: /^\*\/([0-9]+)$/,
	fixed: /^([0-9]+)$/,
	multiple: /^[0-9]+(,[0-9]+)+$/,
	range: /^([0-9]+)-([0-9]+)$/,
	rangemod: /^([0-9]+)-([0-9]+)\/([0-9]+)$/
};

function parseTime(val) {
	if(val=='*') {
		return {
			type: 'all'
		};
	} else if(reg.rangemod.test(val)) {
		let [_, min, max, mod]=reg.rangemod.exec(val);
		return {
			type: 'rangemod',
			value: {
				min: +min,
				max: +max,
				mod: +mod
			}
		};
	} else if(reg.range.test(val)) {
		let [_, min, max]=reg.range.exec(val);
		return {
			type: 'range',
			value: {
				min: +min,
				max: +max
			}
		};
	} else if(reg.modulo.test(val)) {
		return {
			type: 'modulo',
			value: +reg.modulo.exec(val)[1]
		};
	} else if(reg.fixed.test(val)) {
		return {
			type: 'fixed',
			value: +reg.fixed.exec(val)[1]
		};
	} else if(reg.multiple.test(val)) {
		return {
			type: 'multiple',
			value: val.split(/,/g).map(a => +a)
		};
	} else {
		throw new TypeError('Invalid format');
	}
}

function matchPart(date, entry, name) {
	const part=date[name];
	const check=entry[name];
	switch(check.type) {
		case 'all':
			return true;
		case 'fixed':
			return part==check.value;
		case 'range':
			return part>=check.value.min && part<=check.value.max;
		case 'modulo':
			return (part%check.value)==0;
		case 'rangemod':
			part>=check.value.min && part<=check.value.max && part%check.value.mod==0;
		case 'multiple':
			return check.value.some(a => a==part);
		default:
			throw new TypeError('Invalid format')
	}
}

function matchDate(date, entry) {
	if(!matchPart(date, entry, 'month')) return false;
	if(!(matchPart(date, entry, 'day') || matchPart(date, entry, 'dayOfWeek'))) return false;
	if(!matchPart(date, entry, 'hour')) return false;
	return matchPart(date, entry, 'minute');
}

function add(time, fn) {
	let parts=time.split(/\s+/g);
	let timeObj={};
	timeObj.minute=parseTime(parts[0]);
	timeObj.hour=parseTime(parts[1]);
	timeObj.dayOfWeek=parseTime(parts[2]);
	timeObj.month=parseTime(parts[3]);
	timeObj.day=parseTime(parts[4]);
	timeObj.fn=fn;
	timeObj.id=lastID++;
	crontab.push(timeObj);
	return timeObj.id;
}

function remove(id) {
	let oldLen=crontab.length;
	crontab=crontab.filter(evt => evt.id!=id);
	return oldLen-crontab.length;
}

setInterval(function() {
	let date=dates.dateToParts(new Date());
	crontab.forEach(entry => {
		if(matchDate(date, entry)) entry.fn();
	});
}, dates.oneMin);

module.exports=exports=add;
exports.add=add;
exports.remove=remove;
