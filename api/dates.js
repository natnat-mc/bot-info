const config=require('./config');

const oneSec=1000;
const oneMin=oneSec*60;
const oneHr=oneMin*60;
const oneDay=oneHr*24;
const oneWeek=oneDay*7;

const UTCOffset=config('region.UTCOffset')*oneHr;

const dateFormater=new Intl.DateTimeFormat(config('region.locale'), {
	timeZone: config('region.timezone'),
	hour12: false,
	hour: '2-digit',
	minute: '2-digit',
	second: '2-digit',
	day: '2-digit',
	month: '2-digit',
	year: 'numeric'
});
const dateReader=new Intl.DateTimeFormat(config('region.locale'), {
	timeZone: config('region.timezone'),
	hour12: false,
	hour: 'numeric',
	minute: 'numeric',
	second: 'numeric',
	day: 'numeric',
	month: 'numeric',
	year: 'numeric'
});

/** date to string converter
 * returns a string in the format 'DD/MM/AAAA hh:mm:ss'
 */
function dateToTime(date) {
	let parts=dateFormater.formatToParts(date);
	let keys={};
	for(i=0; i<parts.length; i++) keys[parts[i].type]=parts[i].value;
	return keys.day+'/'+keys.month+'/'+keys.year+' '+keys.hour+':'+keys.minute+':'+keys.second;
}

/** date to object converter
 * returns an object containing all the useful components of a date
 */
function dateToParts(date) {
	let parts=dateReader.formatToParts(date);
	let keys={};
	for(i=0; i<parts.length; i++) keys[parts[i].type]=parts[i].value;
	keys.dayOfWeek=new Date(keys.year, keys.month-1, keys.day).getDay();
	return keys;
}

/** date to object converter - 2 digits
 * returns an object containing all the useful components of a date, on 2 digits
 */
function dateToParts2(date) {
	let parts=dateFormater.formatToParts(date);
	let keys={};
	for(i=0; i<parts.length; i++) keys[parts[i].type]=parts[i].value;
	keys.dayOfWeek=new Date(keys.year, keys.month-1, keys.day).getDay();
	return keys;
}

/** dates to range converter
 * returns a range in the format 'DD/MM/AAAA hh:mm:ss -> hh:mm:ss'
 *  or 'DD/MM/AAAA hh:mm:ss -> DD/MM/AAAA hh:mm:ss'
 *  depending on context
 */
function datesToRange(a, b) {
	a=dateToParts(a);
	b=dateToParts(b);
	if(a.day==b.day&&a.month==b.month&&a.year==b.year) {
		return a.day+'/'+a.month+'/'+a.year+' '+a.hour+':'+a.minute+':'+a.second+' -> '+b.hour+':'+b.minute+':'+b.second;
	} else {
		return dateToTime(a)+' -> '+dateToTime(b);
	}
}

/** date parser
 * returns a date from a string in `[YYYY-]MM-DD[ hh:mm[:ss]]`, `DD/MM[/[YY]YY][ hh:mm[:ss]]` or `<+|->n<m|h|D|W|M>` format
 */
function dateParse(str) {
	let iso=str.match(/^(?:(\d{4})-)?(\d{1,2})-(\d{1,2})(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
	if(iso) {
		let d=new Date();
		for(let i=0; i<2; i++) { // weird bugs if we only do it once
			if(iso[1]!==undefined) d.setFullYear(+iso[1]);
			d.setMonth((+iso[2])-1);
			d.setDate(+iso[3]);
			if(iso[4]!==undefined) {
				d.setHours(+iso[4]);
				d.setMinutes(+iso[5]);
				if(iso[6]!==undefined) d.setSeconds(+iso[6]);
			}
		}
		return d;
	}
	let natural=str.match(/^(\d{1,2})\/(\d{1,2})(?:\/((?:\d{2})?\d{2}))?(?:\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/);
	if(natural) {
		let d=new Date();
		for(let i=0; i<2; i++) { // weird bugs if we only do it once
			d.setDate(+natural[1]);
			d.setMonth((+natural[2])-1);
			if(natural[3]!==undefined) {
				if((+natural[3])>=100) d.setFullYear(+natural[3]);
				else d.setFullYear(d.getFullYear()/100+''+natural[3]);
			}
			if(natural[4]!==undefined) {
				d.setHours(+natural[4]);
				d.setMinutes(+natural[5]);
				if(natural[6]!==undefined) d.setSeconds(+natural[5]);
			}
		}
		return d;
	}
	let relative=str.match(/^([+-])(\d+)([mhdDwWM])/);
	if(relative) {
		let d=new Date();

		let sign=relative[1]=='+'?1:-1;
		let magnitude=+relative[2];
		let unit=relative[3];

		if(unit=='M') {
			d.setMonth(d.getMonth()+sign*magnitude);
			return d;
		}

		let multiplier;
		switch(unit) {
			case 'm':
				multiplier=oneMinute;
				break;
			case 'h':
				multiplier=oneHr;
				break;
			case 'D': case 'd':
				multiplier=oneDay;
				break;
			case 'W': case 'w':
				multiplier=oneWeek;
				break;
		}
		d.setTime(d.getTime()+sign*multiplier*magnitude);
		return d;
	}
}


exports.dateToTime=dateToTime;
exports.dateToParts=dateToParts;
exports.dateToParts2=dateToParts2;
exports.datesToRange=datesToRange;
exports.dateParse=dateParse;

exports.oneSec=oneSec;
exports.oneMin=oneMin;
exports.oneHr=oneHr;
exports.oneDay=oneDay;
exports.oneWeek=oneWeek;
exports.UTCOffset=UTCOffset;
