(function() {
  'use strict';

  	commonResetController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function commonResetController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
    	var search = $location.search();
    	
		$scope.resources_base_electric = "appPasteur/modules/energy/electric/point-manage/resources/";
		$scope.resources_base_hvac = "appPasteur/modules/energy/hvac/point-manage/resources/";		
		$scope.resources_base_lighting = "appPasteur/modules/others/lighting/point-manage/resources/";
		$scope.resources_base_elevator = "appPasteur/modules/others/elevator/point-manage/resources/";
		$scope.resources_base_ups = "appPasteur/modules/energy/ups/point-manage/resources/";
		$scope.baseUiUrl = config.settings.network.ui;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.resetUrl = $scope.baseXdUrl+"setting/";
		$scope.csvFileUrl_electric = $scope.baseUiUrl + $scope.resources_base_electric + "electric.csv";
		$scope.csvFileUrl_hvac = $scope.baseUiUrl + $scope.resources_base_hvac + "hvac.csv";
		$scope.csvFileUrl_lighting = $scope.baseUiUrl + $scope.resources_base_lighting + "lighting.csv";
		$scope.csvFileUrl_elevator = $scope.baseUiUrl + $scope.resources_base_elevator + "elevator.csv";
		$scope.csvFileUrl_ups = $scope.baseUiUrl + $scope.resources_base_ups + "ups.csv";
		
		
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
						var criteria = results.data[key].criteria;
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"criteria" : criteria,
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
						var criteria = results.data[key].criteria;
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"criteria" : criteria,
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
						var criteria = results.data[key].criteria;
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"criteria" : criteria,
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
						var criteria = results.data[key].criteria;
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"criteria" : criteria,
								"category" : "elevator"});						
					}
					
					$timeout(function(){
						Papa.parse($scope.csvFileUrl_ups, $scope.csvConfig_ups);
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
		
		
		$scope.csvConfig_ups = {
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
						var criteria = results.data[key].criteria;
						
						$scope.alarmList.set(tagID,
								{"tagID" : tagID, 
								"tagName" : tagName,
								"interval" : interval,
								"criteria" : criteria,
								"category" : "ups"});						
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
	    	var criteriaArray = new Array();
	    	
	    	
	    	$scope.alarmList.forEach(function(value, key) {
	    		//console.log("value : key" + value + " : " + key);
	    		//console.log(value);
	    		
	    		var alarmList_category = value.category;
	    		var alarmList_tagID = value.tagID;
	    		var alarmList_interval = value.interval;
	    		var alarmList_name = value.tagName;
	    		var alarmList_criteria = value.criteria;
	    		
	    		alarmList_tagID = alarmList_tagID.replace("TAG_","");
	    		var tagUrl = $scope.resetUrl + category + "/" + alarmList_tagID;
	    		
	    		if (category == alarmList_category) {
	    			//console.log("criteria : "+ value.criteria);
		    		//console.log("tagUrl : " + tagUrl);
		    		//console.log("alarmList_interval : " + alarmList_interval);		    		
	    			tagUrlArray.push(tagUrl);
		    		intervalArray.push(alarmList_interval);
		    		nameArray.push(alarmList_name);
		    		criteriaArray.push(alarmList_criteria);
	    		}
	    		
			});
	    	
	    	//console.log(tagUrlArray.length);
    		//console.log(intervalArray.length);
    		//console.log(nameArray.length);
    		//console.log(criteriaArray.length);
    		
    		//console.log(criteriaArray);
    		//console.log(tagUrlArray);
    		//console.log(intervalArray);
    		//console.log(nameArray);
    		//console.log(nameArray[0]);
    		//console.log(nameArray[1]);
    		//console.log(nameArray[2]);
    		//console.log(nameArray[3]);
	    	
	    	$scope.disableScreen(true);
	    	$scope.xdResetAction(-1,tagUrlArray, intervalArray, nameArray, criteriaArray);
	    	
	    }
		
		$scope.xdResetAction = function(key, tagUrlArray, intervalArray, nameArray, criteriaArray) {
			
			var key = key+1;
			
			if (key < tagUrlArray.length) {
			//if (key < 10) {
				
				var tagUrl = tagUrlArray[key];
				var intervalValue = intervalArray[key];
				var nameValue = nameArray[key];
				var criteriaValue = criteriaArray[key];
				
				//var postData = "name="+nameValue+"&interval=-1";
				var postData = "name="+nameValue;
				
				if (intervalValue == "NULL") {
					postData = postData + "&interval=";
				}else {
					postData = postData + "&interval="+intervalValue;
				}				
				if (criteriaValue == "NULL") {
					postData = postData + "&criteria=";
				}else {
					postData = postData + "&criteria="+criteriaValue;
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
								$scope.xdResetAction(key, tagUrlArray, intervalArray, nameArray, criteriaArray);
							}, 200);
							
				}).error(function(error) {
					console.log("tagUrl error : "+ tagUrl);
					
					$timeout(function(){
						$scope.xdResetAction(key, tagUrlArray, intervalArray, nameArray, criteriaArray);
					}, 200);
				});
					
					
			} else {
				$scope.disableScreen(false);
				$scope.xdResetRunning = false;
			}
			
			
		}
		
    }

    angular.module('singApp.components-reset')
    .controller('commonResetController', commonResetController);
    /*
    .constant('LOCALES', {
			    'locales': {
			        'ru_RU': 'Русский',
			        'en_US': 'English'
			    },
			    'preferredLocale': 'en_US'
    		})
    .config(function ($translateProvider) {
    	$translateProvider.useMissingTranslationHandlerLog();
    	})
    .config(function ($translateProvider) {
    		    $translateProvider.useStaticFilesLoader({
    		        prefix: 'resources/locale-',// path to translations files
    		        suffix: '.json'// suffix, currently- extension of the translations
    		    });
    		    $translateProvider.preferredLanguage('en_US');// is applied on first load
    		    $translateProvider.useLocalStorage();// saves selected language to localStorage
    		})
    .config(function (tmhDynamicLocaleProvider) {
    	tmhDynamicLocaleProvider.localeLocationPattern('bower_components/angular-i18n/angular-locale_{{locale}}.js');
    	});
    */
})();
