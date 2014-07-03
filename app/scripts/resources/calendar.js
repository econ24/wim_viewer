//function that takes three parameters: stationId, url(where to get data from)[maybe combine url and stationId into one], the dom container(div that contains the calendar)
//url where to get the data#calendar


var wimCalendar = {
  init:function(min,max){
  	var html = [];
  	var caldiv = d3.select("#caldiv");
   	var m = {top: 10, right: 10, bottom: 25, left: 80},
      w = parseInt(caldiv.style('width'))-m.right,
      z = parseInt(w/54),
      h = parseInt(z*7);
      
      var day = d3.time.format("%w"),
          week = d3.time.format("%U"),
          //percent = d3.format(".1%"),
          format = d3.time.format("%Y-%m-%d");

      

      if(parseInt(min) < 10){
            min = "0"+min
          }
          if(parseInt(max) < 10){
            max = "0"+max
          }

          var svg = d3.select("#caldiv").selectAll("svg")
              .data(d3.range(2000+parseInt(min), 2001+parseInt(max)))
            .enter().append("svg")
              .attr("width", w + m.right + m.left + 100)
              .attr("height", h + m.top + m.bottom)
              .attr("class", "RdYlGn")
            .append("g")
              .attr("transform", "translate(" + (m.bottom + (w - z * 53) / 2) + "," + (m.top + (h - z * 7) / 2) + ")");
          svg.append("text")
              .attr("transform", "translate(-6," + z * 3.5 + ")rotate(-90)")
              .attr("text-anchor", "middle")
              .text(String);
          var svg2 = d3.select("#legend").selectAll("svg")
              .data(d3.range(0, 1))
            .enter().append("svg")
              .attr("width", 1200)
              .attr("height", 20)
              .attr("class", "RdYlGn")
            .append("g")
              .attr("transform", "translate(60,0)");
          var rect = svg.selectAll("rect.day")
              .data(function(d) { 
                return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("rect")
              .attr("class", "day")
              .attr("width", z)
              .attr("height", z)
              .attr("x", function(d) { return week(d) * z; })
              .attr("y", function(d) { return day(d) * z; })
              //.map(format);

          rect.append("title")
              .text(function(d) { return d; });

      html.push(z)
    	html.push(day)
    	html.push(week)
    	html.push(svg)
    	html.push(svg2)
    	html.push(rect)

    	return html

  },

  drawCalendar:function(rect,svg,input_data,day,week,z,svg2,dispType){
	  
  		
  		var values = [];
	    input_data.forEach(function(input){
	    	if(dispType === "Weight"){
	    		values.push(+input.averageWeight);
	    	}
	    	else{
	    		values.push(+input.numTrucks);	
	    	}
	    })

	    var color = d3.scale.quantize()
	        .domain([d3.min(values), d3.max(values)])
	        .range(colorbrewer.RdYlGn[11]);

	   
	      var data = wimCalendar.colorDays(svg,input_data,monthPath,rect,color,dispType)
	      
	      

	      //Legend is drawn below


	      	//truckData should contain strings detailing which truck goes where
	      	if(typeof wimCalendar.legend != 'undefined'){
	      		wimCalendar.legend.remove();
	      	}

	        var truckData = [Math.floor(color.invertExtent("#a50026")[0]) + " - " + Math.floor(color.invertExtent("#a50026")[1]),Math.floor(color.invertExtent("#d73027")[0]) + " - " + Math.floor(color.invertExtent("#d73027")[1]),Math.floor(color.invertExtent("#f46d43")[0]) + " - " + Math.floor(color.invertExtent("#f46d43")[1]),Math.floor(color.invertExtent("#fdae61")[0]) + " - " + Math.floor(color.invertExtent("#fdae61")[1]),Math.floor(color.invertExtent("#fee08b")[0]) + " - " + Math.floor(color.invertExtent("#fee08b")[1]),Math.floor(color.invertExtent("#ffffbf")[0]) + " - " + Math.floor(color.invertExtent("#ffffbf")[1]),Math.floor(color.invertExtent("#d9ef8b")[0]) + " - " + Math.floor(color.invertExtent("#d9ef8b")[1]),Math.floor(color.invertExtent("#a6d96a")[0]) + " - " + Math.floor(color.invertExtent("#a6d96a")[1]),Math.floor(color.invertExtent("#66bd63")[0]) + " - " + Math.floor(color.invertExtent("#66bd63")[1]),Math.floor(color.invertExtent("#1a9850")[0]) + " - " + Math.floor(color.invertExtent("#1a9850")[1]),Math.floor(color.invertExtent("#006837")[0]) + " - " + Math.floor(color.invertExtent("#006837")[1])]

	        var color2 = d3.scale.ordinal()
    			.range(["#a50026", "#d73027", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#d9ef8b","#a6d96a","#66bd63","#1a9850","#006837"]);


	        wimCalendar.legend = svg2.selectAll(".legend")
		      .data(truckData.slice())
		    .enter().append("g")
		      .attr("class", "legend")
		      .attr("transform", function(d, i) { return "translate(" + i * 95 + ",0)"; }); //Displays ordering of legend
		    
		 
				//Coordinates of legend
				  wimCalendar.legend.append("rect")
				      .attr("x", 0)
				      .attr("y", 0)
				      .attr("width", 95)
				      .attr("height", 18)
				      .style("fill", color2)    //Sets text of legend
				  
				  wimCalendar.legend.append("text")
				   	  .attr("x", 10)
				      .attr("y", 10)     
				      .attr("dy", ".35em")
				      .style("text-anchor", "front")
				      .style("font-size","12px")
				      .style("color","#fff")
				      .text(function(d) { return d; });

		function monthPath(t0) {
	      var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
	          d0 = +day(t0), w0 = +week(t0),
	          d1 = +day(t1), w1 = +week(t1);
	      return "M" + (w0 + 1) * z + "," + d0 * z
	          + "H" + w0 * z + "V" + 7 * z
	          + "H" + w1 * z + "V" + (d1 + 1) * z
	          + "H" + (w1 + 1) * z + "V" + 0
	          + "H" + (w0 + 1) * z + "Z";
	    }

	    
	},

colorDays:function(svg,input_data,monthPath,rect,color,dispType){
  var format = d3.time.format("%Y-%m-%d");

	svg.selectAll("path.month")
        .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
      .enter().append("path")
        .attr("class", "month")
        .attr("d", monthPath);

    var data = d3.nest() 
        .key(function(d) {  return d.date; }) //Creates key value
        .rollup(function(d) { 
        	if(dispType === "Weight"){
        		return +d[0].averageWeight; 
        	}
        	else{
        		return +d[0].numTrucks;	
        	}
        }) //create pair value
        .map(input_data); //Turns code into an array of objects

        svg.selectAll('rect.day').attr('style','fill:#fff');

        //Below code colors in the calendar
        rect.filter(function(d) { return format(d) in data; })
	          .attr("style", function(d) { 
	            return  "fill:"+color(data[format(d)])+";"; })
	        .select("title") //Creates hover icon
	          .text(function(d) { return d + ": " + data[format(d)]; }); //creates hover icon
	 
	  return data;

	}
}