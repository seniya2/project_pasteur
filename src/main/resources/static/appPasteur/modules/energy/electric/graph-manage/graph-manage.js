(function() {
  'use strict';

  	electricGraphController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService' ];
    function electricGraphController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService) {
	
		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 2000;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/energy/electric/graph-manage/";
		$scope.template = $scope.template_base + "graph-manage-list.html";
		$scope.entityNameForPoint = "pointElectric";
		$scope.entityName = "graphElectric";
		$scope.categoryName = "electric";
		$scope.resources_base_point = "appPasteur/modules/energy/electric/point-manage/resources/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.chartUrl = $scope.baseXdUrl+"chart/"+$scope.categoryName+"/";
		$scope.tagCsvUrl = $scope.baseUiUrl + $scope.resources_base_point + $scope.categoryName + ".csv";
		$scope.listUrlForPoint = config.settings.network.rest+$scope.entityNameForPoint;
		$scope.listUrl = config.settings.network.rest+$scope.entityName;
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByTagIDsContains";
		$scope.xdResetUrl = $scope.baseXdUrl+"reset/"+$scope.categoryName+"/";
				
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.dataList = null;
		$scope.page = {
				"size" : 12,
				"totalPage" : 0,
				"totalElements" : 0,
				"number" : 0
			};
		$scope.paginationDisplay = true;
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.graphList = null;
		$scope.chartEnable = false;
		$scope.searchName = "";

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
		
		$scope.resetXdRequest = function(tagIDs, action, data) {
			console.log("----> resetXdRequest");
			$scope.disableScreen(true);
			//console.log("tagIDs : " + tagIDs)
			var nameNidsArray = String(tagIDs).split(",");			
			for (var key in nameNidsArray) {
				//console.log("id : " + (nameNidsArray[key].split(":"))[1]);				
				var id = (nameNidsArray[key].split(":"))[1];
				id = id.replace("TAG_","");
				id = id.replace("_clone","");
				var url = $scope.xdResetUrl + id;				
				//console.log("id : " + id);
				//console.log("key : " + key);				
				//console.log("url : " + url);
				
				if (key == nameNidsArray.length-1) {
					console.log("xd reset last workd url : " + url);
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
				} else {
					$http({
						method : 'GET',
						url : url
					}).success(function(xdData) {				
						console.log("xd reset ing url : " + url);
					}).error(function(error) {				
						console.log("xd reset ing url : " + url);
					});
				}
			}
		}
		
		$scope.currentDate = "";
		
		$scope.getCurrentDate = function() {
			var nowDate = new Date();			
			var nowDateStr = nowDate.toISOString();
			nowDateStr = nowDateStr.substr(0,19);
			nowDateStr = nowDateStr.replace("T"," ");
			return nowDateStr;			
		}
		
		$scope.setCurrentDate = function() {
			$scope.currentDate = $scope.getCurrentDate();
		}
		
		$scope.setCurrentDate();
		
		$scope.currentData = {
				subject : "",
				interval : "HOUR",
				dateType : "c",
				valueType : "MIN",
				dateTime : $scope.currentDate,
				datetimepicker : $scope.currentDate,
				tagIDs : []
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
		
		$scope.$watch('currentData.subject', function() {
			//console.log("watch : " + $scope.currentData.subject);
			//console.log("watch : " + $scope.currentData.subject.length);			
			if ($scope.currentData.subject.length > 0){
				angular.element("#subject").removeClass("custom_input_text_error");
				$scope.subject_error = false;
			}
		});
		
		$scope.$watch('currentData.tagIDs', function() {
			//console.log("watch : " + $scope.currentData.tagIDs);
			//console.log("watch : " + $scope.currentData.tagIDs.length);			
			if ($scope.currentData.tagIDs.length > 0){
				//angular.element("#s2id_autogen1").parent().removeClass("custom_input_text_error");
				$scope.tagIDs_error = false;
			}
		});
		
		
		$scope.searchClickFn = function(){			
			console.log("--> searchClickFn ------------- ");
			var searchName = document.getElementById("searchName");
			$scope.searchName = searchName.value;
			
			console.log("searchName : " + $scope.searchName);
			
			if (angular.isUndefined($scope.searchName) || $scope.searchName == "") {
				$scope.listAction(0, 12);
				return;
			}
			$scope.searchAction($scope.searchName);
		}
		
		
		$scope.getPointDate = function(dateType, dateTime) {
			if (dateType == "c") {
				return "현재시간";
			} else {
				return dateTime;
			}
		}
		
		
		$scope.getPointNames = function(tagIDs) {
			//console.log("getPointNames : " + tagIDs);
			var tagNames = "";
			var tagIDSArray = tagIDs.split(",");
			for (var key in tagIDSArray) {
				//console.log("tagIDSArray : " +tagIDSArray[key]);
				var tagName = tagIDSArray[key].split(":");
				tagNames = tagNames + ", " + tagName[0];
			}
			return tagNames.substr(1,tagNames.length);
		}
		
		$scope.datetimepickerView1=false;
		$scope.datetimepickerView2=false;
		$scope.datetimepickerView3=false;
		
		$scope.datetimepickerChange = function(type) {
			
			$scope.datetimepickerView1=false;
			$scope.datetimepickerView2=false;
			$scope.datetimepickerView3=false;
			
			$timeout(function () {
				
				if (type == "HOUR") {				
					$scope.datetimepickerView1=true;
					$scope.datetimepickerView2=false;
					$scope.datetimepickerView3=false;
				} else if (type == "DAY") {
					$scope.datetimepickerView1=false;
					$scope.datetimepickerView2=true;
					$scope.datetimepickerView3=false;
				} else if (type == "MONTH") {
					$scope.datetimepickerView1=false;
					$scope.datetimepickerView2=false;
					$scope.datetimepickerView3=true;
				}

			}, 300 , true );
			
			
		}; 
				
		
		$scope.prepareAction = function() {
			
			usSpinnerService.spin("app-spinner");
			Papa.parse($scope.tagCsvUrl, $scope.tagCsvConfig);
			$scope.page = null;
			
		}
		
		
		$scope.searchAction = function(searchStr) {
			var sort = $scope.sortAttr + "," + $scope.sortOder;			
			searchStr = encodeURI(searchStr);
			
			$http(
					{
						method : 'GET',
						url : $scope.searchUrl + '?tagIDs='+searchStr
					}).success(function(data) {
						eval("$scope.graphList = data._embedded."+$scope.entityName);
						$scope.page = null;
				//$scope.graphList = data._embedded.graphHvac;
						$scope.paginationDisplay = false;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.listAction = function(pageNumber, size) {
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			$http(
					{
						method : 'GET',
						url : $scope.listUrl + '?page=' + pageNumber + '&size=' + size + '&sort='+sort
					}).success(function(data) {
						eval("$scope.graphList = data._embedded."+$scope.entityName);
						$scope.page = {
								"size" : data.page.size,
								"totalPage" : data.page.totalPages,
								"totalElements" : data.page.totalElements,
								"number" : data.page.number+1
						}
						$scope.paginationDisplay = true;
				//$scope.graphList = data._embedded.graphHvac;
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
			
			var subject = document.getElementById("subject");
			$scope.currentData.subject = subject.value;
			
			if ($scope.currentData.subject == undefined || $scope.currentData.subject == ""){
				//console.log("$scope.currentData.subject : " + $scope.currentData.subject);
				//angular.element("#subject").addClass("custom_input_text_error");
				$scope.subject_error = true;
				errCnt++;
			}
			
			if ($scope.currentData.tagIDs == undefined || $scope.currentData.tagIDs == "" || $scope.currentData.tagIDs.length == 0){
				console.log("$scope.currentData.tagIDs : " + $scope.currentData.tagIDs);
				//angular.element("#s2id_autogen1").parent().addClass("custom_input_text_error");
				$scope.tagIDs_error = true;
				errCnt++;
			}	
						
			if (errCnt>0) {
				return;
			}
			
			var dateTime = $scope.getCurrentDate();
			console.log("currentData.dateType : " +$scope.currentData.dateType);
			console.log("currentData.interval : " +$scope.currentData.interval);
			if ($scope.currentData.dateType == "s") {				
				if ($scope.currentData.interval == "HOUR") {
					dateTime = angular.element("#datetimepicker1").val() + " " + "00:00:01"
				} else if ($scope.currentData.interval == "DAY") {
					dateTime = angular.element("#datetimepicker2").val() + "-01" + " " + "00:00:01"
				} else if ($scope.currentData.interval == "MONTH") {
					dateTime = angular.element("#datetimepicker3").val() + "-01-01"+" " + "00:00:01"
				}				
			}
			$scope.currentData.dateTime = dateTime;
			
			
			var newData = $scope.currentData;
			
			//console.log("newData.tagIDs1 : " + newData.tagIDs);
			var newTagIDS = "";
			angular.forEach(newData.tagIDs, function(value, key) {				
				newTagIDS = newTagIDS + ","+ value;
			});
			
			newTagIDS = newTagIDS.substr(1,newTagIDS.length);
			newData.tagIDs = newTagIDS;
			//console.log("newData.tagIDs2 : " + newData.tagIDs);
			
			if (angular.isDefined($scope.currentData.no)) {				
				$scope.resetXdRequest(newTagIDS, "updateAction", newData);
				//$scope.updateAction(newData);
			}else {
				$scope.resetXdRequest(newTagIDS, "createAction", newData);
				//$scope.createAction(newData);
			}
			//$scope.createAction($scope.currentData);
			
			
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
				//$scope.displayMode = "list";				
				$scope.template = $scope.template_base + "graph-manage-list.html";				
				$scope.listAction(0, 12);
				$scope.massagePopup("저장 되었습니다.", "success");
				
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";	
				$scope.listAction(0, 12);
				$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
		$scope.updateAction = function(point) {
			console.log("--> updateAction");
			console.log(point);
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
				$scope.template = $scope.template_base + "graph-manage-list.html";				
				$scope.listAction(0, 12);
				$scope.massagePopup("변경 되었습니다.", "success");
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";	
				$scope.listAction(0, 12);
				$scope.massagePopup("변경 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
				
		$scope.deleteAction = function(id) {
			$http({
				method : 'DELETE',
				url : $scope.baseRestUrl + $scope.entityName+'/' + id
			}).success(function(data) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";
				$scope.listAction(0, 12);
				$scope.massagePopup("삭제 되었습니다.", "success");
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";
				$scope.listAction(0, 12);
				$scope.massagePopup("삭제 실패", "error");
			});
		}
		
		
		$scope.editAction = function(selectData) {
			console.log("--> editAction");
			usSpinnerService.spin('app-spinner');			
		
			if (selectData == null) {
				$scope.currentData = {
						subject : "",
						interval : "HOUR",
						dateType : "c",
						valueType : "MIN",
						dateTime : $scope.currentDate,
						datetimepicker : $scope.currentDate,
						tagIDs : []
				};
				
			} else {
				
				//console.log(selectData);		
				
				var tagIds=new Array();				
				var tagIDSArray = selectData.tagIDs.split(",");
				for (var key in tagIDSArray) {
					//console.log("tagIDSArray : " +tagIDSArray[key]);
					var tagIDOne = tagIDSArray[key];
					tagIds.push(tagIDOne);
				}
				
				console.log(tagIds);
				
				$scope.currentData = {
						no : selectData.no,
						subject : selectData.subject,
						interval : selectData.interval,
						dateType : selectData.dateType,
						valueType : selectData.valueType,
						dateTime : selectData.dateTime,
						datetimepicker : selectData.dateTime,
						tagIDs : tagIds
				};
				
				$scope.datetimepickerChange(selectData.interval);
				
			}
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
			$timeout(function(){				
				$scope.template = $scope.template_base + "graph-manage-edit.html";
				$scope.subject_error = false;
				$scope.tagIDs_error = false;
			}, 500);
		}
		
		
		$scope.cancelAction = function() {			
			console.log("--> cancelAction ");
			usSpinnerService.spin('app-spinner');
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
			$timeout(function(){				
				$scope.template = $scope.template_base + "graph-manage-list.html";
			}, 500);			
		}		
		
		$scope.pageChangeHandler = function(num) {
			if ($scope.page != null) {
				$scope.page.number = num;
				$scope.listAction(num - 1, $scope.page.size);
			}
		}
		
    }
    
   

  angular.module('singApp.electric-graph-manage').controller('electricGraphController', electricGraphController);

})();
