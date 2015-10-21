function showObservations(observations) {
	var observationsContainerHeader = jQuery('#observationsHeader');
	var observationsContainer = jQuery('#observations');

	// Clear "observations" panel
	observationsContainerHeader.html("");
	observationsContainer.html("");

	if (observations != undefined && observations.length > 0) {

		var observationsList = jQuery("<ul></ul>");
    
    var uuids = {};
    
    var observationsCount = 0;

    // Iterate over each observation, to display informations
    observations.forEach(function(observation) {
      
      var uuid = observation.get('uuid');
      
      if (uuids[uuid] == undefined) {
      
        var resultFilename = (observation.get('result').match(/[^\\/]+\.[^\\/]+$/) || []).pop();
        
        observationsList.append(jQuery("<li>" 
  //					+ "<a href='javascript:showDetail(\"" + observation.get('id') + "\", \"visualisations-" + observation.get('id') + "\", \"" + observation.get('description') + "\");'>" 
            + "<a id='" + uuid + "' href='" + SNANNY_API + "/observations/" + observation.get('id') + "/results' target='_blank' onmouseover='selectObservationOnMap(\"" + uuid + "\")'>" 
  //					+ observation.get('id') 
  //					+ observation.get('name')
            + resultFilename
            + " <i>(" + observation.get('author') + ")</i>" 
            + "</a>" + " " 
  //					+ observation.get('author') + " " 
  //					+ observation.get('description')
  //					+ " from " + new Date(observation.get('time').begin).toLocaleString() + " to "
  //					+ new Date(observation.get('time').end).toLocaleString() + " " 
  //					+ observation.get('result') + " " 
  //					+ observation.get('bbox')
            + "<div class='visualisation' id='visualisations-" + observation.get('id') + "' style='display: none;'></div>"
            + "</li>"
        ));
        
        observationsCount++;
        
        // Simulate a Set collection
        uuids[uuid] = 1;
      
      }


		});
    
    // Display header with observation's count
		observationsContainerHeader.append(jQuery("<h4>" + $('#individualObsPointCount').text() + " points from " + observationsCount + " observation" + (observationsCount > 1 ? "s" : "") + "</h4>"));
    
    if (timelineSelection != null && !timelineSelection.empty()) {
      observationsContainerHeader.append(jQuery("<p>from " 
		+ moment(+timelineSelection.extent()[0]).format('lll') 
		+ " to " 
		+ moment(+timelineSelection.extent()[1]).format('lll') 
		+ "</p>"
	));
    }else observationsContainerHeader.append(jQuery("<p>on full time range</p>"));
    
    observationsContainer.append(observationsList);

	}
}

function allObservations() {
	var observations = [];
	
	observationsSource.forEachFeature(function(observation) {
		observations.push(observation);
	});
	
	return observations;
}

function filterObservationsByPosition() {
	//var observations = [];
	
	if (selectionFeature.getGeometry() != undefined && selectionFeature.getGeometry() != null) {

		filter = function(observation) {
//			// Observation without bounding box
//			if (observation.getProperties().bbox == undefined || observation.getProperties().bbox.length == 0) {
//				return true;
//			}
			
			var geometry = observation.getGeometry();
			if (geometry.intersectsExtent(selectionFeature.getGeometry().getExtent())) {
				return true;
			}
			
			return false;
		};
		
		observationsSource.forEachFeature(function(observation) {
			if (!filter(observation)) {
				observationsSource.removeFeature(observation);
				//observations.push(observation);
			}
		});

	}
	/*
	 else {

		observationsSource.forEachFeature(function(observation) {
			observations.push(observation);
		});

	}
	*/
	
	//return observations;
}

function filterObservationsByTime() {
	//var filtered = [];
	
	var filter;
	
	if (timelineSelection == null || timelineSelection.empty()) {
		filter = function() {
			return true;
		};
	} else {
		filter = function(observation) {
			var observationResultTimestamp = observation.get('resulttimestamp') * 1000;

			var selectionStart = (+timelineSelection.extent()[0]);
			var selectionEnd = (+timelineSelection.extent()[1]);
			
			return selectionStart <= observationResultTimestamp && observationResultTimestamp <= selectionEnd;
		};
	}
	
	//observations.forEach(function(observation) {
        observationsSource.forEachFeature(function(observation) {
		if (!filter(observation)) {
			observationsSource.removeFeature(observation);
			//filtered.push(observation);
		}
	});
	
	//return filtered;
}

