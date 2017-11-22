(function () {
  'use strict';

  angular
    .module('app.settings')
    .controller('SettingsController', SettingsController);

  /* @ngInject */
  function SettingsController(settingsService) {
    var vm = this;

    var NO_DATA = 'nodata';
    var NO_GEO = 'nogeo';

    vm.updateSettings = updateSettings;

    init();

    function init() {
      var settings = settingsService.getSettings([NO_DATA, NO_GEO]);
      vm.showWithoutData = settings[NO_DATA] !== null ? settings[NO_DATA] === 'true' : initSetting(NO_DATA);
      vm.showWithoutGeo = settings[NO_GEO] !== null ? settings[NO_GEO] === 'true' : initSetting(NO_GEO);
    }

    function initSetting(key) {
      var setting = {};
      setting[key] = true;
      settingsService.saveSettings(setting);
      return true;
    }

    function updateSettings() {
      var settings = {};
      settings[NO_DATA] = vm.showWithoutData;
      settings[NO_GEO] = vm.showWithoutGeo;
      settingsService.saveSettings(settings);
    }
  }
})();
