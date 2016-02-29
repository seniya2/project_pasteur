(function() {
	'use strict';

	var module = angular.module('singApp.hvac-graph-view', [ 
	                                                      'ui.router',
	                                                      'nvd3',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.hvac-graph-view', {
			url : '/hvac-graph-view',
			templateUrl : 'appPasteur/modules/energy/hvac/graph-view/graph-view.html',
			controller : 'hvacGraphViewController'
		})
	}
})();
