var app = angular.module('SkyCast', ['ngCookies', 'ngResource', 'angular-chartist']);


app.controller('MainController', ['$scope', '$cookies', '$resource',
	function($scope, $cookies, $resource){
	
	var recentLocationsCookieKey = 'recentLocations';
	
	
	/*JSON object describing a location, like example_google.json*/
	$scope.currentLocation = {};
	/*The location the user is searching for.*/
	$scope.searchLocation = '';
	/*The user's recent locations.*/
	$scope.recentLocations = [];
	/*JSON object describing weather forecast for current location, like example_darksky.json*/
	$scope.forecast = undefined;
	/*Like forecast, but for the past week.*/
	$scope.preforecast = undefined;
	
	
	
	
	
	/*Recursively looks up all provided location IDs and puts them into
	the scope's recent-locations array.*/
	function recursiveLookupRecentIds(ids, index) {
		if(ids === undefined) {
			return;
		}
		
		//if we're done
		if(index === ids.length) {
			$scope.recentLocations.sort(locationCompare);
		} else {
			//look up the next ID
			var res = $resource('/dynamic/location/' + ids[index]);
			var next = res.get(function(){
				$scope.recentLocations.push(next);
				recursiveLookupRecentIds(ids, index + 1);
			}, function(){
				//TODO on fail
			});
		}
	};
	
	
	
	/*Looks up whatever location the user has typed in the search box.*/
	$scope.doSearchLocation = function() {
		var res = $resource('/dynamic/geocoding/:query', {query: $scope.searchLocation});
		$scope.currentLocation = res.get(function(){
			$scope.recentLocations.push($scope.currentLocation);
			$scope.recentLocations.sort(locationCompare);
			$cookies.putObject(recentLocationsCookieKey, locationIds($scope.recentLocations));
			doGetForecast();
		}, function(){
			//TODO on fail
		});
	};
	
	
	/*Use a specific location (i.e. one from the recent locations list).*/
	$scope.doUseLocation = function(location) {
		$scope.currentLocation = location;
		doGetForecast();
	};
	
	
	function doGetForecast() {
		var res = $resource('/dynamic/forecast/' + $scope.currentLocation.geometry.location.lat +
				',' + $scope.currentLocation.geometry.location.lng);
		$scope.forecast = res.get(function(){
			//nothing to do
		}, function(){
			//TODO on fail
		});
	};
	
	
	/*Removes the current location from the list of recent ones.*/
	$scope.doForgetCurrentLocation = function() {
		var index = -1;
		for(var c = 0; c < $scope.recentLocations.length; c++) {
			if($scope.recentLocations[c].place_id === $scope.currentLocation.place_id) {
				index = c;
				break;
			}
		}
		if(index !== -1) {
			$scope.recentLocations.splice(index, 1);
			$cookies.putObject(recentLocationsCookieKey, locationIds($scope.recentLocations));
		}
	};
	
	
	
	//HELPER FUNCTIONS
	
	/*For sorting locations.*/
	function locationCompare(a, b){
		return a.formatted_address.localeCompare(b.formatted_address);
	};
	
	/*Creates an array of location ids from an array of locations.*/
	function locationIds(arr) {
		var out = [];
		for(var c = 0; c < arr.length; c++) {
			out.push(arr[c].place_id);
		}
		return out;
	};
	
	/**Returns the argument unless it is undefined, in which case this returns "precipitation".*/
	$scope.precipType = function(str) {
		if(str === undefined) {
			return "precipitation";
		}
		return str;
	}
	
	
	var weatherIconMap = {
		'clear-day': 'day-sunny',
		'clear-night': 'night-clear',
		rain: 'rain',
		snow: 'snow',
		sleet: 'sleet',
		wind: 'strong-wind',
		fog: 'fog',
		cloudy: 'cloudy',
		'partly-cloudy-day': 'day-cloudy',
		'partly-cloudy-night': 'night-cloudy'
	};
	/*Takes an icon string from the Dark Sky Forecast API
	and converts it into one of our weather icon classes.*/
	$scope.getWeatherIconClass = function(icon) {
		var result = weatherIconMap[icon];
		if(result === undefined) {
			result = 'alien';//fun
		}
		return 'wi-' + result;
	}
	
	
	
	//INITIALIZATION
	
	recursiveLookupRecentIds($cookies.getObject(recentLocationsCookieKey), 0);
}]);
