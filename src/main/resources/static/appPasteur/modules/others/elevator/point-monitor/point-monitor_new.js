(function() {
	'use strict';

	evMonitorController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval', 'usSpinnerService','$timeout' ];
	function evMonitorController(config, $scope, $resource, $http, $location, $filter, $interval, usSpinnerService, $timeout) {

		Messenger.options = {
			    extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
			    theme: 'future'
			}
			
			$scope.baseRestUrl = config.settings.network.rest;
			$scope.currentPath = $location.path();
			$scope.point = new Array(); 
			
			$scope.categoryName = "elevator";
			$scope.alarmEntity = "alarmElevator";
			$scope.resources_base_point = "appPasteur/modules/others/elevator/point-manage/resources/";
			$scope.resources_base_svg = "appPasteur/modules/others/elevator/point-monitor/svg/";
			$scope.baseUiUrl = config.settings.network.ui;
			$scope.baseRestUrl = config.settings.network.rest;		
			$scope.tagCsvUrl = $scope.baseUiUrl + $scope.resources_base_point + $scope.categoryName + ".csv";			
			$scope.svgFile = $scope.baseUiUrl + $scope.resources_base_svg + "elevator.svg";			
			$scope.tagList = new HashMap();
			
			
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
						
						$scope.svgFileChange($scope.svgFile);
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
				//$scope.svgFile = file;
				document.getElementById("svg_render").innerHTML = "";
				
				d3.xml($scope.svgFile, function(error, documentFragment) {

					//console.log("$scope.svgFile : " + $scope.svgFile);					
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
				    
				    for (var tagID in $scope.point) {
				    	$scope.requestAction(false, tagID);
		        	}
				    for (var tagID in $scope.point) {
				    	$scope.requestAction(true, tagID);
		        	}
				    
				});
				
			}
			
			
			$scope.requestAction = function(async, tagID) {
				
				if ($location.path() != $scope.currentPath) {					
					return;
				}
				//console.log("tagID : " + tagID);
				//console.log($scope.tagList.get(tagID));
				
				var point = $scope.tagList.get(tagID);				
				if (angular.isUndefined(point)) {
					return;
				}				
				var tagAddr = point.tagAddr;				
				if (angular.isUndefined(tagAddr)) {
					return;
				}
				
				if (async) {
					
					var longPollingUrl = String(tagAddr).replace("monitor", "alarm");
					
					$timeout(function(){						
												
						$http({
							method : 'GET',
							url : longPollingUrl,
							headers: {'Content-type': 'application/json'},
							cache: false,
							timeout:60000
						
						}).success(function(data) {		
							console.log("async success");
							$scope.responseAction(true, data, tagID, async);
						}).error(function(error) {
							console.log("async error");
							$scope.responseAction(false, data, tagID, async);
						});						
					}, 1000);
					
				} else {
					
					$http({
						method : 'GET',
						url : tagAddr,
						headers: {'Content-type': 'application/json'},
						cache: false
					}).success(function(data) {						
						$scope.responseAction(true, data, tagID, async);	
						console.log("sync success !!");	
					}).error(function(error) {
						$scope.responseAction(false, data, tagID, async);
						console.log("sync success !!");	
					});
					
				}
				
			}
						
			$scope.responseAction = function(success, data, tagID, async) {
				
				var point = $scope.tagList.get(tagID);
				
				if (success) {
					point.value = data.value;
					point.old_val = data.value;
					var selectedD3 = d3.select("#"+tagID);
					var animateType = point.animateType;						
											
					if (animateType != null){
						//console.log("animateType :" + animateType + ":");
						try {
							eval("$scope.animateTag."+animateType+"(selectedD3, point.value, tagID);");
						}
						catch(err) {
						   //console.log(err);
						}							
					}
					
				} else {
					//console.log(error);				
				}
				
				if (async) {
					$scope.requestAction(async, tagID)
				}
				
			}
			
			
			$scope.animateTag = {
				
				// changeText : 태그값 출력하기
				// changeColor : 디지털 색 변경
				// changeImage : 디지털 이미지 변경
					
				onValues : ["Active", "true", "on", "1", "1.0", "ON"],
				evModeValues : ["기타","운행정지","자동운전","전용운전","수동운전","비상운전","고장","파킹운전"
				                ,"보수운전","구출운전","귀착운전","백업운전","자가발관제","지진관제","소방운전","화재관제"],
				doorValues : [0,1,2,3,4,5,6,7,8,9,10,11,12,13],
				                
				changeText : function(selectedObject, tagValue, tagID) {
					//alert(tagValue);
					var newValue = parseInt(tagValue);
					selectedObject.text(""+newValue);					
					//alert(selectedObject.text());
					return;
				},
				
				changeImageAxis : function(selectedObject, tagValue, tagID) {
					//console.log("changeImageAxis : " + tagValue);
					
					var imageObject = [];
					selectedObject.selectAll("image").each(function() {						
						//console.log(d3.select(this));
						imageObject.push(d3.select(this));					
					});
					if (tagValue == 0) {	// 정지
						imageObject[0].style("visibility", "hidden");
						imageObject[1].style("visibility", "hidden");
					} else if (tagValue == 1){	// UP					
						imageObject[0].style("visibility", "hidden");
						imageObject[1].style("visibility", "visible");
					} else if (tagValue == 2){	// DN			
						imageObject[0].style("visibility", "visible");
						imageObject[1].style("visibility", "hidden");
					}
					return;
				},
				
				changeImageDoor : function(selectedObject, tagValue, tagID) {
					
					//console.log("changeImageDoor : " + tagValue);
					
					var imageObject = [];				
					selectedObject.selectAll("image").each(function() {						
						//console.log(d3.select(this));
						imageObject.push(d3.select(this));
						d3.select(this).style("visibility", "hidden");
						//d3.select(this).style("visibility", "visible");
					});
					
					var floor = 1;
					var targetFloorNumber = 0;
					var targetEvID = "TAG_1_floor";
					var fullFloor = 6;
					if (tagID == "TAG_1_door") {
						targetEvID = "TAG_1_floor";
						fullFloor = 6;
					} else if (tagID == "TAG_2_door") {
						fullFloor = 5;
						targetEvID = "TAG_2_floor";
					} else if (tagID == "TAG_3_door") {
						fullFloor = 2;
						targetEvID = "TAG_3_floor";
					} else if (tagID == "TAG_4_door") {
						fullFloor = 5;
						targetEvID = "TAG_4_floor";
					}
					var floorD3Object = d3.select("#"+targetEvID);
					floor = floorD3Object.text();
					if (floor == ".") {
						return;
					}
					
					
					if (tagValue == 1) {	// 열림
						targetFloorNumber = parseInt(floor) - 1;
						//console.log("targetFloorNumber : " + targetFloorNumber);
						imageObject[targetFloorNumber].style("visibility", "visible");
					} else if (tagValue == 0) {	// 닫힘
						targetFloorNumber = parseInt(floor) + fullFloor;
						//console.log("targetFloorNumber : " + targetFloorNumber);
						imageObject[targetFloorNumber].style("visibility", "visible");
					}
					
					return;
				},
				changeTextEvMode : function(selectedObject, tagValue, tagID) {
					//console.log("changeTextEvMode : " + tagValue);
					selectedObject.text($scope.animateTag.evModeValues[tagValue]);
					return;
				},
								
				changeImage : function(selectedObject, tagValue, tagID) {
					
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
				}
				
			}
		
		
		
	}

	angular.module('singApp.ev-monitor').controller('evMonitorController', evMonitorController);

})();
