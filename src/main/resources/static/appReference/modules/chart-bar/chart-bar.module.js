(function() {
  'use strict';

  var module = angular.module('singApp.chart-bar', [
    'ui.router',
    'nvd3'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.chart-bar', {
        url: '/chart-bar',
        templateUrl: 'appReference/modules/chart-bar/chart-bar.html',
        controller: 'chartBarController'
      })
  }
})();
