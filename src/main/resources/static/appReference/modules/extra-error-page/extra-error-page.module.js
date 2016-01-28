(function() {
  'use strict';

  var module = angular.module('singApp.error', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('error', {
        url: '/error',
        templateUrl: 'appReference/modules/extra-error-page/extra-error-page.html'
      })
  }
})();
