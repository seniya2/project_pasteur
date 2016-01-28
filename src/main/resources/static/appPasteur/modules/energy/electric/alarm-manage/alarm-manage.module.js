(function() {
	'use strict';

	var module = angular.module('singApp.electric-alarm', ['ui.router']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.electric-alarm', {
			url : '/electric-alarm',
			templateUrl : 'appPasteur/modules/energy/electric/alarm-manage/alarm-manage.html',
			controller : 'electricAlarmController'
		})
	}
})();
