
function showObservations(observations) {
	var observationsContainerHeader = jQuery('#observationsHeader');
	var observationsContainer = jQuery('#observations');
	// Clear "observations" panel
	observationsContainerHeader.html("");
	observationsContainer.html("");

	
	if (observations != undefined && observations.length > 0) {
		jQuery('#browserActions').show('slow');
		var uuids = {};
		var ancestorUuids = {};

		var observationsCount = 0;

		var tree = [];

		// Iterate over each observation, to display informations
		observations.forEach(function(observation) {

			var uuid = observation.get('snanny-uuid');

			if (uuids[uuid] == undefined) {

				var ancestors = observation.get('snanny-ancestors');
				var parent = '#';
				ancestors.forEach(function(ancestor) {

					var uuid = ancestor['snanny-ancestor-uuid'];
					if (ancestorUuids[uuid] == undefined) {
						tree.push({
							"id": uuid,
							"text": ancestor['snanny-ancestor-name'],
							"parent": parent,
							"icon": "sensor-ico",
							"a_attr": {
								"onMouseOver": "selectObservationOnMap('" + uuid + "')"
							}
						});
						ancestorUuids[uuid] = 1;
					}
					parent = uuid;

				});
				//Then add observation in the treeView
				var uuid = observation.get('snanny-uuid');
				var id = observation.get('snanny-id');
				var author = observation.get('snanny-author');
				//var resultFilename = (observation.get('snanny-result').match(/[^\\/]+\.[^\\/]+$/) || []).pop();
				var resultFilename = observation.get('snanny-result');
				var name = observation.get('snanny-name');
				var href = DATA_ACCESS_URI + "data/" + uuid + "/download";
				tree.push({
					"id": uuid,
					"parent": parent,
					"text": name,
					"icon": "observation-ico",
					"a_attr": {
						"href": href,
						"target": "_blank",
						"onMouseOver": "selectObservationOnMap('" + uuid + "')"
					}
				});

				observationsCount++;
				// Simulate a Set collection
				uuids[uuid] = 1;
			}


		});

		// Display header with observation's count
		observationsContainerHeader.append(jQuery("<h4>" + $('#individualObsPointCount').text() + " points from " + observationsCount + " observation" + (observationsCount > 1 ? "s" : "") + "</h4>"));

		if (timelineSelection != null && timelineSelection.length>0) {
			observationsContainerHeader.append(jQuery("<p>from " + moment(+timelineSelection[0]).format('lll') + " to " + moment(+timelineSelection[1]).format('lll') + "</p>"));
		} else {
			observationsContainerHeader.append(jQuery("<p>on full time range</p>"));
		}
		observationsContainer.jstree('destroy');
		observationsContainer.jstree({
			"core": {
				"data": tree
			}
		})
		$("#observations").on("select_node.jstree", function(e, data) {
			$("#observations").jstree().toggle_node(data.node);
			selectObservationOnMap(data.node.id);
		});
	}else{
		jQuery('#browserActions').hide('slow');
	}
}


function appendObservation(observation) {
	//
	var ancestors = observation.get('ancestors');
	ancestors.forEach(function(ancestor) {
		//append ancestor if exist 
		var ancestorItem = jQuery("#" + ancestor);

	});

}

function allObservations() {
	var observations = [];

	observationsSource.forEachFeature(function(observation) {
		observations.push(observation);
	});

	return observations;
}

function filterObservationsByPosition() {
	if (selectionFeature.getGeometry() != undefined && selectionFeature.getGeometry() != null) {

		filter = function(observation) {
			var geometry = observation.getGeometry();
			if (geometry.intersectsExtent(selectionFeature.getGeometry().getExtent())) {
				return true;
			}

			return false;
		};

		observationsSource.forEachFeature(function(observation) {
			if (!filter(observation)) {
				observationsSource.removeFeature(observation);
			}
		});

	}
}

function filterObservationsByTime() {

	var filter;

	if (timelineSelection == null ||  timelineSelection.length==0) {
		filter = function() {
			return true;
		};
	} else {
		filter = function(observation) {
			var observationResultTimestamp = observation.get('resulttimestamp') * 1000;

			var selectionStart = (+timelineSelection[0]);
			var selectionEnd = (+timelineSelection[1]);

			return selectionStart <= observationResultTimestamp && observationResultTimestamp <= selectionEnd;
		};
	}

	observationsSource.forEachFeature(function(observation) {
		if (!filter(observation)) {
			observationsSource.removeFeature(observation);
		}
	});
}

function selectObservations(observations) {
	selectedFeatures.clear();
	observations.forEach(function(observation) {
		selectedFeatures.push(observation);
	});
}

function selectFeatureInBrowser(feature) {
	var jstree = $("#observations").jstree();
	var uuid = feature.get("snanny-uuid");
	var node = jstree.get_node(uuid);
	openTreeToRoot(node, jstree);
	var parent = node.parent

	$("#" + uuid).attr("style", "color:rgba(255, 128, 0, 1.0)");
	var position = $("#" + parent).position();
	if (position != undefined) {
		$("#observations").scrollTop($("#observations").scrollTop() - 55 + position.top);
	}
}

function openTreeToRoot(node, jstree) {
	//Open parents 
	var parents = node.parents;
	if (parents != undefined) {
		parents.forEach(function(uuid) {
			if (uuid != "#") {
				var parentNode = jstree.get_node(uuid);
				if (jstree.is_closed(parentNode)) {
					jstree.open_node(parentNode);
				} else {
					return;
				}
			}
		});
	}
}

