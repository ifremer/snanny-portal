(function () {
  'use strict';

  angular.module('app.settings')
    .factory('settingsService', SettingsService);

  /* @ngInject*/
  function SettingsService($window) {

    var localStorage = $window.localStorage;
    var STORAGE_KEY = 'snanny.portal.settings.';

    var service = {
      getSettings: getSettings,
      getSetting: getSetting,
      saveSettings: saveSettings
    };

    return service;

    /**
     * get all the settings from an array of key
     * @param keys Array ['keyname']
     * @return Object {'keyname', value}
     */
    function getSettings(keys) {
      if (angular.isArray(keys)) {
        var result = {};
        angular.forEach(keys, function (key) {
          result[key] = localStorage.getItem(STORAGE_KEY + key);
        });
        return result;
      }
    }

    /**
     * get the value of the give key
     * @param key String
     */
    function getSetting(key) {
      return localStorage.getItem(STORAGE_KEY + key);
    }

    /**
     * Save the local settings for the application
     * @param settings Object {'keyname' : true/false}
     */
    function saveSettings(settings) {
      angular.forEach(settings, function (value, key) {
        localStorage.setItem(STORAGE_KEY + key, value);
      });
    }
  }

})();
