const fs=require('fs');
const request=require('request');
const ICS=require('./ics');
const dates=require('./dates');
const config=require('./config');
const store=require('./storage');

const EE=require('events');
class Calendar extends EE {
	constructor(url, name) {
		super();
		
		this.url=url;
		this.name=name;
		
		this.ics=null;
		this.old=null;
		
		store.ensureStore('calendar.'+name).then((created) => {
			if(!created) {
				return store.get('calendar.'+name, 'list').then(list => {
					this.ics=new ICS();
					this.ics.events=list.map(obj => {
						let evt=new ICS.Event();
						evt.name=obj.name;
						if(obj.desc) {
							evt.desc=obj.desc;
						}
						if(obj.loc) {
							evt.loc=obj.loc;
						}
						if(obj.start) {
							evt.start=new Date(obj.start);
						}
						if(obj.end) {
							evt.end=new Date(obj.end);
						}
						return evt;
					});
				});
			}
		}).then(() => {
			this.update();
		});
		
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
			this.old=this.ics;
			try {
				this.ics=ICS.parse(body);
			} catch(e) {
				this.emit('error', e);
				return false;
			}
			this.emit('update', this.ics);
			this.persist();
			this.once('persisted', this.checkForEdits.bind(this));
		});
	}
	
	persist() {
		if(!this.ics) {
			return false;
		}
		store.set('calendar.'+this.name, 'time', Date.now()).then(() => {
			return store.set('calendar.'+this.name, 'list', this.ics.events);
		}).then(() => {
			return this.emit('persisted');
		}).catch(e => {
			return this.emit('error', e);
		});
	}
	
	checkForEdits() {
		if(!(this.ics && this.old)) {
			return false;
		}
		let diff=ICS.findChanges(this.old, this.ics);
		let hasChanged=false;
		if(diff.hasAdded) {
			this.emit('added', diff.added);
			hasChanged=true;
		}
		if(diff.hasRemoved) {
			this.emit('removed', diff.removed);
			hasChanged=true;
		}
		if(diff.hasModified) {
			this.emit('modified', diff.modified);
			hasChanged=true;
		}
		if(hasChanged) {
			this.emit('changed', diff);
		}
	}
	
	/** event getter, time mode
	 * returns the first event happening at the given time
	 */
	getForTime(time) {
		return this.ics.events.find(evt => evt.start.getTime()<=time && evt.end.getTime()>=time);
	}
	
	/** event getter, range mode
	 * returns every event between the given bounds
	 */
	getForDate(start, end) {
		return this.ics.getForDate(start, end);
	}
	
	/** event getter, day mode
	 * returns every event during a given day
	 */
	getForDay(day) {
		let today=day?new Date(day.getTime()):new Date();
		today.setUTCHours(0, 0, 0, 0);
		let tomorrow=new Date(today.getTime()+dates.oneDay);
		return this.ics.getForDate(today, tomorrow);
	}
	
	/** event getter, week mode
	 * returns every event during a given week
	 * a week starts on Sunday
	 */
	getForWeek(day) {
		let today=day?new Date(day.getTime()):new Date();
		today.setUTCHours(0, 0, 0, 0);
		while(today.getDay()) today.setTime(today.getTime()-dates.oneDay);
		let nextWeek=new Date(today.getTime()+dates.oneWeek);
		return this.ics.getForDate(today, nextWeek);
	}
}

module.exports=exports=Calendar;
