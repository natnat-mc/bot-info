const app=require('./app');
const storage=require('./storage');
const cron=require('./cron');

const router=require('express').Router();
const EE=require('events');

(async () => {
	if(!shared.kfet) {
		shared.kfet={};
	}
	
	/** global KFet emitter
	 * ok(id): triggered when an order becomes ready
	 * ko(id): triggered when an order has a problem
	 * waiting(id): triggered when an order goes back to waiting
	 * clear: triggered when all orders are cleared
	 */
	if(!shared.kfet.emitter) {
		shared.kfet.emitter=new EE();
	}
	
	/** global KFet dict
	 * associates state to command id
	 * 'ok': order is ready
	 * 'ko': order has a problem
	 * 'waiting'||undefined: order is being prepared
	 */
	await storage.ensureStore('kfet');
	shared.kfet.avail=Object.create(null);
	try {
		let avail=await storage.get('kfet', 'avail');
		for(let k in avail) {
			shared.kfet.avail[k]=avail[k];
		}
	} catch(e) {
		await storage.set('kfet', 'avail', {});
	}
	
	/** KFet automatic reset at 15h
	 */
	const cronID=cron('0	15	0	*	*', async () => {
		shared.kfet.avail=Object.create(null);
		await storage.set('kfet', 'avail', {});
		shared.kfet.emitter.emit('clear');
	});
	
	/** KFet web router
	 * handles the web API and UI for the kfet
	 */
	function authenticate(req, res, fail) {
		let ok=config("kfet.passwords").includes(req.query.password || req.get('Password'));
		if(!ok && fail) {
			res.status(401).json({
				ok: false,
				err: "Invalid password"
			});
		}
		return ok;
	}
	function validateBody(req, res) {
		for(let k in req.body) {
			if(isNaN(+k) || +k<1) {
				res.status(400).json({
					ok: false,
					err: "Invaild key: "+k
				});
				return false;
			}
			if(req.body[k]!='ok' && req.body[k]!='ko' && req.body[k]!='waiting') {
				res.status(400).json({
					ok: false,
					err: "Invalid value: "+req.body[k]
				});
				return false;
			}
		}
		return true;
	}
	router.get('/orders', async (req, res) => {
		res.json(shared.kfet.avail);
	});
	router.put('/orders', async (req, res) => {
		if(!authenticate(req, res, true) || !validateBody(req, res)) {
			return;
		}
		for(let k in req.body) {
			let o=shared.kfet.avail[k]||'waiting';
			let n=req.body[k];
			if(o!=n) {
				shared.kfet.emitter.emit(n, +k);
			}
			shared.kfet.avail[k]=n;
		}
		for(let k in shared.kfet.avail) {
			if(!(k in req.body)) {
				shared.kfet.emitter.emit('waiting', +k);
				delete shared.kfet.avail[k];
			}
		}
		await storage.set('kfet', 'avail', shared.kfet.avail);
		await storage.writeStore('kfet');
		return res.json({
			ok: true
		});
	});
	router.post('/orders', async (req, res) => {
		if(!authenticate(req, res, true) || !validateBody(req, res)) {
			return;
		}
		for(let k in req.body) {
			let o=shared.kfet.avail[k]||'waiting';
			let n=req.body[k];
			if(o!=n) {
				shared.kfet.emitter.emit(n, +k);
			}
			shared.kfet.avail[k]=n;
		}
		await storage.set('kfet', 'avail', shared.kfet.avail);
		await storage.writeStore('kfet');
		return res.json({
			ok: true
		});
	});
	router.get('/orders/:n', async (req, res) => {
		if(isNaN(+req.params.n) || +req.params.n<1) return res.status(400).json({
			ok: false,
			err: "Invalid key: "+req.params.n
		});
		return res.json({status: shared.kfet.avail[req.params.n] || 'waiting'});
	});
	router.put('/orders/:n', async (req, res) => {
		if(!authenticate(req, res, true)) {
			return;
		}
		if(isNaN(+req.params.n) || +req.params.n<1) return res.status(400).json({
			ok: false,
			err: "Invalid key: "+req.params.n
		});
		if(req.body.status!='ok' && req.body.status!='ko' && req.body.status!='waiting') return res.status(400).json({
			ok: false,
			err: "Invalid value: "+req.body.status
		});
		if(shared.kfet.avail[req.params.n]!=req.body.status) {
			shared.kfet.emitter.emit(req.body.status, +req.params.n);
		}
		shared.kfet.avail[req.params.n]=req.body.status;
		await storage.set('kfet', 'avail', shared.kfet.avail);
		await storage.writeStore('kfet');
		return res.json({ok: true});
	});
	router.all('/verifyPassword', (req, res) => {
		return res.json({ok: authenticate(req, res, false)});
	});
	router.get('/', (req, res) => {
		res.render('kfet_template.ejs', {
			page: 'kfet_orders',
			title: "Commandes",
			showControls: true,
			data: {
				orders: shared.kfet.avail
			}
		});
	});
	router.get('/login', (req, res) => {
		res.render('kfet_template.ejs', {
			page: 'kfet_login',
			title: 'Login',
			showControls: false,
			data: {}
		});
	});
	app.use('/kfet', router);
	
	/** internal API
	 */
	module.exports.get=function get(id) {
		return shared.kfet.avail[id+''] || 'waiting';
	};
	module.exports.list=function list() {
		return Object.keys(shared.kfet.avail).map(a => ''+a);
	};
	
	module.type='service'
	module.unload=async () => {
		await storage.writeStore('kfet', true);
		cron.remove(cronID);
	};
})();
