(function() {
	'use strict';

	lightingMonitorController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval', 'usSpinnerService','$timeout' ];
	function lightingMonitorController(config, $scope, $resource, $http, $location, $filter, $interval, usSpinnerService, $timeout) {

		Messenger.options = {
			    extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
			    theme: 'future'
			}
			
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.currentPath = $location.path();
		$scope.point = new Array(); 
		
		$scope.categoryName = "lighting";			
		$scope.resources_base_point = "appPasteur/modules/others/lighting/point-manage/resources/";
		$scope.resources_base_svg = "appPasteur/modules/others/lighting/point-monitor/svg/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;		
		$scope.tagCsvUrl = $scope.baseUiUrl + $scope.resources_base_point + $scope.categoryName + ".csv";
		$scope.menuCsvUrl = $scope.baseUiUrl + $scope.resources_base_svg + "menu.csv";
		
				
		$scope.svgFile = "";
		$scope.menuList = null;
		$scope.tagList = new HashMap();
		
		
		$scope.menuCsvConfig = {
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
					$scope.menuList = results.data;
					//console.log($scope.menuList);
					$scope.svgFileChange($scope.menuList[0].url);
					$timeout(function(){usSpinnerService.stop('app-spinner-olpm')}, 1000);
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		$scope.tagCsvConfig = {
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
					//$scope.tagList = results.data;
					//console.log($scope.tagList);
					var tagID = "";
					var tagAddr = "";
					var animateType ="";
					for (var key in results.data) {						
						tagID = results.data[key].tagID;
						tagAddr = results.data[key].tagAddr;
						animateType = results.data[key].animateType;
						$scope.tagList.set(tagID,
								{"tagAddr" : tagAddr, 
								"animateType" : animateType, 
								"val" : null, 
								"old_val" : null}
						);						
					}		
					
					console.log($scope.tagList);
					Papa.parse($scope.menuCsvUrl, $scope.menuCsvConfig);
					
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
			usSpinnerService.spin("app-spinner-olpm");
			Papa.parse($scope.tagCsvUrl, $scope.tagCsvConfig);
		}
		
		
		$scope.svgFileChangeClass = function(file) {			
			//console.log("svgFileChangeClass : " + file);			
			if ($scope.svgFile == file) {				
				return "text-primary";
			}
		}
		
		$scope.svgFileChangeClass2 = function(file) {			
			//console.log("svgFileChangeClass : " + file);			
			if ($scope.svgFile == file) {				
				return "custom_monitor_menu";
			}
		}
		
		$scope.svgFileChange = function(file) {
			
			$scope.point = new Array();
			$scope.svgFile = file;
			document.getElementById("svg_render").innerHTML = "";
			
			d3.xml($scope.svgFile, function(error, documentFragment) {

			    if (error) {console.log(error); return;}
			    $scope.point = new Array();
			    //console.log(documentFragment);
			    document.getElementById("svg_render").appendChild(documentFragment.documentElement);
			    
			    d3.selectAll("svg>g>g").each(function() {
					  //console.log(d3.select(this).attr('id'));
					  var tagID = d3.select(this).attr('id');
					  if (tagID != null) {						  
						  $scope.point[tagID] = "";
						  //console.log("tagID:"+tagID);
					  }
				});
			    
			    /*
			    d3.selectAll("svg>*").each(function() {
					  //console.log(d3.select(this).attr('id'));
					  var tagID = d3.select(this).attr('id');
					  if (tagID != null) {						  
						  $scope.point[tagID] = "";
						  console.log("tagID:"+tagID);
					  }
				});
			    */
			    $scope.callAtInterval();
			    $scope.asyncStartAction();
			    
			});
			
		}
		
		$scope.asyncStartAction = function() {
			$scope.intervalJob = $interval(function(){ $scope.callAtInterval(); }, 10000);
		}
		
		$scope.asyncStopAction = function() {
			 $interval.cancel($scope.intervalJob);
		}
		
		$scope.callAtInterval = function() {			
			if ($location.path() != $scope.currentPath){
				$scope.asyncStopAction();
				return;
			}
			for (var key in $scope.point) {
				try {
					$scope.animateApply(key);
				}
				catch(err) {
				   console.log(err);
				}
        	}
        }

		$scope.animateApply = function(tagID) {

			try {
				$scope.point[tagID] = $scope.tagList.get(tagID);
				//console.log($scope.point[tagID]);			
				var point = $scope.point[tagID];
				//var tagType = point.type;
				//var cateURL = point.categoryAddr;
				var tagAddr = point.tagAddr;
			}
			catch(err) {
			   console.log(err);
			   return;
			}
			
			if (angular.isUndefined(tagAddr)) {
				return;
			}
			
			$http({
						method : 'GET',
						url : tagAddr,
						headers: {'Content-type': 'application/json'}
							
					}).success(function(data) {
						
						point.value = data.value;							
						point.old_val = data.value;
												
						if (!isNaN(point.value)){
							point.value = parseFloat(data.value).toFixed(1);
							//console.log(parseInt(point.value).toFixed(1));
						} else {
							point.value = data.value;
						}
						
						
						var tagValue = point.value;						
						var selectedD3 = d3.select("#"+tagID);
						var animateType = point.animateType;						
												
						if (animateType != null){
							//console.log("animateType :" + animateType + ":");
							try {
								eval("$scope.animateTag."+animateType+"(selectedD3, tagValue);");
							}
							catch(err) {
							   console.log(err);
							}							
						} else {
							//selectedD3.text(tagValue);
						}
						
					}).error(function(error) {
						// $scope.widgetsError = error;
					});
			
		}
		
		$scope.animateTag = {
			
			// changeText : 태그값 출력하기
			// changeColor : 디지털 색 변경
			// changeImage : 디지털 이미지 변경
				
			onValues : ["Active", "true", "on", "1", "1.0", "ON"],
			
			changeText : function(selectedObject, tagValue) {
				selectedObject.text(tagValue);
				return;
			},
			
			changeColor : function(selectedObject, tagValue) {				
				//console.log("tagValue : " + tagValue);
				//console.log($scope.eventPoint.onValues.indexOf(tagValue));				
				if ($scope.animateTag.onValues.indexOf(tagValue) > -1) {
					selectedObject.attr("fill", "red");
				} else {
					selectedObject.attr("fill", "blue");
				}
				return;
			},
			
			changeImageGroup : function(selectedObject, tagValue) {
				
				console.log("tagValue : " + tagValue);
				
				var elementObject = [];				
				selectedObject.selectAll("*").each(function() {						
					//console.log(d3.select(this));
					elementObject.push(d3.select(this));					
				});
				
				var fillColor = "green";					
				if (tagValue > 0) {
					fillColor = "red"
				}
				
				for (var key in elementObject) {
					elementObject[key].attr("fill", fillColor);
				}
				
				return;
			}
			
		}
		
		
		
	}

	angular.module('singApp.lighting-monitor').controller('lightingMonitorController', lightingMonitorController);

})();
