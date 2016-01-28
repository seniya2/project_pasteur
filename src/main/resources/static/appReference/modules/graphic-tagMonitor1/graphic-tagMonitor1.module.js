(function() {
  'use strict';

  var module = angular.module('singApp.graphic-tagMonitor1', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.graphic-tagMonitor1', {
        url: '/graphic-tagMonitor1',
        templateUrl: 'appReference/modules/graphic-tagMonitor1/graphic-tagMonitor1.html',
        controller: 'graphicTagMonitor1Controller'
      })
  }
})();
