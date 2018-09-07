const {dateToTime, datesToRange}=require('./dates');

function parseDate(str) {
	let time={
		year: +str.substr(0, 4),
		month: +str.substr(4, 2)-1,
		day: +str.substr(6, 2),
		hours: 0,
		minutes: 0,
		seconds: 0
	}
	if(str.substr(8, 1)=='T') {
		time.hours=+str.substr(9, 2);
		time.minutes=+str.substr(11, 2);
		time.seconds=+str.substr(13, 2);
	}
	let date;
	if(str.endsWith('Z')) {
		date=new Date(Date.UTC(time.year, time.month, time.day, time.hours, time.minutes, time.seconds));
	} else {
		date=new Date(time.year, time.month, time.day, time.hours, time.minutes, time.seconds);
	}
	return date;
}

class Event {
	constructor() {
		this.start=null;
		this.end=null;
		this.name='[UNNAMED]';
		this.desc='[NO DESC]';
		this.loc=null;
	}

	get short() {
		let time='NO DATE';
		if(this.start&&this.end) {
			time=datesToRange(this.start, this.end);
		} else if(this.start) {
			time=dateToTime(this.start);
			if(this.end) time+='-'+dateToTime(this.end);
		}
		let short='['+time+'] '+this.name;
		if(this.loc) short+=' @ '+this.loc;
		return short;
	}
}

class ICS {
	constructor() {
		this.events=[];
	}
	static parse(code) {
		const lines=code.split(/\r?\n/);
		let lineno=0;
		while(lines[lineno]!='BEGIN:VEVENT') {
			lineno++;
		}


		const cal=new ICS();
		let current=null;
		for(; lineno<lines.length; lineno++) {
			let line=lines[lineno];
			let [cmd, arg]=line.split(':', 2);
			switch(cmd) {
				case 'BEGIN':
					if(current) throw new Error('Malformed ICS file: opening two VEVENTS.');
					current=new Event();
					break;
				case 'END':
					if(arg=='VCALENDAR') {
						cal.events.sort((a, b) => a.start.getTime()-b.start.getTime());
						return cal;
					}
					if(!current) throw new Error('Malformed ICS file: closing no VEVENT');
					cal.events.push(current);
					current=null;
					break;
				case 'DTSTART':
					if(!current) throw new Error('Malformed ICS file: setting property of null');
					current.start=parseDate(arg);
					break;
				case 'DTEND':
					if(!current) throw new Error('Malformed ICS file: setting property of null');
					current.end=parseDate(arg);
					break;
				case 'SUMMARY':
					if(!current) throw new Error('Malformed ICS file: setting property of null');
					current.name=arg;
					break;
				case 'DESCRIPTION':
					if(!current) throw new Error('Malformed ICS file: setting property of null');
					current.desc=arg;
					break;
				case 'LOCATION':
					if(!current) throw new Error('Malformed ICS file: setting property of null');
					current.loc=arg;
					break;
			}
		}
	}

	getForDate(begin, end) {
		if(begin instanceof Date) begin=begin.getTime();
		if(end instanceof Date) end=end.getTime();
		return this.events.filter(a => {
			if(!a.start) return false;
			let time=a.start.getTime();
			return time>=begin && time<=end;
		});
	}
}

ICS.Event=Event;

module.exports=exports=ICS;
