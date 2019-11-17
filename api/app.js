const express=require('express');
const config=require('./config');

const app=express();
app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.engine('ejs', require('ejs').renderFile);
app.set('views', 'views');

app.listen(config('webserver.port'), config('webserver.listenAddress'), () => {
	console.log("Started webserver on port "+config('webserver.port')+" (listening on "+config('webserver.listenAddress')+")");
});

return module.exports=exports=app;
