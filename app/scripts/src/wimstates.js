(function() {
	var wimstates = {
		version: 0.2,
	}

	var mapDIV = null,
		popup = null,
		statesJSON = null
		__JSON__ = {},
		centered = null,
		$scope = null,
		clicked = null,
		prevMarker = null,
		prevColor = null,
		stations = null,
		XHR = null;

	var AVLmap = null,
		customControl,
		width = 1000,
		height = 500;

	var projection = null,
		zoom = null,
		path = null;

	var colorScale = d3.scale.linear()
		.range(['#deebf7', '#08306b']);

	function _drawMap() {
		var dataCollection = {
			type: 'FeatureCollection',
			features: []
		}

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
		    		dataCollection.features.push(d);
		    		var marker = avl.MapMarker(projection.invert(path.centroid(d)),
						{name: d.id, BGcolor: colorScale(d.properties.stations.length), click: _clicked});
		    		AVLmap.addMarker(marker);
		    	}
    		});

    	customControl.click(function() {
    		_zoomToBounds(path.bounds(dataCollection));

    		// if there is a pending xhr, then abort it
    		if (XHR) {
    			XHR.abort();
    		}
    		// if there is an active state, then clear it
    		if (clicked) {
    			_clicked(clicked);
    		}
    	});

    	AVLmap.addAlert(_update);

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

        function _zoomToBounds(bounds, callback) {
	    	var	wdth = bounds[1][0] - bounds[0][0],
	    		hght = bounds[1][1] - bounds[0][1],
	    		center = projection.invert([bounds[0][0] + wdth/2,
	    								    bounds[0][1] + hght/2]),

	    		k = Math.min(width/wdth, height/hght),
	    		scale = zoom.scale()*k;

			zoom.scale(scale);
	        projection
	            .scale(zoom.scale() / 2 / Math.PI)
	            .center(center)
	            .translate([width / 2, height / 2])
	            .translate(projection([0, 0]))
	            .center([0, 0]);

	        zoom.translate(projection.translate());

	        if (callback) {
	        	callback();
	        }

	        AVLmap.zoomMap();
        }

		function _clicked(marker) {
	  		if (d3.event.defaultPrevented) return;

			var collection = {
					type: 'FeatureCollection',
					features: []
				};

			if (marker == clicked) {
				_drawStationPoints(collection);
				prevMarker.BGcolor(prevColor);
				clicked = prevMarker = prevColor = null;
				_updateScopeStations();
				return;
			}
			var name = marker.name();

	  		clicked = marker;

	  		if (prevMarker) {
				prevMarker.BGcolor(prevColor);
	  		}
	  		prevMarker = marker;
	  		prevColor = marker.BGcolor();

	  		marker.BGcolor("#fdae6b");

			_zoomToBounds(path.bounds(__JSON__[name]), _getStationPoints);

			_getStationData(name);

			function _getStationPoints() {
				var URL = '/stations/stateGeo/';
				XHR = wimXHR.get(URL + name, function(error, data) {
	            	XHR = null;
	            	if (error) {
	            		console.log(error);
	            		return;
	            	}
	            	if (clicked) {
						_drawStationPoints(_formatData(__JSON__[name], data));
					}
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
		function _getStationData(id) {
			id = id.toString();

			if (id.match(/^\d$/)) {
				id = '0' + id;
			}

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
		  		return stationsClass.map(function(el) {return el.stationId;}).indexOf(stationID)
		  	}
		}
		function _updateScopeStations(data) {
	  		$scope.$apply(function(){
	  			$scope.stations = [];
	  			$scope.stationsClass = [];
  			});
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
	wimstates.drawMap = function(id, states, $scp) {
		mapDIV = d3.select(id);

		width = parseInt(mapDIV.style('width'));
		height = width/2;

		mapDIV.style('width', width+"px")
			.style('height', height+"px");

var dmn = [5000, 200000];
var rng = ["#a50026","#d73027","#f46d43","#fdae61","#fee08b","#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"].reverse();

		AVLmap = avl.Map({id: id, minZoom: 3, maxZoom: 17})
			.addLayer(avl.RasterLayer("http://{s}.tiles.mapbox.com/v3/am3081.map-lkbhqenw/{z}/{x}/{y}.png"))
			.addControl("zoom")
			.addControl("info");

		customControl = AVLmap.customControl('avl-top-left', {name: 'Reset Zoom', position: 'avl-top-left'});

		projection = AVLmap.projection();
		zoom = AVLmap.zoom();
		path = d3.geo.path().projection(projection);

		popup = mapDIV.append('div')
			.attr('class', 'station-popup');

		$scope = $scp;

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