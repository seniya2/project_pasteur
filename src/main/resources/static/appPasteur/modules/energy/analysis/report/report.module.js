(function() {
  'use strict';

  var module = angular.module('singApp.energy-report', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.energy-report', {
        url: '/energy-report',
        templateUrl: 'appPasteur/modules/energy/analysis/report/report.html',
        controller: 'energyReportController'
      })
  }
})();
