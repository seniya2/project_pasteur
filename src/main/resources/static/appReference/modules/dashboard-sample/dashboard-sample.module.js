(function() {
  'use strict';

  var module = angular.module('singApp.dashboard-sample', [
    'ui.router',
    'ui.jq',
    'singApp.components.rickshaw'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.dashboard-sample', {
        url: '/dashboard-sample',
        templateUrl: 'appReference/modules/dashboard-sample/dashboard-sample.html',
        controller: 'dashboardSampleController'
      })
  }
})();
