(function() {
  'use strict';

  var module = angular.module('singApp.board-person-ui3', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.board-person-ui3', {
        url: '/board-person-ui3',
        templateUrl: 'appReference/modules/board-person-ui3/board-person-ui3.html',
        controller: 'boardPersonUi3Controller'
      })
  }
})();
