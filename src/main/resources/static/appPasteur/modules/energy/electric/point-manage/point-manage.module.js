(function() {
	'use strict';

	var module = angular.module('singApp.energy-electric-point-manage', [ 
	                                                      'ui.router']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.energy-electric-point-manage', {
			url : '/energy-electric-point-manage',
			templateUrl : 'appPasteur/modules/energy/electric/point-manage/point-manage.html',
			controller : 'electricPMModelController'
		})
	}
})();
