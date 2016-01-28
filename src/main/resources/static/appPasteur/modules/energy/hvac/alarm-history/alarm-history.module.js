(function() {
	'use strict';

	var module = angular.module('singApp.hvac-history', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.hvac-history', {
			url : '/hvac-history',
			templateUrl : 'appPasteur/modules/energy/hvac/alarm-history/alarm-history.html',
			controller : 'historyModelController'
		})
	}
})();
