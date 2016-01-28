(function() {
	'use strict';

	var module = angular.module('singApp.electric-history', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.electric-history', {
			url : '/electric-history',
			templateUrl : 'appPasteur/modules/energy/electric/alarm-history/alarm-history.html',
			controller : 'electricHistoryModelController'
		})
	}
})();
