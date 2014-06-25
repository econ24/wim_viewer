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
	/*

	The draw graph function has the following parameter conditions:
	graphData: Data to by organized in graph
	classT: set this flag to the string class when you want to display class data
	PST: These three boolean flags are used in conjunction with the kind of data
	you wish to display. If P is set to true, then passenger data will be displayed.
	If S is set to true, then Single Unit data will be displayed. If T is set to
	true, then tractor trailer data will be displayed. If P, S, or T are left
	undefined, then the data will not be diplayed.

	*/

	drawAADTGraph:function(graphData,classT,PST){
		//console.log('graphData',graphData);

		var x = d3.scale.ordinal()
		    .rangeRoundBands([0, AADTGraph.width], 0.1);

		var y = d3.scale.linear()
		    .rangeRound([AADTGraph.height, 0]);

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom");

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		for(var z = 0;z<graphData.length;z++){
			if(PST != undefined){
				if(PST[0]){
					graphData[z].AAPT = totalAADT(graphData[z].years,"APT")
				}
				if(PST[1]){
					graphData[z].AASU = totalAADT(graphData[z].years,"ASU")
				}
				if(PST[2]){
					graphData[z].AATT = totalAADT(graphData[z].years,"ATT")
				}
			}
			graphData[z].heights[0].y1 = graphData[z].AAPT
			graphData[z].heights[1].y0 = graphData[z].heights[0].y1 
			graphData[z].heights[1].y1 = graphData[z].heights[0].y1 + graphData[z].AASU
			graphData[z].heights[2].y0 = graphData[z].heights[1].y1 
			graphData[z].heights[2].y1 = graphData[z].heights[1].y1 + graphData[z].AATT
			console.log(graphData[z].heights[2].y1)
		}
		graphData.sort(compareStations);
		  
		AADTGraph.graphData = graphData;
		x.domain(graphData.map(function(d,i) { return graphData[i].stationId; }));
		y.domain([0, d3.max(graphData, function(d,i) { return graphData[i].heights[2].y1; })]);


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

		var rect2 =AADTGraph.svg.selectAll("rect")
				 rect2.remove();
		
		var colorP = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return graphData[i].AAPT; }), d3.max(graphData, function(d,i) { return graphData[i].AAPT; })])
	        .range(colorbrewer.RdYlGn[11]);
	    var colorS = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return graphData[i].AASU; }), d3.max(graphData, function(d,i) { return graphData[i].AASU; })])
	        .range(colorbrewer.RdYlGn[11]);
	    var colorT = d3.scale.quantize()
	        .domain([d3.min(graphData, function(d,i) { return graphData[i].AATT; }), d3.max(graphData, function(d,i) { return graphData[i].AATT; })])
	        .range(colorbrewer.RdYlGn[11]);

		var zz = 0;
		var rect = AADTGraph.svg.selectAll(".graph")
	      .data(graphData)
	    .enter().append("g")
	      .attr("class", "g")
			  	
	    rect.selectAll("rect")
	      .data(function(d) { console.log(d);return d.heights; })
	    .enter().append("rect")
			  	.attr("class","enter")
			  	.attr("x", function(d,i) { if(i==0){++zz;}; return x(graphData[zz-1].stationId); })
			  	.attr("width", x.rangeBand())
			  	.attr("y", function(d,i) { if(d.y1 == 0){return 0}; return y(d.y1); })
			  	.attr("height", function(d,i) {zz = 0; return y(d.y0) - y(d.y1); })
			  	.attr("style", function(d,i,zz) { 
			  		if(i==0){return  "fill:"+colorP(graphData[zz].AAPT)+";";}
			  		else if(i==1){return  "fill:"+colorS(graphData[zz].AASU)+";";}
			  		else {return  "fill:"+colorT(graphData[zz].AATT)+";";} 
			  	})
			  	.on("click",function(d,i,zz) { window.location ="#/station/class/"+ graphData[zz].stationId; })
			  	.on("mouseover",function(d,i,zz) {
			  		$(this).attr('opacity',0.5);
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke-width','2px');
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke','yellow');
			  		if(classT !== "class"){
				  		var info =  "<p class="+graphData[i].stationId+">Station: " +graphData[i].stationId+
									"<br> Number of years of data: "+graphData[i].years.length+
									"<br>ACompleteness: "+totalAADT(graphData[i].years,"percent")+
									"<br>AAADT: "+totalAADT(graphData[i].years)+
									"</p>";
					}
					else{
						var info = "<p class="+graphData[zz].stationId+">Station: " +graphData[zz].stationId+
						"<br> Number of years of data: "+graphData[zz].years.length+
						"<br> ADT: "+totalAADT(graphData[zz].years,"class");
						if(i == 0){
							info = info+"<br> APT: "+graphData[zz].AAPT+"</p>"
						}
						else if(i == 1){
							info = info+"<br> ASU: "+graphData[zz].AASU+"</p>"
						}
						else{
							info = info+"<br> ATT: "+graphData[zz].AATT+"</p>"
						}

					}

			  		$("#stationInfo").html(info);
			  		//$("#stationInfo").show();
			  	})
			  	.on("mouseout",function(d,i,zz) {
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke-width','none');
			  		$('#map_station_'+graphData[zz].stationId).attr('stroke','none');
			  		$(this).attr('opacity',1);
			  		$("#stationInfo").html('');
			  		//$("#stationInfo").hide();
			  	});
		
		function totalAADT(arr,check){
			var total = 0;

			for(var i = 0;i<arr.length;i++){
				if(check === "APT"){total = total+arr[i].APT}
				else if(check === "ASU"){total = total+arr[i].ASU}
				else if(check === "ATT"){total = total+arr[i].ATT}
				else if(check === "class"){total = total+arr[i].ADT}	
				else if(classT === "class"){total = total + arr[i].ADT;}
				else if(typeof check === 'undefined'){ total = total + arr[i].AADT; }
				else{ total = total + arr[i].percent; }
			}

			total = total / arr.length;
			return total;
		}
		
		function compareStations(a, b) {
		  return a.heights[2].y1 - b.heights[2].y1;
		}	
	}
}