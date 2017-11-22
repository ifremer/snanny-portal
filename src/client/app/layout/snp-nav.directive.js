(function () {
  'use strict';

  angular
    .module('app.layout')
    .directive('snpNav', snpNav);

  /* @ngInject */
  function snpNav() {
    var directive = {
      bindToController: true,
      controller: TopNavController,
      controllerAs: 'vm',
      restrict: 'EA',
      scope: {
        'navline': '='
      },
      templateUrl: 'app/layout/snp-nav.html'
    };

    /* @ngInject */
    function TopNavController(config, $rootScope, $scope, dataservice, $window) {
      var vm = this;

      vm.globalSearchChanged = globalSearchChanged;
      vm.callCAS = callCAS;

      $rootScope.$watch('globalSearchActive', function (newValue) {
        vm.globalSearchActive = newValue;
      });

      vm.exploreLink = config.host.owncloud;
      vm.isLogged = null;

      init();

      function init() {
        dataservice.getConnectedUser().then(function (data) {
          vm.isLogged = data.logged;
          vm.loggedUser = data.user;
        });
      }

      function callCAS(action) {
        var returnService = config.host.snanny + '/' + action + '.jsp?bf=' + encodeURIComponent($window.location.href);
        $window.location.replace(returnService);
      }

      function globalSearchChanged() {
        $rootScope.$emit('globalSearchChanged', vm.globalSearch);
      }
    }

    return directive;
  }
})();
