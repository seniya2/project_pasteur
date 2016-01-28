(function() {
  'use strict';

  var module = angular.module('singApp.dashboard', [
    'ui.router',
    'ui.jq',
    'singApp.components.rickshaw'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.dashboard', {
        url: '/dashboard',
        templateUrl: 'appReference/modules/dashboard/dashboard.html',
        controller: 'DashboardController'
      })
  }
})();
