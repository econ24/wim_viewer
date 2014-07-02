(function() {
	var wimstates = {
		version: 0.1,
	}

	var mapDIV = null,
		popup = null,
		statesJSON = null
		__JSON__ = {},
		centered = null,
		$scope = null,
		clicked = null,
		stations = null;

	var AVLmap = null;

	var width = 1000,
		height = 500;

	var projection = null,
		zoom = null,
		path = null;

	var colorScale = d3.scale.linear()
		.range(['#deebf7', '#08306b']);

	function _drawMap() {

    	var states = mapDIV.append('svg')
    		.style('position', 'absolute')
    		.style('z-index', -10)
    		.selectAll('path')
    		.data(statesJSON.features);

    	states.enter()
    		.append('path')
    		.attr('class', 'state')
    		.attr('fill', function(d) {
    			if (d.properties.name) {
    				return colorScale(d.properties.stations.length);
    			} else {
    				return 'none';
    			}
    		})
    		.attr('d', path)
    		.each(function(d, i) {
    			if (d.properties.name) {
		    		__JSON__[d.id] = d;
		    		var marker = avl.MapMarker(projection.invert(path.centroid(d)),
						{name: d.id, BGcolor: colorScale(d.properties.stations.length), click: _clicked});
		    		AVLmap.addMarker(marker);
		    	}
    		});

    	AVLmap.addAlert(_update);
    	AVLmap.zoomMap();

    	function _update() {
    		states.attr('d', path);
    		if (stations) {
    			_updateStations();
    		}
    	}

		function _updateStations() {
			stations
				.style('left', function(d) {
					return (projection(d.geometry.coordinates)[0]-10)+"px";
				})
				.style('top', function(d) {
					return (projection(d.geometry.coordinates)[1]-10)+"px";
				})
		};

		function _clicked(name) {
	  		if (d3.event.defaultPrevented) return;

			var collection = {
				type: 'FeatureCollection',
				features: []
			};
			if (name == clicked) {
				_drawStationPoints(collection);
				clicked = null;
				return;
			}
	  		clicked = name;

	    	var	bounds = path.bounds(__JSON__[name]),

	    		wdth = bounds[1][0] - bounds[0][0],
	    		hght = bounds[1][1] - bounds[0][1],
	    		center = projection.invert([bounds[0][0] + wdth/2,
	    								    bounds[0][1] + hght/2]),

	    		k = Math.min(width/wdth, height/hght),
	    		scale = zoom.scale()*k;

	    	if (name == '2') {
	    		// this is a patch required to handle Alaska's odd geometry
	    		center = [-152.2683, 65.3850];
	    		scale = 8900;
	    	}

			zoom.scale(scale);
	        projection
	            .scale(zoom.scale() / 2 / Math.PI)
	            .center(center)
	            .translate([width / 2, height / 2])
	            .translate(projection([0, 0]))
	            .center([0, 0]);

	        zoom.translate(projection.translate());

			_getStationPoints();

	        AVLmap.zoomMap();

			function _getStationPoints() {
				var URL = '/stations/stateGeo/';
				wimXHR.get(URL + name, function(error, data) {
	            	if (error) {
	            		console.log(error);
	            		return;
	            	}
					_drawStationPoints(_formatData(__JSON__[name], data));
				})
			}

			function _formatData(stateData, stationData) {
				// get valid geometries
				var stations = {};
				// need this to filter out bad geometry
				stationData.features.forEach(function(d) {
					if (d.geometry.coordinates[0] != 0 && d.geometry.coordinates[1] != 0) {
						stations[d.properties.station_id] = d.geometry;
					}
				});

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
		} // end _clicked

		function _drawStationPoints(collection) {
			stations = mapDIV.selectAll('.station-point')
				.data(collection.features);

			stations.exit().remove();

			stations.enter().append('div');

			stations.attr('class', 'station-point')
				.style('opacity', 0.66)
				.style('background', function(d) {
					if (d.properties.type == 'wim') {
						return '#081d58';
					} else {
						return '#ff0000';
					}
				})
				.style('left', function(d) {
					return (projection(d.geometry.coordinates)[0]-10)+"px";
				})
				.style('top', function(d) {
					return (projection(d.geometry.coordinates)[1]-10)+"px";
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
		// and then updates $scope.stations variable which
		// is used elsewhere
		function _getStationData(stateData) {
			var URL = '/stations/byState/';
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
		  		data.rows.forEach(function(row){
		  			var rowStation = row.f[0].v;
		  			
		  			if(getStationIndex(rowStation) == -1) {
		  				stations.push({'stationId':rowStation, years:[]})
		  			}
		  			stations[getStationIndex(rowStation)].years.push({'year':row.f[1].v,'percent':(row.f[4].v)*100,'AADT':Math.round(row.f[5].v)});
		  		});
		  		if (centered) {
			  		$scope.$apply(function(){
			  			$scope.stations = stations;
		  			});
			  	}
			});

		  	function getStationIndex(stationID){
		  		return stations.map(function(el) {return el.stationId;}).indexOf(stationID);
		  	}
		}
	}

	function _popup(d) {
		var wdth = parseInt(popup.style('width')),
			hght = parseInt(popup.style('height'));

		var left = projection(d.geometry.coordinates)[0] - wdth - 5,
			top = projection(d.geometry.coordinates)[1] - hght - 5;

		if (top < hght) {
			top += hght + 10;
		}

		popup.style('left', left + 'px')
			.style('top', top + 'px')
			.style('display', 'block')
			.html('<b>Station ID:</b> ' + d.properties.stationID)
	}
	// states is an array of state objects
	wimstates.drawMap = function(id, states, $s) {
		mapDIV = d3.select(id);

		width = parseInt(mapDIV.style('width'));
		height = width/2;

		mapDIV.style('width', width+"px")
			.style('height', height+"px");

var dmn = [5000, 200000];
var rng = ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"];
var rng = rng.reverse();

		AVLmap = avl.Map({id: id, minZoom: 3, maxZoom: 17})
			.addLayer(avl.RasterLayer("http://{s}.tiles.mapbox.com/v3/am3081.map-lkbhqenw/{z}/{x}/{y}.png"))
			.addLayer(avl.VectorLayer("http://localhost:8000/roads/{z}/{x}/{y}.topojson",
				{properties:['type'], name: 'NY HPMS',
				 choros: [{attr: 'aadt', domain: dmn, range: rng, style: 'stroke'}]}))
			.addControl("zoom")
			.addControl("info");


		projection = AVLmap.projection();
		zoom = AVLmap.zoom();
		path = d3.geo.path().projection(projection);

		popup = mapDIV.append('div')
			.attr('class', 'station-popup');

		$scope = $s;

		// states object
		var statesObj = {};

		var domain = []; // colorScale domain

		// load scope states data into states object
		for (var i in states) {
			statesObj[states[i].state_fips] = {stations: states[i].stations, name: states[i].name}
			domain.push(states[i].stations.length);
		}
		colorScale.domain(d3.extent(domain));

		d3.json('./us-states-10m.json', function(error, states) {

			statesJSON = topojson.feature(states, states.objects.states);

			var props;
			statesJSON.features.forEach(function(d) {
				// pad single digit FIPS with a 0 for compatibility
				if (d.id.toString().match(/^\d$/)) {
					d.id = '0' + d.id;
				}
				d.properties.fips = d.id.toString();
				if (d.id in statesObj) {
					d.properties.stations = statesObj[d.id].stations;
					d.properties.name = statesObj[d.id].name;
				}
			})

			_drawMap();
		})
	}

	this.wimstates = wimstates;
})()