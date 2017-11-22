(function () {
  'use strict';

  angular
    .module('app.dashboard')
    .controller('DashboardController', DashboardController);

  /* @ngInject */
  function DashboardController($q, $window, dataservice, logger, moment, config, settingsService, $uibModal, $rootScope, $scope, d3) {
    var vm = this;

    vm.update = update;
    vm.updateTimeRange = updateTimeRange;
    vm.updateBoundaryBox = updateBoundaryBox;
    vm.isCountMode = isCountMode;
    vm.manageTreeClick = manageTreeClick;
    vm.selectFeature = selectFeature;
    vm.selectTreeNode = selectTreeNode;
    vm.addObservations = addObservations;

    vm.observations = {};
    vm.systems = {};

    vm.showNoGeo = settingsService.getSetting('nogeo') === 'true';
    vm.showNoData = settingsService.getSetting('nodata') === 'true';
    vm.loading = true;
    vm.init = true;

    $rootScope.globalSearchActive = true;
    $scope.$on('globalSearchChanged', updateKeywords);

    init();

    function init() {
      dataservice.getAllSystems(!vm.showNoData)
        .then(function (data) {
          if (data.status === 'success') {
            vm.systems.noSystem = data.systems;
          }
        });
      update();
    }

    function extractTimeExtent(data) {
      var dates = [];
      angular.forEach(data, function (e) {
        dates.push(e.time.begin);
        dates.push(e.time.end);
      });
      var timeExtent = d3.extent(dates);
      vm.startDate = moment(timeExtent[0], 'x').format('MMM D, YYYY H:mm A');
      vm.endDate = moment(timeExtent[1], 'x').format('MMM D, YYYY H:mm A');
    }

    function update() {
      vm.loading = true;
      vm.observations.summary = [];
      vm.systems.system = [];
      vm.systems.noGeo = [];

      //parameter is hasCoord ?, if we want to show data without geo, we should set it to false.
      dataservice.getTimelineEvents(vm.boundaryBox, vm.keyword, !vm.showNoGeo)
        .then(function (data) {
          vm.timeline = data;
          if (angular.isUndefined(vm.startDate)) {
            extractTimeExtent(data);
          }
        });

      dataservice.getMapFeatures(vm.boundaryBox, vm.timerange, vm.keyword, !vm.showNoGeo)
        .then(function (data) {
          vm.observations.status = data.status;
          vm.observations.nbPoints = data.totalCount;

          if (data.status === 'success') {
            var promises = [];
            promises.push(dataservice.getObservations(vm.boundaryBox, vm.timerange, vm.keyword));
            if (vm.showNoGeo) {
              promises.push(dataservice.getObservationsWithoutGeo(vm.timerange, vm.keyword));
            }
            return $q.all(promises);
          }

          vm.observations.observations = data.features;
          return $q.reject();
        })
        .then(function (data) {

          if (data[0].status === 'success') {
            vm.observations.observations = data[0].features;
            vm.systems.system = data[0].features;
          } else if (data[0].status === 'empty') {
            vm.observations.observations = [];
          }

          if (vm.showNoGeo && data[1].status === 'success') {
            vm.observations.observations.concat(data[1].features);
            vm.systems.noGeo = data[1].features;
          }
        }).finally(function () {
        vm.loading = false;
      });

    }

    function addObservations(observations) {
      vm.observations.summary = vm.observations.summary.concat(observations);
    }

    function updateTimeRange(range) {
      var normalized = range.map(function (data) {
        return moment(data).valueOf();
      });
      vm.startDate = moment(normalized[0], 'x').format('MMM D, YYYY H:mm A');
      vm.endDate = moment(normalized[1], 'x').format('MMM D, YYYY H:mm A');
      vm.timerange = normalized.join(',');
      update();
    }

    function updateKeywords(event, keyword) {
      vm.keyword = keyword;
      update();
    }

    function updateBoundaryBox(box) {
      vm.boundaryBox = box.join(',');
      update();
    }

    function manageTreeClick(node) {
      if (node.type === 'observation') {
        downloadSystemData(node);

      } else if (node.type === 'system') {
        openSystemModal(node);
      }
    }

    function downloadSystemData(node) {
      var obs = vm.observations.summary.find(function (e) {
        return e['snanny-deploymentid'] === node.id;
      });
      if (angular.isDefined(obs)) {
        var id = obs['snanny-uuid'].substr(0, obs['snanny-uuid'].lastIndexOf('-'));
        $window.open(config.api.owncloud + '/data/' + id + '/download', '_blank');
      }
    }

    function openSystemModal(node) {
      $uibModal.open({
        animation: true,
        templateUrl: 'app/dashboard/system.html',
        controller: 'SystemController',
        controllerAs: 'vm',
        bindToController: true,
        size: 'lg',
        resolve: {
          system: dataservice.getSML(node.id),
          params: function () {
            return {
              resource: config.api.owncloud + '/sml/' + node.id + '?pretty=true'
            };
          }
        }
      });
    }

    function selectFeature(node) {
      //look for all potential selected ids (node_id + deep childrens node_id)
      var ids = [node.id];
      $scope.$broadcast('mapSelectFeature', ids.concat(node.children_d));
    }

    function selectTreeNode(id) {
      $scope.$broadcast('treeSelectNode', id);
    }

    function isCountMode() {
      return vm.observations.status === 'tooMany' || vm.observations.status === 'timeOut';
    }

  }
})();
