function showObservations(observations) {
	var observationsContainer = jQuery('#observations');

	// Clear "observations" panel
	observationsContainer.html("");

	if (observations != undefined && observations.length > 0) {
		// Display header with observation's count
		observationsContainer.append(jQuery("<h3>" + observations.length + " observation" + (observations.length > 1 ? "s" : "") + "</h3>"));

		var observationsList = jQuery("<ul></ul>");
		observationsContainer.append(observationsList);

		// Iterate over each observation, to display informations
		observations.forEach(function(observation) {
			observationsList.append(jQuery("<li>" 
//					+ "<a href='javascript:showDetail(\"" + observation.get('id') + "\", \"visualisations-" + observation.get('id') + "\", \"" + observation.get('description') + "\");'>" 
					+ "<a href='" + SNANNY_API + "/observations/" + observation.get('id') + "/results' target='_blank'>" 
//					+ observation.get('id') 
					+ observation.get('name')
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
		});

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
	var observations = [];
	
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
			if (filter(observation)) {
				observations.push(observation);
			}
		});

	} else {

		observationsSource.forEachFeature(function(observation) {
			observations.push(observation);
		});

	}
	
	return observations;
}

function filterObservationsByTime(observations) {
	var filtered = [];
	
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
	
	observations.forEach(function(observation) {
		if (filter(observation)) {
			filtered.push(observation);
		}
	});
	
	return filtered;
}

function selectObservations(observations) {
	selectedFeatures.clear();
	observations.forEach(function(observation) {
		selectedFeatures.push(observation);
	});
}

function filterObservations() {
	var observations = filterObservationsByPosition();
	observations     = filterObservationsByTime(observations);
	selectObservations(observations);
	return observations;
}

function getObservationsCount() {
	var extent = map.getView().calculateExtent(map.getSize());
	var bottomLeft = ol.extent.getBottomLeft(extent);
	var topRight = ol.extent.getTopRight(extent);
	
	var bbox = [ parseFloat(bottomLeft[1].toFixed(2)), parseFloat(bottomLeft[0].toFixed(2)), parseFloat(topRight[1].toFixed(2)), parseFloat(topRight[0].toFixed(2)) ];
	var timerange = [ 0, new Date().getTime() ];
	if (timelineSelection != null && !timelineSelection.empty()) {
		timerange = [ (+timelineSelection.extent()[0]), (+timelineSelection.extent()[1]) ];
	}
//	loadObservationsCount(SNANNY_API + "/observations/synthetic/map?bbox=" + bbox.join(",") + "&time=" + timerange.join(","), SNANNY_API + "/observations/synthetic/timeline?bbox=" + bbox.join(",") + "&time=" + timerange.join(","));
	loadObservationsCount(SNANNY_API + "/observations/synthetic/map?bbox=" + bbox.join(",") + "&time=" + timerange.join(","), SNANNY_API + "/observations/synthetic/timeline?bbox=" + bbox.join(","));
}

function getObservations() {
	var extent = map.getView().calculateExtent(map.getSize());
	var bottomLeft = ol.extent.getBottomLeft(extent);
	var topRight = ol.extent.getTopRight(extent);
	
	var bbox = [ parseFloat(bottomLeft[1].toFixed(2)), parseFloat(bottomLeft[0].toFixed(2)), parseFloat(topRight[1].toFixed(2)), parseFloat(topRight[0].toFixed(2)) ];
	var timerange = [ 0, new Date().getTime() ];
	if (timelineSelection != null && !timelineSelection.empty()) {
		timerange = [ (+timelineSelection.extent()[0]), (+timelineSelection.extent()[1]) ];
	}
	
	d3.json(SNANNY_API + "/observations?bbox=" + bbox.join(",") + "&time=" + timerange.join(","), function(err, data) {
		observationsSource.clear();

		if (data && data.features && data.features.length > 0) {
			var vectorSource = new ol.source.GeoJSON({
				projection : 'EPSG:4326',
				object : data
			});
			
			observationsCountSource.clear();
			
			observationsSource.addFeatures(vectorSource.getFeatures());
		}
		
		observations = filterObservations();
		showObservations(observations);
		
		console.log(err);
		console.log(data);
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
			var vectorSource = new ol.source.GeoJSON({
				projection : 'EPSG:4326',
				object : data
			});
			
			observationsCountSource.clear();
			observationsCountSource.addFeatures(vectorSource.getFeatures());
			
			// FIXME: 
			selectionFeature.setGeometry(undefined);
			
			if (--loadingCount == 0) {
				stopLoading();
			}
		});
		if (!timelineInitialized) {
			loadingCount++;
		}
	}

	if (timelineZoomURL) {
		d3.json(timelineZoomURL, function(err, data) {
			if (!timelineInitialized) {
				initializeTimeline(data);
				timelineInitialized = true;
			} else {
				setTimeline(data);
			}
	
			if (--loadingCount == 0) {
				stopLoading();
			}
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