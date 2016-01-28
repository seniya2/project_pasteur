(function() {
	'use strict';

	var module = angular.module('singApp.electric-graph-view', [ 
	                                                      'ui.router',
	                                                      'nvd3',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.electric-graph-view', {
			url : '/electric-graph-view',
			templateUrl : 'appPasteur/modules/energy/electric/graph-view/graph-view.html',
			controller : 'electricGraphViewController'
		})
	}
})();
