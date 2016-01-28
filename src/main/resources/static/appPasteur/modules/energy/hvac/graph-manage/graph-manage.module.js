(function() {
	'use strict';

	var module = angular.module('singApp.hvac-graph-manage', [ 
	                                                      'ui.router',
	                                                      'nvd3',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.hvac-graph-manage', {
			url : '/hvac-graph-manage',
			templateUrl : 'appPasteur/modules/energy/hvac/graph-manage/graph-manage.html',
			controller : 'hvacGraphController'
		})
	}
})();
