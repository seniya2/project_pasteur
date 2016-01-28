(function() {
	'use strict';

	var module = angular.module('singApp.ev-point-manage', [ 
	                                                      'ui.router']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.ev-point-manage', {
			url : '/ev-point-manage',
			templateUrl : 'appPasteur/modules/others/elevator/point-manage/point-manage.html',
			controller : 'evPMModelController'
		})
	}
})();
