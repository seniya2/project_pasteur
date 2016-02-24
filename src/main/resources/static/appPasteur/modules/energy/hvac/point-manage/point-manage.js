(function() {
  'use strict';

  	hvacPMModelController.$inject = ['config', '$scope', '$resource', '$filter', 'usSpinnerService', '$timeout', '$compile','$sce', '$location', '$http'];
    function hvacPMModelController (config, $scope, $resource, $filter, usSpinnerService, $timeout, $compile, $sce, $location, $http) {
    	
    	var search = $location.search();
    	
		$scope.categoryName = "hvac";
		$scope.template_base = "appPasteur/modules/energy/hvac/point-manage/";
		$scope.template = $scope.template_base + "point-manage-list.html";
		$scope.resources_base = $scope.template_base + "resources/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.csvFileUrl = $scope.baseUiUrl + $scope.resources_base + $scope.categoryName + ".csv";
		$scope.xdListUrl = $scope.baseXdUrl+"current/"+$scope.categoryName+"/";
		$scope.xdUpdateUrl = $scope.baseXdUrl+"setting/"+$scope.categoryName+"/";
				
		$scope.dataList = null;
		$scope.page = {
				"size" : 12,
				"totalPage" : 0,
				"totalElements" : 0,
				"number" : 0
			};
		$scope.paginationDisplay = true;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.currentData = null;
		
		
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
		
		$scope.excelDownAction = function() {
			console.log("--> excelDownAction ------------- ");
			var openUrl = $scope.baseXdUrl+"setting/"+$scope.categoryName;
			window.open(openUrl, "excelDown", "", "");
		}
		
		$scope.searchClickFn = function(){			
			console.log("--> searchClickFn ------------- ");
			var searchName = document.getElementById("searchName");
			$scope.searchText = searchName.value;
			$scope.listAction($scope.page.number-1);
		}
		
		$scope.getDateTime = function(dateTime){
			var newDateItme = "";
			newDateItme = dateTime.substr(0,19);
			newDateItme = newDateItme.replace("T"," ");
			return newDateItme;
		}
		
		$scope.fileNameChanged = function(files) {
			console.log("select file");
			console.log(files[0]);
			
			var formdata = new FormData();
			formdata.append('file', files[0]);
			
			console.log(formdata);
			/*
			var reader = new FileReader();
			reader.onload = function(){
				var dataURL = reader.result;
				console.log("select file dataURL : " + dataURL);
			};
			reader.readAsDataURL(target.files[0]);
			*/
			
			var postUrl = $scope.baseXdUrl+"setting/"+$scope.categoryName;
			
			
			$http.post(postUrl, formdata, {
	            transformRequest: angular.identity,
	            headers: {'Content-Type': undefined}
	        })
	        .success(function(data){
	        	console.log(data);
	        })
	        .error(function(error){
	        	console.log(error);
	        });
			
			/*
			$http(
					{
						method : 'POST',
						url : postUrl,
						data: formdata,
						headers : {
							'Content-Type': 'multipart/form-data'
						}
					}).success(function(data) {						
						
						console.log(data);
						
					}).error(function(error) {
						console.log(error);
					});
			
			*/
			
		}
		
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
		
		$scope.formSubmit = function(valid) {
			console.log("--> Submitting form valid : " + valid);
			if (!valid) {
				return;
			}			
			var name = document.getElementById("name");
			var interval = document.getElementById("interval");
			var criteria = document.getElementById("criteria");
			
			console.log($scope.currentData);
			if (name != null) {
				$scope.currentData.name = name.value;
			} else {
				$scope.currentData.name = null;
			}
			if (interval != null) {
				$scope.currentData.interval = parseInt(interval.value);	
			} else {
				$scope.currentData.interval = null;
			}
			if (criteria != null) {
				$scope.currentData.criteria = criteria.value;
			} else {
				$scope.currentData.criteria = null;
			}	
			console.log($scope.currentData);
			
			$scope.disableScreen(true);
			$scope.updateAction($scope.currentData);
		}
		
		$scope.prepareAction = function() {
			usSpinnerService.spin('app-spinner');
			//Papa.parse($scope.csvFileUrl, $scope.csvConfig);
			$scope.getPointInfo();
			$scope.listAction(0);
		}	
		
		
		$scope.getPointInfo = function() {			
			var listUrl = $scope.xdListUrl + '?page=0&size=2000';			
			$http(
					{
						method : 'GET',
						url : listUrl
					}).success(function(data) {						
						var pointInfoArray = [];
						for (var key in data.content) {
							pointInfoArray.push(data.content[key].id);
							pointInfoArray.push(data.content[key].name);
						}						
						$scope.pointInfo = pointInfoArray;						
						$timeout(function(){usSpinnerService.stop('app-spinner')}, 1000);
					}).error(function(error) {
						// $scope.widgetsError = error;
					});
		}
		
		$scope.updateValue = function(id, idx) {
			usSpinnerService.spin('app-spinner');
			$http(
					{
						method : 'GET',
						url : $scope.xdListUrl+id
					}).success(function(data) {			
						$scope.dataList[idx].datetime = data.datetime;
						$scope.dataList[idx].value = data.value;
						//console.log("idx : " + idx);
						$timeout(function(){usSpinnerService.stop('app-spinner')}, 500);
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.editAction = function(selectData) {
			console.log("--> editAction");
			usSpinnerService.spin('app-spinner');	
			
			$scope.currentData = selectData;
			$scope.template = $scope.template_base + "point-manage-edit.html";
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 500);
			
		}
		$scope.listAction = function(pageNumber) {
			console.log("--> listAction");
			
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			
			var listUrl = $scope.xdListUrl + '?page=' + pageNumber + '&size=' + $scope.page.size + '&sort='+sort;
			if ($scope.searchText != null) {
				listUrl = $scope.xdListUrl + '?page=' + pageNumber + '&size=' + $scope.page.size + '&sort='+sort+'&name='+$scope.searchText;
			}
			
			$http(
					{
						method : 'GET',
						url : listUrl
					}).success(function(data) {
						$scope.dataList = data.content;
												
						var dataType = "";
						for (var key in $scope.dataList) {
							if ($scope.dataList[key].interval != null) {
								dataType = '<span class="label label-info">'+"이력포인트"+'</span>';
								if ($scope.dataList[key].criteria != null && $scope.dataList[key].criteria != "") {
									dataType += '&nbsp; <span class="label label-warning">'+"알람포인트"+'</span>';
								}
							} else {
								if ($scope.dataList[key].criteria != null && $scope.dataList[key].criteria != "") {
									dataType = '<span class="label label-warning">'+"알람포인트"+'</span>';
								} else {
									dataType = '<span class="label label-default">'+"일반포인트"+'</span>';
								}
							}
							$scope.dataList[key].dataType = $sce.trustAsHtml(dataType);
						}
						
						$scope.page = {
								"size" : data.size,
								"totalPage" : data.totalPages,
								"totalElements" : data.totalElements,
								"number" : data.number+1
						}
						$scope.paginationDisplay = true;
						
						$timeout(function(){usSpinnerService.stop('app-spinner')}, 1000);
						//console.log($scope.dataList);
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.updateAction = function(point) {
			console.log("--> updateAction");
			
			var postData = "";
			if (point.name != null) {
				postData += "&name="+encodeURIComponent(point.name)
			} else {
				//postData += "&name=null"
			}
			if (point.interval != null) {
				if (!isNaN(point.interval)){
					postData += "&interval="+point.interval
				} else {
					postData += "&interval=-1"
				}
			} else {
				postData += "&interval="
			}
			if (point.criteria != null && point.criteria != "") {
				postData += "&criteria="+encodeURIComponent(point.criteria)
			} else {
				//postData += "&criteria="
			}
			
			//console.log("postData : " + postData);
			//postData = encodeURI(postData);
			//postData = encodeURIComponent(postData);
			//postData = escape(postData);
			
			$http({
				method : 'POST',
				url : $scope.xdUpdateUrl + point.id,
				headers : {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				data : postData
			}).success(function(data) {
				$scope.disableScreen(false);
				//console.log(data);
				$scope.template = $scope.template_base + "point-manage-list.html";				
				$scope.listAction($scope.page.number-1);
				$scope.massagePopup("변경 되었습니다.", "success");
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "point-manage-list.html";				
				$scope.listAction($scope.page.number-1);
				$scope.massagePopup("변경 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
		
		
		$scope.cancelAction = function() {			
			console.log("--> cancelAction ");
			usSpinnerService.spin('app-spinner');
			$scope.currentData = null;
			$scope.template = $scope.template_base + "point-manage-list.html";
			$scope.listAction($scope.page.number-1);
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 500);
		}	
		
			
		
		$scope.getSortClass = function(attr) {
			if ($scope.sortAttr != attr) {
				return "sorting";
			}
			if ($scope.sortOder == false) {
				return "sorting_desc";
			} else {
				return "sorting_asc";
			}
		}
		
		$scope.sortAction = function(attr) {
			
			if ($scope.sortAttr != attr) {
				$scope.sortOder = "desc";
				$scope.sortAttr = attr;
			} else {
				if ($scope.sortOder == "desc") {
					$scope.sortOder = "asc";
				} else {
					$scope.sortOder = "desc";
				}
			}
			
			var num = $scope.page.number;
			$scope.listAction(num-1);
			
		}
		
		$scope.pageChangeHandler = function(num) {
			if ($scope.page != null) {
				$scope.page.number = num;
				$scope.listAction(num - 1);
			}
		}
    }
    
    angular.module('singApp.energy-hvac-point-manage').controller('hvacPMModelController', hvacPMModelController);

})();
