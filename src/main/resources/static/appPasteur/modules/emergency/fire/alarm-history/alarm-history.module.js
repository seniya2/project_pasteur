(function() {
	'use strict';

	var module = angular.module('singApp.fire-history', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.fire-history', {
			url : '/fire-history',
			templateUrl : 'appPasteur/modules/emergency/fire/alarm-history/alarm-history.html',
			controller : 'fireHistoryModelController'
		})
	}
})();
