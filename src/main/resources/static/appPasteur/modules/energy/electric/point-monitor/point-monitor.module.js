(function() {
  'use strict';

  var module = angular.module('singApp.electric-monitor', [
    'ui.router',
    'ui.bootstrap'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.electric-monitor', {
        url: '/electric-monitor',
        templateUrl: 'appPasteur/modules/energy/electric/point-monitor/point-monitor.html',
        controller: 'electricMonitorController'
      })
  }
})();
