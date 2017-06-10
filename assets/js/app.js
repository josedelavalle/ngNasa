var app = angular.module('myApp', ['ngRoute', 'ngAnimate', 'ngAria', 'ngMessages', 'ngMaterial', 'material.svgAssetsCache', 'angularMoment']);



app.config(['$routeProvider', '$locationProvider', '$mdDateLocaleProvider', function($routeProvider, $locationProvider, $mdDateLocaleProvider){
	$mdDateLocaleProvider.formatDate = function(date) {
       return moment(date).format('YYYY-MM-DD');
    };
	//ChartJsProvider.setOptions({ chartColors: myChartColors });
	$locationProvider.html5Mode(true);
	$routeProvider
   .when('/', {
    templateUrl: 'views/home.html'
  })
  // .when('/1', {
  //  templateUrl: 'views/left-sidebar.html'
  // })
  // .when('/2', {
  //  templateUrl: 'views/right-sidebar.html'
  // })
  // .when('/3', {
  //  templateUrl: 'views/two-sidebar.html'
  // })
  // .when('/4', {
  //  templateUrl: 'views/no-sidebar.html'
  // })
  .otherwise({
  	redirectTo: '/'
  });
}]);


app.factory('ngNasaFactory', function ($http) {
  apikey = 'sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA';
  return {
    getPicOfTheDay: function (thisDate) {
        return $http.get('https://api.nasa.gov/planetary/apod?date='+thisDate+'&api_key=' + apikey);
    },
    getSounds: function () {
        return $http.get('https://api.nasa.gov/planetary/sounds?q=apollo&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
    },
    getEpic: function () {
        var thisURL = 'https://epic.gsfc.nasa.gov/api/images.php';
        //thisURL = "./assets/natural.json";
        return $http.get(thisURL);
    },
    getMars: function(thisDate, whichRover) {
      console.log(thisDate, whichRover);
      var thisURL = 'https://api.nasa.gov/mars-photos/api/v1/rovers/' + whichRover + '/photos?earth_date=' + thisDate + '&api_key=' + apikey;
      console.log(thisURL);
        return $http.get(thisURL);
    },
    getImagery: function (lat, lon, thisDate) {
        var thisURL = 'https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=' + thisDate + '&cloud_score=True&api_key=' + apikey;
        console.log(thisURL);
        return $http.get(thisURL);
        // return $http.get('https://api.nasa.gov/planetary/earth/imagery?lon=' + lon + '&lat=' + lat + '&date=2014-02-01&cloud_score=True&api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
    },
    getCoordinates: function (loc) {
        return $http.get(encodeURI('http://maps.googleapis.com/maps/api/geocode/json?address=' + loc));
    }
  };
});




app.controller("appController", ['$scope', '$filter', 'ngNasaFactory', 'geolocationSvc', function($scope, $filter, ngNasaFactory, geolocationSvc) {
	$scope.title = formatDate(new Date());
	$scope.path = "/";
	notToday = false;
	defaultPicture = "images/earth2.jpg";
	$scope.todayDate = $scope.title;
	$scope.currentDate = new Date();

  var whichRover = "curiosity";
	// currentDate.setDate(currentDate.getDate());
	// $scope.mypics = ["images/pic01.jpg", "images/pic02.jpg", "images/pic03.jpg"];
	function formatDate(thisdate) {
		return $filter('date')(thisdate,'yyyy-MM-dd');
		// console.log($scope.title + ' - ' + $scope.todayDate);
		// $scope.apply;
	}
	$scope.initDatepicker = function(){
        angular.element(".md-datepicker-button").each(function(){
            var el = this;
            var ip = angular.element(el).parent().find("input").bind('click', function(e){
                angular.element(el).click();
            });
            angular.element(this).css('visibility', 'hidden');
        });
    };
	$scope.dateChanged = function () {
		$scope.myDate = formatDate(this.myDate);
		$scope.currentDate = this.myDate;
		$scope.title = $scope.myDate;

		checkToday();
		goGetPic($scope.title);
    goGetMars(whichRover);
	};
	checkToday = function() {
		if ($scope.title != $scope.todayDate) notToday = true; else notToday = false;
	};
	$scope.myDate = new Date();
  $scope.minDate = new Date(
     $scope.myDate.getFullYear(),
     $scope.myDate.getMonth() - 2,
     $scope.myDate.getDate());
  $scope.maxDate = new Date(
     $scope.myDate.getFullYear(),
     $scope.myDate.getMonth(),
     $scope.myDate.getDate());
  $scope.onlyWeekendsPredicate = function(date) {
     var day = date.getDay();
     return day === 0 || day === 6;
  };

	$scope.pageTitle = "Picture of the Day";
	$scope.headerTitle = "Jose DeLavalle";
	$scope.defaultSearch = "New York";

	$scope.rotate = true;
	$scope.rotateIcon = function() {
			$scope.rotate = !$scope.rotate;

	};

	$scope.goBack = function(i) {
    if (!i) i = 1;
		$scope.currentDate.setDate($scope.currentDate.getDate() - i);
		$scope.title = formatDate($scope.currentDate);
		$scope.myDate = $scope.currentDate;
		checkToday();
		goGetPic($scope.title);
    goGetMars(whichRover);
	};
	$scope.goForward = function() {
		if (notToday) {
			$scope.currentDate.setDate($scope.currentDate.getDate() + 1);
			$scope.title = formatDate($scope.currentDate);
			$scope.myDate = $scope.currentDate;
			checkToday();
			goGetPic($scope.title);
      goGetMars(whichRover);
		}
	};

	function goGetPic(myDate) {
		toggleSpinner('1');
  	ngNasaFactory.getPicOfTheDay(myDate).then(function (msg) {
      $scope.data = msg.data;
      console.log('got pic of the day', msg);
			if ($scope.data.media_type == "video") {
				//$scope.data.url = defaultPicture;
				$scope.data.title = "Video Support Coming Soon";
				//$scope.data.media_type = "";
			}
			toggleSpinner('1');
  	}, function(msg) {
			$scope.data = {title: msg.data.msg, copyright: 'Code: ' + msg.data.code, date: myDate, explanation: 'NASA Pic of the Day unavailable for this date', url: defaultPicture};
			toggleSpinner('1');
		});
	}
	goGetPic($scope.title);

  var getSounds = function () {


    ngNasaFactory.getSounds().then(function (msg) {
        console.log('got sounds', msg);
        $scope.soundData = msg.data.results;
  			// console.log("sounds data");
        // console.log($scope.soundData);
         $scope.audio = [];
         for (i = 0; i < $scope.soundData.length; i++) {
           $scope.audio[i] = new Audio();
           $scope.audio[i].src = $scope.soundData[i].stream_url;
         }
    }).catch(function (e) {
      console.log('error getting sounds', e);
    });
  };


  var goGetEpic = function () {
    ngNasaFactory.getEpic().then(function (msg) {
        console.log('got mars', msg);
        $scope.epic = msg.data;
    }).catch(function(e) {
        console.log('error getting epic data', e);
    });
  };

  var goGetMars = function(r) {
    whichRover = r;
    console.log('getting mars images', r);
    ngNasaFactory.getMars(formatDate($scope.myDate), r).then(function (msg) {
        console.log('got mars', msg);
        $scope.mars = msg.data.photos;
    }).catch(function(e) {
        console.log('error getting mars data', e);
        $scope.mars = {};
    });
  };
  goGetMars(whichRover);
  $scope.goGetMars = goGetMars;

	$scope.goGetCoordinates = function (loc) {
		toggleSpinner('2');
		$scope.imagery = {};

		ngNasaFactory.getCoordinates(loc).then(function (msg) {
				console.log(msg);
				$scope.coordinates = msg.data.results[0].geometry.location;
	      console.log($scope.coordinates);
				ngNasaFactory.getImagery($scope.coordinates.lat, $scope.coordinates.lng, $scope.title).then(function (msg) {
			      $scope.imagery = msg.data;
			      console.log($scope.imagery);
						toggleSpinner('2');
			  });
	  });
	};
	function toggleSpinner(whichOne) {
		$('#my-spinner' + whichOne).toggleClass("hidden");
	}
	$scope.getUserLocation = function captureUserLocation() {
		toggleSpinner('2');
    geolocationSvc.getCurrentPosition().then(function (onUserLocationFound) {

			$scope.coordinates = {lat: onUserLocationFound.coords.latitude, lng: onUserLocationFound.coords.longitude};

			ngNasaFactory.getImagery($scope.coordinates.lat, $scope.coordinates.lng, $scope.title).then(function (msg) {
					$scope.imagery = msg.data;
					toggleSpinner('2');
					// console.log($scope.imagery);
			},
				function (msg) {
						$scope.imagery = {date: msg};
						toggleSpinner('2');
			});
		},
			function (msg) {
				console.log(msg.message);
				$scope.imagery = {date: msg.message};
				toggleSpinner('2');
		});

	};

}]);



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