function selectObservations(observations) {
	selectedFeatures.clear();
	observations.forEach(function(observation) {
		selectedFeatures.push(observation);
	});
}

function filterObservations() {
	//var observations = filterObservationsByPosition();
	//observations     = filterObservationsByTime(observations);
	filterObservationsByTime();
	//selectObservations(observations);
	return observations;
}

function getObservationsCount() {
	var extent = map.getView().calculateExtent(map.getSize());
	var bottomLeft = ol.extent.getBottomLeft(extent);
	var topRight = ol.extent.getTopRight(extent);
	
	var bbox = [ parseFloat(bottomLeft[1].toFixed(2)), parseFloat(bottomLeft[0].toFixed(2)), parseFloat(topRight[1].toFixed(2)), parseFloat(topRight[0].toFixed(2)) ];
	
	var bboxQuery = "?bbox=" + bbox.join(",");
	var timeQuery = "";
	if (timelineSelection != null && !timelineSelection.empty()) {
		timeQuery = "&time="+(+timelineSelection.extent()[0])+","+(+timelineSelection.extent()[1]);
	}
	
	var kwordsQuery = "";
	var searchText =  $("#searchInput").val();
	if(searchText != ""){
		kwordsQuery = "&kwords="+searchText;
	}
	
	loadObservationsCount(MAP_RESOURCES+bboxQuery+timeQuery+kwordsQuery,TIMELINE_RESOURCES+bboxQuery+kwordsQuery);
}

function getObservations() {
	var extent = map.getView().calculateExtent(map.getSize());
	var bottomLeft = ol.extent.getBottomLeft(extent);
	var topRight = ol.extent.getTopRight(extent);

	var bbox = [ parseFloat(bottomLeft[1].toFixed(2)), parseFloat(bottomLeft[0].toFixed(2)), parseFloat(topRight[1].toFixed(2)), parseFloat(topRight[0].toFixed(2)) ];
	
	var bboxQuery = "?bbox=" + bbox.join(",");
	var timeQuery = "";
	if (timelineSelection != null && !timelineSelection.empty()) {
		timeQuery = "&time="+(+timelineSelection.extent()[0])+","+(+timelineSelection.extent()[1]);
	}
	
	var kwordsQuery = "";
	var searchText =  $("#searchInput").val();
	if(searchText != ""){
		kwordsQuery = "&kwords="+searchText;
	}
	
	var observationsContainerHeader = jQuery('#observationsHeader');
	var observationsContainer = jQuery('#observations');
	// Clear "observations" panel
	observationsContainer.html("");
	observationsContainerHeader.html("");
	observationsContainerHeader.append("<h4>loading...</h4>");
	observationsContainerHeader.append("<p>&nbsp;</p>");

	d3.json(OBSERVATIONS_RESOURCES+bboxQuery+timeQuery+kwordsQuery, function(err, data) {
		$('#individualObsPointLoading').text("1");
		observationsSource.clear(true);
	
		if (data && data.status == "success" && data.features && data.features.length > 0 ){

			var vectorSource = new ol.source.GeoJSON({
				projection : 'EPSG:4326',
				object : data
			});
			
			observationsCountSource.clear();
			
			observationsSource.addFeatures(vectorSource.getFeatures());

			//observations = filterObservations();
			filterObservations();
			showObservations(observationsSource.getFeatures());
			
		}else if (data && (data.status == "timeOut" || data.status == "tooMany")) {
			while($('#syntheticMapLoading').text() == 1){1;}
			observationsContainerHeader.html("");
			observationsContainerHeader.append("<h4>" + $('#individualObsPointCount').text() + " points available </h4> \
						      <p>refine your request to see individual observations...");

		}else if (data && data.status == "empty") {
			observationsContainerHeader.html("");
			observationsContainerHeader.append("<h4>no point</h4> \
						      <p>please relax you request...</p>");
			observationsCountSource.clear();

		}

		$('#individualObsPointLoading').text("0");
   		//console.log(err);
                //console.log(data);
		
		
		
		
	});

   

	
}

function startLoading() {
	document.getElementsByTagName('body')[0].classList.add("chargement");
}

function stopLoading() {
	document.getElementsByTagName('body')[0].classList.remove("chargement");	
}

var timelineInitialized = false;

