var express = require('express'),
	app = express();

app.use(express.static(__dirname + '/static'));



var googleMapsApiKey = 'AIzaSyBbz4bqUcqqO5jh2POeJ6PUQNcXuoHlUm4';
var darkSkyApiKey = 'b8847c3c2f6a04988a8958bb33d5734e';
var request = require('request');
var NodeCache = require('node-cache');


/*Caches locations by ID.*/
var locationCache = new NodeCache({stdTTL: 24*60*60, checkPeriod: 60*60});

/*Looks up locations by ID (reverse geocoding).*/
app.get('/dynamic/location/:id', function(req, res){
	locationCache.get(req.params.id, function(err, value){
		if(!err && value !== undefined){//cache hit
			res.send(value);
		} else {//cache miss
			var url = 'https://maps.googleapis.com/maps/api/geocode/json?place_id="' +
					req.params.id +
					'&key=' + googleMapsApiKey +
					'&language=en';
			request(url, function(error, response, body){
				if(error || response.statusCode !== 200 || body.results.length === 0) {
					//TODO error
				} else {
					res.send(body.results[0]);
					locationCache.put(req.params.id, body.results[0]);
				}
			});
		}
	});
});



/*Looks up locations by a user's search query.*/
app.get('/dynamic/geocoding/:query', function(req, res){
	var url = 'https://maps.googleapis.com/maps/api/geocode/json?address="' +
			encodeURIComponent(req.params.query) + '"'+
			'&key=' + googleMapsApiKey +
			'&language=en' +
			'&userIp=' + req.ip;
	request(url, function(error, response, body){
		if(error || response.statusCode !== 200) {
			//TODO error
		} else {
			var result = JSON.parse(body).results[0];
			res.send(result);
			locationCache.set(result.place_id, result);
		}
	});
});



/*Caches foreasts by 'lat,lon'*/
var forecastCache = new NodeCache({stdTTL: 20*60, checkPeriod: 5*60});

app.get('/dynamic/forecast/:lat,:lon', function(req, res){
	var key = req.params.lat + ',' + req.params.lon;
	forecastCache.get(key, function(err, value){
		if(!err && value !== undefined) {//cache hit
			res.send(value);
		} else {//cache miss
			var url = 'https://api.forecast.io/forecast/' + darkSkyApiKey + '/' +
					req.params.lat + ',' + req.params.lon
					+ '?units=us&exclude=minutely,alerts,flags';
			request(url, function(error, response, body){
				if(error || response.statusCode !== 200) {
					//TODO error
				} else {
					res.send(body);
					forecastCache.set(key, body);
				}
			});
		}
	});
});



/*Caches preforeasts ("forecasts" of the past week) by 'lat,lon'*/
var preforecastCache = new NodeCache({stdTTL: 24*60*60, checkPeriod: 60*60});

app.get('/dynamic/preforecast/:lat,:lon', function(req, res){
	var key = req.params.lat + ',' + req.params.lon;
	preforecastCache.get(key, function(err, value){
		if(!err && value !== undefined) {//cache hit
			res.send(value);
		} else {//cache miss
			var start = Date.now();
			start.setDate(start.getDate() - 7);
			var url = 'https://api.forecast.io/forecast/' + darkSkyApiKey + '/' +
					req.params.lat + ',' + req.params.lon +
					',' + start.getTime() +
					'?units=us&exclude=minutely,hourly,alerts,flags';
			request(url, function(error, response, body){
				if(error || response.statusCode !== 200) {
					//TODO error
				} else {
					res.send(body);
					preforecastCache.set(key, body);
				}
			});
		}
	});
});




var cacheReportPeriodMS = 5*60*1000;
function cacheReport() {
	var now = new Date();
	
	console.log('LOCATION CACHE REPORT at ' + now.toString());
	console.log(JSON.stringify(locationCache.getStats()));
	
	console.log('FORECAST CACHE REPORT at ' + now.toString());
	console.log(JSON.stringify(forecastCache.getStats()));
	
	console.log('');
	
	setTimeout(cacheReport, cacheReportPeriodMS);
};
setTimeout(cacheReport, cacheReportPeriodMS);




var port = 8888
app.listen(port);
console.log('Serving content on port ' + port);
