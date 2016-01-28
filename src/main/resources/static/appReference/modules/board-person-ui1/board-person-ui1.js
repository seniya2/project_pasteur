(function() {
	'use strict';

	boardPersonUi1Controller.$inject = ['config', '$scope', '$resource', '$http', '$location','$modal' ];
	
	
	
	function boardPersonUi1Controller(config, $scope, $resource, $http, $location, $modal) {

		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 5;
		var s_sort = search.sort || 'id,desc';

		$scope.people = null;
		$scope.page = null;
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		
		$scope.entityName = "person";		
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.listUrl = config.settings.network.rest+$scope.entityName;		
		

		$scope.currentPath = $location.path();

		$scope.prepareAction = function() {

			$http(
					{
						method : 'GET',
						url : $scope.baseRestUrl + 'person?page=' + s_page
								+ '&size=' + s_size + '&sort=' + s_sort
					}).success(function(data) {
				$scope.people = data._embedded.person;
				$scope.page = data.page;
				$scope.pageLinks = data._links;
				// $scope.widgets = data.content;
				// $scope.page = data.page;
				// $scope.sort = sort;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}
		$scope.prepareAction();

		$scope.listAction = function(page, size) {

			if (angular.isUndefined(size)) {
				size = page.size;
			}

			var sort = $scope.sortAttr + "," + $scope.sortOder;
			console.log("sort : " + sort);

			$http(
					{
						method : 'GET',
						url : $scope.baseRestUrl + 'person?page=' + page
								+ '&size=' + size + '&sort=' + sort
					}).success(function(data) {
				$scope.people = data._embedded.person;
				$scope.page = data.page;
				console.log($scope.people);
				// $scope.widgets = data.content;
				// $scope.page = data.page;
				// $scope.sort = sort;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}

		$scope.deleteAction = function(id) {
			$http({
				method : 'DELETE',
				url : $scope.baseRestUrl + 'person/' + id
			}).success(function(data) {
				console.log(data);
				$scope.listAction($scope.page.number, $scope.page.size);

			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}

		$scope.pageChangeHandler = function(num) {
			console.log(num);
			// $scope.pageNumber = num;
			$scope.listAction(num - 1, s_size);
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

		$scope.createAction = function(person) {

			console.log(person);
			$http({
				method : 'POST',
				url : $scope.baseRestUrl + 'person',
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : person
			}).success(function(data) {
				console.log(data);
				$scope.listAction($scope.page.number, $scope.page.size);

			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}

		$scope.updateAction = function(person) {

			console.log(person);
			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + 'person/' + person.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : person
			}).success(function(data) {
				console.log(data);
				$scope.listAction($scope.page.number, $scope.page.size);

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

		$scope.modalInstance = null;
		$scope.viewModalOpen = function(size, entry) {

			console.log("modalOpen")
			// console.log(entry);

			$scope.modalInstance = $modal.open({
				animation : true,
				templateUrl : 'appReference/modules/board-person-ui1/viewModal.html',
				controller : 'modalViewInstanceCtrl',
				size : size,
				resolve : {
					item : function() {
						return entry;
					}
				}
			});

			$scope.modalInstance.result.then(function(result) {
				// $scope.selected = selectedItem;
				console.log(result.action);
				console.log(result.data);

				if (result.action == "edit") {
					$scope.editModalOpen(null, result.data);
				} else if (result.action == "delete") {
					$scope.deleteAction(result.data.no);
				} else if (result.action == "cancel") {

				}

			}, function() {
				// $log.info('Modal dismissed at: ' + new Date());
				$scope.modalInstance = null;
			});
		};

		$scope.editModalOpen = function(size, entry) {

			console.log("modalOpen")
			// console.log(entry);

			$scope.modalInstance = $modal.open({
				animation : true,
				templateUrl : 'appReference/modules/board-person-ui1/editModal.html',
				controller : 'modalEditInstanceCtrl',
				size : size,
				resolve : {
					item : function() {
						return entry;
					}
				}
			});

			$scope.modalInstance.result.then(function(result) {
				// $scope.selected = selectedItem;
				console.log(result.action);
				console.log(result.data);

				if (result.action == "save") {

					if (angular.isDefined(result.data.no)) {
						$scope.updateAction(result.data);
					} else {
						$scope.createAction(result.data);
					}

				} else if (result.action == "cancel") {

				}

			}, function() {
				// $log.info('Modal dismissed at: ' + new Date());
				$scope.modalInstance = null;
			});
		};

	}

	modalViewInstanceCtrl.$inject = [ '$scope', '$modalInstance', 'item' ];
	function modalViewInstanceCtrl($scope, $modalInstance, item) {
		$scope.item = item;
		$scope.cancel = function(action, item) {
			// console.log(action);
			// console.log(item);
			var result = {
				action : action,
				data : item
			}
			$modalInstance.close(result);
		};
	}
	
	modalEditInstanceCtrl.$inject = [ '$scope', '$modalInstance', 'item' ];
	function modalEditInstanceCtrl($scope, $modalInstance, item) {
		$scope.item = item;
		$scope.cancel = function(action, item) {
			// console.log(action);
			// console.log(item);
			var result = {
				action : action,
				data : item
			}
			$modalInstance.close(result);
		};
	}
		
	angular.module('singApp.board-person-ui1').controller('boardPersonUi1Controller', boardPersonUi1Controller);
	angular.module('singApp.board-person-ui1').controller('modalViewInstanceCtrl', modalViewInstanceCtrl);
	angular.module('singApp.board-person-ui1').controller('modalEditInstanceCtrl', modalEditInstanceCtrl);
	
	angular.module('singApp.board-person-ui1').directive('myEnter', function () {
	    return function (scope, element, attrs) {
	        element.bind("keydown keypress", function (event) {
	            if(event.which === 13) {
	                scope.$apply(function (){
	                	console.log("enter keydown keypress");
	                    scope.$eval(attrs.myEnter);
	                });

	                event.preventDefault();
	            }
	        });
	    };
	});
	
	
	angular.module('singApp.board-person-ui1').directive('ngConfirmClick', [
         function(){
             return {
                 link: function (scope, element, attr) {
                     var msg = attr.ngConfirmClick || "삭제하시겠습니까?";
                     var clickAction = attr.confirmedClick;
                     element.bind('click',function (event) {
                         if ( window.confirm(msg) ) {
                             scope.$eval(clickAction)
                         }
                     });
                 }
             };
     }]);
	
})();
