(function() {
	'use strict';

	var module = angular.module('singApp.ev-history', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.ev-history', {
			url : '/ev-history',
			templateUrl : 'appPasteur/modules/others/elevator/alarm-history/alarm-history.html',
			controller : 'evHistoryModelController'
		})
	}
})();
