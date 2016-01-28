(function() {
	'use strict';

	var module = angular.module('singApp.board-point-ui1', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.board-point-ui1', {
			url : '/board-point-ui1',
			templateUrl : 'appReference/modules/board-point-ui1/board-point-ui1.html',
			controller : 'boardPointUi1Controller'
		})
	}
})();
