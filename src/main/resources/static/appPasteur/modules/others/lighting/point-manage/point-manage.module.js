(function() {
	'use strict';

	var module = angular.module('singApp.lighting-point-manage', [ 
	                                                      'ui.router',
	                                                      'angularUtils.directives.dirPagination']);

	module.config(appConfig);

	appConfig.$inject = [ '$stateProvider' ];

	function appConfig($stateProvider) {
		$stateProvider.state('app.lighting-point-manage', {
			url : '/lighting-point-manage',
			templateUrl : 'appPasteur/modules/others/lighting/point-manage/point-manage.html',
			controller : 'lightingPMModelController'
		})
	}
})();
