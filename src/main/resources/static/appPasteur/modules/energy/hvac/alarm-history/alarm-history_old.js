(function() {
  'use strict';

  	historyModelController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function historyModelController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 10;
		var s_sort = search.sort || '_id,desc';
		
		$scope.template_base = "appPasteur/modules/energy/hvac/alarm-history/";
		$scope.resources_base = "appPasteur/modules/energy/hvac/point-manage/resources/";
		$scope.categoryName = "hvac";
		$scope.alarmEntity = "alarmHvac";
		$scope.template = $scope.template_base + "alarm-history-list.html";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.csvFileUrl = $scope.baseUiUrl + $scope.resources_base + $scope.categoryName + ".csv";
		$scope.alarmUrl = $scope.baseRestUrl + $scope.alarmEntity;
				
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
					$scope.pointList = [];
					for (var key in results.data) {
						console.log("data : " + results.data[key]);
						results.data[key].no = parseInt(results.data[key].no);
					}
					$scope.pointList = results.data;
					$timeout(function(){usSpinnerService.stop('app-spinner-hah')}, 1000);
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		
		
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.pointList = null;
		$scope.dataList = null;
		$scope.page = null;
		$scope.pageLinks = null;
		$scope.sortAttr = "_id";
		$scope.sortOder = "desc";
		$scope.orderProperty = "-no";							
		$scope.currentPath = $location.path();
		$scope.currentPoint = {"tagID" : undefined};
		$scope.alarmList = new HashMap();
		$scope.alarmEventLog = new HashMap();
		
		Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
		}
						
	    $scope.prepareAction = function() {
			$scope.dataList = {};
			$scope.page = null;
			$scope.alarmEventLog = "";
			
			$http({
				method : 'GET',
				url : $scope.alarmUrl,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				var dataList = null;
				eval("dataList = data._embedded."+$scope.alarmEntity);
				
				var tagID = "";
				var tagName = "";
				var alarmName = "";
				var condition = "";
				var global = "";
				for (var key in dataList) {
					//console.log(dataList[key]);
					tagName=dataList[key].tagID.split(":")[0];
					tagID=dataList[key].tagID.split(":")[1];
					alarmName=dataList[key].condition.split(":")[0];
					condition=dataList[key].condition.split(":")[1];
					global=dataList[key].global;
					
					if ($scope.alarmList.get(tagID) != undefined) {
						
						var alarmNameAdd = $scope.alarmList.get(tagID).alarmName + "," + alarmName;
						var conditionAdd = $scope.alarmList.get(tagID).condition + "," + condition;
						var globalAdd = $scope.alarmList.get(tagID).global + "," + global;
						
						$scope.alarmList.set(tagID, {
							"tagName" : tagName,
							"alarmName" :alarmNameAdd,
							"condition" :conditionAdd,
							"global" : globalAdd
						}); 
					} else {
						$scope.alarmList.set(tagID, {
							"tagName" : tagName,
							"alarmName" :alarmName,
							"condition" :condition,
							"global" : global
						}); 
					}
					console.log($scope.alarmList.get(tagID));
					
				}
				usSpinnerService.spin('app-spinner-hah');
				Papa.parse($scope.csvFileUrl, $scope.csvConfig);
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		
		
				
		$scope.paginationDisplay = true;
		$scope.paginationDisplayAction = function(able) {
			if (able == true) {
				$scope.paginationDisplay = true;
			} else {
				$scope.paginationDisplay = false;
			}
		}
				
		$scope.formSubmit = function(valid){			
			console.log("--> Submitting form valid : " + valid);
			console.log("currentPoint.tagID : " + $scope.currentPoint.tagID);			
			if (!valid) {
				return;
			}
			if (angular.isUndefined($scope.currentPoint.tagID)) {
				$scope.dataList = {};
				$scope.page = null;
				return;
			}
			$scope.listAction(0, 20);
		}
		
		$scope.$watch('currentPoint.tagID', function() {	
			console.log($scope.currentPoint.tagID);
		});	
		
		
		
		$scope.listAction = function(pageNumber, size) {

			var tagID = String($scope.currentPoint.tagID).replace("TAG_", "");
			$scope.listUrl = $scope.baseXdUrl+"raw/"+$scope.categoryName+"/"+tagID;
			
			if (angular.isUndefined(size)) {
				size = page.size;
			}

			var sort = $scope.sortAttr + "," + $scope.sortOder;
			//console.log("sort : " + sort);

			$http(
					{
						method : 'GET',
						url : $scope.listUrl + '?page=' + pageNumber + '&size=' + size + '&sort='+sort
					}).success(function(data) {
						
				$scope.alarmEventLog = new HashMap();
				$scope.dataList = data.content;
				
				var page = {
						size : data.size,
						totalElements : data.totalElements,
						current : data.number
				}
				
				$scope.page = page;
				console.log($scope.dataList);
				//console.log($scope.page);
				// $scope.widgets = data.content;
				// $scope.page = data.page;
				// $scope.sort = sort;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}
			
		$scope.alarmEventLogFn = function(id, idx, val) {
			
			var old_val = undefined;
			if (idx != 0) {
				old_val = $scope.dataList[idx-1].value;
			}
			
			//console.log("old_val : "+ old_val);
			//console.log("val : "+ val);
			
			var alarmInfo = $scope.alarmList.get($scope.currentPoint.tagID);
			//console.log(alarmInfo);
			if (alarmInfo != undefined) {				
				var conditions = alarmInfo.condition.split(",");
				var alarmNames = alarmInfo.alarmName.split(",");
				var globals = alarmInfo.global.split(",");
				for (var i=0; i<conditions.length; i++ ) {
					console.log("conditions[i] : " + conditions[i]);
					eval("if ("+conditions[i]+") {console.log(conditions[i]); $scope.alarmMessage(alarmNames[i], id, globals[i]);}");
				}
			}
			
		}
		
		$scope.alarmMessage = function(alarmName, id, global) {
			
			var elementRaw = "";			
			//console.log($scope.alarmEventLog.get(id));
			if ($scope.alarmEventLog.get(id) == undefined) {
				if (global == "Y") {
					elementRaw = '<span class="label label-danger">'+alarmName+'</span>'
				} else {
					elementRaw = '<span class="label label-info">'+alarmName+'</span>'
				}
			} else {
				elementRaw = $scope.alarmEventLog.get(id);
				if (global == "Y") {
					elementRaw = elementRaw + '<br/><span class="label label-danger">'+alarmName+'</span>'
				} else {
					elementRaw = elementRaw + '<br/><span class="label label-info">'+alarmName+'</span>'
				}
			}
			$scope.alarmEventLog.set(id, elementRaw);
		}
		
		$scope.getElement = function(tagID) {
			var elementRaw = $scope.alarmEventLog.get(tagID);
			return $sce.trustAsHtml(elementRaw);
		}
		
		
		$scope.getSortClass = function(attr) {
			if ($scope.sortAttr != attr) {
				return "sorting";
			}
			if ($scope.sortOder == "desc") {
				return "sorting_desc";
			} else {
				return "sorting_asc";
			}
		}
		
		$scope.sortAction = function(attr) {
			
			if ($scope.sortAttr != attr) {
				$scope.sortOder = "desc"
				$scope.sortAttr = attr;
			} else {
				if ($scope.sortOder == "desc") {
					$scope.sortOder = "asc"
				} else {
					$scope.sortOder = "desc"
				}
			}
			
			$scope.listAction($scope.page.number, $scope.page.size);
			
		}
		
		$scope.pageChangeHandler = function(num) {
			console.log(num);
			// $scope.pageNumber = num;
			$scope.listAction(num - 1, s_size);
		}
    }

  angular.module('singApp.hvac-history').controller('historyModelController', historyModelController);

})();
