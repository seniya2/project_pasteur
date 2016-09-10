(function() {
	'use strict';

	var module = angular.module('singApp.ups-graph-manage', [ 
	                                                      'ui.router',
	                                                      'nvd3',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.ups-graph-manage', {
			url : '/ups-graph-manage',
			templateUrl : 'appPasteur/modules/energy/ups/graph-manage/graph-manage.html',
			controller : 'upsGraphController'
		})
	}
})();
