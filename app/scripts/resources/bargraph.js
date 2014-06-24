var AADTGraph ={
	svg:{},

	initAADTGraph:function(elem){

		AADTGraph.margin = {top: 5, right: 5, bottom: 10, left:50},
		AADTGraph.width = parseInt($(elem).width()) - AADTGraph.margin.left - AADTGraph.margin.right,
		AADTGraph.height = parseInt($(elem).width()*0.75) - AADTGraph.margin.top - AADTGraph.margin.bottom;

		AADTGraph.svg = d3.select(elem).append("svg")
		    .attr("width", AADTGraph.width + AADTGraph.margin.left + AADTGraph.margin.right)
		    .attr("height", AADTGraph.height + AADTGraph.margin.top + AADTGraph.margin.bottom)
		  .append("g")
		    .attr("transform", "translate(" + AADTGraph.margin.left + "," + AADTGraph.margin.top + ")");

	},
	drawAADTGraph:function(graphData,classT){
		//console.log('graphData',graphData);

		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, AADTGraph.width], 0.1);

		var y = d3.scale.linear()
		    .range([AADTGraph.height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		  
		AADTGraph.graphData = graphData;
		graphData.sort(compareStations);
		x.domain(graphData.map(function(d,i) { return graphData[i].stationId; }));
		y.domain([0, d3.max(graphData, function(d,i) { return totalAADT(graphData[i].years); })]);

		var color = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return totalAADT(graphData[i].years); }), d3.max(graphData, function(d,i) { return totalAADT(graphData[i].years); })])
	        .range(colorbrewer.RdYlGn[11]);

	    AADTGraph.svg.selectAll("g").remove();

		AADTGraph.svg.append("g")
		  .attr("class", "y axis")
		  .call(yAxis)
		.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 6)
		  .attr("dy", ".71em")
		  .style("text-anchor", "end")
		  .text("AAADT");

		var rect =AADTGraph.svg.selectAll("rect");
			rect.remove();
			rect =AADTGraph.svg.selectAll("rect")
		  		.data(graphData);
		rect.enter().append("rect")
		  	.attr("class","enter")
		  	.attr("x", function(d,i) { return x(graphData[i].stationId); })
		  	.attr("width", x.rangeBand())
		  	.attr("y", function(d,i) { return y(totalAADT(graphData[i].years)); })
		  	.attr("style", function(d,i) { return  "fill:"+color(totalAADT(graphData[i].years))+";"; })
		  	.attr("height", function(d,i) { return AADTGraph.height - y(totalAADT(graphData[i].years)); })
		  	.on("click",function(d,i) { window.location ="/station/wim/"+ graphData[i].stationId; })
		  	.on("mouseover",function(d,i) {
		  		$(this).attr('opacity',0.5);
		  		$('#map_station_'+graphData[i].stationId).attr('stroke-width','2px');
		  		$('#map_station_'+graphData[i].stationId).attr('stroke','yellow');
		  		if(classT != "class"){
			  		var info =  "<p class="+graphData[i].stationId+">Station: " +graphData[i].stationId+
								"<br> Number of years of data: "+graphData[i].years.length+
								"<br>ACompleteness: "+totalAADT(graphData[i].years,"percent")+
								"<br>AAADT: "+totalAADT(graphData[i].years)+
								"</p>";
				}
				else{
					var info = "<p class="+graphData[i].stationId+">Station: " +graphData[i].stationId+
					"<br> Number of years of data: "+graphData[i].years.length+
					"<br> ADT: "+totalAADT(graphData[i].years)+
					"</p>"
				}

		  		$("#stationInfo").html(info);
		  		//$("#stationInfo").show();
		  	})
		  	.on("mouseout",function(d,i) {
		  		$('#map_station_'+graphData[i].stationId).attr('stroke-width','none');
		  		$('#map_station_'+graphData[i].stationId).attr('stroke','none');
		  		$(this).attr('opacity',1);
		  		$("#stationInfo").html('');
		  		//$("#stationInfo").hide();
		  	});
		
		function totalAADT(arr,check){
			var total = 0;

			for(var i = 0;i<arr.length;i++){
				if(classT === "class"){total = total + arr[i].ADT;}
				else if(typeof check === 'undefined'){ total = total + arr[i].AADT; }
				else{ total = total + arr[i].percent; }
			}

			total = total / arr.length;
			return total;
		}
		
		function compareStations(a, b) {
		  return totalAADT(a.years) - totalAADT(b.years);
		}		
	}
}