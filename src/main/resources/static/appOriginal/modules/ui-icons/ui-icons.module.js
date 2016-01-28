(function() {
  'use strict';

  var module = angular.module('singApp.ui.icons', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.ui-icons', {
        url: '/ui/icons',
        templateUrl: 'appOriginal/modules/ui-icons/ui-icons.html'
      })
  }
})();
