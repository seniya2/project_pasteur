(function() {
  'use strict';

  var module = angular.module('singApp.grid', [
    'ui.router'

  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.grid', {
        url: '/grid',
        templateUrl: 'appReference/modules/grid/grid.html'
      })
  }
})();
