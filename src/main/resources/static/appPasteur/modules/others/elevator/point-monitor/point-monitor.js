(function() {
	'use strict';
	
	ModalInstanceCtrl.$inject = ['$scope', '$modalInstance'];
	function ModalInstanceCtrl ($scope, $modalInstance) {
		$scope.ok = function () {
			$modalInstance.close("retry");
			$modalInstance.dismiss('cancel');
		};	
		$scope.cancel = function () {
			$modalInstance.close("cancel");
			$modalInstance.dismiss('cancel');
		};
	}

	evMonitorController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval', 'usSpinnerService','$timeout', '$modal'];
	function evMonitorController(config, $scope, $resource, $http, $location, $filter, $interval, usSpinnerService, $timeout, $modal) {

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
		
		$scope.disableScreen = function(enable) {			
			if (enable) {
				config.globalDisable = true;
				usSpinnerService.spin('app-spinner-pm');					
			} else {
				$timeout(function(){
					config.globalDisable = false;					
					usSpinnerService.stop('app-spinner-pm');
				}, 500);
			}
		};
		
		$scope.entryModalOpen = function (entry) {

		      $scope.modalInstance = $modal.open({
					animation : true,
					templateUrl: 'network-confirm-content.html',
			        controller: 'ModalInstanceCtrl',
					resolve : {
						item : function() {
							return entry;
						}
					}
				});

				$scope.modalInstance.result.then(function(result) {
					console.log(result);
					if (result == "retry") {
						$scope.prepareAction();
					} else {
						$scope.disableScreen(false);
					}
				}, function() {					
					$scope.modalInstance = null;
				});
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
			$scope.modalInstance = null;
			$scope.disableScreen(true);
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
			    
			    $scope.requestAction("http://192.168.245.3:9898/current/elevator?size=2000");
			    
			});
			
		}
		
		$scope.requestAction = function(dataUrl) {

			$http({
				method : 'GET',
				url : dataUrl,
				headers: {'Content-type': 'application/json'},
				cache: false,
				timeout:20000
			}).success(function(data) {
				
				var contents = data.content;
				for (var i=0; i<contents.length; i++) {
					//console.log("contents["+i+"] : " + contents[i].id);
					$scope.responseAction(contents[i]);
				}
				$scope.disableScreen(false);

				if ($location.path() == $scope.currentPath) {
					
					$timeout(function(){
						$scope.requestAction(dataUrl)
					}, 5000);
					
				}
				//$scope.responseAction(true, data, tagID, async);
			}).error(function(error) {
				console.log($scope.svgFile + " ! " + error);
				if ($location.path() == $scope.currentPath) {
					if ($scope.modalInstance == null) {
						$scope.disableScreen(false);
						$scope.entryModalOpen(error);
					}
				}
			});

		}
		
	
		$scope.responseAction = function(data) {
			
			//console.log("$scope.responseAction success : " + success);
			//console.log("$scope.responseAction async : " + async);
			
			try {
				var tagID = "TAG_"+data.id;
				var point = $scope.tagList.get(tagID);
				var selectedD3 = d3.select("#"+tagID);
				var tagValue = data.value;
				var animateType = point.animateType;
				var tagTime = data.datetime;
				
				//console.log("animateType :" + animateType + ":");
				//console.log("data.value :" + data.value + ":");
				eval("$scope.animateTag."+animateType+"(selectedD3, tagValue, tagID);");
				
			} catch(e) {
				console.log("$scope.responseAction error : " + e);
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
				if (tagValue == "STOP") {	// 정지
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "hidden");
				} else if (tagValue == "UP"){	// UP					
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "visible");
				} else if (tagValue == "DOWN"){	// DN			
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
				
				
				if (tagValue == "OPEN") {	// 열림
					targetFloorNumber = parseInt(floor) - 1;
					//console.log("targetFloorNumber : " + targetFloorNumber);
					imageObject[targetFloorNumber].style("visibility", "visible");
				} else if (tagValue == "CLOSE") {	// 닫힘
					targetFloorNumber = parseInt(floor) + fullFloor;
					//console.log("targetFloorNumber : " + targetFloorNumber);
					imageObject[targetFloorNumber].style("visibility", "visible");
				}
				
				return;
			},
			changeTextEvMode : function(selectedObject, tagValue, tagID) {
				//console.log("changeTextEvMode : " + tagValue);
				//selectedObject.text($scope.animateTag.evModeValues[tagValue]);
				selectedObject.text(tagValue);
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
