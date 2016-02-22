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
		$scope.searchMonthUrl = config.settings.network.rest+$scope.entityName+"/search/findByDailyContains";
		
		
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
			nowDateStr = nowDateStr.substr(0,10);
			return nowDateStr;			
		}
		
		$scope.editable = function() {
			var nowDate = new Date();			
			var nowDateStr = nowDate.toISOString();
			nowDateStr = nowDateStr.substr(0,10);
			if (nowDateStr == $scope.reportEntity.daily) {
				return true;
			} else { 
				return false;
			}
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
			/*
			var selectedDate = new Date($scope.searchDate);
			var currentDateStr = $scope.getCurrentDate();
			
			var selectedDateStr = selectedDate.toISOString();
			selectedDateStr = selectedDateStr.substr(0,10);
			
			console.log("currentDateStr : " + currentDateStr);
			console.log("selectedDateStr : " + selectedDateStr);
			
			*/
			
			var errCnt = 0;
			if (angular.isUndefined($scope.searchDate) || $scope.searchDate == "") {
				$scope.searchDate_error=true;
				errCnt++;
			}
			/*
			if (selectedDate > currentDateStr) {
				$scope.searchDate_next_error=true;
				errCnt++;
			}
			*/
			if (errCnt>0) {
				return;
			}
			
			$scope.disableScreen(true);
			$scope.searchDate_error=false;
			$scope.searchDate_next_error=false;
			$scope.searchAction($scope.searchDate);
			
		}
		
		$scope.editFormSubmit = function(valid) {
			console.log("editFormSubmitSubmit -->");
			console.log($scope.reportEntity);
			//console.log("$scope.reportEntity.no : " + $scope.reportEntity.no);
			
			if (!valid) {
				return;
			}
			
			var selectedDate = new Date($scope.searchDate);
			var currentDateStr = $scope.getCurrentDate();
			
			var selectedDateStr = selectedDate.toISOString();
			selectedDateStr = selectedDateStr.substr(0,10);
			
			if (currentDateStr != selectedDateStr) {
				window.alert("현재 날짜만 작성 가능합니다.");
				return;
			}
			
			
			
			$scope.disableScreen(true);
			
			if ($scope.reportEntity.no == undefined) {
				$scope.createAction();
			} else {
				$scope.updateAction();
			}
			
		}
		
		
		$scope.searchPreDataAction_day = function(day) {
			
			var newDay = day.substring(0, 7);			
			var qurey = "?daily="+newDay+"&size=50&sort=daily,asc";
			var searchUrl = $scope.searchMonthUrl + qurey;
			console.log("searchUrl : " + searchUrl);
			
			$http({
				method : 'GET',
				url : searchUrl,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				
				$scope.searchPreDataAction_month(day);				
				var energyReportArray = data._embedded.energyReport;
				var preDataArray = new Array();
				var waterSum = 0.0;
				var boiler1Sum = 0.0;
				var boiler2Sum = 0.0;
				var wastesSum = 0.0;
				var heat1Sum = 0.0;
				var heat2Sum = 0.0;
				var oilSum = 0.0;
				var freeze1Sum = 0.0;
				var freeze2Sum = 0.0;
				var wattSum = 0.0;				
				var item1Sum = 0.0;
				var item2Sum = 0.0;
				
				var co21Sum = 0;
				var co22Sum = 0;
				var co23Sum = 0;
				var co24Sum = 0;
				var co20Sum = 0;
				
				for (var key in energyReportArray) {					
					if (day <= energyReportArray[key].daily) {
						break;
					} else {
						waterSum = waterSum + energyReportArray[key].waterToday;
						boiler1Sum = boiler1Sum + energyReportArray[key].boiler1Today;
						boiler2Sum = boiler2Sum + energyReportArray[key].boiler2Today;
						wastesSum = wastesSum + energyReportArray[key].wastesToday;
						heat1Sum = heat1Sum + energyReportArray[key].heat1Today;
						heat2Sum = heat2Sum + energyReportArray[key].heat2Today;
						oilSum = oilSum + energyReportArray[key].oilToday;
						freeze1Sum = freeze1Sum + energyReportArray[key].freeze1Today;
						freeze2Sum = freeze2Sum + energyReportArray[key].freeze2Today;
						wattSum = wattSum + energyReportArray[key].wattToday;					
						item1Sum = item1Sum + energyReportArray[key].item1Today;
						item2Sum = item2Sum + energyReportArray[key].item2Today;
						//console.log("energyReportArray[key].daily : " + energyReportArray[key].daily);
					}
				}				
				
				$scope.reportEntity.waterSum = waterSum;
				$scope.reportEntity.boiler1Sum = boiler1Sum;
				$scope.reportEntity.boiler2Sum = boiler2Sum;
				$scope.reportEntity.wastesSum = wastesSum;
				$scope.reportEntity.heat1Sum = heat1Sum;
				$scope.reportEntity.heat2Sum = heat2Sum;
				$scope.reportEntity.oilSum = oilSum;
				$scope.reportEntity.freeze1Sum = freeze1Sum;
				$scope.reportEntity.freeze2Sum = freeze2Sum;
				$scope.reportEntity.wattSum = wattSum;
				$scope.reportEntity.item1Sum = item1Sum;
				$scope.reportEntity.item2Sum = item2Sum;				
				
				$scope.reportEntity.waterTotal = waterSum;
				$scope.reportEntity.boiler1Total = boiler1Sum;
				$scope.reportEntity.boiler2Total = boiler2Sum;
				$scope.reportEntity.wastesTotal = wastesSum;
				$scope.reportEntity.heat1Total = heat1Sum;
				$scope.reportEntity.heat2Total = heat2Sum;
				$scope.reportEntity.oilTotal = oilSum;
				$scope.reportEntity.freeze1Total = freeze1Sum;
				$scope.reportEntity.freeze2Total = freeze2Sum;
				$scope.reportEntity.wattTotal = wattSum;
				$scope.reportEntity.item1Total = item1Sum;
				$scope.reportEntity.item2Total = item2Sum;
				
				co21Sum = ((parseFloat(boiler1Sum) + parseFloat(boiler2Sum)) * 0.001043).toFixed(6);
				co22Sum = ((parseFloat(heat1Sum) + parseFloat(heat2Sum)) * 0.1).toFixed(6);
				co23Sum = (parseFloat(oilSum) * 0.000901).toFixed(6);
				co24Sum = (parseFloat(wattSum) * 0.00023).toFixed(6);
				co20Sum = (parseFloat(co21Sum) + parseFloat(co22Sum) + parseFloat(co23Sum) + parseFloat(co24Sum)).toFixed(6);
								
				$scope.reportEntity.co21Sum = co21Sum;	
				$scope.reportEntity.co22Sum = co22Sum;	
				$scope.reportEntity.co23Sum = co23Sum;	
				$scope.reportEntity.co24Sum = co24Sum;	
				$scope.reportEntity.co20Sum = co20Sum;
				
				$scope.reportEntity.co21Total = co21Sum;	
				$scope.reportEntity.co22Total = co22Sum;	
				$scope.reportEntity.co23Total = co23Sum;
				$scope.reportEntity.co24Total = co24Sum;
				$scope.reportEntity.co20Total = co20Sum;
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		
		$scope.searchPreDataAction_month = function(day) {
			
			var currentDate = new Date(day);
			currentDate.setMonth(currentDate.getMonth()-1); 
			var newDay = currentDate.toISOString();
			newDay = newDay.substr(0,7);
			
			var qurey = "?daily="+newDay+"&size=50&sort=daily,asc";
			var searchUrl = $scope.searchMonthUrl + qurey;
			console.log("searchUrl : " + searchUrl);
			
			$http({
				method : 'GET',
				url : searchUrl,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {				
				var energyReportArray = data._embedded.energyReport;
				var preDataArray = new Array();
				var powerMonth = 0.0;
				for (var key in energyReportArray) {
					powerMonth = powerMonth + energyReportArray[key].wattToday;					
					//console.log("energyReportArray[key].daily : " + energyReportArray[key].daily);
				}
				$scope.reportEntity.powerMonth = powerMonth;
				$scope.functionInit();
				
				console.log("$scope.reportEntity.no : " + $scope.reportEntity.no);
				if ($scope.reportEntity.no != undefined) {
					$scope.viewAndUpdateAction();
				} else {
					$scope.disableScreen(false);
				}
				//console.log(data);				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		
		$scope.searchAction = function(day) {
			
			var qurey = "?daily="+day;
			var searchUrl = $scope.searchUrl + qurey;
			
			console.log("searchUrl : " + searchUrl);
			
			$http({
				method : 'GET',
				url : searchUrl,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				
				var energyReportArray = data._embedded.energyReport;
				
				if (energyReportArray.length == 0) {
					$scope.editAction(null);
					$scope.searchPreDataAction_day(day);
					
					$scope.reportEntity.waterToday = 0.0;
					$scope.reportEntity.boiler1Today = 0.0;
					$scope.reportEntity.boiler2Today = 0.0;
					$scope.reportEntity.wastesToday = 0.0;
					$scope.reportEntity.heat1Today = 0.0;
					$scope.reportEntity.heat2Today = 0.0;
					$scope.reportEntity.oilToday = 0.0;
					$scope.reportEntity.freeze1Today = 0.0;
					$scope.reportEntity.freeze2Today = 0.0;
					$scope.reportEntity.wattToday = 0.0;
					$scope.reportEntity.item1Today = 0.0;
					$scope.reportEntity.item2Today = 0.0;
					$scope.reportEntity.item2Today = 0.0;
					$scope.reportEntity.powerMonth = 0.0;
					$scope.reportEntity.powerToday = 0.0;
					
				} else {
					$scope.viewAction(energyReportArray[0],day);					
				}				
				//console.log(data);
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		
		
		$scope.editAction = function(reportEntity) {
			
			if (reportEntity == null) {
				$scope.reportEntity = new Object();
				$scope.reportEntity.daily = $scope.searchDate;
			} else {
				var selectedDate = new Date($scope.searchDate);
				var currentDateStr = $scope.getCurrentDate();
				
				var selectedDateStr = selectedDate.toISOString();
				selectedDateStr = selectedDateStr.substr(0,10);
				
				if (currentDateStr != selectedDateStr) {
					window.alert("현재 날짜만 작성 가능합니다.");
					return;
				}
			}
			
			$scope.template = $scope.template_base + "report-edit.html";
			
		}
		
		$scope.viewAction = function(reportEntity, day) {
			
			$scope.reportEntity = reportEntity;			
			$scope.template = $scope.template_base + "report-view.html";
			$scope.searchPreDataAction_day(day);
		}
		
		$scope.createAction = function() {
			console.log("createAction -->");
			//console.log($scope.reportEntity);

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
				$scope.searchAction($scope.searchDate);
				
			}).error(function(error) {
				$scope.disableScreen(false);				
				$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
			
		}
		
		$scope.updateAction = function() {
			console.log("updateAction -->");
			//console.log($scope.reportEntity);

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
				$scope.searchAction($scope.searchDate);
				
			}).error(function(error) {
				$scope.disableScreen(false);				
				$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
		$scope.viewAndUpdateAction = function() {
			console.log("viewAndUpdateAction -->");
			//console.log($scope.reportEntity);

			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + $scope.entityName + "/" + $scope.reportEntity.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : $scope.reportEntity
			}).success(function(data) {
				$scope.disableScreen(false);
				//$scope.massagePopup("저장 되었습니다.", "success");
				//$scope.searchAction($scope.searchDate);
				
			}).error(function(error) {
				$scope.disableScreen(false);			
				$scope.massagePopup("업데이트 실패", "error");
				//$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
		$scope.functionInit = function() {
			
			$scope.$watch('reportEntity.waterToday', function() {			
				$scope.reportEntity.waterTotal = parseFloat($scope.reportEntity.waterToday) + parseFloat($scope.reportEntity.waterSum);
			});
			$scope.$watch('reportEntity.boiler1Today', function() {	
				$scope.reportEntity.boiler1Total = parseFloat($scope.reportEntity.boiler1Today) + parseFloat($scope.reportEntity.boiler1Sum);
				$scope.reportEntity.co21Today = ((parseFloat($scope.reportEntity.boiler1Today) + parseFloat($scope.reportEntity.boiler2Today)) * 0.001043).toFixed(6);
			});
			$scope.$watch('reportEntity.boiler2Today', function() {	
				$scope.reportEntity.boiler2Total = parseFloat($scope.reportEntity.boiler2Today) + parseFloat($scope.reportEntity.boiler2Sum);
				$scope.reportEntity.co21Today = ((parseFloat($scope.reportEntity.boiler1Today) + parseFloat($scope.reportEntity.boiler2Today)) * 0.001043).toFixed(6);
			});
			$scope.$watch('reportEntity.wastesToday', function() {			
				$scope.reportEntity.wastesTotal = parseFloat($scope.reportEntity.wastesToday) + parseFloat($scope.reportEntity.wastesSum);
			});
			$scope.$watch('reportEntity.heat1Today', function() {			
				$scope.reportEntity.heat1Total = parseFloat($scope.reportEntity.heat1Today) + parseFloat($scope.reportEntity.heat1Sum);
				$scope.reportEntity.co22Today = ((parseFloat($scope.reportEntity.heat1Today) + parseFloat($scope.reportEntity.heat2Today)) * 0.1).toFixed(6);
			});
			$scope.$watch('reportEntity.heat2Today', function() {			
				$scope.reportEntity.heat2Total = parseFloat($scope.reportEntity.heat2Today) + parseFloat($scope.reportEntity.heat2Sum);
				$scope.reportEntity.co22Today = ((parseFloat($scope.reportEntity.heat1Today) + parseFloat($scope.reportEntity.heat2Today)) * 0.1).toFixed(6);
			});
			$scope.$watch('reportEntity.oilToday', function() {			
				$scope.reportEntity.oilTotal = parseFloat($scope.reportEntity.oilToday) + parseFloat($scope.reportEntity.oilSum);
				$scope.reportEntity.co23Today = (parseFloat($scope.reportEntity.oilToday) * 0.000901).toFixed(6);
			});
			$scope.$watch('reportEntity.freeze1Today', function() {			
				$scope.reportEntity.freeze1Total = parseFloat($scope.reportEntity.freeze1Today) + parseFloat($scope.reportEntity.freeze1Sum);
			});
			$scope.$watch('reportEntity.freeze2Today', function() {			
				$scope.reportEntity.freeze2Total = parseFloat($scope.reportEntity.freeze2Today) + parseFloat($scope.reportEntity.freeze2Sum);
			});
			$scope.$watch('reportEntity.wattToday', function() {			
				$scope.reportEntity.wattTotal = parseFloat($scope.reportEntity.wattToday) + parseFloat($scope.reportEntity.wattSum);
				$scope.reportEntity.co24Today = (parseFloat($scope.reportEntity.wattToday) * 0.00023).toFixed(6);
			});		
			$scope.$watch('reportEntity.item1Today', function() {			
				$scope.reportEntity.item1Total = parseFloat($scope.reportEntity.item1Today) + parseFloat($scope.reportEntity.item1Sum);
			});
			$scope.$watch('reportEntity.item2Today', function() {			
				$scope.reportEntity.item2Total = parseFloat($scope.reportEntity.item2Today) + parseFloat($scope.reportEntity.item2Sum);
			});
			
			
			$scope.$watch('reportEntity.co21Today', function() {
				if (isNaN($scope.reportEntity.co21Today)){
					$scope.reportEntity.co21Today = 0.0;
				}
				$scope.reportEntity.co21Total = (parseFloat($scope.reportEntity.co21Today) + parseFloat($scope.reportEntity.co21Sum)).toFixed(6);
				$scope.reportEntity.co20Today = (parseFloat($scope.reportEntity.co21Today) 
												+ parseFloat($scope.reportEntity.co22Today)
												+ parseFloat($scope.reportEntity.co23Today) 
												+ parseFloat($scope.reportEntity.co24Today));
			});
			$scope.$watch('reportEntity.co22Today', function() {		
				if (isNaN($scope.reportEntity.co22Today)){
					$scope.reportEntity.co22Today = 0.0;
				}
				$scope.reportEntity.co22Total = (parseFloat($scope.reportEntity.co22Today) + parseFloat($scope.reportEntity.co22Sum)).toFixed(6);
				$scope.reportEntity.co20Today = (parseFloat($scope.reportEntity.co21Today) 
												+ parseFloat($scope.reportEntity.co22Today)
												+ parseFloat($scope.reportEntity.co23Today) 
												+ parseFloat($scope.reportEntity.co24Today)).toFixed(6);
			});
			$scope.$watch('reportEntity.co23Today', function() {
				if (isNaN($scope.reportEntity.co23Today)){
					$scope.reportEntity.co23Today = 0.0;
				}
				$scope.reportEntity.co23Total = (parseFloat($scope.reportEntity.co23Today) + parseFloat($scope.reportEntity.co23Sum)).toFixed(6);
				$scope.reportEntity.co20Today = (parseFloat($scope.reportEntity.co21Today) 
												+ parseFloat($scope.reportEntity.co22Today)
												+ parseFloat($scope.reportEntity.co23Today) 
												+ parseFloat($scope.reportEntity.co24Today)).toFixed(6);
			});		
			$scope.$watch('reportEntity.co24Today', function() {	
				if (isNaN($scope.reportEntity.co24Today)){
					$scope.reportEntity.co24Today = 0.0;
				}
				$scope.reportEntity.co24Total = (parseFloat($scope.reportEntity.co24Today) + parseFloat($scope.reportEntity.co24Sum)).toFixed(6);
				$scope.reportEntity.co20Today = (parseFloat($scope.reportEntity.co21Today) 
												+ parseFloat($scope.reportEntity.co22Today)
												+ parseFloat($scope.reportEntity.co23Today) 
												+ parseFloat($scope.reportEntity.co24Today)).toFixed(6);
			});
			$scope.$watch('reportEntity.co20Today', function() {
				
				if (isNaN($scope.reportEntity.co20Today)){
					$scope.reportEntity.co20Today = 0.0;
				}
				$scope.reportEntity.co20Total = (parseFloat($scope.reportEntity.co20Today) + parseFloat($scope.reportEntity.co20Sum)).toFixed(6);
			});
		}
		
	
	}

  angular.module('singApp.energy-report').controller('energyReportController', energyReportController);

})();
