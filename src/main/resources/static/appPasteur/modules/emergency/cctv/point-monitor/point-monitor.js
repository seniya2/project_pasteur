(function() {
	'use strict';

	cctvMonitorController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval', 'usSpinnerService','$timeout' ];
	function cctvMonitorController(config, $scope, $resource, $http, $location, $filter, $interval, usSpinnerService, $timeout) {

		Messenger.options = {
			    extraClasses: 'messenger-fixed messenger-on-top messenger-on-right',
			    theme: 'future'
			}
 
		$scope.categoryName = "cctv";
		$scope.resources_base_svg = "appPasteur/modules/emergency/cctv/point-monitor/svg/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.menuCsvUrl = $scope.baseUiUrl + $scope.resources_base_svg + "menu.csv";
		
				
		$scope.svgFile = "";
		$scope.menuList = null;
		
		$scope.menuCsvConfig = {
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
					$scope.menuList = results.data;
					//console.log($scope.menuList);
					$scope.svgFileChange($scope.menuList[0].url);
					$timeout(function(){usSpinnerService.stop('app-spinner-ecpm')}, 1000);
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
			usSpinnerService.spin("app-spinner-ecpm");
			Papa.parse($scope.menuCsvUrl, $scope.menuCsvConfig);
		}
		
		
		$scope.svgFileChangeClass = function(file) {			
			//console.log("svgFileChangeClass : " + file);			
			if ($scope.svgFile == file) {				
				return "text-primary";
			}
		}
		
		$scope.svgFileChangeClass2 = function(file) {			
			//console.log("svgFileChangeClass : " + file);			
			if ($scope.svgFile == file) {				
				return "custom_monitor_menu";
			}
		}
		
		$scope.svgFileChange = function(file) {		
			
			$scope.svgFile = file;
			document.getElementById("svg_render").innerHTML = "";			
			d3.xml($scope.svgFile, function(error, documentFragment) {
			    if (error) {console.log(error); return;}
			    document.getElementById("svg_render").appendChild(documentFragment.documentElement);
			});
			
		}
		
	}

	angular.module('singApp.cctv-monitor').controller('cctvMonitorController', cctvMonitorController);

})();
