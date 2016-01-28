(function() {
  'use strict';

	angular.module('singApp.pasteur-dashboard').controller('pasteurDashboardController', pasteurDashboardController);
	
	pasteurDashboardController.$inject = ['config', '$scope', '$resource', '$filter', 'usSpinnerService', '$timeout', '$http', '$rootScope', '$state'];
	function pasteurDashboardController (config, $scope, $resource, $filter, usSpinnerService, $timeout, $http, $rootScope, $state) {

		$scope.categoryName = "hvac";
		$scope.template_base = "appPasteur/modules/energy/hvac/point-manage/";
		$scope.resources_base = $scope.template_base + "resources/";
		
		$scope.entityNameHvac = "graphHvac";
		$scope.categoryNameHvac = "hvac";
		$scope.entityNameElec = "graphElectric";
		$scope.categoryNameElec = "electric";
		
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.baseXdUrl = config.settings.network.xd;
		
		$scope.chartUrlHvac = $scope.baseXdUrl+"chart/"+$scope.categoryNameHvac+"/";
		$scope.chartUrlElec = $scope.baseXdUrl+"chart/"+$scope.categoryNameElec+"/";	
		
		$scope.listUrlHvac = config.settings.network.rest+$scope.entityNameHvac;
		$scope.listUrlElec = config.settings.network.rest+$scope.entityNameElec;
		
		$scope.csvFileUrl = $scope.baseUiUrl + $scope.resources_base + $scope.categoryName + ".csv";
		
		$scope.dataList = null;
		$scope.sortAttr = 'no';
		$scope.sortOder = false;
		
		$scope.graphList = new Array();
		
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
					for (var key in results.data) {
						//console.log("data : " + results.data[key]);
						results.data[key].no = parseInt(results.data[key].no);
					}
					$scope.dataList = results.data;
					$timeout(function(){usSpinnerService.stop('app-spinner-main')}, 1000);
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
			usSpinnerService.spin('app-spinner-main');
			Papa.parse($scope.csvFileUrl, $scope.csvConfig);
			$scope.loadChartHvac();
		}
		
		$scope.getPointDate = function(dateType, dateTime) {
			if (dateType == "c") {
				return "현재시간";
			} else {
				return dateTime;
			}
		}
		
		$scope.loadChartHvac = function() {
			$http({
						method : 'GET',
						url : $scope.listUrlHvac + '?page=0&size=2&sort=id,asc'
					}).success(function(data) {
						for (var key in data._embedded.graphHvac) {
							data._embedded.graphHvac.chartOptions = "";
							data._embedded.graphHvac.chartData = "";
							data._embedded.graphHvac.chartEnable = false;
							data._embedded.graphHvac.categoryEntity ="hvac";
							
							$scope.graphList.push(data._embedded.graphHvac[key]);
						}
						for (var key in $scope.graphList) {
							$scope.graphList[key].categoryEntity ="hvac";
							console.log($scope.graphList[key]);
						}
						$scope.loadChartElec();
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.loadChartElec = function() {
			$http({
						method : 'GET',
						url : $scope.listUrlElec + '?page=0&size=1&sort=id,asc'
					}).success(function(data) {
						for (var key in data._embedded.graphElectric) {
							data._embedded.graphElectric.chartOptions = "";
							data._embedded.graphElectric.chartData = "";
							data._embedded.graphElectric.chartEnable = false;
							data._embedded.graphElectric.categoryEntity ="electric";
							$scope.graphList.push(data._embedded.graphElectric[key]);
						}
						for (var key in $scope.graphList) {
							$scope.graphList[key].categoryEntity ="electric";
							console.log($scope.graphList[key]);
						}
						//console.log($scope.graphList);
						//$scope.drawCharts();
						$timeout(function(){usSpinnerService.stop('app-spinner-main-g')}, 1000);
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.drawCharts = function(idx) {
			
			console.log("drawCharts idx : " + idx);
			var graphData = $scope.graphList[idx];
			
			var chartOptions = {
		            chart: {
		                type: 'lineChart',
		                height: 220,	                
		                margin : {
		                    top: 20,
		                    right: 20,
		                    bottom: 40,
		                    left: 50
		                },
		                x: function(d){ return d.x; },
		                y: function(d){ return d.y; },
		                useInteractiveGuideline: true,
		                dispatch: {
		                    stateChange: function(e){ console.log("stateChange"); },
		                    changeState: function(e){ console.log("changeState"); },
		                    tooltipShow: function(e){ console.log("tooltipShow"); },
		                    tooltipHide: function(e){ console.log("tooltipHide"); }
		                },
		                xAxis: {
		                    axisLabel: 'Time'
		                    ,ticks:24
		                },
		                yAxis: {
		                    axisLabel: 'Value',	                    
		                    tickFormat: function(d){
		                        return d3.format('.01f')(d);
		                    },	                    
		                    axisLabelDistance: -10
		                },
		                callback: function(chart){
		                    //console.log("!!! lineChart callback !!!");
		                }
		            },
		            title: {
		                enable: true,
		                html: '',
		                css:{ 'font-weight' : '700'}
		            },
		            caption: {   
		            	enable: true,
		            	html: '',
		            	css:{ 'textAlign' : 'center',
							  'text-align' : 'justify',
						 	  'margin' :'0px 0px 0px 10px'}
		            },
		            subtitle: {   
		            	enable: true,
		            	html: '',
		            	css:{ 'textAlign' : 'center',
						 	  'margin' :'0px 0px 0px 10px'}
		            }
		        }
						
			var chartURL = "#/app/hvac-graph"
			if ($scope.graphList[idx].categoryEntity == "electric") {
				chartURL = "#/app/electric-graph"
			}
			
			var subTitle = $scope.getPointDate($scope.graphList[idx].dateType, $scope.graphList[idx].dateTime);
			//chartOptions.title.html = "<a href="+chartURL+">"+$scope.graphList[idx].subject+"</a>";
			chartOptions.title.html = $scope.graphList[idx].subject;
			
			chartOptions.caption.html = 
				'<small class="fw-bold">시간 단위 : '+$scope.graphList[idx].interval
				+'&nbsp;/&nbsp; Value 측정 : '+$scope.graphList[idx].valueType+'</small>';
			chartOptions.subtitle.html = '<small>기준 시간 : '+subTitle+'</small>';
			
			$scope.graphList[idx].chartEnable = true;
			$scope.graphList[idx].chartData = [];
			$scope.graphList[idx].chartOptions = chartOptions;
			
			//var category = $scope.graphList[idx].category;
						
			var urlQurey = "?interval="+$scope.graphList[idx].interval
							+"&calculation="+$scope.graphList[idx].valueType
							+"&datetime="+$scope.graphList[idx].dateTime;
			var tagIDs = $scope.graphList[idx].tagIDs.split(",");
			
			angular.forEach(tagIDs, function(value, key) {				
				var splitValue = value.split(":");
				var tagName = splitValue[0];
				var tagID = splitValue[1];
				var category = $scope.graphList[idx].categoryEntity;
				tagID = tagID.replace("TAG_","");
				tagID = tagID.replace("_clone","");	
				$scope.fetchData(tagName, tagID, urlQurey, category, idx);
			});
			
		}
		
		$scope.fetchData = function(tagID, tagIDReplace, urlQurey, category, idx) {
			
			console.log("category : " + category);
			
			var chartUrl = "";
			if (category == "hvac") {
				chartUrl = $scope.chartUrlHvac
			} else {
				chartUrl = $scope.chartUrlElec
			}
			
			console.log("fetchData tagIDReplace:" +tagIDReplace);
			console.log("chartUrl : " + chartUrl+tagIDReplace+urlQurey);
			$http(
					{
						method : 'GET',
						url : chartUrl+tagIDReplace+urlQurey
					}).success(function(data) {	
						
						console.log("fetch data.data : " + data.data);
						console.log("fetch data.dataCount : " + data.dataCount);
						
						$scope.graphList[idx].chartOptions.chart.xAxis.ticks = data.dataCount;
						
						var dataList = data.data;
						var dataValues = [];		
						var cnt = 0;
						for (var key in dataList) {							
							cnt = cnt+1;
							//console.log("cnt : " + cnt);
							//console.log("key : " + key);	
							//console.log("dataList[key] : " + dataList[key]);
							dataValues.push({x: cnt, y: dataList[key]});
						}	
						
						function randomString() {
							var chars = "0123456789ABCDEF";
							var string_length = 6;
							var randomstring = '';
							for (var i=0; i<string_length; i++) {
							var rnum = Math.floor(Math.random() * chars.length);
								randomstring += chars.substring(rnum,rnum+1);
							}							
							return randomstring;
						}						
						
						var chartDataSub = {
				        	color: "#"+randomString(),
			    		    key: tagID,
			    		    values: dataValues};
						
						$scope.graphList[idx].chartData.push(chartDataSub);
						
						//$scope.chartData.push(chartDataSub);
						
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
	  
	}
  
})();
