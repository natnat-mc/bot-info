const {dateToTime, datesToRange}=require('./dates');

/** ICalendar date parser
 * returns a Date for a given ICalendar date string
 */
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
		date=new Date(Date.UTC(time.year, time.month, time.day, time.hours, time.minutes, time.seconds, 0));
	} else {
		date=new Date(time.year, time.month, time.day, time.hours, time.minutes, time.seconds, 0);
	}
	return date;
}

/** Event class
 * represents a calendar event
 * for now, only VEVENT's with a duration are supported
 */
class Event {
	constructor() {
		this.start=null;
		this.end=null;
		this.name='[UNNAMED]';
		this.desc='[NO DESC]';
		this.loc=null;
	}
	
	/** short description
	 * returns a short description of the event
	 */
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
	
	equals(other) {
		if(other.constructor!=this.constructor) {
			return false;
		} else if(other.name!=this.name) {
			return false;
		} else if(other.desc!=this.desc) {
			return false;
		} else if(other.loc!=this.loc) {
			return false;
		} else if((!!other.start)!=(!!this.start)) {
			return false;
		} else if((!!other.end)!=(!!this.end)) {
			return false;
		} else if(this.start && this.start.getTime()!=other.start.getTime()) {
			return false;
		} else if(this.end && this.end.getTime()!=other.end.getTime()) {
			return false;
		} else {
			return true;
		}
	}
}

/** class ICalendar
 * holds ICalendar's, parses them, and operates on them
 */
class ICS {
	constructor() {
		this.events=[];
	}
	
	/** ICalendar parser
	 * parses an ICalendar string into an ICS object
	 */
	static parse(code) {
		const lines=code.split(/\r?\n/);
		let lineno=0;
		while(lines[lineno]!='BEGIN:VEVENT') {
			if(lines[lineno]===undefined) throw new Error("Encountered EOF before the first event");
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
	
	/** event getter
	 * returns all events between the bounds
	 */
	getForDate(begin, end) {
		if(begin instanceof Date) begin=begin.getTime();
		if(end instanceof Date) end=end.getTime();
		return this.events.filter(a => {
			if(!a.start) return false;
			let time=a.start.getTime();
			return time>=begin && time<=end;
		});
	}
	
	/** change finder
	 * finds everything that changed between two calendars
	 */
	static findChanges(oldCal, newCal) {
		let oldPos=0, newPos=0;
		let removed=[], added=[], modified=[], unchanged=[];
		let hasAdded=false, hasRemoved=false, hasModified=false;
		do {
			let oldEvt=oldCal.events[oldPos];
			let newEvt=newCal.events[newPos];
			if(oldEvt.equals(newEvt)) {
				unchanged.push(newEvt);
				oldPos++; newPos++;
			} else if(oldEvt.start.getTime()==newEvt.start.getTime()) {
				modified.push({
					before: oldEvt,
					after: newEvt
				});
				hasModified=true;
				oldPos++; newPos++;
			} else if(oldEvt.start.getTime()<newEvt.start.getTime()) {
				removed.push(oldEvt);
				hasRemoved=true;
				oldPos++;
			} else {
				added.push(newEvt);
				hasAdded=true;
				newPos++;
			}
		} while(oldPos<oldCal.events.length && newPos<newCal.events.length);
		for(; oldPos<oldCal.events.length; oldPos++) {
			removed.push(oldCal.events[oldPos]);
		}
		for(; newPos<newCal.events.length; newPos++) {
			added.push(newCal.events[newPos]);
		}
		return {
			unchanged: unchanged,
			modified: modified,
			added: added,
			removed: removed,
			hasModified: hasModified,
			hasAdded: hasAdded,
			hasRemoved: hasRemoved
		};
	}
}

ICS.Event=Event;

module.exports=exports=ICS;
