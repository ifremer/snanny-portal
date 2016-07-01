// Variables nécessaires à l'affichage du Layer WMTS fond de carte sextant
var projection = ol.proj.get('EPSG:4326');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
var changeMapRequest = null;
var countTooltipElement;
var countTooltip;
for (var z = 0; z < 14; ++z) {
  // generate resolutions and matrixIds arrays for this WMTS
  resolutions[z] = size / Math.pow(2, z);
  matrixId=z-1.0;
  matrixIds[z] = 'EPSG:4326:'+matrixId;
}




var interactions = ol.interaction.defaults({
	altShiftDragRotate: false,
	pinchRotate: false
});
var controls = ol.control.defaults({
	rotate: false
});
var map = new ol.Map({

	interactions: interactions,
	controls: controls,
	layers: [
	    new ol.layer.Tile({
      		opacity: 1.0,
	        extent: projectionExtent,
	        source: new ol.source.WMTS({
		        url: 'http://sextant.ifremer.fr/geowebcache/service/wmts',
		        layer: 'sextant',
		        matrixSet: 'EPSG:4326',
		        format: 'image/png',
		        projection: projection,
		        tileGrid: new ol.tilegrid.WMTS({
		          origin: ol.extent.getTopLeft(projectionExtent),
		          resolutions: resolutions,
		          matrixIds: matrixIds
        		}),
        	        style: ''
      	        })
           })
	],
	target: 'map',
	view: new ol.View({
		projection: 'EPSG:4326',
		center: [0, 0],
		zoom: 2.5,
		minZoom: 2.1,
		maxZoom: 16
	})
});

var observation_style = new ol.style.Style({
	image: new ol.style.Circle({
		radius: 3,
		fill: new ol.style.Fill({
			color: 'rgba(255, 255, 255, 1.0)'
		})
	}),
	zIndex: 1
});


var selected_style = new ol.style.Style({
	image: new ol.style.Circle({
		radius: 3,
		fill: new ol.style.Fill({
			color: 'rgba(255, 128, 0, 1.0)'
		})
	}),
	zIndex: 2
});


var getObservationCountText = function(feature, resolution) {
	var maxResolution = 0.05;
	var text = feature.get('count');

	if (map.getView().getResolution() > maxResolution) {
		text = '';
	}
	return text;

};




var getObservationCountText = function(feature, resolution) {
	var text = feature.get('count');

	if (map.getView().getResolution() > 0.05) {
		text = '';
	}
	return text;

};



var observation_count_style = (function() {
	var color = function(red, green, blue, alpha) {
		return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
	};
	return function(feature, resolution) {
		return [new ol.style.Style({
			fill: new ol.style.Fill({
				color: color(154, 205, 50, 0.4+Math.floor(10.0 * Math.log(feature.get('ratio') + 1) / Math.log(100.0)) / 10.0),
			}),
			zIndex: 0
		})];
	};
})();



var observation_count_style_backup = (function() {
	var compute = function(average, alpha) {
		var red = 0;
		var green = 0;
		var blue = 255;

		if (average <= 50) {
			green = Math.floor((average * 255) / 50);
			blue = Math.floor(((50 - average) * 255) / 50);
		} else {
			red = Math.floor(((average - 50) * 255) / 50);
			green = Math.floor(((100 - average) * 255) / 50);
			blue = 0;
		}

		return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
	};
	return function(feature, resolution) {
		return [new ol.style.Style({
			fill: new ol.style.Fill({
				color: compute(feature.get('average'), 0.20)
			}),
			zIndex: 0
		})];
	};
})();

var observationsSource = new ol.source.GeoJSON({
	projection: 'EPSG:4326'
});



map.addLayer(new ol.layer.Vector({
	source: observationsSource,
	style: observation_style
}));

var observationsCountSource = new ol.source.GeoJSON({
	projection: 'EPSG:4326'
});


// vue marine-traffic
map.addLayer(new ol.layer.Vector({
	source: observationsCountSource,
	style: observation_count_style
}));



// event management on feature mouse over
var selectedFeatures = [];

// Unselect previous selected features
function unselectPreviousFeatures() {
	var i;
	for (i = 0; i < selectedFeatures.length; i++) {
		selectedFeatures[i].setStyle(null);
		$("#" + selectedFeatures[i].get("snanny-deploymentid")).attr("style", null);
	}
	selectedFeatures = [];
}



function selectObservationOnMap(deploymentId) {
	unselectPreviousFeatures();
	observationsSource.forEachFeature(function(observation) {
		var ancestors = observation.get("snanny-ancestors");
		if (observation.get("snanny-deploymentid") == deploymentId) {
			observation.setStyle([selected_style]);
			selectedFeatures.push(observation);
		} else {
			ancestors.forEach(function(ancestor) {
				if (ancestor['snanny-ancestor-deploymentid'] == deploymentId) {
					observation.setStyle([selected_style]);
					selectedFeatures.push(observation);
				}
			});
		}
	});
}

// Handle pointer
map.on('pointermove', function(event) {
	unselectPreviousFeatures();
	countTooltip.setPosition(undefined);
	map.forEachFeatureAtPixel(event.pixel,
		function(feature) {
			if (feature.get("snanny-deploymentid") != undefined) {
				feature.setStyle([
					selected_style
				]);
				selectFeatureInBrowser(feature);
				selectedFeatures.push(feature);
			}else if(feature.get("count") != undefined){
				var tooltipCoord = event.coordinate;
				//Affichage UUID
				countTooltipElement.innerHTML = feature.get("count")+" observations";
				countTooltip.setPosition(event.coordinate);
			}	
		});
});



map.on('moveend', function(evt) {
	clearTimeout(changeMapRequest);
	changeMapRequest = setTimeout(function() {
		getObservationsCount();
		getObservations();
	}, 500);

});


/**
 * Creates a new help tooltip
 */
function createCountTooltip() {
  if (countTooltipElement) {
    countTooltipElement.parentNode.removeChild(countTooltipElement);
  }
  countTooltipElement = document.createElement('div');
  countTooltipElement.className = 'tooltip';
  countTooltip = new ol.Overlay({
    element: countTooltipElement,
    offset: [15, 0],
    positioning: 'center-left'
  });
  map.addOverlay(countTooltip);
}

createCountTooltip();
