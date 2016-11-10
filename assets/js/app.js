var app = angular.module('myApp', ['ngRoute', 'ngAnimate']);

app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){

	//ChartJsProvider.setOptions({ chartColors: myChartColors });
	$locationProvider.html5Mode(true);
	$routeProvider
   .when('/', {
    templateUrl: 'views/home.html',
    controller: 'appController'
  })
  .when('/1', {
   templateUrl: 'views/left-sidebar.html',
   controller: 'appController'
  })
  .when('/2', {
   templateUrl: 'views/right-sidebar.html',
   controller: 'appController'
  })
  .when('/3', {
   templateUrl: 'views/two-sidebar.html',
   controller: 'appController'
  })
  .when('/4', {
   templateUrl: 'views/no-sidebar.html',
   controller: 'appController'
  })
  .otherwise({
  	redirectTo: '/'
  });
}]);

app.controller("appController", ['$scope', 'getPicOfTheDay', 'getSounds', 'getEpic', 'getMars', 'getImagery', 'getCoordinates', 'geolocationSvc', function($scope, getPicOfTheDay, getSounds, getEpic, getMars, getImagery, getCoordinates, geolocationSvc) {
  $scope.pageTitle = "Picture of the Day";
	$scope.headerTitle = "Jose DeLavalle";
	$scope.defaultSearch = "New York";
	$scope.thisDate = "2016-10-08";
	$scope.rotate = true;
	$scope.rotateIcon = function() {
			$scope.rotate = !$scope.rotate;

	};

  getPicOfTheDay.get($scope.thisDate).then(function (msg) {
      $scope.data = msg.data;
      console.log($scope.data);
  });


  getSounds.get().then(function (msg) {
      $scope.soundData = msg.data.results;
      console.log($scope.soundData);
      // $scope.audio = [];
      // for (i = 0; i < $scope.soundData.length; i++) {
      //   $scope.audio[i] = new Audio();
      //   $scope.audio[i].src = $scope.soundData[i].stream_url;
      // }
  });
  getEpic.get().then(function (msg) {
      $scope.epic = msg.data;
      console.log($scope.epic);
  });



  getMars.get().then(function (msg) {
      $scope.mars = msg.data.photos;
      console.log($scope.mars);
  });

	var lon = "100.75";
	var lat = "2.5";




	$scope.goGetCoordinates = function (loc) {
		$scope.imagery = {date: "Searching"};
		getCoordinates.get(loc).then(function (msg) {
				console.log(msg);
				$scope.coordinates = msg.data.results[0].geometry.location;
	      console.log($scope.coordinates);
				getImagery.get($scope.coordinates.lat, $scope.coordinates.lng, $scope.thisDate).then(function (msg) {
			      $scope.imagery = msg.data;
			      console.log($scope.imagery);
			  });
	  });
	};

	$scope.getUserLocation = function captureUserLocation() {
		$scope.imagery = {date: "Searching"};
    geolocationSvc.getCurrentPosition().then(function (onUserLocationFound) {
			console.log(onUserLocationFound);
			$scope.coordinates = {lat: onUserLocationFound.coords.latitude, lng: onUserLocationFound.coords.longitude};

			getImagery.get($scope.coordinates.lat, $scope.coordinates.lng, '2016-01-01').then(function (msg) {
					$scope.imagery = msg.data;
					// console.log($scope.imagery);
			},
				function (msg) {
						$scope.imagery = {date: msg};
			});
		},
			function (msg) {
				console.log(msg.message);
				$scope.imagery = {date: msg.message};
		});
	};

}]);

app.factory('getPicOfTheDay', function ($http) {
    return {
        get: function (thisDate) {
            return $http.get('https://api.nasa.gov/planetary/apod?date='+thisDate+'&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
        }
    };
});

app.factory('getSounds', function ($http) {
    return {
        get: function () {
            return $http.get('./assets/sounds.json');
        }
    };
});

app.factory('getEpic', function ($http) {
    return {
        get: function () {
            return $http.get('http://epic.gsfc.nasa.gov/api/images.php');
        }
    };
});

app.factory('getMars', function ($http) {
    return {
        get: function () {
            return $http.get('https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?earth_date=2015-6-3&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
        }
    };
});

app.factory('getImagery', function ($http) {
    return {
        get: function (lat, lon, thisDate) {
						var thisURL = 'https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=' + thisDate + '&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA';
						console.log(thisURL);
            return $http.get(thisURL);
						// return $http.get('https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=2014-02-01&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
        }
    };
});

app.factory('getCoordinates', function ($http) {
		return {
				get: function (loc) {
						return $http.get(encodeURI('http://maps.googleapis.com/maps/api/geocode/json?address=' + loc));
				}
		};
});

app.factory('geolocationSvc', ['$q', '$window', function ($q, $window) {

    'use strict';

    function getCurrentPosition() {
        var deferred = $q.defer();
        if (!$window.navigator.geolocation) {
						deferred.reject('Geolocation not supported.');

        } else {
            $window.navigator.geolocation.getCurrentPosition(
                function (position) {
                    deferred.resolve(position);
                },
                function (err) {
										console.log(err);
                    deferred.reject(err);
                });
        }

        return deferred.promise;
    }

    return {
        getCurrentPosition: getCurrentPosition
    };
}]);

app.directive('slideable', function () {
    return {
        restrict:'C',
        compile: function (element, attr) {
            // wrap tag
            var contents = element.html();
            element.html('<div class="slideable_content" style="margin:0 !important; padding:0 !important" >' + contents + '</div>');

            return function postLink(scope, element, attrs) {
                // default properties
                attrs.duration = (!attrs.duration) ? '1s' : attrs.duration;
                attrs.easing = (!attrs.easing) ? 'ease-in-out' : attrs.easing;
                var startHeight = "0px";
                if (!attrs.showonload) {

                    var y = content.clientHeight;
                    startHeight = y + 'px';
                }
                element.css({
                    'overflow': 'hidden',
                    'height': startHeight,
                    'transitionProperty': 'height',
                    'transitionDuration': attrs.duration,
                    'transitionTimingFunction': attrs.easing,
                    'background': 'rgba(0, 0, 0, 0)'
                });
            };
        }
    };
});

app.directive('slideToggle', function() {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var target, content;
            attrs.expanded = (attrs.expanded==="true") ? true : false;

            element.bind('click', function (e) {
                if (!attrs.slideToggle) {
                    if (!target) target = $(this).parent().find(".slideable")[0];
                } else {
                    if (!target) target = document.querySelector(attrs.slideToggle);
                }
                if (!content) content = target.querySelector('.slideable_content');
                if (!attrs.expanded) {
                    content.style.border = '1px solid rgba(0,0,0,0)';
                    var y = content.clientHeight;
                    content.style.border = 0;
                    target.style.height = y + 'px';
                } else {
                    target.style.height = '0px';
                }
                attrs.expanded = !attrs.expanded;
            });
        }
    };
});

app.directive('myEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.myEnter);
                });

                event.preventDefault();
            }
        });
    };
});
