(function() {
	var wimstates = {
		version: 0.1,
	}

	var mapDIV = null,
		SVG = null,
		popup = null,
		geoJSON = null,
		centered = null,
		$scope = null,
		clicked = false;

	var width = null,
		height = 600;

	var projection = d3.geo.albersUsa()
		.scale(1 << 10);

	var path = d3.geo.path()
		.projection(projection);

	var colorScale = d3.scale.linear()
		.range(['#deebf7', '#08306b']);

	function _drawMap() {
		var states = SVG.selectAll('path')
			.data(geoJSON.features)

		states.enter().append('path')
			.attr('fill', function(d) {
				if (typeof d.properties.stations !== 'undefined') {
					return colorScale(d.properties.stations.length);
				} else {
					return '#999';
				}
			})
			.attr('class', 'state')
			.attr('d', path)
			.on('click', function(d) {
				if (!clicked) {
					clicked = true;
					_clickZoom(d);
				}
			})
			.on('mouseover', function(d) {
				if (typeof d.properties.stations !== 'undefined') {
					d3.select(this).classed('state-hover', true);
				}
			})
			.on('mouseout', function(d) {
				if (typeof d.properties.stations !== 'undefined') {
					d3.select(this).classed('state-hover', false);
				}
			});

		function _clickZoom(d) {
			if (typeof d.properties.stations === 'undefined') {
				return;
			}
			var x, y, k;

			var collection = {
				type: 'FeatureCollection',
				features: []
			};
			var	URL;

			if (d && centered !== d) {
			    var bounds = path.bounds(d);
			    var wdth = bounds[1][0] - bounds[0][0];
			    var hght = bounds[1][1] - bounds[0][1];
			    x = bounds[1][0] - wdth/2
			    y = bounds[1][1] - hght/2
			    k = Math.floor(Math.min(width/wdth, height/hght));
			    centered = d;
			} else {
			    x = width / 2;
			    y = height / 2;
			    k = 1;
			    centered = null;
			}

			if (centered) {
				URL = '/stations/stateGeo/';
				_getStationPoints();

				_getStationData(d);
			} else {
				d3.selectAll('.station').remove();

				collection.features = [];
			  		
		  		$scope.$apply(function() {
		  			$scope.stations = [];
		  			$scope.stationsClass = [];
		  		});
				clicked = false;
			}

			SVG.selectAll("path")
			    .classed("state-active", centered && function(d) { return d === centered; });

			SVG.transition()
			    .duration(750)

			    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")"+
			    				    "scale(" + k + ")"+
			    				    "translate(" + -x + "," + -y + ")");

			function _getStationPoints() {
				wimXHR.get(URL + d.id, function(error, data) {
	            	if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	_drawStationPoints(_formatData(d, data));
					clicked = false;
				})
			}


			function _formatData(stateData, stationData) {
				var stations = {};
				stationData.features.forEach(function(d) {
					if (d.geometry.coordinates[0] != 0 && d.geometry.coordinates[1] != 0) {
						stations[d.properties.station_id] = d.geometry;
					}
				});

				//stateData.properties.stations.forEach(function(d) {
				for (var i in stateData.properties.stations) {
					var d = stateData.properties.stations[i];

					var obj = {
						type: 'Feature',
						properties: {},
						geometry: {}
					};
					obj.properties.stationID = d.stationID;
					obj.properties.count = d.stationCount;
					obj.properties.type = d.stationType;

					if (d.stationID in stations) {
						obj.geometry = stations[d.stationID];
						collection.features.push(obj);
					}
				}
				return collection;
			}
		} // end _clickZoom

		function _drawStationPoints(collection) {
			var stations = SVG.selectAll('circle')
				.data(collection.features);

			stations.exit().remove();

			stations.enter().append('circle');

			stations.attr('class', 'station')
				.attr('r', 1.5)
				.attr('opacity', 0.66)
				.attr('fill', function(d) {
					if (d.properties.type == 'wim') {
						return '#081d58';
					} else {
						return '#ff0000';
					}
				})
				.attr('cx', function(d) {
					return projection(d.geometry.coordinates)[0];
				})
				.attr('cy', function(d) {
					return projection(d.geometry.coordinates)[1];
				})
				.on('mouseover', function(d) {
					d3.select(this)
						.attr('opacity', 1.0);
					_popup(d);
				})
				.on('mouseout', function(d) {
					d3.selectAll('.station')
						.attr('opacity', 0.66);
					popup.style('display', 'none')
				})
				.on('mousemove', _popup)
				.on('click', function(d) {
					var URL = '#/station/' + 
						d.properties.type + '/' +
						d.properties.stationID;

					open(URL, '_self');
				})
		}
		// this function queries backend for all stations
		// and then updates $scope.stations variable in
		// order to draw list of stations below map
		function _getStationData(stateData) {
			var URL = 'stations/byState/';
			var id = stateData.id.toString();

			var regex = /^\d$/;

			if (id.match(regex)) {
				id = '0' + id;
			}

		  	var stations = [];

			wimXHR.get(URL + id, function(error, data) {
            	if (error) {
            		console.log(error);
            		return;
            	}
            	if(data.rows != undefined){
			  		data.rows.forEach(function(row){
			  			var rowStation = row.f[0].v;
			  			if(getStationIndex(rowStation) == -1) {
			  				stations.push({'stationId':rowStation, years:[]})
			  			}
			  			stations[getStationIndex(rowStation)].years.push({'year':row.f[1].v,'percent':(row.f[4].v)*100,'AADT':Math.round(row.f[5].v)});
			  		});
			  	}
		  		if (centered) {
			  		$scope.$apply(function(){
			  			//$scope.stations = stations;
			  		});
			  	}

			});
			URL = 'stations/byState/class/'
			var stationsClass = [];

			wimXHR.get(URL + id, function(error, data) {
				if (error) {
            		console.log(error);
            		return;
            	}
            	if(data.rows != undefined){
			  		data.rows.forEach(function(row){
				  			var rowStation = row.f[0].v;
				  			if(getStationIndex(rowStation,"class") == -1) {
				  				stationsClass.push({'stationId':rowStation, years:[],heights:[],'AAPT':0,'AASU':0,'AATT':0})
				  				stationsClass[getStationIndex(rowStation,"class")].heights.push({'y0':0,'y1':0})
				  				stationsClass[getStationIndex(rowStation,"class")].heights.push({'y0':0,'y1':0})
				  				stationsClass[getStationIndex(rowStation,"class")].heights.push({'y0':0,'y1':0})
				  			}
				  			stationsClass[getStationIndex(rowStation,"class")].years.push({'year':row.f[1].v,'ADT':Math.round(row.f[2].v),'APT':Math.round(row.f[3].v),'ASU':Math.round(row.f[4].v),'ATT':Math.round(row.f[5].v)});
				  			
			  		});
		  		}
		  		if (centered) {
			  		$scope.$apply(function(){
			  			$scope.stationsClass = stationsClass;
			  		});
			  	}

			});

		  	function getStationIndex(stationID,classT){
		  		if(classT != "class"){
		  			return stations.map(function(el) {return el.stationId;}).indexOf(stationID)
		  		}
		  		else{
		  			return stationsClass.map(function(el) {return el.stationId;}).indexOf(stationID)
		  		}
		  	}
		}
	}

	function _popup(d) {
		var wdth = parseInt(popup.style('width')),
			hght = parseInt(popup.style('height'));

		var xPos = d3.event.offsetX - wdth/2,
			yPos = (d3.event.offsetY-hght-15);

		if (yPos < 0) {
			yPos = d3.event.offsetY + 20;
		}

		popup.style('left', xPos + 'px')
			.style('top', yPos + 'px')
			.style('display', 'block')
			.html('<b>Station ID:</b> ' + d.properties.stationID)
	}
	// states is an array of state objects
	wimstates.drawMap = function(id, states, $s) {
		mapDIV = d3.select(id)

		width = parseInt(mapDIV.style('width'));
		projection.translate([width/2, height/2]);

		SVG = mapDIV.append('svg')
			.attr('id', 'mapSVG')
			.attr('height', height)
			.attr('width', width)
			.append('g');

		popup = mapDIV.append('div')
			.attr('class', 'station-popup')

		$scope = $s;

		// states object
		var obj = {};

		var domain = [];

		// load scope states data into states object
		for (var i in states) {
			obj[states[i].state_fips] = {stations: states[i].stations, name: states[i].name}
			domain.push(states[i].stations.length);
		}
		colorScale.domain(d3.extent(domain));

		d3.json('./us-states-10m.json', function(error, states) {

			geoJSON = topojson.feature(states, states.objects.states);

			var props;
			geoJSON.features.forEach(function(d) {
				// pad single digit FIPS with a 0 for compatibility
				if (d.id.toString().match(/^\d$/)) {
					d.id = '0' + d.id;
				}
				d.properties.fips = d.id.toString();
				if (d.id in obj) {
					d.properties.stations = obj[d.id].stations;
					d.properties.name = obj[d.id].name;
				}
			})

			_drawMap();
		})
	}

	this.wimstates = wimstates;
})()