function loadObservationsCount(mapZoomURL, timelineZoomURL) {
	var loadingCount = 0;

	if (mapZoomURL) {
		d3.json(mapZoomURL, function(err, data) {
			$('#syntheticMapLoading').text("1");
			var vectorSource = new ol.source.GeoJSON({
				projection : 'EPSG:4326',
				object : data
			});
			
			observationsCountSource.clear();
			observationsCountSource.addFeatures(vectorSource.getFeatures());			
			$('#individualObsPointCount').text(data['totalCount']);

			// FIXME: 
			//selectionFeature.setGeometry(undefined);
			
			if (--loadingCount == 0) {
				stopLoading();				
			}
			$('#syntheticMapLoading').text("0");
			

		});
		if (!timelineInitialized) {
			loadingCount++;
		}
	}

	if (timelineZoomURL) {
		d3.json(timelineZoomURL, function(err, data) {
			$('#timelineLoading').text("1");
			if (!timelineInitialized) {
				initializeTimeline(data);
				timelineInitialized = true;
			} else {
				setTimeline(data);
			}
	
			if (--loadingCount == 0) {
				stopLoading();
			}
			$('#timelineLoading').text("0");
		});
		if (!timelineInitialized) {
			loadingCount++;
		}
	}
	
	if (loadingCount > 0) {
		startLoading();
	}


}

function loadObservations(observationsURL) {
	startLoading();

	d3.json(observationsURL, function(err, data) {
		var vectorSource = new ol.source.GeoJSON({
			projection : 'EPSG:4326',
			object : data
		});
		
		observationsSource.clear();
		observationsSource.addFeatures(vectorSource.getFeatures());
		
//		selectionFeature.setGeometry(undefined);

		observations = filterObservations();

		showObservations(observations);
		
		initializeTimeline(observations);
		
		stopLoading();
		
		
	});
}

function showDetail(observationID, container, title) {
//	showDetailEnvision(observationID, container, title);
//	showDetailNVD3(observationID, container, title);
	showDetailDygraph(observationID, container, title);
}

function showDetailEnvision(observationID, container, title) {
	container = document.getElementById(container);
	d3.json(SNANNY_API + '/observations/' + observationID + '/results.json', function(data) {
		var options = {
				container : container,
				data : {
					detail : data[0].values,
					summary : data[0].values
				},
	//			An initial selection
//				selection : {
//					data : {
//						x : {
//							min : 100,
//							max : 200
//						}
//					}
//				}
		};
	
		new envision.templates.TimeSeries(options);
	});
}

var graphs = [];
var graphsSync = null;

function showDetailDygraph(observationID, container, title) {
	
	document.getElementById(container).style.cssText = '';
	graphs.push(new Dygraph(container, SNANNY_API + '/observations/' + observationID + '/results', {
	  legend: 'always',
//      errorBars: true,
//	  title: title,
//	  showRoller: true,
//	  rollPeriod: 14,
//	  customBars: true,
//	  ylabel: 'Temperature (F)', // FIXME: find right unit
	}));
	
	if (graphsSync != null) {
		graphsSync.detach();
	}
	if (graphs.length >= 2) {
		graphsSync = Dygraph.synchronize(graphs, {
			 selection: true,
			 zoom: false,
			 range: false
		});
	}
	
}

function showDetailNVD3(observationID, container, title) {
	d3.json(SNANNY_API + '/observations/' + observationID + '/results.json', function(data) {
		
		document.getElementById(container).style.cssText = '';
		
		data.forEach(function(each, index) {
			var eachContainer = container + '-' + index;
			nv.addGraph(function() {
				//var chart = nv.models.cumulativeLineChart()
				var chart = nv.models.lineChart()
				.x(function(d) { return d[0] })
				.y(function(d) { return d[1] })
				.color(d3.scale.category10().range())
				.useInteractiveGuideline(true)
				;
				
				chart.xAxis
				.axisLabel('Time')
				.tickFormat(function(d) {
					return d3.time.format('%x')(new Date(d))
				})
				;
				
				chart.yAxis
				.axisLabel(each.key)				// FIXME: find unit
				.tickFormat(d3.format(',.1f'))	// FIXME: find unit
				;
				
				chart.y2Axis
//					.axisLabel(each.key)				// FIXME: find unit
				.tickFormat(d3.format(',.1f'))	// FIXME: find unit
				;
				
				if (data == null || data.length == 0) {
					d3.select('#' + eachContainer).html("");
				}
				
				d3.select('#' + eachContainer)
				.datum([ each ])
				.transition().duration(500)
				.call(chart);
				
				//TODO: Figure out a good way to do this automatically
				nv.utils.windowResize(chart.update);
				
				return chart;
			});
		});
	});
}
