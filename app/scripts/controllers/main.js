'use strict';

angular.module('wimViewerApp')
  .controller('MainCtrl', function ($scope, $http, $routeParams) {

    var state2fips = {"01": "Alabama","02": "Alaska","04": "Arizona","05": "Arkansas","06": "California","08": "Colorado","09": "Connecticut","10": "Delaware","11": "District of Columbia","12": "Florida","13": "Geogia","15": "Hawaii","16": "Idaho","17": "Illinois","18": "Indiana","19": "Iowa","20": "Kansas","21": "Kentucky","22": "Louisiana","23": "Maine","24": "Maryland","25": "Massachusetts","26": "Michigan","27": "Minnesota","28": "Mississippi","29": "Missouri","30": "Montana","31": "Nebraska","32": "Nevada","33": "New Hampshire","34": "New Jersey","35": "New Mexico","36": "New York","37": "North Carolina","38": "North Dakota","39": "Ohio","40": "Oklahoma","41": "Oregon","42": "Pennsylvania","44": "Rhode Island","45": "South Carolina","46": "South Dakota","47": "Tennessee","48": "Texas","49": "Utah","50": "Vermont","51": "Virginia","53": "Washington","54": "West Virginia","55": "Wisconsin","56": "Wyoming"};

    $scope.barGraph;
    // $scope.states = [];

    var states = {};

    var URL = '/stations/byState',
        dataSources = 0,
        numRoutes = 2;

    wimXHR.get(URL, function(error, data) {

        data.rows.forEach(function(row){
            var rowState = row.f[0].v;
            var rowStation = row.f[1].v;


            if (!(rowState in states)) {
                states[rowState] = {
                    'state_fips': rowState, 
                    stations: {length: 0},
                    name: state2fips[rowState]
                };
            }
            var obj = {
                stationID: rowStation,
                stationCount: row.f[2].v,
                stationType: 'wim'
            }
            if (!(rowStation in states[rowState].stations)) {
                states[rowState].stations[rowStation] = obj;
                states[rowState].stations.length++;
            } else {
                states[rowState].stations[rowStation].stationType = 'wim';

            }
        });
        if (++dataSources == numRoutes) {
            wimstates.drawMap('#statesDIV', states, $scope);
        }
    })

    URL = '/stations/allClass';

AADTGraph.initAADTGraph("#barGraph");

/*

Below is where chart is drawn. Test Array set up below

*/

var testingArr = [true,true,true]

    $scope.$watch('stationsClass', function() {
      if($scope.stationsClass != undefined){
          if($scope.stationsClass.length != 0){
            AADTGraph.drawAADTGraph($scope.stationsClass,"class",testingArr);
          }
          
        }
    });


    $("#barGraph").on("mousemove", function(e) {
     
      var x = e.pageX - 80;
      var y = e.pageY;
      var windowH = $(window).height();
      if (y > (windowH - 100)) {
      var y = e.pageY - 120;
      } else {
      var y = e.pageY - 120;
      }

      $("#stationInfo").css({
        "left": x,
        "top": y
      });
    });
    





    wimXHR.get(URL, function(error, data) {
        data.rows.forEach(function(row){
            var rowState = row.f[0].v;
            var rowStation = row.f[1].v;

            if (!(rowState in states)) {
                states[rowState] = {
                    'state_fips': rowState, 
                    stations: {length: 0},
                    name: state2fips[rowState]
                };
            }
            var obj = {
                stationID: rowStation,
                stationCount: row.f[2].v,
                stationType: 'class'
            }
            if (!(rowStation in states[rowState].stations)) {
                states[rowState].stations[rowStation] = obj;
                states[rowState].stations.length++;
            }
        });
        if (++dataSources == numRoutes) {
            wimstates.drawMap('#statesDIV', states, $scope);
        }
    })

    // get state data
    // wimXHR.get(URL, function(error, data) {
    //     data.rows.forEach(function(row){
    //         var rowState = row.f[0].v;
    //         var rowStation = row.f[1].v;
    //         if(getStateIndex(rowState) == -1) {
    //           $scope.states.push({'state_fips':rowState, stations:[], name: state2fips[rowState]})
    //         }
    //         var obj = {
    //             stationID: rowStation,
    //             stationCount: row.f[2].v,
    //             stationType: 'wim'
    //         }
    //         $scope.states[getStateIndex(rowState)].stations.push(obj);
    //     });
    //     if (++drawMap == 1) {
    //         wimstates.drawMap('#statesDIV', $scope.states, $scope);
    //     }
    // })

    // function getStateIndex(state_fips){
    //   return $scope.states.map(function(el) {return el.state_fips;}).indexOf(state_fips);
    // }
  });

