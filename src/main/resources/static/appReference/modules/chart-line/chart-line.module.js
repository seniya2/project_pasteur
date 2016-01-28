(function() {
  'use strict';

  var module = angular.module('singApp.chart-line', [
    'ui.router',
    'nvd3'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.chart-line', {
        url: '/chart-line',
        templateUrl: 'appReference/modules/chart-line/chart-line.html',
        controller: 'chartLineController'
      })
  }
})();
