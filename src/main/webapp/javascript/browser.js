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
					+ "<a href='/api/rest/observations/" + observation.get('id') + "/results' target='_blank'>" 
//					+ observation.get('id') 
					+ observation.get('description')
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
			// Observation without bounding box
			if (observation.getProperties().bbox == undefined || observation.getProperties().bbox.length == 0) {
				return true;
			}
			
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
			var observationBegin = observation.get('time').begin;
			var observationEnd = observation.get('time').end;
			if (observationEnd == undefined) {
				observationEnd = new Date().getTime();
			}
			var selectionStart = (+timelineSelection.extent()[0]);
			var selectionEnd = (+timelineSelection.extent()[1]);
			
			return (selectionStart <= observationBegin && observationBegin <= selectionEnd)
			|| (observationBegin <= selectionStart && selectionEnd <= observationEnd)
			|| (selectionStart <= observationEnd && selectionEnd >= observationEnd)
			|| (selectionStart <= observationBegin && selectionEnd >= observationEnd);
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

function startLoading() {
	document.getElementsByTagName('body')[0].classList.add("chargement");
}

function stopLoading() {
	document.getElementsByTagName('body')[0].classList.remove("chargement");	
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
		
		selectionFeature.setGeometry(undefined);

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
	d3.json('/api/rest/observations/' + observationID + '/results.json', function(data) {
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
	graphs.push(new Dygraph(container, '/api/rest/observations/' + observationID + '/results', {
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
	d3.json('/api/rest/observations/' + observationID + '/results.json', function(data) {
		
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