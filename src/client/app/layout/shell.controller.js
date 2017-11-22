(function() {
  'use strict';

  angular
    .module('app.layout')
    .controller('ShellController', ShellController);

  /* @ngInject */
  function ShellController(config, $rootScope, $scope) {
    var vm = this;
    vm.navline = {
      title: config.appTitle
    };

    $rootScope.$on('globalSearchChanged', function(event, data){
      //broadcast to all children scope the event, to provide only $scope base event listening
      $scope.$broadcast('globalSearchChanged', data);
    });
  }
})();
