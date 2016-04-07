var systemlocationmap

function showSystem(systemUUID) {
$('#systemDescriptionModal').on('shown.bs.modal', function () {showSystemLocation(systemUUID);});
$('#systemDescriptionModal').modal('show');


}


function showSystemLocation(systemUUID){

if (systemlocationmap == undefined){
	systemlocationmap = new ol.Map({
		interactions: [],
		controls: [],
		layers: [new ol.layer.Tile({
			source: new ol.source.TileWMS({
				url: 'http://www.ifremer.fr/services/wms1',
				params: {
					'LAYERS': 'continent,ETOPO1_BATHY_R'
				}
			})
		})],
		target: 'systemlocationmap',
		view: new ol.View({
			projection: 'EPSG:4326',
			center: [0, 0],
			zoom: 2.5,
		})
	});
}


}
