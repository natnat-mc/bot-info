const fs=require('fs');
const util=require('util');
const vm=require('vm');
const config=require('./config');
const shared=require('./shared');

const readFile=util.promisify(fs.readFile);

class Loader {
	constructor(path) {
		this.path=fs.realpathSync(path);
		this.loaded={};
		this.queue=[];
		this.busy=false;
	}
	
	/** available modules list
	 * returns a list of all modules that can be loaded
	 */
	get available() {
		return fs.readdirSync(this.path).map(function(name) {
			if(name.endsWith('.js')) {
				return name.substr(0, name.length-3);
			} else {
				return name;
			}
		});
	}
	
	/** loaded modules list
	 * returns a list of all loaded modules
	 */
	get list() {
		let list=[];
		for(let k in this.loaded) {
			list.push(this.loaded[k]);
		}
		return list;
	}
	
	/** module loader
	 * loads a module given its name as a Promise
	 * doesn't reload any loaded module
	 */
	load(name) {
		let file=this.path+'/'+name;
		let filename=file;
		let self=this;
		if(this.loaded[file]) {
			return Promise.resolve(this.loaded[file]);
		}
		if(this.busy) {
			return new Promise(function(ok, nok) {
				self.queue.push(function() {
					ok(self.load(name));
				});
			});
		}
		this.busy=true;
		return readFile(filename, {encoding: 'utf8'}).catch(function() {
			filename=file+'.js';
			return readFile(filename, {encoding: 'utf8'});
		}).catch(function() {
			filename=file+'/index.js';
			return readFile(filename, {encoding: 'utf8'});
		}).then(function(code) {
			const context=vm.createContext({}, {
				name: name,
				displayErrors: true
			});
			
			context.shared=shared;
			context.config=config;
			
			context.console=console;
			context.require=require;
			context.Buffer=Buffer;
			context.clearImmediate=clearImmediate;
			context.clearInterval=clearInterval;
			context.clearTimeout=clearTimeout;
			context.process=process;
			context.setImmediate=setImmediate;
			context.setInterval=setInterval;
			context.setTimeout=setTimeout;
			
			context.module={}
			context.module.name=name;
			context.module.exports={};
			context.module.loader=self;
			context.module.loadTime=new Date();
			
			context.exports=context.module.exports;
			context.loader=context.module.loader;
			context.global=context;
			
			vm.runInContext(code, context, {
				filename: filename,
				displayErrors: true
			});
			
			self.loaded[file]=context.module;
			self.busy=false;
			let next=self.queue.shift();
			if(next) next();
			return context.module;
		}).catch(function(e) {
			self.busy=false;
			let next=self.queue.shift();
			if(next) next();
			throw e;
		});
	}
	
	/** module require
	 * loads any number of modules as a Promise
	 * doesn't reload any module
	 */
	require(names) {
		const self=this;
		if(names instanceof Array) {
			return Promise.all(names.map(function(name) {
				return self.load(name);
			})).then(a => a.map(b => b.exports));
		} else if(typeof names=='string') {
			return self.load(names).then(a => a.exports);
		} else if(typeof names=='object') {
			let list=[]
			let prop=[];
			for(let k in names) {
				if(names.hasOwnProperty(k)) {
					list.push(names[k]);
					prop.push(k);
				}
			}
			return this.require(list).then(function(list) {
				let obj={};
				for(let i=0; i<list.length; i++) {
					obj[prop[i]]=list[i];
				}
				return obj;
			});
		} else {
			return Promise.reject(new Error('Ilegal argument to Loader.require'));
		}
	}
	
	/** module unloader
	 * unloads a module
	 */
	unload(name) {
		if(this.busy) {
			const self=this;
			return new Promise(function(ok, nok) {
				self.queue.push(function() {
					ok(self.unload(name));
				});
			});
		}
		let module=this.loaded[this.path+'/'+name];
		if(module.unload) {
			try {
				module.unload();
			} catch(e) {
				console.error('Error unloading module', name, e);
			}
		}
		return Promise.resolve(delete this.loaded[this.path+'/'+name]);
	}
	
	/** module reloader
	 * reloads a module
	 */
	reload(name) {
		return this.unload(name).then(this.load.bind(this, name));
	}
	
	/** module mass reloader
	 * reloads all modules sequentially
	 */
	reloadAll() {
		const self=this;
		return Promise.all(this.list.map(function(module) {
			return self.reload(module.name);
		}));
	}
	
	/** module mass loader
	 * loads all available modules
	 */
	loadAll() {
		return this.require(this.available);
	}
}

module.exports=exports=Loader;
