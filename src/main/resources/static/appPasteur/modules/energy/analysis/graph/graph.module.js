(function() {
  'use strict';

  var module = angular.module('singApp.energy-graph', [
    'ui.router','nvd3'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.energy-graph', {
        url: '/energy-graph',
        templateUrl: 'appPasteur/modules/energy/analysis/graph/graph.html',
        controller: 'energyGraphController'
      })
  }
})();
