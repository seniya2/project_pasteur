(function() {
  'use strict';

  var module = angular.module('singApp.extra.gallery', [
    'ui.router',
    'ui.jq',
    'singApp.components.gallery'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.extra-gallery', {
        url: '/extra/gallery',
        templateUrl: 'appOriginal/modules/extra-gallery/extra-gallery.html'
      })
  }
})();
