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
    $scope.alarmEntity = ['alarmElectric','alarmHvac','alarmElevator','alarmFire'];
    
    $scope.prepareAction = function() {
    	
    	for (var key in $scope.alarmEntity) {
    		var entity = $scope.alarmEntity[key];
    		//$scope.getGlobalAlarm(entity, key);
    	}
    }
    
    $scope.getGlobalAlarm = function(entityName, idx) {
    	
    	var listUrl = $scope.baseRestUrl+entityName;    	
    	//console.log("entityName : "+ entityName);
		//console.log("idx : "+ idx);
		//console.log("listUrl : "+ listUrl);
		var dataList = null;
		
    	$http(
				{
					method : 'GET',
					url : listUrl + '?page=0&size=1000&sort=id,desc'
				}).success(function(data) {
					
					eval("dataList = data._embedded."+entityName);					
					var tagID = "";
					var tagName = "";
					var alarmName = "";
					var condition = "";
					var global = "";
					var tagEntity = "";
					
					if (entityName == "alarmElevator"){
						tagEntity = "elevator";
					} else if (entityName == "alarmFire"){
						tagEntity = "fire";
					} else if (entityName == "alarmElectric"){
						tagEntity = "electric";
					} else if (entityName == "alarmHvac"){
						tagEntity = "hvac";
					}
					
					
					for (var key in dataList) {
						//console.log(dataList[key]);
						tagName=dataList[key].tagID.split(":")[0];
						tagID=dataList[key].tagID.split(":")[1];
						alarmName=dataList[key].condition.split(":")[0];
						condition=dataList[key].condition.split(":")[1];
						
						console.log(alarmName);
						
						//global=dataList[key].global;
						
						//if (global == "Y") {
							if ($scope.globalAlarmList.get(tagID) != undefined) {
								//console.log("!undefined : " + tagID);
								var alarmNameAdd = $scope.globalAlarmList.get(tagID).alarmName + "," + alarmName;
								var conditionAdd = $scope.globalAlarmList.get(tagID).condition + "," + condition;
								
								$scope.globalAlarmList.set(tagID, {
									"tagName" : tagName,
									"alarmName" :alarmNameAdd,
									"condition" :conditionAdd,
									"global" : global,
									'tagEntity' : tagEntity
								}); 
							} else {
								//console.log("undefined : " +tagID);
								$scope.globalAlarmList.set(tagID, {
									"tagName" : tagName,
									"alarmName" :alarmName,
									"condition" :condition,
									"global" : global,
									'tagEntity' : tagEntity
								}); 
							}
							//console.log($scope.globalAlarmList.get(tagID));
						//}
						
						$scope.point[tagID] = {
								"tagID" : tagID,
								"value" : null, 
								"old_val" : null
						};
						
					}
					
					if (idx == 1) {
						$timeout(function(){
							$scope.callAtInterval(); 
							$scope.asyncStartAction();
						}, 5000);
					}
					
		}).error(function(error) {
			console.log(error);
			// $scope.widgetsError = error;
		});
    }
    
    $scope.asyncStartAction = function() {
		$scope.intervalJob = $interval(function(){ $scope.callAtInterval(); }, 10000);
	}
	
	$scope.asyncStopAction = function() {
		 $interval.cancel($scope.intervalJob);
	}
	
	$scope.callAtInterval = function() {
		//console.log($scope.globalAlarmList);
		var tagList = $scope.globalAlarmList.keys();
		for (var key in tagList) {
			try {
				var tagID = tagList[key];
				var tagEntity = $scope.globalAlarmList.get(tagID).tagEntity;				
				//console.log("tagID : " + tagList[key]);
				//console.log("tagEntity : " + tagEntity);
				$scope.fetchTagData(tagID, tagEntity);
			}
			catch(err) {
			   console.log(err);
			}
    	}
    }
	
	$scope.fetchTagData = function(tagID, tagEntity) {
		
		var newTagID = "";
		newTagID = tagID.replace("TAG_","");
		newTagID = newTagID.replace("_clone","");
		
		var tagAddr = $scope.baseXdUrl+"monitor/"+tagEntity+"/"+newTagID;
		
		$http({
			method : 'GET',
			url : tagAddr,
			headers: {'Content-type': 'application/json'}
				
		}).success(function(data) {
			
			$scope.point[tagID].value = data.value;
			$scope.alarmFilter(tagID, $scope.point[tagID].old_val, data.value);
			$scope.point[tagID].old_val = data.value;
			
		}).error(function(error) {
			// $scope.widgetsError = error;
		});
	}
	
	
	$scope.alarmFilter = function(tagID, old_val, val) {
		
		//console.log("tagID : " + tagID);
		//console.log("old_val : " + old_val);
		//console.log("new val : " + val);
				
		if (old_val == null || old_val == undefined) {
			return;
		}			
		var alarmInfo = $scope.globalAlarmList.get(tagID);
		//console.log("alarmInfo.condition : " + alarmInfo.condition);
		
		if (alarmInfo != undefined) {
			var conditions = alarmInfo.condition.split(",");
			var alarmNames = alarmInfo.alarmName.split(",");
			for (var i=0; i<conditions.length; i++ ) {
				//console.log("conditions[i] : " + conditions[i]);
				eval("if ("+conditions[i]+") {console.log(conditions[i]);$scope.alarmMessage(tagID, alarmNames[i], i, val);}");
			}
		}
		
	}
	
	$scope.alarmMessage = function(tagID, alarmName, number, val) {
		
		Messenger({
		    extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
		    theme: 'future'
		}).post({			
			message:alarmName + "<br/>현재값 : " + val,
			type: 'error',
			hideAfter:36000,
		    showCloseButton: true,
		    id: tagID+"_"+number+"_"+val,
		    singleton: true		    
		});
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
