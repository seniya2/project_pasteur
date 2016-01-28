(function() {
	'use strict';

	var module = angular.module('singApp.board-person-ui1', [ 'ui.router', 'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.board-person-ui1', {
			url : '/board-person-ui1',
			templateUrl : 'appReference/modules/board-person-ui1/board-person-ui1.html',
			controller : 'boardPersonUi1Controller'
		})
	}
})();
