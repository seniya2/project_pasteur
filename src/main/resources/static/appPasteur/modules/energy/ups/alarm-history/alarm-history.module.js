(function() {
	'use strict';

	var module = angular.module('singApp.ups-history', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.ups-history', {
			url : '/ups-history',
			templateUrl : 'appPasteur/modules/energy/ups/alarm-history/alarm-history.html',
			controller : 'upsHistoryModelController'
		})
	}
})();
