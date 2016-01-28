(function() {
  'use strict';

  var module = angular.module('singApp.login', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'appReference/modules/extra-login-page/extra-login-page.html'
      })
  }
})();
