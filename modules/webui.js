// setup module info
module.type='service';
module.desc="Serves a web UI";

// load the libraries
const express=require('express');
const expressWs=require('express-ws');

// create an Express.js web server and configure it
const app=express();
expressWs(app);
app.engine('html', require('ejs').renderFile);
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded());

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

// function to automatically add a view with some context
function addView(path, file, page) {
	app.get(path, (req, res) => {
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