function filterObservations() {
	filterObservationsByTime();
	return observations;
}

function getObservationsCount() {
	var bboxQuery = getBboxQuery();
	var timeQuery = getTimeQuery();
	var kwordsQuery = getKeywordsQuery();

	loadObservationsCount(MAP_RESOURCES + bboxQuery + timeQuery + kwordsQuery, TIMELINE_RESOURCES + bboxQuery + kwordsQuery);
}

function getBboxQuery(){
var extent = map.getView().calculateExtent(map.getSize());
	var bottomLeft = ol.extent.getBottomLeft(extent);
	var topRight = ol.extent.getTopRight(extent);

	var bbox = [parseFloat(bottomLeft[1].toFixed(2)), parseFloat(bottomLeft[0].toFixed(2)), parseFloat(topRight[1].toFixed(2)), parseFloat(topRight[0].toFixed(2))];

	var bboxQuery = "?bbox=" + bbox.join(",");
	return bboxQuery;
}

function getTimeQuery(){
	var timeQuery = "";

	
	if (timelineSelection != null && timelineSelection.length>0) {
		timeQuery = "&time="+(+timelineSelection[0])+","+(+timelineSelection[1]);
	}
	return timeQuery;

}

function getKeywordsQuery(){
	var kwordsQuery = "";
	var searchText = $("#searchInput").val();
	if (searchText != "") {
		kwordsQuery = "&kwords=" + searchText;
	}
	return kwordsQuery;
}

function getObservations() {

	var bboxQuery = getBboxQuery();
	var timeQuery = getTimeQuery();
	var kwordsQuery = getKeywordsQuery();


	var observationsContainerHeader = jQuery('#observationsHeader');
	var observationsContainer = jQuery('#observations');
	// Clear "observations" panel
	observationsContainer.html("");
	observationsContainerHeader.html("");
	observationsContainerHeader.append("<h4>loading...</h4>");
	observationsContainerHeader.append("<p>&nbsp;</p>");

	d3.json(OBSERVATIONS_RESOURCES + bboxQuery + timeQuery + kwordsQuery, function(err, data) {
		$('#individualObsPointLoading').text("1");
		observationsSource.clear(true);

		if (data && data.status == "success" && data.features && data.features.length > 0) {
			var vectorSource = new ol.source.GeoJSON({
				projection: 'EPSG:4326',
				object: data
			});

			observationsCountSource.clear();

			observationsSource.addFeatures(vectorSource.getFeatures());
			//filterObservations();
			showObservations(observationsSource.getFeatures());

		} else if (data && (data.status == "timeOut" || data.status == "tooMany")) {
			while ($('#syntheticMapLoading').text() == 1) {
				1;
			}
			observationsContainerHeader.html("");
			observationsContainerHeader.append("<h4>" + $('#individualObsPointCount').text() + " points available </h4> \
						      <p>refine your request to see individual observations...");
			jQuery('#browserActions').hide('fast');

		} else if (data && data.status == "empty") {
			observationsContainerHeader.html("");
			observationsContainerHeader.append("<h4>no point</h4> \
						      <p>please relax you request...</p>");
			observationsCountSource.clear();
			jQuery('#browserActions').hide('fast');
		}

		$('#individualObsPointLoading').text("0");
  
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
				projection: 'EPSG:4326',
				object: data
			});
			if (data != undefined) {
				$('#individualObsPointCount').text(data['totalCount']);
				//Display count only if observations details will not be displayed
				observationsCountSource.clear();
				if (data['status'] != undefined && data['status'] == "tooMany") {
					observationsCountSource.addFeatures(vectorSource.getFeatures());
					if (--loadingCount == 0) {
						stopLoading();
					}
				}
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
		debugger;
		var vectorSource = new ol.source.GeoJSON({
			projection: 'EPSG:4326',
			object: data
		});

		observationsSource.clear();
		observationsSource.addFeatures(vectorSource.getFeatures());

		observations = filterObservations();

		showObservations(observations);

		initializeTimeline(observations);

		stopLoading();


	});
}

function showDetail(observationID, container, title) {
	showDetailDygraph(observationID, container, title);
}

function showDetailEnvision(observationID, container, title) {
	container = document.getElementById(container);
	d3.json(SNANNY_API + '/observations/' + observationID + '/results.json', function(data) {
		var options = {
			container: container,
			data: {
				detail: data[0].values,
				summary: data[0].values
			},
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
				var chart = nv.models.lineChart()
					.x(function(d) {
						return d[0]
					})
					.y(function(d) {
						return d[1]
					})
					.color(d3.scale.category10().range())
					.useInteractiveGuideline(true);

				chart.xAxis
					.axisLabel('Time')
					.tickFormat(function(d) {
						return d3.time.format('%x')(new Date(d))
					});

				chart.yAxis
					.axisLabel(each.key) // FIXME: find unit
					.tickFormat(d3.format(',.1f')) // FIXME: find unit
				;

				chart.y2Axis
					//					.axisLabel(each.key)				// FIXME: find unit
					.tickFormat(d3.format(',.1f')) // FIXME: find unit
				;

				if (data == null || data.length == 0) {
					d3.select('#' + eachContainer).html("");
				}

				d3.select('#' + eachContainer)
					.datum([each])
					.transition().duration(500)
					.call(chart);

				//TODO: Figure out a good way to do this automatically
				nv.utils.windowResize(chart.update);

				return chart;
			});
		});
	});
}