(function() {
	'use strict';

	var module = angular.module('singApp.energy-hvac-point-manage', [ 
	                                                      'ui.router',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.energy-hvac-point-manage', {
			url : '/energy-hvac-point-manage',
			templateUrl : 'appPasteur/modules/energy/hvac/point-manage/point-manage.html',
			controller : 'hvacPMModelController'
		})
	}
})();
