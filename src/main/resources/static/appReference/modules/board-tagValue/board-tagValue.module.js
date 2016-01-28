(function() {
	'use strict';

	var module = angular.module('singApp.board-tagValue', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.board-tagValue', {
			url : '/board-tagValue',
			templateUrl : 'appReference/modules/board-tagValue/board-tagValue.html',
			controller : 'boardTagValueController'
		})
	}
})();
