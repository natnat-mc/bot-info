const fs=require('fs');
const request=require('request');
const ICS=require('./ics');
const dates=require('./dates');
const config=require('./config');

const EE=require('events');
class Calendar extends EE {
	constructor(url) {
		super();
		this.url=url;
		this.ics=null;
		setInterval(this.update.bind(this), config('calendar.updateInterval'));
	}
	update() {
		request(this.url, (err, res, body) => {
			if(err){
				this.emit('error', err);
				return false;
			}
			if(res.statusCode!=200) {
				this.emit('error', new Error('Got a non-200 return code: '+res.statusCode));
				return false;
			}
			let old=this.ics;
			try {
				this.ics=ICS.parse(body);
			} catch(e) {
				this.emit('error', e);
				return false;
			}
			this.emit('update', this.ics);
		});
	}
	getForDate(start, end) {
		return this.ics.getForDate(start, end);
	}
	getForDay(day) {
		let today=day?new Date(day.getTime()):new Date();
		today.setUTCHours(0, 0, 0, 0);
		let tomorrow=new Date(today.getTime()+dates.oneDay);
		return this.ics.getForDate(today, tomorrow);
	}
	getForWeek(day) {
		let today=day?new Date(day.getTime()):new Date();
		today.setUTCHours(0, 0, 0, 0);
		while(today.getDay()) today.setTime(today.getTime()-dates.oneDay);
		let nextWeek=new Date(today.getTime()+dates.oneWeek);
		return this.ics.getForDate(today, nextWeek);
	}
}

module.exports=exports=Calendar;
