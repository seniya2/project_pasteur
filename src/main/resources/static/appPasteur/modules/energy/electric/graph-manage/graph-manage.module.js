(function() {
	'use strict';

	var module = angular.module('singApp.electric-graph-manage', [ 
	                                                      'ui.router',
	                                                      'nvd3',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.electric-graph-manage', {
			url : '/electric-graph-manage',
			templateUrl : 'appPasteur/modules/energy/electric/graph-manage/graph-manage.html',
			controller : 'electricGraphController'
		})
	}
})();
