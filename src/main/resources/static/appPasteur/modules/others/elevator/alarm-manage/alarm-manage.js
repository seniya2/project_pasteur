(function() {
  'use strict';

  	evAlarmController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService' ];
    function evAlarmController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService) {
	
		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 13;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/others/elevator/alarm-manage/";
		$scope.resources_base = "appPasteur/modules/others/elevator/point-manage/resources/";
		$scope.template = $scope.template_base + "alarm-manage-list.html";
		$scope.entityName = "alarmElevator";
		$scope.categoryName = "elevator";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.csvFileUrl = $scope.baseUiUrl + $scope.resources_base + $scope.categoryName + ".csv";
		$scope.listUrl = $scope.baseRestUrl+$scope.entityName;
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByTagIDContains";
		$scope.xdResetUrl = $scope.baseXdUrl+"reset/"+$scope.categoryName+"/";
		
		$scope.dataList = null;
		$scope.alarmList = null;
		$scope.page = {
				"size" : 12,
				"totalPage" : 0,
				"totalElements" : 0,
				"number" : 0
			};
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.searchName = "";
		$scope.paginationDisplay = true;
		
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
		
		$scope.resetXdRequest = function(tagID, action, data) {
			
			$scope.disableScreen(true);
			
			var id = "";
			id = tagID.replace("TAG_","");
			id = id.replace("_clone","");	
			var url = $scope.xdResetUrl + id;
			
			console.log("----> resetXdRequest");
			console.log("url : " + url);
			
			$http({
				method : 'GET',
				url : url
			}).success(function(xdData) {				
				if (action == "createAction") {
					$scope.createAction(data);
				} else if (action == "updateAction") {
					$scope.updateAction(data);
				} else if (action == "deleteAction") {
					$scope.deleteAction(data);
				}				
			}).error(function(error) {				
				$scope.disableScreen(false);
				$scope.massagePopup("resetXdRequest 실패", "error");				
			});
		}
		
		$scope.currentData = {
				'name' : undefined,
				'tagID' : undefined,
				'condition_type' : "condition2",
				'condition2' : undefined,
				'condition3_1' : undefined,
				'condition3_2' : undefined,
				'condition4' : undefined,
				'condition5' : undefined
		};
		
		$scope.csvConfig = {
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
					//console.log("Parsing complete:", results);					
					$scope.dataList = [];
					for (var key in results.data) {
						//console.log("data : " + results.data[key]);
						results.data[key].no = parseInt(results.data[key].no);
					}
					$scope.dataList = results.data;
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
		
		$scope.$watch('currentData.name', function() {	
			if ($scope.currentData.name != undefined && $scope.currentData.name.length > 0){				
				$scope.name_error = false;
			}
		});		
		$scope.$watch('currentData.tagID', function() {		
			if ($scope.currentData.tagID != undefined && $scope.currentData.tagID.length > 0){				
				$scope.tagID_error = false;
			}
		});
				
		$scope.conditionTypeChange = function() {			
			$scope.condition2_error = false;
			$scope.condition3_error = false;
			$scope.condition4_error = false;
			$scope.condition5_error = false;
		}		
		
		$scope.searchClickFn = function(){			
			console.log("--> searchClickFn ------------- ");
			var searchName = document.getElementById("searchName");
			$scope.searchName = searchName.value;
			
			//console.log("searchName : " + $scope.searchName);			
			
			if (angular.isUndefined($scope.searchName) || $scope.searchName == "") {
				$scope.listAction(0, 12);
				return;
			}
			$scope.searchAction($scope.searchName);
		}
		
		$scope.prepareAction = function() {			
			
			usSpinnerService.spin('app-spinner');
			Papa.parse($scope.csvFileUrl, $scope.csvConfig);
		}
		
		$scope.searchAction = function(searchStr) {
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			searchStr = encodeURI(searchStr);
			$http(
					{
						method : 'GET',
						url : $scope.searchUrl + '?tagID='+searchStr
					}).success(function(data) {
						
						$scope.paginationDisplay = false;
						$scope.page = null;
						$scope.alarmList = null;
						eval("$scope.alarmList = data._embedded."+$scope.entityName);
						for (var key in $scope.alarmList) {
							var tagID = $scope.alarmList[key].tagID;
							var condition = $scope.alarmList[key].condition;							
							$scope.alarmList[key].tagName = tagID.split(":")[0];
							$scope.alarmList[key].tagID = tagID.split(":")[1];
							$scope.alarmList[key].alarmName = condition.split(":")[0];
							$scope.alarmList[key].alarmEval = condition.split(":")[1];
							
						}
						
				//$scope.graphList = data._embedded.graphHvac;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.listAction = function(pageNumber, size) {
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			//console.log("sort : " + sort);
			$http(
					{
						method : 'GET',
						url : $scope.listUrl + '?page=' + pageNumber + '&size=' + s_size + '&sort='+sort
					}).success(function(data) {
						$scope.alarmList = null;
						eval("$scope.alarmList = data._embedded."+$scope.entityName);
						//console.log($scope.alarmList);
						
						$scope.paginationDisplay = true;
						$scope.page = {
								"size" : data.page.size,
								"totalPage" : data.page.totalPages,
								"totalElements" : data.page.totalElements,
								"number" : data.page.number+1
						}
						
						//console.log($scope.page);
						
						for (var key in $scope.alarmList) {
							var tagID = $scope.alarmList[key].tagID;
							var condition = $scope.alarmList[key].condition;							
							$scope.alarmList[key].tagName = tagID.split(":")[0];
							$scope.alarmList[key].tagID = tagID.split(":")[1];
							$scope.alarmList[key].alarmName = condition.split(":")[0];
							$scope.alarmList[key].alarmEval = condition.split(":")[1];
						}
						
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}
								
		$scope.formSubmit = function(valid) {
			console.log("--> Submitting form valid : " + valid);
			
			if (!valid) {
				return;
			}
			
			var errCnt = 0;			
			var name = document.getElementById("name");
			$scope.currentData.name = name.value;
			
			if ($scope.currentData.tagID == undefined || $scope.currentData.tagID == "" || $scope.currentData.tagID.length == 0){
				$scope.tagID_error = true;
				errCnt++;
			}			
			if ($scope.currentData.name == undefined || $scope.currentData.name == ""){
				$scope.name_error = true;
				errCnt++;
			}			
			if ($scope.currentData.condition_type == "condition2"){
				if ($scope.currentData.condition2 == undefined || $scope.currentData.condition2 == ""){
					$scope.condition2_error = true;
					errCnt++;
				}
			}
			if ($scope.currentData.condition_type == "condition3"){
				if ($scope.currentData.condition3_1 == undefined || $scope.currentData.condition3_1 == ""){
					$scope.condition3_error = true;
					errCnt++;
				}
				if ($scope.currentData.condition3_2 == undefined || $scope.currentData.condition3_2 == ""){
					$scope.condition3_error = true;
					errCnt++;
				}
			}
			if ($scope.currentData.condition_type == "condition4"){
				if ($scope.currentData.condition4 == undefined || $scope.currentData.condition4 == ""){
					$scope.condition4_error = true;
					errCnt++;
				}
			}
			if ($scope.currentData.condition_type == "condition5"){
				if ($scope.currentData.condition5 == undefined || $scope.currentData.condition5 == ""){
					$scope.condition5_error = true;
					errCnt++;
				}
			}
			
			if (errCnt>0) {
				return;
			}
			
			
			
			var tagID = $scope.currentData.tagID[0];
			var newData = {
					tagID : tagID,
					global : $scope.currentData.global,
					condition : ""
			};
			if (angular.isDefined($scope.currentData.no)) {
				newData.no = $scope.currentData.no;
			}else {
				newData.no = undefined;
			}
			
			var condition_main = $scope.currentData.name;
			var condition_sub = "";
			if ($scope.currentData.condition_type == "condition1"){				
				condition_sub = "old_val != val";
			}			
			if ($scope.currentData.condition_type == "condition2"){				
				condition_sub = "val != " + $scope.currentData.condition2;
			}
			if ($scope.currentData.condition_type == "condition3"){				
				condition_sub =  $scope.currentData.condition3_1 + " < val < " + $scope.currentData.condition3_2;
			}
			if ($scope.currentData.condition_type == "condition4"){
				condition_sub =  $scope.currentData.condition4 + " < val ";
			}
			if ($scope.currentData.condition_type == "condition5"){
				condition_sub =  $scope.currentData.condition5 + " > val ";
			}
			var condition = condition_main + ":"+condition_sub;
			newData.condition = condition;
			
			//console.log("newData : -------");			
			//console.log(newData);
			
			if (angular.isDefined($scope.currentData.no)) {				
				$scope.resetXdRequest((String(tagID).split(":"))[1], "updateAction", newData);
				//$scope.updateAction(newData);
			}else {
				$scope.resetXdRequest((String(tagID).split(":"))[1], "createAction", newData);
				//$scope.createAction(newData);
			}
		}
		
		$scope.createAction = function(point) {
			console.log("--> createAction");
			console.log(point);			
			$http({
				method : 'POST',
				url : $scope.baseRestUrl + $scope.entityName,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : point
			}).success(function(data) {
				$scope.disableScreen(false);
				//console.log(data);		
				$scope.template = $scope.template_base + "alarm-manage-list.html";				
				$scope.listAction(0, 12);
				$scope.massagePopup("저장 되었습니다.", "success");
				//location.reload();
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "alarm-manage-list.html";	
				$scope.listAction(0, 12);
				$scope.massagePopup("저장 실패", "error");
				console.log(error);
				// $scope.widgetsError = error;
			});

		}
		
		$scope.updateAction = function(point) {
			console.log("--> updateAction");
			//console.log(point);			
			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + $scope.entityName + "/" + point.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : point
			}).success(function(data) {
				$scope.disableScreen(false);
				//console.log(data);
				$scope.template = $scope.template_base + "alarm-manage-list.html";				
				$scope.listAction(0, 12);
				$scope.massagePopup("변경 되었습니다.", "success");
				//location.reload();
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "alarm-manage-list.html";	
				$scope.listAction(0, 12);
				$scope.massagePopup("변경 실패", "error");
				// $scope.widgetsError = error;
			});
		}
				
		$scope.deleteAction = function(id) {		
			console.log("--> deleteAction");
			
			$http({
				method : 'DELETE',
				url : $scope.baseRestUrl + $scope.entityName+'/' + id
			}).success(function(data) {
				$scope.disableScreen(false);
				//console.log(data);
				$scope.template = $scope.template_base + "alarm-manage-list.html";
				$scope.listAction(0, 12);
				$scope.massagePopup("삭제 되었습니다.", "success");
				//location.reload();
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "alarm-manage-list.html";
				$scope.listAction(0, 12);
				$scope.massagePopup("삭제 실패", "error");
				// $scope.widgetsError = error;
			});
		}
				
		$scope.editAction = function(selectData) {
			console.log("--> editAction");
			usSpinnerService.spin('app-spinner');
			
			if (selectData == null) {
				$scope.currentData = {
						'name' : undefined,
						'tagID' : undefined,
						'condition_type' : "condition2",					
						'condition2' : undefined,
						'condition3_1' : undefined,
						'condition3_2' : undefined,
						'condition4' : undefined,
						'condition5' : undefined
				};
			} else {
				console.log(selectData);
				var tagID = new Array();
				tagID.push(selectData.tagName+":"+selectData.tagID);
				
				var condition = String(selectData.alarmEval);
				console.log(condition);
				var condition_type = "condition1";
				var condition2 = "";
				var condition3_1 = "";
				var condition3_2 = "";
				var condition4 = "";
				var condition5 = "";
				
				if (condition.indexOf("val != ") > -1) {
					condition_type = "condition2";
					condition2 = (condition.split("val != "))[1];
					console.log("condition2 : " + condition2);
				} else if (condition.indexOf(" < val < ") > -1) {
					condition_type = "condition3";
					var condition3Array = condition.split(" < val < ");
					condition3_1 = condition3Array[0];
					condition3_2 = condition3Array[1];		
					console.log("condition3_1 : " + condition3_1);
					console.log("condition3_2 : " + condition3_2);
				} else if (condition.indexOf(" < val") > -1) {
					condition_type = "condition4";
					condition4 = (condition.split(" < val"))[0];
					console.log("condition4 : " + condition4);
				} else if (condition.indexOf(" > val") > -1) {
					condition_type = "condition5";
					condition5 = (condition.split(" > val"))[0];
					console.log("condition5 : " + condition5);
				}				
				
				/*
				console.log("------------------------------------------");
				console.log("condition2 : " + condition2);
				console.log("condition3_1 : " + condition3_1);
				console.log("condition3_2 : " + condition3_2);
				console.log("condition4 : " + condition4);
				console.log("condition5 : " + condition5);
				console.log("------------------------------------------");
				*/
				
				$scope.currentData = {
						"no" : selectData.no,
						"name" : selectData.alarmName,
						"tagID" : tagID,
						"condition_type" : condition_type,					
						"condition2" : condition2,
						"condition3_1" : condition3_1,
						"condition3_2" : condition3_2,
						"condition4" : condition4,
						"condition5" : condition5
				};
								
				//$scope.currentData = currentData_;
				//$scope.currentData.condition5 = 50;
				
				
				console.log($scope.currentData);
			}
			
			//console.log($scope.currentData);
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
			$timeout(function(){				
				$scope.template = $scope.template_base + "alarm-manage-edit.html";
			}, 500);			
			//console.log($scope.currentData);
		}
		
		$scope.cancelAction = function() {
			console.log("--> cancelAction ");
			usSpinnerService.spin('app-spinner');
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
			$timeout(function(){				
				$scope.template = $scope.template_base + "alarm-manage-list.html";
			}, 500);
		}
		
		$scope.pageChangeHandler = function(num) {
			if ($scope.page != null) {
				$scope.page.number = num;
				$scope.listAction(num - 1, $scope.page.size);
			}
		}
		
		
    }
    
    angular.module('singApp.ev-alarm').controller('evAlarmController', evAlarmController);

})();
