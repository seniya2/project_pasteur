(function() {
  'use strict';

  var module = angular.module('singApp.pasteur-dashboard', [
    'ui.router','nvd3'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.pasteur-dashboard', {
        url: '/pasteur-dashboard',
        templateUrl: 'appPasteur/modules/dashboard/dashboard.html',
        controller: 'pasteurDashboardController'
      })
  }
})();
