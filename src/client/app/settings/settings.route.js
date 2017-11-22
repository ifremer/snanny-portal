(function() {
  'use strict';

  angular
    .module('app.settings')
    .run(appRun);

  /* @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return [
      {
        state: 'settings',
        config: {
          url: '/settings',
          templateUrl: 'app/settings/settings.html',
          controller: 'SettingsController',
          controllerAs: 'vm',
          title: 'settings'
        }
      }
    ];
  }
})();
