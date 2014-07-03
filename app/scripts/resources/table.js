var wimTable = {
	drawTable:function(data){
		var nameMap = { func_class_code : 'Functional Class Code',
			num_lanes_direc_indicated:"Num Lanes",
			sample_type_for_traffic_vol:"Traffic Volume Trends Site",
			method_of_traffic_vol_counting:"Permanant Site",
			alg_for_vehicle_class:"Classification Algorightm",
			class_sys_for_vehicle_class:"Class System",
			method_of_truck_weighing:"WIM Method",
			calibration_of_weighing_sys:"Wim Calibration",
			type_of_sensor:"Sensor Type",
			second_type_of_sensor:"Second Sensor Type",
			primary_purpose:"Primary purpose",
		}

		var method_of_weghing= {
			1:"Portable static scale",
			2:"Chassis-mounted, towed static scale",
			3:"Platform or pit static scale",
			4:"Portable weigh-in-motion system",
			5:"Permanent weigh-in-motion system",
		}
		var sample_type_for_traffic_vol={
			T:"Yes",
			N:"No",
		}
		var method_of_traffic_vol_counting={
			1:"No",
			2:"No",
			3:"Yes",
		}
		var alg_for_vehicle_class={
			A:"Human observation on site (manual)",
			B:"Human observation of vehicle image (e.g., video)",
			C:"Automated interpretation of vehicle image or signature (e.g., video, microwave, sonic)",
			D:"Vehicle length classification",
			E:"Axle spacing with ASTM Standard E1572",
			F:"Axle spacing with Scheme F",
			G:"Axle spacing with Scheme F modified",
			H:"Other axle spacing algorithm",
			K:"Axle spacing and weight algorithm",
			L:"Axle spacing and vehicle length algorithm",
			M:"Axle spacing, weight, and vehicle length algorithm",
			N:"Axle spacing and other input(s) not specified above",
			Z:"Other means not specified above",
		}
		var calibration_of_weighing_sys={
			A:"ASTM Standard E1318",
			B:"Subset of ASTM Standard E1318",
			C:"Combination of test trucks and trucks from the traffic stream (but not ASTM E1318)",
			D:"Other sample of trucks from the traffic stream",
			M:"Moving average of the steering axle of 3S2s",
			S:"Static calibration",
			T:"Test trucks only",
			U:"Uncalibrated",
			Z:"Other method",
		}
		var type_of_sensor={
			A:"Automatic vehicle identification (AVI)",
			B:"Bending plate",
			C:"Capacitance strip",
			D:"Capacitance mat/pad",
			E:"Hydraulic load cells",
			F:"Fiber optic-NEW",
			G:"Strain gauge on bridge beam",
			H:"Human observation (manual)",
			I:"Infrared",
			K:"Laser/lidar",
			L:"Inductance loop",
			M:"Magnetometer",
			P:"Piezoelectric",
			Q:"Quartz piezoelectric-NEW",
			R:"Road tube",
			S:"Sonic/acoustic",
			T:"Tape switch",
			U:"Ultrasonic",
			V:"Video image",
			W:"Microwave",
			X:"Radio wave",
			Z:"Other",
		}
		var primary_purpose={
			E:"Enforcement purposes (e.g., speed or weight enforcement)",
			I:"Operations purposes in support of ITS initiatives",
			L:"Load data for pavement design or pavement management purposes",
			O:"Operations purposes but not ITS",
			P:"Planning or traffic statistics purposes",
			R:"Research purposes (e.g., LTPP)",
		}
		var posted_route_sign={
			0:"Not signed",
			5:"County",
			1:"Interstate",
			6:"Township",
			2:"U.S.",
			7:"Municipal",
			3:"State",
			8:"Parkway or Forest Route Marker",
			4:"Off-Interstate Business Marker",
			9:"None of the above",
		}


		$("#wimtable").append("<table class=\"table table-hover\"><tr id='WTR1'></tr><tr id='WTR2'></tr><tr id='WTR3'></tr><tr id='WTR4'></tr><tr id='WTR5'></tr><tr id='WTR6'></tr><tr id='WTR7'></tr><tr id='WTR8'></tr><tr id='WTR9'></tr><tr id='WTR10'></tr></table>")
		for(var i = 0;i<20;i++){
			xtag = "#WTR"+parseInt(Math.floor(i/2)+1)
			if(data.schema.fields[i].name === "national_highway_sys"){
				$(xtag).append("<th>Route</th><td>"+posted_route_sign[data.rows[0].f[i].v]+" "+parseInt(data.rows[0].f[i+1].v)+"</td>")
				i++
			}
			else if(data.schema.fields[i].name === "latitude"){
				$("#WTR9").append("<th>Lat/Long</th><td>"+data.rows[0].f[i].v+","+data.rows[0].f[i+1].v+"</td>")
				i++	
			}
			else if(nameMap[data.schema.fields[i].name] == undefined){
				if(data.schema.fields[i].name === "method_of_weghing"){
					$(xtag).append("<th>"+data.schema.fields[i].name+"</th><td>"+method_of_weghing[data.rows[0].f[i].v]+"</td>")
				}
				else{
						$(xtag).append("<th>"+data.schema.fields[i].name+"</th><td>"+data.rows[0].f[i].v+"</td>")
					
				}
			}
			else{
				if(data.schema.fields[i].name === "sample_type_for_traffic_vol" ){
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+sample_type_for_traffic_vol[data.rows[0].f[i].v]+"</td>")
				}
				else if(data.schema.fields[i].name ==="method_of_traffic_vol_counting" ){
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+method_of_traffic_vol_counting[data.rows[0].f[i].v]+"</td>")
				}
				else if(data.schema.fields[i].name === "alg_for_vehicle_class" ){
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+alg_for_vehicle_class[data.rows[0].f[i].v]+"</td>")
				}
				else if(data.schema.fields[i].name === "calibration_of_weighing_sys" ){
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+calibration_of_weighing_sys[data.rows[0].f[i].v]+"</td>")
				}
				else if(data.schema.fields[i].name === "type_of_sensor" ){
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+type_of_sensor[data.rows[0].f[i].v]+"</td>")
				}
				else if(data.schema.fields[i].name === "primary_purpose"){
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+primary_purpose[data.rows[0].f[i].v]+"</td>")
				}
				else{
					$(xtag).append("<th>"+nameMap[data.schema.fields[i].name]+"</th><td>"+data.rows[0].f[i].v+"</td>")
				}
				
			}
		}
	}

}