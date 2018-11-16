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

exports.dateToTime=dateToTime;
exports.dateToParts=dateToParts;
exports.datesToRange=datesToRange;

exports.oneSec=oneSec;
exports.oneMin=oneMin;
exports.oneHr=oneHr;
exports.oneDay=oneDay;
exports.oneWeek=oneWeek;
exports.UTCOffset=UTCOffset;
