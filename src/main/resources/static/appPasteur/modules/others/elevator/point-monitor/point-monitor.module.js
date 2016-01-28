(function() {
  'use strict';

  var module = angular.module('singApp.ev-monitor', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.ev-monitor', {
        url: '/ev-monitor',
        templateUrl: 'appPasteur/modules/others/elevator/point-monitor/point-monitor.html',
        controller: 'evMonitorController'
      })
  }
})();
