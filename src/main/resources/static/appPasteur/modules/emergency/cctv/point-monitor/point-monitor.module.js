(function() {
  'use strict';

  var module = angular.module('singApp.cctv-monitor', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.cctv-monitor', {
        url: '/cctv-monitor',
        templateUrl: 'appPasteur/modules/emergency/cctv/point-monitor/point-monitor.html',
        controller: 'cctvMonitorController'
      })
  }
})();
