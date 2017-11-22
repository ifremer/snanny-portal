(function() {
  'use strict';

  angular
    .module('app.widgets')
    .directive('snpContainer', snpContainer);

  /* @ngInject */
  function snpContainer() {
    var directive = {
      restrict: 'EA',
      transclude: true,
      link : link,
      templateUrl: 'app/widgets/snp-container.html'
    };
    return directive;

    function link(scope){
      scope.date = new Date().getFullYear();
    }
  }
})();
