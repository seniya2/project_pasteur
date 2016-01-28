(function() {
	'use strict';

	var module = angular.module('singApp.ev-alarm', ['ui.router','angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.ev-alarm', {
			url : '/ev-alarm',
			templateUrl : 'appPasteur/modules/others/elevator/alarm-manage/alarm-manage.html',
			controller : 'evAlarmController'
		})
	}
})();
