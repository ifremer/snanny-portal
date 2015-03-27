'use strict';

var controllers = angular.module('sensornanny.editor.controllers', []);

controllers.controller('MooredPlatformCtrl', function ($scope, $routeParams, $location, $http, editorService) {

//  $scope.mooredPlatformTemplate = 'forms/mooredplatform_platform_handlebars.xml';
  $scope.mooredPlatformTemplate = 'forms/mooredplatform_platform_mustache.xml';

  $scope.tabs = [
    {title: "General observatory", active: true, disabled: false},
    {title: "Events/News", active: false, disabled: true},
    {title: "Embedded sensors", active: false, disabled: true}
  ];
  
  $scope.wmoPlatformNumbers = [ 61277, 61278, 61279 ];
  $scope.verticalReferences = [ "inapplicable", "local reference plane", "mean high water", "mean high water neaps", "mean high water springs", "mean low water", "mean low water neaps", "mean sea level", "sea floor", "sea level"];
  
  $scope.platform = {};
  
  console.log($routeParams);
  console.log($location);
  
  // NEW
  if ('/mooredPlatform/new' === $location.path()) {
    $scope.platform.uuid = editorService.guid();
    
  // EDIT
  } else if ($location.path().indexOf('/mooredPlatform/edit') == 0) {
    if ($routeParams.uuid) {
      $scope.platform.uuid = $routeParams.uuid;
      
      editorService.getSystem($scope.platform.uuid, $scope.mooredPlatformTemplate).then(function(platform) {
        $scope.platform = platform;
      });
      
    }

  }
  
  
  $scope.currentTab = 0;

  $scope.isTabEnabled = function(tab) {
    return ! $scope.tabs[tab].disabled;
  };

  $scope.isTabActive = function(tab) {
    return $scope.tabs[tab].active;
  };

  $scope.activateTab = function(tab, active) {
    $scope.tabs[tab].active = !!active;
  };

  $scope.selectTab = function(tab) {
    if ($scope.isTabEnabled(tab) && $scope.validateTab($scope.currentTab)) {
      /*for (var each in $scope.tabs) {
        $scope.tabs[each].active = false;
      }*/
      $scope.tabs.forEach(function(each, index) {
        $scope.activateTab(index, false);
      });

      $scope.activateTab(tab, true);

      $scope.currentTab = tab;
    }
  };

  $scope.validateTab = function(tab) {
    switch (tab) {
      case 0:
        return $scope.platformForm.$valid;
      case 1:
        return $scope.eventsForm.$valid;
      case 2:
        return $scope.instrumentsForm.$valid;
    };
  };
  
  $scope.validatePlatform = function() {
    $scope.$broadcast('show-errors-check-validity');
    
    if ($scope.platformForm.$valid) {
      $scope.tabs[1].disabled = false;
      $scope.selectTab(1);
    }
  };

  $scope.validateEvents = function() {
    $scope.$broadcast('show-errors-check-validity');
    
    if ($scope.platformForm.$valid) {
      $scope.tabs[1].disabled = false;
      if ($scope.eventsForm.$valid) {
        $scope.tabs[2].disabled = false;
        $scope.selectTab(2);
      }
    }
  };
  
  $scope.addEvent = function() {
    $scope.platform.events = $scope.platform.events || [];
    var event = {};
    //$scope.platform.events.push(event);
    $scope.platform.events.unshift(event);
  };
  
  $scope.deleteEvent = function(index) {
    // FIXME: use angularUI dialog
    var date = $scope.platform.events[index].date;
    var description = $scope.platform.events[index].description;
    
    var prompt = "Are you sure to delete event";
    
    if (date, description) {
      prompt += " at " + date + " (" + description + ")";
    }
    
    if (confirm(prompt)) {
      $scope.platform.events.splice(index, 1);
    }
  };

  $scope.savePlatform = function() {
    $scope.$broadcast('show-errors-check-validity');
    
    if ($scope.platformForm.$valid) {
      $scope.tabs[1].disabled = false;
      if ($scope.eventsForm.$valid) {
        $scope.tabs[2].disabled = false;
        if ($scope.instrumentsForm.$valid) {
          
          return editorService.generatePlatform($scope.mooredPlatformTemplate, $scope.platform)
          .then(function(platformContent) {
            // TODO: call SOS server
            console.log("TODO: call SOS server");
            console.log(platformContent);
          });
          
        }
      }
    }
  };
  
  $scope.exportPlatform = function() {
    $scope.$broadcast('show-errors-check-validity');
    
    if ($scope.platformForm.$valid) {
      $scope.tabs[1].disabled = false;
      if ($scope.eventsForm.$valid) {
        $scope.tabs[2].disabled = false;
        if ($scope.instrumentsForm.$valid) {
          
          return editorService.generatePlatform('forms/mooredplatform_platform_mustache.xml', $scope.platform)
          //return editorService.generatePlatform('forms/mooredplatform_platform_handlebars.xml', $scope.platform)
          .then(function(platformContent) {
            editorService.makeArchive($scope.platform.observatoryName + ".zip", $scope.platform.observatoryName + ".xml", platformContent);
          });
        }
      }
    }
  };

});