(function() {
  'use strict';

  	historyModelController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function historyModelController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
    	var search = $location.search();
    	var s_page = search.page || 0;
		var s_size = search.size || 12;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/energy/hvac/alarm-history/";
		$scope.resources_base = "appPasteur/modules/energy/hvac/point-manage/resources/";
		$scope.categoryName = "hvac";
		$scope.alarmEntity = "alarmHvac";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.alarmUrl = $scope.baseRestUrl + $scope.alarmEntity;
		$scope.listUrl = config.settings.network.rest+$scope.alarmEntity;
		$scope.listUrlXd = $scope.baseXdUrl+"history/"+$scope.categoryName+"/";
		$scope.csvFileUrl = $scope.baseUiUrl + $scope.resources_base + $scope.categoryName + ".csv";
		
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.pointList = null;
		$scope.dataList = new Array();
		$scope.page = {
				"size" : 12,
				"totalPage" : 0,
				"totalElements" : 0,
				"number" : 0
			};
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.orderProperty = "-no";							
		$scope.currentPath = $location.path();
		$scope.currentPoint = {"tagID" : undefined};
		$scope.alarmList = new HashMap();
		$scope.alarmEventLog = new HashMap();
		
		$scope.searchNo = "";
		$scope.searchName = "";
		$scope.searchDate1 = "";
		$scope.searchDate2 = "";
		
		$scope.searchNo_error = false;
		$scope.searchDate1_error = false;
		$scope.searchDate2_error = false;
		
		
		Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
		}
		

		$scope.$watch('searchNo', function() {	
			if ($scope.searchNo.length > 0){				
				$scope.searchNo_error = false;
			}
		});		
		$scope.$watch('searchDate1', function() {		
			if ($scope.searchDate1.length > 0){				
				$scope.searchDate1_error = false;
			}
		});
		$scope.$watch('searchDate2', function() {		
			if ($scope.searchDate2.length > 0){				
				$scope.searchDate2_error = false;
			}
		});
		
		
		
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
					
					for (var key in results.data) {
						
						var tagID = results.data[key].tagID;
						var interval = results.data[key].interval;
						var tagName = results.data[key].name;
						
						if (interval == 0) {
							$scope.alarmList.set(tagID,
									{"tagID" : tagID, 
									"tagName" : tagName,
									"interval" : interval}
							);
						}
					}
					//console.log("$scope.alarmList : " + $scope.alarmList);
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
		
	    $scope.prepareAction = function() {
	    	
	    	$scope.searchNo_error = false;
			$scope.searchDate1_error = false;
			$scope.searchDate2_error = false;
			$scope.dataList = {};
			$scope.page = null;
			$scope.alarmEventLog = "";
			
			usSpinnerService.spin('app-spinner-hah');
			Papa.parse($scope.csvFileUrl, $scope.csvConfig);
			
			$("#searchDate1").on("dp.change", function (e) {
	            $('#searchDate2').data("DateTimePicker").minDate(e.date);
	        });
	        $("#searchDate2").on("dp.change", function (e) {
	            $('#searchDate1').data("DateTimePicker").maxDate(e.date);
	        });
			
		}
		
	    
		$scope.searchNameFormSubmit = function(valid){			
			console.log("--> Submitting form valid : " + valid);
			
			if (!valid) {
				return;
			}
			
			var searchDate1 = document.getElementById("searchDate1");
			var searchDate2 = document.getElementById("searchDate2");
			$scope.searchDate1 = searchDate1.value;
			$scope.searchDate2 = searchDate2.value;
			
			var errCnt = 0;	
			
			if (angular.isUndefined($scope.searchNo) || $scope.searchNo == "" || $scope.searchNo.length == 0) {
				$scope.searchNo_error=true;
				errCnt++;
			}
			
			/*
			if (angular.isUndefined($scope.searchDate1) || $scope.searchDate1 == "") {
				$scope.searchDate1_error=true;
				errCnt++;
			}
			if (angular.isUndefined($scope.searchDate2) || $scope.searchDate2 == "") {
				$scope.searchDate2_error=true;
				errCnt++;
			}
			*/
			
			if (errCnt>0) {
				return;
			}
			
			//console.log("$scope.searchNo : " + $scope.searchNo);
			//console.log("errCnt : " + errCnt);
			
			if (!(angular.isUndefined($scope.searchDate1) || $scope.searchDate1 == "") && !(angular.isUndefined($scope.searchDate2) || $scope.searchDate2 == "")){
				$scope.searchDate1 = String($scope.searchDate1).substring(0, 10);
				$scope.searchDate2 = String($scope.searchDate2).substring(0, 10);
				$scope.searchDate1 = $scope.searchDate1 + " 00:00:01";
				$scope.searchDate2 = $scope.searchDate2 + " 23:59:59";
			}
			
			$scope.listAction(0);
		}
		
		
		
		$scope.listAction = function(pageNumber) {

			var tagID = String($scope.searchNo).replace("TAG_", "");	
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			var listUrl = $scope.listUrlXd + tagID + '?page=' + pageNumber + '&size=' + s_size +"&sort="+sort;
			if (!(angular.isUndefined($scope.searchDate1) || $scope.searchDate1 == "") && !(angular.isUndefined($scope.searchDate2) || $scope.searchDate2 == "")){
				listUrl = listUrl + '&min='+$scope.searchDate1 + '&max='+$scope.searchDate2 ;
			}
			
			//console.log("listUrl : " + listUrl);

			$http(
					{
						method : 'GET',
						url : listUrl
					}).success(function(data) {

						var newData = {
								'id' : null,
								'value' : null,
								'datatime' : null,
								'alarmName' : null
						};
						var dataList = new Array();

						for (var key in data.content) {
							newData = data.content[key];
							var dataType = "";
							if ("Active" == newData.value) {
								dataType = '<span class="label label-danger">'+"알람발생"+'</span>';
							} else {
								dataType = '<span class="label label-info">'+"정상"+'</span>';
							}
							newData.alarmName = $sce.trustAsHtml(dataType);
							dataList.push(newData);			
						}
						
						$scope.dataList = dataList;
						//console.log($scope.dataList);
						
						$scope.paginationDisplay = true;
						$scope.page = {
								"size" : data.size,
								"totalPage" : data.totalPages,
								"totalElements" : data.totalElements,
								"number" : data.number+1
						}
						
						
						//console.log($scope.page);
						// $scope.widgets = data.content;
						// $scope.page = data.page;
						// $scope.sort = sort;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

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
			if ($scope.page != null) {
				$scope.page.number = num;
				$scope.listAction(num - 1);
			}
		}
		
    }

    angular.module('singApp.hvac-history').controller('historyModelController', historyModelController);

})();
