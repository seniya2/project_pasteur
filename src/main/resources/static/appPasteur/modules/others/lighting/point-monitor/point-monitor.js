(function() {
	'use strict';
	
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

	lightingMonitorController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval', 'usSpinnerService','$timeout', '$modal'];
	function lightingMonitorController(config, $scope, $resource, $http, $location, $filter, $interval, usSpinnerService, $timeout, $modal) {

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
		
		$scope.disableScreen = function(enable) {			
			if (enable) {
				config.globalDisable = true;
				usSpinnerService.spin('app-spinner-olpm');					
			} else {
				$timeout(function(){
					config.globalDisable = false;					
					usSpinnerService.stop('app-spinner-olpm');
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
								"old_val" : null,
								"svg" : null}
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
			//usSpinnerService.spin("app-spinner-olpm");
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
			    
			    $scope.requestAction("http://192.168.245.3:9898/current/lighting?size=2000", file);	
			    
			});
			
		}
		
		$scope.requestAction = function(dataUrl, currentFile) {

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

				if ($location.path() == $scope.currentPath && currentFile == $scope.svgFile) {
					
					$timeout(function(){
						$scope.requestAction(dataUrl, currentFile)
					}, 5000);
					
				}
				//$scope.responseAction(true, data, tagID, async);
			}).error(function(error) {
				console.log($scope.svgFile + " ! " + error);
				//console.log("$scope.modalInstance : "+$scope.modalInstance);
				//console.log($scope.modalInstance);
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
				eval("$scope.animateTag."+animateType+"(selectedD3, tagValue);");
				
			} catch(e) {
				console.log("$scope.responseAction error : " + e);
			}
			
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
