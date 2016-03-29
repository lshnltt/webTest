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

function getWheatherData(){
	return {
		locations:[
			{
				name: 'Portland',
				forecastUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				iconUrl: 'http://www.wunderground.com/US/OR/Portland.html',
				weather: 'Overcast',
				temp: '54.1 F (12.3 C)'
			},
			{
				name: 'Bend',
				forecastUrl: 'http://www.wunderground.com/US/OR/Bend.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/partlycloudy.gif',
				weather: 'Partly Cloudy',
				temp: '55.0 F (12.8 C)',
			},
			{
				name: 'Manzanita',
				forecastUrl: 'http://www.wunderground.com/US/OR/Manzanita.html',
				iconUrl: 'http://icons-ak.wxug.com/i/c/k/rain.gif',
				weather: 'Light Rain',
				temp: '55.0 F (12.8 C)',
			}
		]
	};
};

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');

app.use(function(req, res, next){
	res.locals.showTests = app.get('env') !== 'production' && 
						   req.query.test === '1';
	console.log(res.locals.showTests);
	next();
});

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

app.get('/headers', function(req, res){
	res.set('Content-Type','text/plain');
	var s = '';
	for(var name in req.headers) s += name + ': ' + req.headers[name] + '\n';
	res.send(s);
});

app.use(function(req, res, next){
	if(!res.locals.particals)res.locals.particals = {};
	res.locals.particals.weather = getWheatherData();
	console.log(res.locals.particals.weather);
	next();
});

app.get('/', function(req, res){
	res.render('home');
});

app.get('/about', function(req, res){
	var randomFortune = fortune.getFortune();
	res.render('about',{
					fortune: randomFortune,
					pageTestScript: '/qa/tests-about.js'
				});
});

app.get('/tours/hood-river', function(req, res){
	res.render('tours/hood-river');
});


app.get('/tours/request-group-rate', function(req, res){
	res.render('tours/request-group-rate');
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
	console.log('server start');
});
