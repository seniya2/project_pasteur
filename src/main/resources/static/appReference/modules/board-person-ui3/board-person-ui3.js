(function() {
	'use strict';

	boardPersonUi3Controller.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter' ];
	function boardPersonUi3Controller(config, $scope, $resource, $http, $location, $filter) {

		Messenger.options = {
		    extraClasses: 'messenger-fixed messenger-on-top',
		    theme: 'air'
		}
		
		$scope.orderBy = $filter('orderBy');
				
		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 20;
		var s_sort = search.sort || 'id,desc';


		$scope.people = null;
		$scope.page = null;
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.orderProperty = "-no";
		
		$scope.entityName = "person";		
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.listUrl = config.settings.network.rest+$scope.entityName;
		
		$scope.currentPath = $location.path();	
		
		$scope.currentPerson = null;		
		$scope.displayMode = "list";				
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
		
		$scope.listAction = function(pageNumber, size) {

			if (angular.isUndefined(size)) {
				size = page.size;
			}

			var sort = $scope.sortAttr + "," + $scope.sortOder;
			console.log("sort : " + sort);

			$http(
					{
						method : 'GET',
						url : $scope.baseRestUrl + 'person?page=' + pageNumber
								+ '&size=' + size + '&sort='+sort
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
						
		$scope.formSubmit = function(valid) {
			console.log("--> Submitting form valid : " + valid);
			
			if (!valid) {
				return;
			}
			if ($scope.currentPerson.password != $scope.currentPerson.password2) {
				return;
			}
			
			if (angular.isDefined($scope.currentPerson.no)) {
				$scope.updateAction($scope.currentPerson);
			}else {
				$scope.createAction($scope.currentPerson);
			}
			
		}
		
		$scope.createAction = function(person) {
			console.log("createAction");
			console.log(person);
			$http({
				method : 'POST',
				url : $scope.baseRestUrl + 'person',
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : person
			}).success(function(data) {
				//console.log(data);
				$scope.displayMode = "list";
				$scope.listAction(1, $scope.page.size);

				Messenger().post({
					  message: '저장 되었습니다.',
					  type: 'success',
					  showCloseButton: false
				});
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}
		
		$scope.updateAction = function(person) {
			console.log("updateAction");
			console.log(person);
			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + 'person/' + person.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : person
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
				url : $scope.baseRestUrl + 'person/' + id
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
		
		$scope.viewAction = function(person) {
			console.log("birth : " + person.birth);
			person.birth = new Date(person.birth);
			$scope.currentPerson = person;
			$scope.displayMode = "view";
		}
		
		$scope.editAction = function(person) {
			//console.log("birth : " + person.birth);
			if (angular.isUndefined(person)) {
				$scope.currentPerson = null;				
			} else {
				person.birth = new Date(person.birth);
				$scope.currentPerson = person;
			}
			$scope.displayMode = "edit";
		}
		
		$scope.cancelAction = function() {			
			console.log("cancelAction displayMode : " + $scope.displayMode);
			if (angular.equals($scope.displayMode, "view")) {
				$scope.currentPerson = null;
				$scope.displayMode = "list";
			} else if (angular.equals($scope.displayMode, "edit")) {
				console.log("angular.isUndefined($scope.currentPerson) : " + angular.isUndefined($scope.currentPerson));
				console.log("angular.isDefined($scope.currentPerson) : " + angular.isDefined($scope.currentPerson));
				if (angular.isUndefined($scope.currentPerson)) {
					$scope.currentPerson = null;
					$scope.displayMode = "list";
				} else {
					if($scope.currentPerson !== null){
						$scope.displayMode = "view";
					}else {
						$scope.currentPerson = null;
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
			
			/*
			if ($scope.sortAttr != attr) {
				
				$scope.sortOder = "desc";
				$scope.sortAttr = attr;				
				$scope.people = $scope.orderBy($scope.people, attr, false);
				
			} else {
				if ($scope.sortOder == "desc") {
					$scope.sortOder = "asc";			
					$scope.people = $scope.orderBy($scope.people, attr, true);
				} else {
					$scope.sortOder = "desc";
					$scope.people = $scope.orderBy($scope.people, attr, false);
				}
			}
			*/
		}
		
		$scope.pageChangeHandler = function(num) {
			console.log(num);
			// $scope.pageNumber = num;
			$scope.listAction(num - 1, s_size);
		}
		
	}

	angular.module('singApp.board-person-ui3').controller('boardPersonUi3Controller',	boardPersonUi3Controller);

})();
