const dates=require('./dates');

const crontab=[];

const reg={
	modulo: /^\*\/([0-9]+)$/,
	fixed: /^([0-9]+)$/,
	multiple: /^[0-9]+(,[0-9]+)+$/
};

function parseTime(val) {
	if(val=='*') {
		return {
			type: 'all'
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
		case 'modulo':
			return (part%check.value)==0;
		case 'multiple':
			return check.value.some(a => a==part);
		default:
			throw new TypeError('Invalid format')
	}
}

function matchDate(date, entry) {
	if(!matchPart(date, entry, 'year')) return false;
	if(!matchPart(date, entry, 'month')) return false;
	if(!matchPart(date, entry, 'day')) return false;
	if(!matchPart(date, entry, 'dayOfWeek')) return false;
	if(!matchPart(date, entry, 'hour')) return false;
	return matchPart(date, entry, 'minute');
}

function add(time, fn) {
	let parts=time.split(/\s+/g);
	let timeObj={};
	timeObj.minute=parseTime(parts[0]);
	timeObj.hour=parseTime(parts[1]);
	timeObj.dayOfWeek=parseTime(parts[2]);
	timeObj.day=parseTime(parts[3]);
	timeObj.month=parseTime(parts[4]);
	timeObj.year=parseTime(parts[5]);
	timeObj.fn=fn;
	console.log(timeObj);
	crontab.push(timeObj);
}

setInterval(function() {
	let date=dates.dateToParts(new Date());
	console.log('date is', date);
	crontab.forEach(entry => {
		console.log('matching', entry.minute);
		if(matchDate(date, entry)) entry.fn();
	});
}, dates.oneMin);

module.exports=exports=add;

add('*/2	*	*	*	*	*	*', () => console.log('ok'));
add('*		*	*	*	*	*	*', () => console.log('ok2'));
add('57		*	*	*	*	*	*', () => console.log('ok3'));
add('57,58	*	*	*	*	*	*', () => console.log('ok4'));
