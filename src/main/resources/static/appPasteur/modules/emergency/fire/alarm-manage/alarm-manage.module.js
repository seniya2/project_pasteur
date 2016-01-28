(function() {
	'use strict';

	var module = angular.module('singApp.fire-alarm', ['ui.router','angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.fire-alarm', {
			url : '/fire-alarm',
			templateUrl : 'appPasteur/modules/emergency/fire/alarm-manage/alarm-manage.html',
			controller : 'fireAlarmController'
		})
	}
})();
