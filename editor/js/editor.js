'use strict';

var app = angular.module('sensornanny.editor', [
  'sensornanny.editor.controllers',
  // 'ui.bootstrap',
  'mgcrea.ngStrap',
  'ui.bootstrap.showErrors',
  'ngRoute'
]);

app.config(['showErrorsConfigProvider', function(showErrorsConfigProvider) {
  showErrorsConfigProvider.showSuccess(false);
  showErrorsConfigProvider.trigger('keypress');
}]);

app.config(['$routeProvider', function($routeProvider){
  $routeProvider.when('/mooredPlatform/new', {templateUrl: 'partials/mooredPlatform.html', controller: 'MooredPlatformCtrl'});
  $routeProvider.when('/mooredPlatform/edit/:uuid', {templateUrl: 'partials/mooredPlatform.html', controller: 'MooredPlatformCtrl'});
  // TODO: add other routes
  //$routeProvider.when('/test', {templateUrl: 'partials/test.html', controller: 'OtherController'});
  $routeProvider.otherwise({redirectTo: '/mooredPlatform/new'});
}]);