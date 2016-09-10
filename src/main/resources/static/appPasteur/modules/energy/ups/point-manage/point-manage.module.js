(function() {
	'use strict';

	var module = angular.module('singApp.ups-point-manage', [ 
	                                                      'ui.router',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.ups-point-manage', {
			url : '/ups-point-manage',
			templateUrl : 'appPasteur/modules/energy/ups/point-manage/point-manage.html',
			controller : 'upsPointController'
		})
	}
})();
