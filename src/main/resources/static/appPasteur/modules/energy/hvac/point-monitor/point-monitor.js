(function() {
	'use strict';

	hvacMonitorController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval', 'usSpinnerService','$timeout' ];
	function hvacMonitorController(config, $scope, $resource, $http, $location, $filter, $interval, usSpinnerService, $timeout) {

		Messenger.options = {
		    extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
		    theme: 'future'
		}
		
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.currentPath = $location.path();
		$scope.point = new Array(); 
		
		$scope.categoryName = "hvac";
		$scope.alarmEntity = "alarmHvac";
		$scope.resources_base_point = "appPasteur/modules/energy/hvac/point-manage/resources/";
		$scope.resources_base_svg = "appPasteur/modules/energy/hvac/point-monitor/svg/";
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
					$timeout(function(){usSpinnerService.stop('app-spinner-pm')}, 1000);
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
			
			usSpinnerService.spin("app-spinner-pm");
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
			    d3.selectAll("svg>*>*").each(function() {
					  //console.log(d3.select(this).attr('id'));
					  var tagID = d3.select(this).attr('id');
					  if (tagID != null) {						  
						  $scope.point[tagID] = "";
					  }
				});
			    d3.selectAll("svg>*").each(function() {
					  //console.log(d3.select(this).attr('id'));
					  var tagID = d3.select(this).attr('id');
					  if (tagID != null) {						  
						  $scope.point[tagID] = "";
						  //console.log("tagID:"+tagID);
					  }
				});
			    
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
						//$scope.alarmFilter(tagID, point.old_val, data.value);
						point.old_val = data.value;
						
						var tagValue = point.value;						
						var selectedD3 = d3.select("#"+tagID);
						var animateType = point.animateType;						
												
						if (tagID == "TAG_2001_5_53"){
							console.log("tagID : " + tagID);
							console.log("tagValue : " + tagValue);
						}
						
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
			// changeTextFloor_0 : 소수점 버림, 정수형 반환
			// changeTextFloor_1 : 소수점 첫째자리까지 표시. 반올림
			// changeTextFloor_2 : 소수점 둘째자리까지 표시. 반올림
			// changeColor : 디지털 색 변경
			// changeImage : 디지털 이미지 변경
			// changeImage1to3 : 아날로그 이미지 변경(1-3)
				
			onValues : ["Active", "true", "on", "1", "1.0", "ON"],
			
			changeText : function(selectedObject, tagValue) {
				selectedObject.text(tagValue);
				return;
			},
			
			changeTextFloor_0 : function(selectedObject, tagValue) {
				
				if (!isNaN(tagValue)){
					tagValue = Math.floor(tagValue);
					//console.log(parseInt(point.value).toFixed(1));
				}
				
				selectedObject.text(tagValue);
				return;
			},
			
			changeTextFloor_1 : function(selectedObject, tagValue) {
				
				if (!isNaN(tagValue)){
					
					//tagValue = Math.floor(tagValue*100) / 100;
					tagValue = parseFloat(tagValue).toFixed(1);
					tagValue = (tagValue*10) / 10;
					//console.log(parseInt(point.value).toFixed(1));
				}
				
				selectedObject.text(tagValue);
				return;
			},
			
			changeTextFloor_2 : function(selectedObject, tagValue) {
				
				if (!isNaN(tagValue)){
					tagValue = parseFloat(tagValue).toFixed(2);
					tagValue = (tagValue*100) / 100;
					//tagValue = Math.floor(tagValue*100) / 100;
					//console.log(parseInt(point.value).toFixed(1));
				}
				
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
			
			changeImage : function(selectedObject, tagValue) {
				
				//console.log("changeImage : " + changeImage);
				
				var imageObject = [];				
				selectedObject.selectAll("image").each(function() {						
					//console.log(d3.select(this));
					imageObject.push(d3.select(this));					
				});
				
				if ($scope.animateTag.onValues.indexOf(tagValue) > -1) {
					imageObject[0].style("visibility", "visible");
					imageObject[1].style("visibility", "hidden");
					//imageObject[2].style("visibility", "hidden");					
				} else {					
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "visible");
					//imageObject[2].style("visibility", "hidden");
				}
				
				return;
			},
			
			changeImage1to3 : function(selectedObject, tagValue) {
				
				//console.log("changeImage : " + changeImage);
				
				var imageObject = [];				
				selectedObject.selectAll("image").each(function() {						
					//console.log(d3.select(this));
					imageObject.push(d3.select(this));					
				});
				
				if (tagValue == 1) {
					imageObject[0].style("visibility", "visible");
					imageObject[1].style("visibility", "hidden");
					imageObject[2].style("visibility", "hidden");					
				} else if (tagValue == 2) {
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "visible");
					imageObject[2].style("visibility", "hidden");					
				} else {					
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "hidden");
					imageObject[2].style("visibility", "visible");
				}
				
				return;
			},
			
			changeImage1to4 : function(selectedObject, tagValue) {
				
				//console.log("changeImage : " + changeImage);
				
				var imageObject = [];				
				selectedObject.selectAll("image").each(function() {						
					//console.log(d3.select(this));
					imageObject.push(d3.select(this));					
				});
				
				if (tagValue == 1) {
					imageObject[0].style("visibility", "visible");
					imageObject[1].style("visibility", "hidden");
					imageObject[2].style("visibility", "hidden");
					imageObject[3].style("visibility", "hidden");				
				} else if (tagValue == 2) {
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "visible");
					imageObject[2].style("visibility", "hidden");
					imageObject[3].style("visibility", "hidden");
				} else if (tagValue == 3) {
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "hidden");
					imageObject[2].style("visibility", "visible");
					imageObject[3].style("visibility", "hidden");
				} else {
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "hidden");
					imageObject[2].style("visibility", "hidden");
					imageObject[3].style("visibility", "visible");
				}
				
				return;
			}
			
		}
		
		
		
	}

	angular.module('singApp.hvac-monitor').controller('hvacMonitorController', hvacMonitorController);

})();
