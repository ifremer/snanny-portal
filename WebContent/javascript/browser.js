function showObservations(observations) {
	var observationsContainer = document.getElementById('observations');

	// Clear "observations" panel
	observationsContainer.innerHTML = "";

	if (observations != undefined && observations.length > 0) {
		// Display header with observation's count
		observationsContainer.innerHTML += "<h3>" + observations.length + " observation" + (observations.length > 1 ? "s" : "") + "</h3>";

		observationsContainer.innerHTML += "<ul>";

		// Iterate over each observation, to display informations
		observations.forEach(function(observation) {
			observationsContainer.innerHTML += "<li>" + observation.get('id') + " " + observation.get('author') + " " + observation.get('description')
					+ " from " + new Date(observation.get('time').begin).toLocaleString() + " to "
					+ new Date(observation.get('time').end).toLocaleString() + " " + observation.get('result') + " " + observation.get('bbox') + "</li>";
		});

		observationsContainer.innerHTML += "</ul>";
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

		observationsSource.forEachFeatureIntersectingExtent(selectionFeature.getGeometry().getExtent(), function(observation) {
			observations.push(observation);
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