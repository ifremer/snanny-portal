(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('dataservice', dataservice);

  /* @ngInject */
  function dataservice($http, $q, exception, logger, config) {

    var service = {
      getMapFeatures: getMapFeatures,
      getTimelineEvents: getTimelineEvents,
      getObservations: getObservations,
      getAllSystems: getAllSystems,
      getObservationsWithoutGeo: getObservationsWithoutGeo,
      getSML: getSML,
      getConnectedUser: getConnectedUser
    };

    return service;

    function getMapFeatures(box, range, keywords, hasGeo) {
      return $http({
        method: 'GET',
        url: config.api.snanny + '/obs/synthetic/map',
        params: {
          bbox: box,
          time: range,
          kwords: keywords,
          hasCoords: hasGeo
        }
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover synthetic map data')(e);
      }
    }

    function getTimelineEvents(box, keywords, hasGeo) {
      return $http({
        method: 'GET',
        url: config.api.snanny + '/obs/synthetic/timeline',
        params: {
          bbox: box,
          kwords: keywords,
          hasCoords: hasGeo
        }
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover synthetic timeline data')(e);
      }
    }

    function getObservations(box, range, keywords) {
      return $http({
        method: 'GET',
        url: config.api.snanny + '/obs',
        params: {
          bbox: box,
          time: range,
          kwords: keywords
        }
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover full observation data')(e);
      }
    }

    function getObservationsWithoutGeo(range, keywords) {
      return $http({
        method: 'GET',
        url: config.api.snanny + '/obs/withoutgeo',
        params: {
          time: range,
          kwords: keywords
        }
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover observations without geographic data')(e);
      }
    }

    function getAllSystems(hasData) {
      return $http({
        method: 'GET',
        url: config.api.snanny + '/system/all',
        params: {
          hasdata: hasData
        }
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover systems')(e);
      }
    }

    function getSML(id) {
      return $http({
        method: 'GET',
        url: config.api.owncloud + '/sml/' + id,
        params: {
          pretty: false
        }
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover SML')(e);
      }
    }

    function getConnectedUser() {
      return $http({
        method: 'GET',
        url: config.api.snanny + '/user'
      })
        .then(success)
        .catch(fail);

      function success(response) {
        return response.data;
      }

      function fail(e) {
        return exception.catcher('Failed to recover SML')(e);
      }
    }
  }
})();
