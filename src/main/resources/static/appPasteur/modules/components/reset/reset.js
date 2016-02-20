(function() {
  'use strict';

  	commonResetController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function commonResetController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
    	var search = $location.search();
    	
		$scope.resources_base_electric = "appPasteur/modules/energy/electric/point-manage/resources/";
		$scope.resources_base_hvac = "appPasteur/modules/energy/hvac/point-manage/resources/";		
		$scope.resources_base_lighting = "appPasteur/modules/others/lighting/point-manage/resources/";
		$scope.resources_base_elevator = "appPasteur/modules/others/elevator/point-manage/resources/";
		$scope.baseUiUrl = config.settings.network.ui;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.resetUrl = $scope.baseXdUrl+"setting/";
		$scope.csvFileUrl_electric = $scope.baseUiUrl + $scope.resources_base_electric + "electric.csv";
		$scope.csvFileUrl_hvac = $scope.baseUiUrl + $scope.resources_base_hvac + "hvac.csv";
		$scope.csvFileUrl_lighting = $scope.baseUiUrl + $scope.resources_base_lighting + "lighting.csv";
		$scope.csvFileUrl_elevator = $scope.baseUiUrl + $scope.resources_base_elevator + "elevator.csv";
		
		
		
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
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"category" : "electric"});					
					}
					//console.log("$scope.alarmList : " + $scope.alarmList);
					$timeout(function(){
						Papa.parse($scope.csvFileUrl_hvac, $scope.csvConfig_hvac);
					}, 500);
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
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"category" : "hvac"});						
					}
					//console.log($scope.alarmList);
					$timeout(function(){
						Papa.parse($scope.csvFileUrl_lighting, $scope.csvConfig_lighting);
					}, 500);
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		
		$scope.csvConfig_lighting = {
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
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"category" : "lighting"});						
					}
					$timeout(function(){
						Papa.parse($scope.csvFileUrl_elevator, $scope.csvConfig_elevator);
					}, 500);
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		$scope.csvConfig_elevator = {
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
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"category" : "elevator"});						
					}
					$timeout(function(){usSpinnerService.stop('app-spinner')}, 500);
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
	    	var nameArray = new Array();
	    	
	    	$scope.alarmList.forEach(function(value, key) {
	    		//console.log("value : key" + value + " : " + key);
	    		
	    		var alarmList_category = value.category;
	    		var alarmList_tagID = value.tagID;
	    		var alarmList_interval = value.interval;
	    		var alarmList_name = value.tagName;
	    		
	    		alarmList_tagID = alarmList_tagID.replace("TAG_","");
	    		var tagUrl = $scope.resetUrl + category + "/" + alarmList_tagID;
	    		
	    		if (category == alarmList_category) {
		    		//console.log("tagUrl : " + tagUrl);
		    		//console.log("alarmList_interval : " + alarmList_interval);		    		
	    			tagUrlArray.push(tagUrl);
		    		intervalArray.push(alarmList_interval);
		    		nameArray.push(alarmList_name);
	    		}
	    		
			});
	    	
	    	console.log(tagUrlArray.length);
    		console.log(intervalArray.length);
    		console.log(nameArray.length);
    		
    		//console.log(tagUrlArray);
    		//console.log(intervalArray);
    		//console.log(nameArray);
    		//console.log(nameArray[0]);
    		//console.log(nameArray[1]);
    		//console.log(nameArray[2]);
    		//console.log(nameArray[3]);
	    	
	    	$scope.disableScreen(true);
	    	$scope.xdResetAction(-1,tagUrlArray, intervalArray, nameArray);
	    	
	    }
		
		$scope.xdResetAction = function(key, tagUrlArray, intervalArray, nameArray) {
			
			var key = key+1;
			
			if (key < tagUrlArray.length) {
			//if (key < 10) {
				
				var tagUrl = tagUrlArray[key];
				var intervalValue = intervalArray[key];
				var nameValue = nameArray[key];
				
				var postData = "name="+nameValue+"&interval="+intervalValue;
				if (intervalValue == "NULL") {
					postData = "name="+nameValue+"&interval=";
				}
				
				console.log("postData : " + postData);
				
				
				$http(
						{
							method : 'POST',
							headers: {
							    'Content-Type': 'application/x-www-form-urlencoded'},
							url : tagUrl,
							data : postData
							
						}).success(function(data) {
							
							console.log(key + " : tagUrl success : "+ tagUrl + " : " + intervalValue);
							
							$timeout(function(){
								$scope.xdResetAction(key, tagUrlArray, intervalArray, nameArray);
							}, 200);
							
				}).error(function(error) {
					console.log("tagUrl error : "+ tagUrl);
					
					$timeout(function(){
						$scope.xdResetAction(key, tagUrlArray, intervalArray, nameArray);
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
