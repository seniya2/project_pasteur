(function() {
  'use strict';

  var module = angular.module('singApp.components-reset', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.components-reset', {
        url: '/components/reset',
        templateUrl: 'appPasteur/modules/components/reset/reset.html',
        controller : 'commonResetController'
      })
  }
})();
