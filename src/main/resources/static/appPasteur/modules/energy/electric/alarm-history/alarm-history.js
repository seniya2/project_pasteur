(function() {
  'use strict';

  	electricHistoryModelController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function electricHistoryModelController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
    	var search = $location.search();
    	var s_page = search.page || 0;
		var s_size = search.size || 9999;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/energy/electric/alarm-history/";
		$scope.resources_base = "appPasteur/modules/energy/electric/point-manage/resources/";
		$scope.categoryName = "electric";
		$scope.alarmEntity = "alarmElectric";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.alarmUrl = $scope.baseRestUrl + $scope.alarmEntity;
		$scope.listUrl = config.settings.network.rest+$scope.alarmEntity;
		$scope.listUrlXd = $scope.baseXdUrl+"history/"+$scope.categoryName+"/";
		
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.pointList = null;
		$scope.dataList = new Array();
		$scope.page = null;
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
		
		
	    $scope.prepareAction = function() {
	    	
	    	$scope.searchNo_error = false;
			$scope.searchDate1_error = false;
			$scope.searchDate2_error = false;
			
			usSpinnerService.spin('app-spinner-hah');
			$scope.dataList = {};
			$scope.page = null;
			$scope.alarmEventLog = "";
			
			$http({
				method : 'GET',
				url : $scope.alarmUrl+"/search/findByTagIDContains?tagID=",
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				var dataList = null;
				eval("dataList = data._embedded."+$scope.alarmEntity);
				
				var tagID = "";
				var tagName = "";
				var alarmName = "";
				var condition = "";
				var alarmNo = 0;
				
				for (var key in dataList) {
					//console.log(dataList[key]);
					alarmNo=dataList[key].no;
					tagName=dataList[key].tagID.split(":")[0];
					tagID=dataList[key].tagID.split(":")[1];
					alarmName=dataList[key].condition.split(":")[0];
					condition=dataList[key].condition.split(":")[1];
					
					$scope.alarmList.set(alarmNo, {
						"alarmNo" : alarmNo,
						"tagID" : tagID,
						"tagName" : tagName,
						"alarmName" :alarmName,
						"condition" :condition
					}); 
					
				}
				$timeout(function(){usSpinnerService.stop('app-spinner-hah')}, 1000);
				console.log($scope.alarmList);
				//console.log($scope.alarmList.values());
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
			//console.log($scope.alarmList.get("TAG_2001_0_21"));
			
			
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
			if (angular.isUndefined($scope.searchDate1) || $scope.searchDate1 == "") {
				$scope.searchDate1_error=true;
				errCnt++;
			}
			if (angular.isUndefined($scope.searchDate2) || $scope.searchDate2 == "") {
				$scope.searchDate2_error=true;
				errCnt++;
			}
			
			if (errCnt>0) {
				return;
			}
			
			$scope.searchName = $scope.alarmList.get(parseInt($scope.searchNo[0])).tagID;
			$scope.searchDate1 = String($scope.searchDate1).substring(0, 10);
			$scope.searchDate2 = String($scope.searchDate2).substring(0, 10);
			$scope.searchDate1 = $scope.searchDate1 + " 00:00:01";
			$scope.searchDate2 = $scope.searchDate2 + " 23:59:59";
			
			$scope.listAction(0);
		}
		
		
		
		$scope.listAction = function(pageNumber) {

			var tagID = String($scope.searchName).replace("TAG_", "");	
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			var listUrl = $scope.listUrlXd + tagID + '?page=' + pageNumber + '&size=' + s_size +"&sort="+sort
						+ '&min='+$scope.searchDate1 + '&max='+$scope.searchDate2 
			
			
			//console.log("sort : " + sort);

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
				var alarm = $scope.alarmList.get(parseInt($scope.searchNo[0]));
				var alarmName = alarm.alarmName;
				var condition = alarm.condition;
				var old_val = undefined;
				
				for (var key in data.content) {
					
					newData = data.content[key];
					newData.alarmName = alarmName;
					var val = data.content[key].value;
					if (key != 0) {
						old_val = data.content[key-1].value;
					}
					
					eval("if ("+condition+") {dataList.push(newData);}");					
				}
				
				$scope.dataList = dataList;
				//console.log($scope.dataList);
								
				var page = {
						size : data.size,
						totalPage : data.totalPages,
						totalElements : data.totalElements,
						number : data.number
				}
				
				$scope.page = page;
				
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
		
    }

    angular.module('singApp.electric-history').controller('electricHistoryModelController', electricHistoryModelController);

})();
