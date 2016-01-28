(function() {
  'use strict';

  	boardTagMetaModelController.$inject = ['config','$scope', '$resource', '$http', '$location', '$filter' ];
    function boardTagMetaModelController (config, $scope, $resource, $http, $location, $filter) {
    	Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
		}
						
		$scope.remoteUrlRequestFn = function(str) {
			if ($scope.searchType == "tagID") {
				return {tagID: str};
			} else {
				return {name: str};
			}
	    };
	
	
		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 20;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appReference/modules/board-tagMetaModel/";
		$scope.template = $scope.template_base + "board-tagMetaModel-list.html";
		

		$scope.dataList = null;
		$scope.page = null;
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.orderProperty = "-no";
		
		$scope.entityName = "tagMetaModel";		
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.listUrl = config.settings.network.rest+$scope.entityName;
		
		$scope.currentPath = $location.path();	
		
		$scope.searchType = "tagID";
		$scope.searchUrlBase = $scope.baseRestUrl + "tagMetaModel/search/";
		$scope.searchUrlFn = $scope.searchUrlBase+"findByTagID";
		
		$scope.searchTypeChange = function(searchType) {
			console.log("searchType : " + searchType);
			
			$scope.searchType = searchType;
			if ($scope.searchType == "tagID") {
				$scope.searchUrlFn = $scope.searchUrlBase+"findByTagID";
			} else {
				$scope.searchUrlFn = $scope.searchUrlBase+"findByName";
			}
		}

		$scope.selectedPoint  = function(selected) {
			console.log("selectedPoint");
			//console.log(selected);			
			if (angular.isUndefined(selected)) {
				$scope.listAction($scope.page.number, $scope.page.size);
				$scope.paginationDisplayAction(true);
			} else {
				$scope.dataList = [];
				$scope.dataList.push(selected.originalObject);
				$scope.paginationDisplayAction(false);
			}			
			//console.log($scope.dataList);
		}
		
		
		
		$scope.currentPoint = null;
		
		$scope.paginationDisplay = true;
		$scope.paginationDisplayAction = function(able) {
			if (able == true) {
				$scope.paginationDisplay = true;
			} else {
				$scope.paginationDisplay = false;
			}
		}
		
		
		$scope.prepareAction = function() {

			$http(
					{
						method : 'GET',
						url : $scope.baseRestUrl + 'tagMetaModel?tag=' + s_page	+ '&size=' + s_size + '&sort=' + s_sort
					}).success(function(data) {
				$scope.dataList = data._embedded.tagMetaModel;
				$scope.page = data.page;
				$scope.pageLinks = data._links;
				console.log($scope.dataList);
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		//$scope.prepareAction();
		
		$scope.listAction = function(pageNumber, size) {

			if (angular.isUndefined(size)) {
				size = page.size;
			}

			var sort = $scope.sortAttr + "," + $scope.sortOder;
			console.log("sort : " + sort);

			$http(
					{
						method : 'GET',
						url : $scope.baseRestUrl + 'tagMetaModel?page=' + pageNumber + '&size=' + size + '&sort='+sort
					}).success(function(data) {
				$scope.dataList = data._embedded.tagMetaModel;
				$scope.page = data.page;
				console.log($scope.dataList);
				// $scope.widgets = data.content;
				// $scope.page = data.page;
				// $scope.sort = sort;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}
						
		$scope.formSubmit = function(valid) {
			console.log("--> Submitting form valid : " + valid);
			
			if (!valid) {
				return;
			}
			
			if (angular.isDefined($scope.currentPoint.no)) {
				$scope.updateAction($scope.currentPoint);
			}else {
				$scope.createAction($scope.currentPoint);
			}
			
		}
		
		$scope.createAction = function(point) {
			console.log("--> createAction");
			console.log(point);
			$http({
				method : 'POST',
				url : $scope.baseRestUrl + 'tagMetaModel',
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : point
			}).success(function(data) {
				//console.log(data);
				//$scope.displayMode = "list";				
				$scope.template = $scope.template_base + "board-tagMetaModel-list.html";				
				$scope.listAction(0, $scope.page.size);

				Messenger().post({
					  message: '저장 되었습니다.',
					  type: 'success',
					  showCloseButton: false
				});
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}
		
		$scope.updateAction = function(point) {
			console.log("--> updateAction");
			console.log(point);
			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + 'tagMetaModel/' + point.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : point
			}).success(function(data) {
				//console.log(data);
				$scope.template = $scope.template_base + "board-tagMetaModel-list.html";
				$scope.listAction($scope.page.number, $scope.page.size);
				
				Messenger().post({
					  message: '변경 되었습니다.',
					  type: 'success',
					  showCloseButton: false
				});

			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.deleteAction = function(id) {
			$http({
				method : 'DELETE',
				url : $scope.baseRestUrl + 'tagMetaModel/' + id
			}).success(function(data) {
				//console.log(data);
				$scope.template = $scope.template_base + "board-tagMetaModel-list.html";
				$scope.listAction($scope.page.number, $scope.page.size);
				
				Messenger().post({
					  message: '삭제 되었습니다.',
					  type: 'success',
					  showCloseButton: false
				});
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.viewAction = function(point) {
			$scope.currentPoint = point;
			$scope.template = $scope.template_base + "board-tagMetaModel-view.html";
		}
		
		$scope.editAction = function(point) {
			//console.log("birth : " + person.birth);
			if (angular.isUndefined(point)) {
				$scope.currentPoint = {};				
			} else {    				
				$scope.currentPoint = point;
			}
			$scope.template = $scope.template_base + "board-tagMetaModel-edit.html";
		}
		
		$scope.cancelAction = function() {			
			console.log("--> cancelAction displayMode : " + $scope.displayMode);
			$scope.template = $scope.template_base + "board-tagMetaModel-list.html";
			/*			
			if (angular.equals($scope.displayMode, "view")) {
				$scope.currentPoint = null;
				$scope.displayMode = "list";
			} else if (angular.equals($scope.displayMode, "edit")) {
				//console.log("angular.isUndefined($scope.currentPerson) : " + angular.isUndefined($scope.currentPerson));
				//console.log("angular.isDefined($scope.currentPerson) : " + angular.isDefined($scope.currentPerson));
				if (angular.isUndefined($scope.currentPoint)) {
					$scope.currentPoint = null;
					$scope.displayMode = "list";
				} else {
					if($scope.currentPoint !== null){
						$scope.displayMode = "view";
					}else {
						$scope.currentPoint = null;
						$scope.displayMode = "list";
					}
					
				}
				
			}
			*/
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

  angular.module('singApp.board-tagMetaModel').controller('boardTagMetaModelController', boardTagMetaModelController);

})();
