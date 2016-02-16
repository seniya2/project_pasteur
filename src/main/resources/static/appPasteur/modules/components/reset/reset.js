(function() {
  'use strict';

  	commonResetController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function commonResetController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
    	var search = $location.search();
    	
		$scope.resources_base_electric = "appPasteur/modules/energy/electric/point-manage/resources/";
		$scope.resources_base_hvac = "appPasteur/modules/energy/hvac/point-manage/resources/";		
		$scope.baseUiUrl = config.settings.network.ui;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.resetUrl = $scope.baseXdUrl+"monitor/";
		$scope.csvFileUrl_electric = $scope.baseUiUrl + $scope.resources_base_electric + "electric.csv";
		$scope.csvFileUrl_hvac = $scope.baseUiUrl + $scope.resources_base_hvac + "hvac.csv";
		$scope.xdResetRunning = false;
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.alarmList = new HashMap();
	
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
		
		
		$scope.csvConfig_electric = {
				delimiter: ",",	// auto-detect
				newline: "",	// auto-detect
				header: true,
				dynamicTyping: false,
				preview: 0,
				encoding: "",
				worker: false,
				comments: false,
				step: undefined,
				complete: function(results, file) {				
					
					for (var key in results.data) {
						
						var tagID = results.data[key].tagID;
						var interval = results.data[key].interval;
						var tagName = results.data[key].name;
						
						if (interval != "NULL") {
							$scope.alarmList.set(tagID,
									{"tagID" : tagID, 
									"tagName" : tagName,
									"interval" : interval,
									"category" : "electric"}
							);
						}
					}
					//console.log("$scope.alarmList : " + $scope.alarmList);
					$timeout(function(){
						Papa.parse($scope.csvFileUrl_hvac, $scope.csvConfig_hvac);
					}, 3000);
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		$scope.csvConfig_hvac = {
				delimiter: ",",	// auto-detect
				newline: "",	// auto-detect
				header: true,
				dynamicTyping: false,
				preview: 0,
				encoding: "",
				worker: false,
				comments: false,
				step: undefined,
				complete: function(results, file) {				
					
					for (var key in results.data) {
						
						var tagID = results.data[key].tagID;
						var interval = results.data[key].interval;
						var tagName = results.data[key].name;
						
						if (interval != "NULL") {
							$scope.alarmList.set(tagID,
									{"tagID" : tagID, 
									"tagName" : tagName,
									"interval" : interval,
									"category" : "hvac"}
							);
						}
					}
					console.log($scope.alarmList);
					$timeout(function(){usSpinnerService.stop('app-spinner')}, 1000);
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		
	    $scope.prepareAction = function() {	    	
			Papa.parse($scope.csvFileUrl_electric, $scope.csvConfig_electric);
			$scope.xdResetRunning = false;
		}
		
	    
	    
	    $scope.xdReset = function(category) {
	    	console.log("xdReset category : " + category);
	    	
	    	if ($scope.xdResetRunning == true) {
	    		return;
	    	}
	    	$scope.xdResetRunning = true;
	    	
	    	var tagUrlArray = new Array();
	    	var intervalArray = new Array();
	    	
	    	$scope.alarmList.forEach(function(value, key) {
	    		//console.log("value : key" + value + " : " + key);
	    		
	    		var alarmList_category = value.category;
	    		var alarmList_tagID = value.tagID;
	    		var alarmList_interval = value.interval;
	    		
	    		alarmList_tagID = alarmList_tagID.replace("TAG_","");
	    		var tagUrl = $scope.resetUrl + category + "/" + alarmList_tagID;
	    		
	    		if (category == alarmList_category) {
		    		//console.log("tagUrl : " + tagUrl);
		    		//console.log("alarmList_interval : " + alarmList_interval);		    		
	    			tagUrlArray.push(tagUrl);
		    		intervalArray.push(alarmList_interval);
	    		}
	    		
			});
	    	
	    	console.log(tagUrlArray.length);
    		console.log(intervalArray.length);
	    	
	    	$scope.disableScreen(true);
	    	$scope.xdResetAction(0,tagUrlArray, intervalArray);
	    	
	    }
		
		$scope.xdResetAction = function(key, tagUrlArray, intervalArray) {
			
			var key = key+1;
			
			if (key < tagUrlArray.length) {
			//if (key < 10) {
				
				var tagUrl = tagUrlArray[key];
				var intervalValue = intervalArray[key];
				
				$http(
						{
							method : 'POST',
							headers: {
							    'Content-Type': 'application/x-www-form-urlencoded'},
							url : tagUrl,
							data : "interval="+intervalValue
							
						}).success(function(data) {
							
							console.log(key + " : tagUrl success : "+ tagUrl + " : " + intervalValue);
							
							$timeout(function(){
								$scope.xdResetAction(key, tagUrlArray, intervalArray);
							}, 200);
							
				}).error(function(error) {
					console.log("tagUrl error : "+ tagUrl);
					
					$timeout(function(){
						$scope.xdResetAction(key, tagUrlArray, intervalArray);
					}, 200);
				});
					
					
			} else {
				$scope.disableScreen(false);
				$scope.xdResetRunning = false;
			}
			
			
		}
		
    }

    angular.module('singApp.components-reset').controller('commonResetController', commonResetController);

})();
