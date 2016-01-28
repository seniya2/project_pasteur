(function() {
  'use strict';

  var module = angular.module('singApp.graphic-tagMonitor2', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.graphic-tagMonitor2', {
        url: '/graphic-tagMonitor2',
        templateUrl: 'appReference/modules/graphic-tagMonitor2/graphic-tagMonitor2.html',
        controller: 'graphicTagMonitor2Controller'
      })
  }
})();
