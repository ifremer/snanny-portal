(function () {
  'use strict';

  angular.module('app.widgets')
    .directive('snpSystemsTree', SnpSystemsTree);

  /* @ngInject */
  function SnpSystemsTree(config, settingsService) {

    var directive = {
      link: link,
      controller: snpSystemsTreeController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'app/widgets/snp-systems-tree.html',
      scope: {
        noSystem: '<',
        noGeo: '<',
        system: '<',
        hover: '&onHover',
        click: '&onClick',
        update: '&onUpdate'
      }
    };

    return directive;

    function snpSystemsTreeController() {
      var vm = this;

      vm.init = init;
      vm.updateSystemTreeStructure = updateSystemTreeStructure;
      vm.updateNoSystemTreeStructure = updateNoSystemTreeStructure;
      vm.updateNoGeoTreeStructure = updateNoGeoTreeStructure;
      vm.expandAll = expandAll;
      vm.collapseAll = collapseAll;
      vm.selectNode = selectNode;

      function init() {
        vm.tree = [];
        vm.noSystemTree = [];
        vm.noGeoTree = [];
        vm.systemTree = [];
        vm.container.jstree('destroy');

        vm.container.jstree(buildConfiguration());

        //register events
        vm.container.on('hover_node.jstree', function (e, data) {
          if (data.node.type !== 'default') {
            vm.hover({$node: data.node});
          }
        });

        vm.container.on('select_node.jstree', function (e, data) {
          if (data.node.type !== 'default') {
            vm.click({$node: data.node});
          }
        });
      }

      function buildConfiguration() {
        return {
          'core': {
            'data': function (obj, callback) {
              callback.call(this, getTree());
            }
          },
          'types': {
            'system': {
              'icon': 'sensor-icon'
            },
            'observation': {
              'icon': 'download-icon'
            }
          },
          'contextactions': {
            'observation': {
              'icon': 'observation-icon',
              'a_attr': {
                'href': '#',
                'target': '_self',
                'onclick': 'openTimelineTab({id})'
              }
            }
          },
          'plugins': ['contextactions', 'types']
        };
      }

      function addNoSystemFolder() {
        vm.noSystemTree.push({
          'id': 'without_data_systems',
          'text': 'Systems without data',
          'parent': '#'
        });
      }

      function addNoGeoFolder() {
        vm.noGeoTree.push({
          'id': 'without_geo_systems',
          'text': 'Data without geolocation',
          'parent': '#'
        });
      }

      function getTree() {
        var tree = [];
        //no service
        tree = tree.concat(vm.noSystemTree, vm.noGeoTree, vm.systemTree);

        return tree;
      }

      function updateSystemTreeStructure() {
        vm.systemTree = [];
        if (angular.isArray(vm.system) && vm.system.length !== 0) {
          vm.systemTree = vm.systemTree.concat(extractTreeStructure(vm.system, '#'));
        }
        vm.container.jstree('refresh');
      }

      function updateNoGeoTreeStructure() {
        vm.noGeoTree = [];
        if (angular.isArray(vm.noGeo) && vm.noGeo.length !== 0 && settingsService.getSetting('nogeo') === 'true') {
          addNoGeoFolder();
          vm.noGeoTree = vm.noGeoTree.concat(extractTreeStructure(vm.noGeo, 'without_geo_systems'));
        }
        vm.container.jstree('refresh');
      }

      function updateNoSystemTreeStructure() {
        vm.noSystemTree = [];
        if (angular.isArray(vm.noSystem) && vm.noSystem.length !== 0 && settingsService.getSetting('nodata') === 'true') {
          addNoSystemFolder();
          vm.noSystem.forEach(function (system) {
            vm.noSystemTree.push({
              'id': system['snanny-systems-uuid'],
              'text': system['snanny-systems-name'],
              'parent': 'without_data_systems',
              'type': 'system',
              'description': system['snanny-systems-description']
            });
          });
        }
        vm.container.jstree('refresh');
      }

      function extractTreeStructure(systems, parent) {

        var mainParent = angular.copy(parent);
        var tree = [];
        var systemsIds = {};
        var observations = [];

        angular.forEach(systems, function (s) {
          parent = mainParent;
          var system = s.properties;
          angular.forEach(system['snanny-ancestors'], function (ancestor) {

            var id = angular.isDefined(ancestor['snanny-ancestor-deploymentid']) ?
              ancestor['snanny-ancestor-deploymentid'] : ancestor['snanny-ancestor-uuid'];

            if (angular.isUndefined(systemsIds[id])) {
              tree.push({
                'id': id,
                'text': ancestor['snanny-ancestor-name'],
                'parent': parent,
                'type': 'system'
              });
              systemsIds[id] = true;
            }
            parent = id;
          });

          if (angular.isUndefined(systemsIds[system['snanny-deploymentid']])) {
            tree.push({
              'id': system['snanny-deploymentid'],
              'text': system['snanny-name'],
              'parent': parent,
              'type': 'observation'
            });
            systemsIds[system['snanny-deploymentid']] = true;
            observations.push(system);
          }

        });
        vm.update({$observations: observations});

        return tree;
      }

      function expandAll() {
        vm.container.jstree('open_all');
      }

      function collapseAll() {
        vm.container.jstree('close_all');
      }

      function selectNode(id) {
        vm.container.jstree(true)
          .deselect_all(true);
        vm.container.jstree(true)
          .select_node(id, true);
      }
    }

    function link(scope, element, attrs, vm) {
      vm.container = $(element[0]).children('#tree-container');

      vm.init();

      scope.$watch('vm.system', function (newValue) {
        if (angular.isDefined(newValue)) {
          vm.updateSystemTreeStructure();
        }
      });

      scope.$watch('vm.noGeo', function (newValue) {
        if (angular.isDefined(newValue)) {
          vm.updateNoGeoTreeStructure();
        }
      });

      scope.$watch('vm.noSystem', function (newValue) {
        if (angular.isDefined(newValue)) {
          vm.updateNoSystemTreeStructure();
        }
      });

      scope.$on('treeSelectNode', function (event, data) {
        vm.selectNode(data);
      });
    }
  }
})();
