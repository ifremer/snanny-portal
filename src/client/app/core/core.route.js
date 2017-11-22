(function() {
  'use strict';

  angular
    .module('app.core')
    .run(appRun);

  /* @ngInject */
  function appRun(routerHelper) {
    var otherwise = '/';
    routerHelper.configureStates(getStates(), otherwise);
  }

  function getStates() {
    return [
      {
        state: 'default',
        config: {
          url: '/',
          templateUrl: 'app/core/welcome.html',
          title: 'Welcome'
        }
      }
    ];
  }
})();
