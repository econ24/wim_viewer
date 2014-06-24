'use strict';


angular.module('wimViewerApp')
  .controller('StationCtrl', function ($scope,$http,$routeParams) {
    $scope.station = $routeParams['stationId'];
    $scope.stationType = $routeParams['stationType'];

    // create graph object and draw a graph
    var grapher = wimgraph.grapher('#wimgraph');
    grapher.drawGraph($scope.station, $scope.stationType);

    $scope.values = [
      { id: 0, label: 'All' },
      { id: 4, label: '4' },
      { id: 5, label: '5' },
      { id: 6, label: '6' },
      { id: 7, label: '7' },
      { id: 8, label: '8' },
      { id: 9, label: '9' },
      { id: 10, label: '10' },
      { id: 11, label: '11' },
      { id: 12, label: '12' },
      { id: 13, label: '13' },
    ];
    $scope.values2 = [
      { id: "Weight", label: 'Weight' },
      { id: "Count", label: 'Count' },
    ];
    $scope.values3 = [
      { id: "Freight", label:'Freight'},
      { id: "Class", label:'Class'},
    ];
  $scope.myClass = 0;
  $scope.myDisp = "Count";
  $scope.myDataDisp = "Freight";

       $scope.minYear = ""
       $scope.maxYear = ""
       $scope.drawVars = []

      var URL = 'stations/byStation';

      wimXHR.get(URL, function(error, data) {
          $scope.minYear = data.rows[0].f[0].v
          $scope.maxYear = data.rows[0].f[1].v
          $scope.drawVars = wimCalendar.init($scope.minYear,$scope.maxYear)
          $scope.stationData = [];
          $scope.stationDataAll = [];
          $scope.myClass = $scope.values[0].id;
          $scope.myDisp = $scope.values2[1].id;
          $scope.myDataDisp = $scope.values3[0].id;

          wimXHR.get('stations/byStation/state/info/'+$scope.station, function(error, data) {
                wimTable.drawTable(data)
                
                wimXHR.get('stations/byStation/class/'+$scope.station, function(error, data) {
                  $scope.stationDataAll = data;
                });
          });

          wimXHR.get('stations/byStation/'+$scope.station, function(error, data) {
              $scope.stationData = data;
              calCreate($scope.drawVars[5],$scope.drawVars[3],$scope.myClass,$scope.drawVars[1],$scope.drawVars[2],data,$scope.drawVars[0],$scope.drawVars[4],"trucks","Freight")
          });
          
          $scope.loadCalendar = function(){
            if($scope.myDataDisp === "Freight"){
                calCreate($scope.drawVars[5],$scope.drawVars[3],$scope.myClass,$scope.drawVars[1],$scope.drawVars[2],$scope.stationData,$scope.drawVars[0],$scope.drawVars[4],$scope.myDisp,$scope.myDataDisp)
            
            }
            else{
                calCreate($scope.drawVars[5],$scope.drawVars[3],$scope.myClass,$scope.drawVars[1],$scope.drawVars[2],$scope.stationDataAll,$scope.drawVars[0],$scope.drawVars[4],"Count",$scope.myDataDisp)
            }
          }
      });
});

  function calCreate(rect,svg,classT,day,week,data,z,svg2,dispType,dispType2){
      if(dispType2 === "Freight"){
        wimCalendar.drawCalendar(rect,svg,parseDataF(data,classT),day,week,z,svg2,dispType);
      }
      else{
        wimCalendar.drawCalendar(rect,svg,parseDataA(data,classT),day,week,z,svg2,dispType); 
      }
  };

function parseDataA(input,classInfo){
	var output = [];
	input.rows.forEach(function(row){

    		var item = {}
    		var string = ""
        var yearStr = row.f[0].v
        var totalTrucks = 0;
        if(classInfo == 0){
          totalTrucks = parseInt(row.f[3].v) + parseInt(row.f[4].v) + parseInt(row.f[5].v) + parseInt(row.f[6].v) + parseInt(row.f[7].v) + parseInt(row.f[8].v) + parseInt(row.f[9].v) + parseInt(row.f[10].v) + parseInt(row.f[11].v) + parseInt(row.f[12].v) + parseInt(row.f[13].v) + parseInt(row.f[14].v) + parseInt(row.f[15].v)
        }
        else{
          totalTrucks = parseInt(row.f[classInfo+2].v);
        }
        if(row.f[0].v < 10){
          yearStr = "0"+row.f[0].v
        }
    		if(row.f[1].v < 10){
    	        if(row.f[2].v < 10){
    	        	string= "20"+yearStr+"-0"+row.f[1].v+"-0"+row.f[2].v
    	        }else{
    	        	string = "20"+yearStr+"-0"+row.f[1].v+"-"+row.f[2].v
    	        }
    	 	}else{
    	        if(row.f[2].v < 10){
    	        	string = "20"+yearStr+"-"+row.f[1].v+"-0"+row.f[2].v
    	        }else{
    	        	string = "20"+yearStr+"-"+row.f[1].v+"-"+row.f[2].v
    	        }
    		}

              item.date = string;
              item.numTrucks = totalTrucks;
              output.push(item);
  });
	return output
};

function parseDataF(input,classInfo){
  var output = [];
  if(input.rows != undefined){
    input.rows.forEach(function(row){
      if(classInfo == 0 || classInfo == row.f[4].v){
          var item = {}
          var x = 0
          var string = ""
          var yearStr = row.f[5].v
          if(row.f[5].v < 10){
            yearStr = "0"+row.f[5].v
          }
          if(row.f[2].v < 10){
                if(row.f[3].v < 10){
                  string= "20"+yearStr+"-0"+row.f[2].v+"-0"+row.f[3].v
                }else{
                  string = "20"+yearStr+"-0"+row.f[2].v+"-"+row.f[3].v
                }
          }else{
                if(row.f[3].v < 10){
                  string = "20"+yearStr+"-"+row.f[2].v+"-0"+row.f[3].v
                }else{
                  string = "20"+yearStr+"-"+row.f[2].v+"-"+row.f[3].v
                }
          }

              for(var i = 0;i<output.length;i++){
                if(output[i].date == string){
                  output[i].numTrucks = parseInt(row.f[1].v) + parseInt(output[i].numTrucks)
                  output[i].totalWeight = parseInt(row.f[6].v) + parseInt(output[i].totalWeight)
                  x = 1
                  break
                }
              }
              if(x == 0){
                item.date = string;
                item.numTrucks = parseInt(row.f[1].v);
                item.totalWeight = parseInt(row.f[6].v)
                item.averageWeight = parseInt(row.f[6].v) / parseInt(row.f[1].v)
                output.push(item);
              }
              x = 0 
           }

          
    });
  }
 
  return output
};