(function() {
  'use strict';

	energyReportController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$timeout', 'usSpinnerService' ];
	function energyReportController (config, $scope, $resource, $http, $location, $timeout, usSpinnerService) {
		
		var search = $location.search();
		$scope.template_base = "appPasteur/modules/energy/analysis/report/";
		$scope.template = $scope.template_base + "report-edit.html";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByDaily";		
		$scope.entityName = "energyReport";
		
		$scope.disableScreen = function(enable) {			
			if (enable) {
				config.globalDisable = true;
				usSpinnerService.spin('app-spinner');					
			} else {
				$timeout(function(){
					config.globalDisable = false;					
					usSpinnerService.stop('app-spinner');
				}, 500);
			}
		};
		
		$scope.massagePopup = function(msg, type) {			
			Messenger({
				extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
			}).post({
				  message: msg,
				  type: type,
				  showCloseButton: false
			});
		}
		
		$scope.currentDate = "";
		
		$scope.getCurrentDate = function() {
			var nowDate = new Date();			
			var nowDateStr = nowDate.toISOString();
			nowDateStr = nowDateStr.substr(0,19);
			nowDateStr = nowDateStr.replace("T"," ");
			return nowDateStr;			
		}
		
		$scope.setCurrentDate = function() {
			$scope.currentDate = $scope.getCurrentDate();
		}
		
		
		$scope.prepareAction = function() {
			
			$timeout(function () {				
				usSpinnerService.stop('app-spinner');
			}, 1000 , true );
			
		}
		
		$scope.searchDayFormSubmit = function() {
			console.log("searchDayFormSubmit -->");
		}
		
	
	}

  angular.module('singApp.energy-report').controller('energyReportController', energyReportController);

})();
