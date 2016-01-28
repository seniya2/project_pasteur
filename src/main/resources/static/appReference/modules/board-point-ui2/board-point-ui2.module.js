(function() {
	'use strict';

	var module = angular.module('singApp.board-point-ui2', [ 'ui.router', 'angucomplete-alt' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.board-point-ui2', {
			url : '/board-point-ui2',
			templateUrl : 'appReference/modules/board-point-ui2/board-point-ui2.html',
			controller : 'boardPointUi2Controller'
		})
	}
})();
