(function() {
	'use strict';

	var module = angular.module('singApp.cctv-point-manage', [ 
	                                                      'ui.router']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.cctv-point-manage', {
			url : '/cctv-point-manage',
			templateUrl : 'appPasteur/modules/emergency/cctv/point-manage/point-manage.html',
			controller : 'cctvPMModelController'
		})
	}
})();
