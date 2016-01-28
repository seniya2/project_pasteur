(function() {
  'use strict';

  var module = angular.module('singApp.lighting-monitor', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.lighting-monitor', {
        url: '/lighting-monitor',
        templateUrl: 'appPasteur/modules/others/lighting/point-monitor/point-monitor.html',
        controller: 'lightingMonitorController'
      })
  }
})();
