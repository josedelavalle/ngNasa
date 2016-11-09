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

app.controller("appController", ['$scope', 'getData', 'getSounds', 'getEpic', 'getMars', function($scope, getData, getSounds, getEpic, getMars) {
  $scope.pageTitle = "Picture of the Day";
	$scope.headerTitle = "Jose DeLavalle";
  getData.get().then(function (msg) {
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
}]);

app.factory('getData', function ($http) {
    return {
        get: function () {
            return $http.get('https://api.nasa.gov/planetary/apod?api_key=sFBD6hSaJ9HBP6U8qhXaBv6v9pKcTYtICStGJlOA');
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
