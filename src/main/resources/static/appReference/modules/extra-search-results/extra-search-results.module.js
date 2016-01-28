(function() {
  'use strict';

  var module = angular.module('singApp.extra.search', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.extra-search', {
        url: '/extra/search',
        templateUrl: 'appReference/modules/extra-search-results/extra-search-results.html'
      })
  }
})();
