(function() {
	'use strict';

	var module = angular.module('singApp.board-tagMetaModel', [ 
	                                                      'ui.router', 
	                                                      'angucomplete-alt', 
	                                                      'angularUtils.directives.dirPagination' ]);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.board-tagMetaModel', {
			url : '/board-tagMetaModel',
			templateUrl : 'appReference/modules/board-tagMetaModel/board-tagMetaModel.html',
			controller : 'boardTagMetaModelController'
		})
	}
})();
