(function () {
  'use strict';

  angular.module('app.widgets')
    .directive('snpMap', snpMap);

  /* @ngInject */
  function snpMap(config, ol, $timeout) {

    var PROJECTION = 'EPSG:4326';

    var directive = {
      restrict: 'E',
      template: '<div id="map" class="map"><div id="tooltip"></div></div>',
      link: link,
      controller: snpMapController,
      controllerAs: 'vm',
      bindToController: true,
      scope: {
        countMode: '<',
        data: '<',
        update: '&onUpdate',
        hover: '&onHover'
      }
    };

    return directive;

    function snpMapController() {

      var vm = this;

      vm.init = init;
      vm.setData = setData;
      vm.selectFeature = selectFeature;

      function init() {

        vm.tooltip.tooltip({
          animation: false,
          trigger: 'manual',
          placement : 'right'
        });

        var projection = ol.proj.get(PROJECTION);
        var projectionExtent = projection.getExtent();
        var size = ol.extent.getWidth(projectionExtent) / 256;

        // generate resolutions and matrixIds arrays for this WMTS
        var resolutions = new Array(14);
        var matrixIds = new Array(14);
        for (var z = 0; z < 14; ++z) {
          resolutions[z] = size / Math.pow(2, z);
          var id = z - 1.0;
          matrixIds[z] = 'EPSG:4326:' + id;
        }

        var interactions = ol.interaction.defaults({
          altShiftDragRotate: false,
          pinchRotate: false
        });

        var controls = ol.control.defaults({
          rotate: false,
          zoomOptions: {
            zoomInTipLabel: 'Zoom in (Shift key + left click)'
          }
        });

        vm.map = new ol.Map({
          interactions: interactions,
          controls: controls,
          layers: [
            new ol.layer.Tile({
              opacity: 1.0,
              extent: projectionExtent,
              source: new ol.source.WMTS({
                url: 'http://sextant.ifremer.fr/geowebcache/service/wmts',
                layer: 'sextant',
                matrixSet: PROJECTION,
                format: 'image/png',
                projection: projection,
                tileGrid: new ol.tilegrid.WMTS({
                  origin: ol.extent.getTopLeft(projectionExtent),
                  resolutions: resolutions,
                  matrixIds: matrixIds
                }),
                style: '',
                wrapX: true
              })
            })
          ],
          target: 'map',
          view: new ol.View({
            projection: PROJECTION,
            center: [0, 0],
            zoom: 2.5,
            minZoom: 2.5,
            maxZoom: 16
          })
        });

        $('.ol-zoom-in, .ol-zoom-out').tooltip({
          placement: 'right'
        });

        vm.observationsVectorSource = new ol.source.Vector({
          projection: PROJECTION
        });

        var observationStyle = function (feature) {
          return [new ol.style.Style({
            image: new ol.style.Circle({
              radius: 3,
              fill: new ol.style.Fill({
                color: feature.get('selected') ? 'rgba(255, 128, 0, 1.0)' : 'rgba(255, 255, 255, 1.0)'
              }),
              zIndex: 1
            })
          })];
        };

        vm.map.addLayer(new ol.layer.Vector({
          source: vm.observationsVectorSource,
          style: observationStyle
        }));

        //Observations count layer

        var observationsCountStyle = (function () {

          function smoothObservationCount(nbObservations) {
            return (1.0 - (1.0 / (1.0 + nbObservations / config.resolution)));
          }

          function colorAsRgba(red, green, blue, alpha) {
            return 'rgba(' + red + ',' + green + ',' + blue + ',' + alpha + ')';
          }

          return function (feature) {
            return [new ol.style.Style({
              fill: new ol.style.Fill({
                color: colorAsRgba(154, 205, 50, smoothObservationCount(feature.get('count')))
              }),
              zIndex: 0
            })];
          };
        })();

        vm.observationsCountVectorSource = new ol.source.Vector({
          projection: PROJECTION
        });

        // vue marine-traffic
        vm.map.addLayer(new ol.layer.Vector({
          source: vm.observationsCountVectorSource,
          style: observationsCountStyle
        }));

        manageMapEvents();
      }

      function manageMapEvents(){

        function manageTooltip(feature, position) {
          vm.tooltip.css({
            left: (position[0] + 5) + 'px',
            top: position[1] + 'px'
          });
          vm.tooltip.attr('data-original-title', feature.get('count') + ' observations')
            .tooltip('fixTitle')
            .tooltip('show');
        }

        var timeoutPromise = null;
        vm.map.on('moveend', function () {
          if (timeoutPromise !== null) {
            $timeout.cancel(timeoutPromise);
          }
          timeoutPromise = $timeout(function () {
            vm.update({$boundaryBox: getBoundaryBox()});
          }, 500);
        });

        vm.map.on('pointermove', function (event) {

          var lastFeature = vm.map.forEachFeatureAtPixel(event.pixel, function (feature) {
            return feature;
          });

          if (angular.isDefined(lastFeature)) {
            if (angular.isDefined(lastFeature.get('count'))) {
              manageTooltip(lastFeature, event.pixel);
            } else if (angular.isDefined(lastFeature.get('snanny-deploymentid'))) {
              lastFeature.set('selected', true);
              vm.hover({$id: lastFeature.get('snanny-deploymentid')});
            }
          } else {
            vm.tooltip.tooltip('hide');
          }
        });
      }

      function getBoundaryBox() {
        var extent = vm.map.getView().calculateExtent(vm.map.getSize());
        var bottomLeft = ol.extent.getBottomLeft(extent);
        var topRight = ol.extent.getTopRight(extent);

        return [
          parseFloat(bottomLeft[1].toFixed(2)),
          parseFloat(bottomLeft[0].toFixed(2)),
          parseFloat(topRight[1].toFixed(2)),
          parseFloat(topRight[0].toFixed(2))
        ];
      }

      function setData() {
        vm.observationsVectorSource.clear(true);
        vm.observationsCountVectorSource.clear(true);

        var geoJson = new ol.format.GeoJSON({
          defaultDataProjection: PROJECTION
        });

        var features = vm.data.map(function (data) {
          if (angular.isUndefined(data.type)) {
            data.type = 'Feature';
          }
          return geoJson.readFeature(data);
        });

        if (vm.countMode) {
          vm.observationsCountVectorSource.addFeatures(features);
        } else {
          vm.observationsVectorSource.addFeatures(features);
        }
      }

      function selectFeature(ids) {
        vm.observationsVectorSource.forEachFeature(function (feature) {
          if (ids.indexOf(feature.get('snanny-deploymentid')) !== -1) {
            feature.set('selected', true);
          } else {
            feature.unset('selected');
          }
        });
      }
    }

    function link(scope, element, attrs, vm) {

      vm.tooltip = $(element[0]).find('#tooltip');
      vm.init();

      scope.$watch('vm.data', function (newValue) {
        if (angular.isDefined(newValue)) {
          vm.setData();
        }
      });

      scope.$on('mapSelectFeature', function (event, data) {
        vm.selectFeature(data);
      });
    }
  }
})();
