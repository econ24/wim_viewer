'use strict';

angular
  .module('wimViewerApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/state/:stateFips', {
        templateUrl: 'views/state.html',
        controller: 'StateCtrl'
      })
      .when('/station/:stationId', {
        templateUrl: 'views/station.html',
        controller: 'StationCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
