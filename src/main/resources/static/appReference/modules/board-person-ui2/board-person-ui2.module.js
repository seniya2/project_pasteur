(function() {
	'use strict';

	var module = angular.module('singApp.board-person-ui2', [ 'ui.router', 'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.board-person-ui2', {
			url : '/board-person-ui2',
			templateUrl : 'appReference/modules/board-person-ui2/board-person-ui2.html',
			controller : 'boardPersonUi2Controller'
		})
	}
})();
