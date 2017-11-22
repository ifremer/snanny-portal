(function() {
  'use strict';

  var core = angular.module('app.core');

  core.config(toastrConfig);

  /* @ngInject */
  function toastrConfig(toastr) {
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-top-right';
  }

  var config = {
    appErrorPrefix: '[snannyPortal Error] ',
    appTitle: 'SensorNanny',
    host : {
      owncloud : 'http://10.17.2.49/owncloud',
      snanny : 'http://localhost.ifremer.fr:8080/snanny-indexIO-api'
    },
    api : {
      snanny : 'http://localhost.ifremer.fr:8080/snanny-indexIO-api/rest',
      owncloud : 'http://10.17.2.49/owncloud/index.php/apps/snannyowncloudapi'
    },
    resolution : 200
  };

  core.value('config', config);

  core.config(configure);

  /* @ngInject */
  function configure($logProvider, $httpProvider, routerHelperProvider, exceptionHandlerProvider) {
    if ($logProvider.debugEnabled) {
      $logProvider.debugEnabled(true);
    }
    exceptionHandlerProvider.configure(config.appErrorPrefix);
    routerHelperProvider.configure({ docTitle: config.appTitle + ': ' });
    $httpProvider.interceptors.push('xmlHttpInterceptor');
  }

})();
