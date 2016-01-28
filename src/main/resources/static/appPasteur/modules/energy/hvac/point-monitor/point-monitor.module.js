(function() {
  'use strict';

  var module = angular.module('singApp.hvac-monitor', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.hvac-monitor', {
        url: '/hvac-monitor',
        templateUrl: 'appPasteur/modules/energy/hvac/point-monitor/point-monitor.html',
        controller: 'hvacMonitorController'
      })
  }
})();
