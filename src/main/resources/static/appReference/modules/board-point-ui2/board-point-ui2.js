(function() {
  'use strict';

  	boardPointUi2Controller.$inject = ['config','$scope', '$resource', '$http', '$location', '$filter' ];
    function boardPointUi2Controller (config, $scope, $resource, $http, $location, $filter) {
    	Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
    		}
    		
    		$scope.orderBy = $filter('orderBy');
    				
    		$scope.remoteUrlRequestFn = function(str) {
    			if ($scope.searchType == "name") {
    				return {name: str};
    			} else {
    				return {url: str};
    			}
    	    };
    	
    	
    		var search = $location.search();
    		var s_page = search.page || 0;
    		var s_size = search.size || 20;
    		var s_sort = search.sort || 'id,desc';


    		$scope.pointList = null;
    		$scope.page = null;
    		$scope.pageLinks = null;
    		$scope.sortAttr = "id";
    		$scope.sortOder = "desc";
    		$scope.orderProperty = "-no";
    		
    		$scope.entityName = "point";		
    		$scope.baseRestUrl = config.settings.network.rest;
    		$scope.listUrl = config.settings.network.rest+$scope.entityName;
    		
    		$scope.currentPath = $location.path();	
    		
    		$scope.searchUrlBase = $scope.baseRestUrl + "point/search/";    		
    		$scope.searchType = "name";
    		$scope.searchUrlFn = $scope.searchUrlBase+"findByName";
    		
    		$scope.$watch('searchType', function() {
    		    console.log("searchType : " + $scope.searchType);
    		    if ($scope.searchType == "name") {
    		    	$scope.searchUrlFn = $scope.searchUrlBase+"findByName";
    			} else {
    				$scope.searchUrlFn = $scope.searchUrlBase+"findByUrl";
    			}
    		});
    			
    		$scope.selectedPoint  = function(selected) {
    			console.log("selectedPoint");
    			console.log(selected);
    			$scope.pointList = [];
    			$scope.pointList.push(selected.originalObject);
    			
    			console.log($scope.pointList);
    		}
    		
    		
    		
    		$scope.currentPoint = null;		
    		$scope.displayMode = "list";				
    		$scope.prepareAction = function() {

    			$http(
    					{
    						method : 'GET',
    						url : $scope.baseRestUrl + 'point?point=' + s_page	+ '&size=' + s_size + '&sort=' + s_sort
    					}).success(function(data) {
    				$scope.pointList = data._embedded.point;
    				$scope.page = data.page;
    				$scope.pageLinks = data._links;
    				console.log($scope.pointList);
    				
    			}).error(function(error) {
    				// $scope.widgetsError = error;
    			});
    			
    		}
    		$scope.prepareAction();
    		
    		$scope.listAction = function(pageNumber, size) {

    			if (angular.isUndefined(size)) {
    				size = page.size;
    			}

    			var sort = $scope.sortAttr + "," + $scope.sortOder;
    			console.log("sort : " + sort);

    			$http(
    					{
    						method : 'GET',
    						url : $scope.baseRestUrl + 'point?page=' + pageNumber
    								+ '&size=' + size + '&sort='+sort
    					}).success(function(data) {
    				$scope.pointList = data._embedded.point;
    				$scope.page = data.page;
    				console.log($scope.pointList);
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
    				url : $scope.baseRestUrl + 'point',
    				headers : {
    					'Content-Type' : 'application/json; charset=UTF-8'
    				},
    				data : point
    			}).success(function(data) {
    				//console.log(data);
    				$scope.displayMode = "list";
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
    				url : $scope.baseRestUrl + 'point/' + point.no,
    				headers : {
    					'Content-Type' : 'application/json; charset=UTF-8'
    				},
    				data : point
    			}).success(function(data) {
    				//console.log(data);
    				$scope.displayMode = "list";
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
    				url : $scope.baseRestUrl + 'point/' + id
    			}).success(function(data) {
    				//console.log(data);
    				$scope.listAction($scope.page.number, $scope.page.size);
    				$scope.displayMode = "list";
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
    			$scope.displayMode = "view";
    		}
    		
    		$scope.editAction = function(point) {
    			//console.log("birth : " + person.birth);
    			if (angular.isUndefined(point)) {
    				$scope.currentPoint = null;				
    			} else {    				
    				$scope.currentPoint = point;
    			}
    			$scope.displayMode = "edit";
    		}
    		
    		$scope.cancelAction = function() {			
    			console.log("--> cancelAction displayMode : " + $scope.displayMode);
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

  angular.module('singApp.board-point-ui2').controller('boardPointUi2Controller', boardPointUi2Controller);

})();
