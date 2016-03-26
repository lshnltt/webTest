var express = require('express');
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout: 'main'});
var fortune = require('./fortune.js');
var tours = [
	{
		id:0,
		name:'Hood River',
		price:99.99
	},{
		id:1,
		name:'Oregon Coast',
		price:149.95
	}
];
var products = [
	{
		id:0,
		price:0.5,
		name:'辣条'
	},{
		id:1,
		price:4,
		name:'红牛'
	}
];

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000);

app.get('/api/tours', function(req, res){
	var toursXml = '<?xml version="1.0"?><tours>' +
		tours.map(function(p){
			return '<tour price="'+ p.price +
					'" id="' + p.id + '">' + p.name +
					'</tour>';
		}).join('') + '</tours>';
	var toursText = tours.map(function(p){
		return p.id + ':' + p.name + '( ' + p.price + ' )';
	}).join('\n');
	res.format(
		{
			'application/xml': function(){
				res.type('application/xml');
				res.send(toursXml);
			}
		},{
			'application/json': function(){
				res.json(tours);
			}
		},{
			'text/xml': function(){
				res.type('text/xml');
				res.send(toursXml);
			}
		},{
			'text/plain': function(){
				res.type('text/plain');
				res.send(toursText);
			}
		}
	)
});

app.put('/api/tour/:id', function(req, res){
	var p = tours.some(function(p){ return p.id == req.params.id });
	if( p ) {
		if( req.query.name ) p.name = req.query.name;
		if( req.query.price ) p.price = req.query.price;
		res.json({success: true});
	} else {
		res.json({error: 'No such tour exists.'});
	}
});

app.get('/headers', function(req,res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
});

app.get('/', function(req, res){
	res.render('home');
});

app.get('/about', function(req, res){
	var randomFortune = fortune.getFortune();
	res.render('about', {fortune:randomFortune});
});

app.use(function(req, res, next){
	res.status(404);
	res.send('404 - not found');
});

app.use(function(err, req, res, next){
	console.error(err.stack);
	res.status(500);
	res.send('500 - server error');
});

app.listen(app.get('port'), function(){
	console.log('server to start');
});
