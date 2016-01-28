(function() {
	'use strict';

	var module = angular.module('singApp.hvac-alarm', ['ui.router','angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.hvac-alarm', {
			url : '/hvac-alarm',
			templateUrl : 'appPasteur/modules/energy/hvac/alarm-manage/alarm-manage.html',
			controller : 'hvacAlarmController'
		})
	}
})();
