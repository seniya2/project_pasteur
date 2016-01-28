(function() {
  'use strict';

  var module = angular.module('singApp.extra.invoice', [
    'ui.router'
  ]);

  module.config(appConfig);

  appConfig.$inject = ['$stateProvider'];

  function appConfig($stateProvider) {
    $stateProvider
      .state('app.extra-invoice', {
        url: '/extra/invoice',
        templateUrl: 'appOriginal/modules/extra-invoice/extra-invoice.html',
        controller: 'InvoiceCtrl'
      })
  }
})();
