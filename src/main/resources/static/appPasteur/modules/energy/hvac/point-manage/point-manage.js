(function() {
  'use strict';

  	hvacPMModelController.$inject = ['config', '$scope', '$resource', '$filter', 'usSpinnerService', '$timeout', '$compile','$sce'];
    function hvacPMModelController (config, $scope, $resource, $filter, usSpinnerService, $timeout, $compile, $sce) {
    	    	
		$scope.categoryName = "hvac";
		$scope.template_base = "appPasteur/modules/energy/hvac/point-manage/";
		$scope.template = $scope.template_base + "point-manage-list.html";
		$scope.resources_base = $scope.template_base + "resources/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.csvFileUrl = $scope.baseUiUrl + $scope.resources_base + $scope.categoryName + ".csv";
				
		$scope.dataList = null;
		$scope.sortAttr = 'no';
		$scope.sortOder = false;

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
					
					var dataType = "";
					
					for (var key in results.data) {
						//console.log("data : " + results.data[key]);
						results.data[key].no = parseInt(results.data[key].no);
						if (results.data[key].interval == 0) {
							dataType = '<span class="label label-warning">'+"알람포인트"+'</span>';
						} else if (results.data[key].interval > 0) {
							dataType = '<span class="label label-info">'+"이력포인트"+'</span>';
						} else {
							dataType = '<span class="label label-default">'+"일반포인트"+'</span>';
						}
						results.data[key].dataType = $sce.trustAsHtml(dataType);
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
		
		$scope.getTypeElement = function(key) {
			var elementRaw = $scope.dataList[key].dataType;
			return $sce.trustAsHtml(elementRaw);
		}
		
		Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
		}						
		
		$scope.searchClickFn = function(){			
			console.log("--> searchClickFn ------------- ");
			var searchName = document.getElementById("searchName");
			$scope.searchText = searchName.value;
			/*
			if (angular.isUndefined($scope.searchName) || $scope.searchName == "") {
				$scope.searchText = "";
				return;
			}
			*/
		}
		
		$scope.prepareAction = function() {
			usSpinnerService.spin('app-spinner');
			Papa.parse($scope.csvFileUrl, $scope.csvConfig);			
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
				$scope.sortOder = true
				$scope.sortAttr = attr;
			} else {
				if ($scope.sortOder == true) {
					$scope.sortOder = false
				} else {
					$scope.sortOder = true
				}
			}
			
		}
    }
    
    angular.module('singApp.energy-hvac-point-manage').controller('hvacPMModelController', hvacPMModelController);

})();
