// setup module info
module.type='service';
module.desc="Serves a web UI";

// load the libraries
const express=require('express');
const expressWs=require('express-ws');
const ClientOAuth2=require('client-oauth2');
const store=require('./storage');

// create an Express.js web server and configure it
const app=express();
expressWs(app);
const router=express.Router();
app.engine('html', require('ejs').renderFile);
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded());

// treat "/" and "/bot-info" as one
app.use(router);
app.use('/bot-info', router);

// make it listen on the configured port
let server=app.listen(config('webui.internalPort'), () => {
	console.log('WebUI is listening on port '+config('webui.internalPort'));
});

// unload it with the module
module.unload=() => {
	server.close();
	delete shared.commands.webui;
};

// register the command
shared.commands.webui=(args, msg) => {
	msg.reply("**WebUI** available at "+config('webui.externalAddr'));
};
shared.commands.webui.usage=[];
shared.commands.webui.help={
	name: 'webui',
	desc: "Donne le lien vers l'interface Web",
	category: 'util',
	admin: false
};

// create a OAuth2 client
const OAuth=new ClientOAuth2({
	clientId: config('bot.clientId'),
	clientSecret: config('bot.clientSecret'),
	accessTokenUri: 'https://discordapp.com/api/oauth2/token',
	authorizationUri: 'https://discordapp.com/api/oauth2/authorize',
	redirectUri: config('webui.externalAddr')+'/login/callback',
	scopes: config('webui.scopes')
});

// the user's data
const users={}, tokens=[];

// setup the data store
store.ensureStore('webui.oauth').then(created => {
	if(created) {
		return store.set('webui.oauth', 'users', {}).then(() => {
			return store.set('webui.oauth', 'tokens', []);
		});
	} else {
		//TODO retrieve tokens and users
	}
}).catch(console.error);

// setup the routes
router.get('/login', (req, res) => {
	const uri=OAuth.code.getUri();
	console.log(uri);
	res.redirect(uri);
});
router.get('/login/callback', (req, res) => {
	OAuth.code.getToken(req.originalUrl).then(token => {
		console.log(token);
		return token.refresh();
	}).then(token => {
		console.log(token);
	}).then(token => {
		//TODO write the token somewhere
		//TODO push a cookie
		//TODO redirect somewhere useful
	}).catch(err => {
		console.error(err);
		res.status(500).end('Something went wrong');
	});
});

// function to automatically add a view with some context
function addView(path, file, page) {
	router.get(path, (req, res) => {
		res.render(file, {
			req,
			config,
			shared,
			page
		});
	});
}

addView('/', 'index.ejs', {
	name: "Main page"
});
