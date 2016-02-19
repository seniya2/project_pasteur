(function() {
  'use strict';

	energyReportController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$timeout', 'usSpinnerService' ];
	function energyReportController (config, $scope, $resource, $http, $location, $timeout, usSpinnerService) {
		
		var search = $location.search();
		$scope.entityName = "energyReport";
		$scope.template_base = "appPasteur/modules/energy/analysis/report/";
		$scope.template = "";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.reportUrl = config.settings.network.rest+$scope.entityName+"/";
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByDaily";
		$scope.reportEntity = new Object();
		
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
		$scope.searchDate = "";
		
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
			
			$scope.reportEntity = new Object();
			$timeout(function () {				
				usSpinnerService.stop('app-spinner');
			}, 1000 , true );
			
		}
		
		$scope.searchDayFormSubmit = function() {
			console.log("searchDayFormSubmit -->");			
			
			var searchDate = document.getElementById("searchDate");
			$scope.searchDate = searchDate.value;
			
			var errCnt = 0;
			if (angular.isUndefined($scope.searchDate) || $scope.searchDate == "") {
				$scope.searchDate_error=true;
				errCnt++;
			}
			
			if (errCnt>0) {
				return;
			}
			
			$scope.searchDate_error=false;
			//console.log("searchDate : " + $scope.searchDate);
						
			$scope.searchAction($scope.searchDate, "viewOrEdit");
			
		}
		
		$scope.editFormSubmit = function() {
			console.log("editFormSubmitSubmit -->");
			console.log($scope.reportEntity);
			console.log("$scope.reportEntity.no : " + $scope.reportEntity.no);
			
			$scope.disableScreen(true);
			
			if ($scope.reportEntity.no == undefined) {
				$scope.createAction();
			} else {
				$scope.updateAction();
			}
			
			
		}
		
		
		$scope.readAction = function(id) {			
			var reportUrl = $scope.reportUrl + day;
			console.log("reportUrl : " + reportUrl);
			
			$http({
				method : 'GET',
				url : reportUrl,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				
				console.log(data);
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		
		$scope.searchAction = function(day, mode) {
			
			var qurey = "?daily="+day;
			var searchUrl = $scope.searchUrl + qurey;
			
			console.log("searchUrl : " + searchUrl);
			
			$http({
				method : 'GET',
				url : searchUrl,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				
				console.log(data.energyReport);
				
				var energyReportArray = data._embedded.energyReport;
				
				if ("viewOrEdit" == mode) {
					
					if (energyReportArray.length == 0) {
						$scope.editAction(null);
					} else {
						$scope.viewAction(energyReportArray[0]);
					}
					
				}
				
				console.log(data);
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		
		
		$scope.editAction = function(reportEntity) {
			
			if (reportEntity == null) {
				$scope.reportEntity = new Object();
				$scope.reportEntity.daily = $scope.searchDate;
			}
			
			$scope.template = $scope.template_base + "report-edit.html";
			
		}
		
		$scope.viewAction = function(reportEntity) {
			
			$scope.reportEntity = reportEntity;			
			$scope.template = $scope.template_base + "report-view.html";
			
		}
		
		$scope.createAction = function() {
			console.log("createAction -->");
			console.log($scope.reportEntity);
			
			$http({
				method : 'POST',
				url : $scope.baseRestUrl + $scope.entityName,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : $scope.reportEntity
			}).success(function(data) {
				$scope.disableScreen(false);				
				$scope.massagePopup("저장 되었습니다.", "success");
				$scope.searchAction($scope.searchDate, "viewOrEdit");
				
			}).error(function(error) {
				$scope.disableScreen(false);
				
				$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
			
		}
		
		$scope.updateAction = function() {
			console.log("updateAction -->");
			console.log($scope.reportEntity);
			
			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + $scope.entityName + "/" + $scope.reportEntity.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : $scope.reportEntity
			}).success(function(data) {
				$scope.disableScreen(false);
				$scope.massagePopup("저장 되었습니다.", "success");
				$scope.searchAction($scope.searchDate, "viewOrEdit");
				
			}).error(function(error) {
				$scope.disableScreen(false);				
				$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
			
			
		}
		
		
		
		
		
	
	}

  angular.module('singApp.energy-report').controller('energyReportController', energyReportController);

})();
