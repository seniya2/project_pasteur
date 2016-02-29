(function() {
  'use strict';

  angular
    .module('singApp.core')
    .controller('App', AppController)
    .factory('jQuery', jQueryService)
    .factory('$exceptionHandler', exceptionHandler)
  ;

  AppController.$inject = ['config', '$scope', '$localStorage', '$state', '$location', '$http', '$interval','$timeout'];
  function AppController(config, $scope, $localStorage, $state, $location, $http, $interval, $timeout) {
    /*jshint validthis: true */
    var vm = this;

    vm.title = config.appTitle;

    $scope.app = config;
    $scope.$state = $state;

    if (angular.isDefined($localStorage.state)){
      $scope.app.state = $localStorage.state;
    } else {
      $localStorage.state = $scope.app.state;
    }
        
    $scope.menu = {
    		main : "메인화면",
    		sub : ""
    }
    
    $scope.$on("$locationChangeStart", function() {
    	$scope.currentPath = $location.path();
    	//console.log("$locationChangeStart");
    	//console.log("$scope.currentPath : " +$scope.currentPath);    	
    	if ($scope.currentPath == "/app/pasteur-dashboard") {
    		$scope.menu = { main : "Institut Pasteur Korea", sub : ""}
    	} else if ($scope.currentPath == "/app/energy-report") {
    		$scope.menu = { main : "사용량일지", sub : ""}
    	} else if ($scope.currentPath == "/app/energy-graph") {
    		$scope.menu = { main : "사용량분석", sub : "경향그래프"}
    	} else if ($scope.currentPath == "/app/energy-hvac-point-manage") {
    		$scope.menu = { main : "설비시스템", sub : "관제점보기"}
    	} else if ($scope.currentPath == "/app/hvac-monitor") {
    		$scope.menu = { main : "설비시스템", sub : "상태감시"}
    	} else if ($scope.currentPath == "/app/hvac-history") {
    		$scope.menu = { main : "설비시스템", sub : "알람 및 이력 보기"}
    	} else if ($scope.currentPath == "/app/hvac-alarm") {
    		$scope.menu = { main : "설비시스템", sub : "알람이력 설정"}
    	} else if ($scope.currentPath == "/app/hvac-graph-manage") {
    		$scope.menu = { main : "설비시스템", sub : "경향그래프"}
    	} else if ($scope.currentPath == "/app/hvac-graph-view") {
    		$scope.menu = { main : "설비시스템", sub : "이력그래프 보기"}
    	} else if ($scope.currentPath == "/app/energy-electric-point-manage") {
    		$scope.menu = { main : "전력시스템", sub : "관제점보기"}
    	} else if ($scope.currentPath == "/app/electric-monitor") {
    		$scope.menu = { main : "전력시스템", sub : "상태감시"}
    	} else if ($scope.currentPath == "/app/electric-history") {
    		$scope.menu = { main : "전력시스템", sub : "알람 및 이력 보기"}
    	} else if ($scope.currentPath == "/app/electric-alarm") {
    		$scope.menu = { main : "전력시스템", sub : "알람이력 설정"}
    	} else if ($scope.currentPath == "/app/electric-graph-manage") {
    		$scope.menu = { main : "전력시스템", sub : "경향그래프"}
    	} else if ($scope.currentPath == "/app/electric-graph-view") {
    		$scope.menu = { main : "전력시스템", sub : "경향그래프 보기"}
    	} else if ($scope.currentPath == "/app/cctv-point-manage") {
    		$scope.menu = { main : "CCTV시스템", sub : "카메라정보"}
    	} else if ($scope.currentPath == "/app/cctv-monitor") {
    		$scope.menu = { main : "CCTV시스템", sub : "실시간영상"}
    	} else if ($scope.currentPath == "/app/fire-history") {
    		$scope.menu = { main : "화재시스템", sub : "알람 및 이력 보기"}
    	} else if ($scope.currentPath == "/app/fire-alarm") {
    		$scope.menu = { main : "화재시스템", sub : "알람이력 설정"}
    	} else if ($scope.currentPath == "/app/lighting-point-manage") {
    		$scope.menu = { main : "조명시스템", sub : "관제점관리"}
    	} else if ($scope.currentPath == "/app/lighting-monitor") {
    		$scope.menu = { main : "조명시스템", sub : "상태감시"}
    	} else if ($scope.currentPath == "/app/ev-point-manage") {
    		$scope.menu = { main : "E/V시스템", sub : "관제점보기"}
    	} else if ($scope.currentPath == "/app/ev-monitor") {
    		$scope.menu = { main : "E/V시스템", sub : "상태감시"}
    	} else if ($scope.currentPath == "/app/ev-alarm") {
    		$scope.menu = { main : "E/V시스템", sub : "알람관리"}
    	} else if ($scope.currentPath == "/app/ev-history") {
    		$scope.menu = { main : "E/V시스템", sub : "알람 및 이력 보기"}
    	} else {
    		$scope.menu = { main : "", sub : ""}
    	}
    	
    });
    
    $scope.globalAlarmList = new HashMap();
    $scope.point = new Array();
    
    $scope.baseXdUrl = config.settings.network.xd;
    $scope.baseRestUrl = config.settings.network.rest;
   
    
   
    
    $scope.requestAction = function(dataUrl) {

		$http({
			method : 'GET',
			url : dataUrl,
			headers: {'Content-type': 'application/json'},
			cache: false,
			timeout:20000
		}).success(function(data) {			
			var contents = data.content;			
			for (var key in contents) {				
				var entity = contents[key];
				$scope.alarmMessage(entity);				
			}
			
			$timeout(function(){
				$scope.requestAction(dataUrl)
			}, 5000);
			
		}).error(function(error) {
			console.log($scope.svgFile + " ! " + error);
			
		});

	}
    
    
    
    $scope.alarmMessage = function(entity) {
		
		var name = entity.name;
		var datetime = entity.datetime;
		var criteria = entity.criteria;

    	var message = name + "알람발생<br /> "+ datetime  +"<br />아래 조건에 의하여 알람이 발생하였습니다. <br />" + criteria;
		Messenger({
		    extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
		    theme: 'future'
		}).post({			
			message:message,
			type: 'error',
			hideAfter:36000,
		    showCloseButton: true 
		});
	}
    
    
    
    $scope.prepareAction = function() {    	
    	console.log("core.js $scope.prepareAction------>");
    	 //$scope.alarmEntity = ['electric','hvac','elevator','fire'];
    	/*
    	$scope.requestAction("http://192.168.245.3:9898/current/electric?status=status");
    	$scope.requestAction("http://192.168.245.3:9898/current/hvac?status=status");
    	$scope.requestAction("http://192.168.245.3:9898/current/elevator?status=status");
    	$scope.requestAction("http://192.168.245.3:9898/current/fire?status=status");
    	*/
    }
    
    
    
    
  }

  jQueryService.$inject = ['$window'];

  function jQueryService($window) {
    return $window.jQuery; // assumes jQuery has already been loaded on the page
  }

  exceptionHandler.$inject = ['$log', '$window', '$injector'];
  function exceptionHandler($log, $window, $injector) {
    return function (exception, cause) {
      var errors = $window.JSON.parse($window.localStorage.getItem('sing-2-angular-errors')) || {};
      errors[new Date().getTime()] = arguments;
      $window.localStorage.setItem('sing-2-angular-errors', $window.JSON.stringify(errors));
      if ($injector.get('config').debug) {
        $log.error.apply($log, arguments);
        $window.alert('check errors');
      }
    };
  }
})();
