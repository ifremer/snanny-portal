// Variables nécessaires à l'affichage du Layer arcgisonline
var projection = ol.proj.get('EPSG:3857');
var projectionExtent = projection.getExtent();
var size = ol.extent.getWidth(projectionExtent) / 256;
var resolutions = new Array(14);
var matrixIds = new Array(14);
for (var z = 0; z < 14; ++z) {
	// generate resolutions and matrixIds arrays for this WMTS
	resolutions[z] = size / Math.pow(2, z);
	matrixIds[z] = z;
}

// var map = new ol.Map({
// target : 'map',
// layers : [ new ol.layer.Tile({
// opacity : 1,
// extent : projectionExtent,
// source : new ol.source.WMTS({
// url :
// 'http://server.arcgisonline.com/arcgis/rest/services/Ocean_Basemap/MapServer/WMTS/1.0.0/WMTSCapabilities.xml',
// layer : '0',
// matrixSet : 'EPSG:3857',
// format : 'image/png',
// projection : projection,
// tileGrid : new ol.tilegrid.WMTS({
// origin : ol.extent.getTopLeft(projectionExtent),
// resolutions : resolutions,
// matrixIds : matrixIds
// }),
// style : 'default'
// })
// }) ],
// view : new ol.View({
// projection : 'EPSG:4326',
// center : ol.proj.transform([ 37.41, 8.82 ], 'EPSG:4326', 'EPSG:3857'),
// zoom : 2
// }),
// controls : ol.control.defaults().extend([ new ol.control.ScaleLine() ])
// });

var map = new ol.Map({

	// controls : ol.control.defaults().extend([ new ol.control.ScaleLine({
	// units : 'degrees'
	// }) ]),

	layers : [ new ol.layer.Tile({
		source : new ol.source.TileWMS({
			url : 'http://demo.boundlessgeo.com/geoserver/wms',
			params : {
				'LAYERS' : 'ne:NE1_HR_LC_SR_W_DR'
			}
		})
	}) ],
	target : 'map',
	view : new ol.View({
		projection : 'EPSG:4326',
		center : [ 0, 0 ],
		zoom : 2
	})
});

var observation_style = new ol.style.Style({
	fill : new ol.style.Fill({
		// color : 'rgba(255, 255, 255, 0.2)'
//		color : 'rgba(255, 160, 122, 0.05)' // LightSalmon #FFA07A
		color : 'rgba(104, 142, 35, 0.05)' // OliveDrab  #688E23
	}),

	stroke : new ol.style.Stroke({
//		color : 'rgba(255, 160, 122, 0.15)', // LightSalmon #FFA07A
		color : 'rgba(104, 142, 35, 0.25)', // OliveDrab  #688E23
		width : 1
	}),
	zIndex : 1
});

var selected_style = new ol.style.Style({
	fill : new ol.style.Fill({
		// color : 'rgba(70, 130, 180, 0.2)' // SteelBlue #4682B4
		// color : 'rgba(255, 160, 122, 0.05)' // LightSalmon #FFA07A
//		color : 'rgba(154, 205, 50, 0.05)' // YellowGreen #9ACD32
		color : 'rgba(255, 140, 0, 0.05)' // DarkOrange  #FF8C00
	}),
	stroke : new ol.style.Stroke({
//		color : 'rgba(154, 205, 50, 0.15)', // YellowGreen #9ACD32
		color : 'rgba(255, 140, 0, 0.25)', // DarkOrange  #FF8C00
		width : 1
	}),
	zIndex : 2
});

var selection_style = new ol.style.Style({
	fill : new ol.style.Fill({
		color : 'rgba(0, 0, 0, 0.125)'
	}),
	stroke : new ol.style.Stroke({
		color : 'rgba(255, 255, 255, 1)',
		width : 1
	}),
	zIndex : 3
});

var observationsSource = new ol.source.GeoJSON({
	projection : 'EPSG:4326'
});

map.addLayer(new ol.layer.Vector({
	source : observationsSource,
	style : observation_style
}));

// Layer de sélection
var selectionFeature = new ol.Feature({
// geometry : undefined
// geometry : new ol.geom.Polygon([ [ [ 90, -180 ], [ 90, 180 ], [ -90, 180 ], [
// -90, -180 ], [ 90, -180 ] ] ])
// geometry : new ol.geom.Polygon([[ [ 10, -10 ], [ 10, 10 ], [ -10, 10 ], [
// -10, -10 ], [ 10, -10 ] ]])
// geometry : new ol.geom.Polygon([ [ [ 20, -20 ], [ 20, 20 ], [ -20, 20 ], [
// -20, -20 ], [ 20, -20 ] ]])
});
// selectionFeature.getGeometry().transform('EPSG:4326', 'EPSG:3857');
var selectionSource = new ol.source.Vector();
selectionSource.addFeature(selectionFeature);
selectionLayer = new ol.layer.Vector({
	source : selectionSource,
	style : selection_style
});
map.addLayer(selectionLayer);

var select = new ol.interaction.Select({
	style : selected_style
});
map.addInteraction(select);

var selectedFeatures = select.getFeatures();

var dragBox = new ol.interaction.DragBox({
	// FIXME: on veut appuyer sur Maj ou non ?
	condition : ol.events.condition.shiftKeyOnly,
	style : new ol.style.Style({
		stroke : new ol.style.Stroke({
			color : [ 0, 0, 255, 1 ]
		})
	})
});

map.addInteraction(dragBox);

dragBox.on('boxend', function(e) {
	startLoading();

	selectionFeature.setGeometry(dragBox.getGeometry());

	var observations = filterObservationsByPosition();
	setTimeline(observations);

	observations = filterObservationsByTime(observations);
	selectObservations(observations);

	showObservations(observations);

	stopLoading();
});

dragBox.on('boxstart', function(e) {
	selectedFeatures.clear();
});

map.on('click', function(e) {
	// FIXME: ne fait rien, les élements sont sélectionnés, et aussitôt
	// désélectionnés
	e.preventDefault();

	startLoading();

	selectionFeature.setGeometry(undefined);

	// FIXME: hack pour resélectionner les observations à l'écran
	setTimeout(function() {
		var observations = filterObservationsByPosition();
		setTimeline(observations);

		observations = filterObservationsByTime(observations);
		selectObservations(observations);

		showObservations(observations);

		stopLoading();
	}, 500);

});
