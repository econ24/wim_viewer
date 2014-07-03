'use strict';

angular.module('wimViewerApp')
  .controller('StateCtrl', function ($scope,$http,$routeParams) {
  	$scope.stateFips = $routeParams['stateFips']
  	$scope.stations = []

    var URL = 'stations/byState/'+$scope.stateFips;

    wimXHR.get(URL, function(error, data) {
      data.rows.forEach(function(row){

  			var rowStation = row.f[0].v;
  			
  			if(getStationIndex(rowStation) == -1) {
  				$scope.stations.push({'stationId':rowStation, years:[]})
  			}
  			$scope.stations[getStationIndex(rowStation)].years.push({'year':row.f[1].v,'percent':(row.f[4].v)*100,'AADT':Math.round(row.f[5].v)});
  		}); 
  	})
    
  	function getStationIndex(stationID){
  		return $scope.stations.map(function(el) {return el.stationId;}).indexOf(stationID);
  	}
  });
