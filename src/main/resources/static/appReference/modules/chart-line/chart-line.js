(function() {
	'use strict';

	chartLineController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval' ];
	function chartLineController(config, $scope, $resource, $http, $location, $filter, $interval) {

		$scope.baseUiUrl = config.settings.network.ui;
		
		$scope.fetchData = function(tagID) {
			$http(
					{
						method : 'GET',
						url : $scope.baseUiUrl+"appReference/modules/chart-line/data/chart_line_data.json"
					}).success(function(data) {	
						
						/*
						//console.log("fetch tagID : " + tagID);
						var dataList = data.content;
						//console.log(dataList);						
						var cnt = 0;
						var dataValues = [];						
						for (var key in dataList) {							
							cnt = cnt+1;
							var value = dataList[key].value;
							var time = dataList[key].timestamp;			
							
							//console.log("cnt : " + cnt);
							//console.log("value : " + value);
							
							dataValues.push({x: cnt, y: value});
						}						
						//console.log(dataValues);
						*/
						
						$scope.data2 = [{
				        	color: "#ff7f0e",
			    		    key: "data",
			    		    values: data}];
						
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.fetchData();
		
		$scope.options2 = {
	            chart: {
	                type: 'lineChart',
	                height: 450,
	                margin : {
	                    top: 20,
	                    right: 20,
	                    bottom: 40,
	                    left: 55
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
	                    axisLabel: 'Time (ms)'
	                },
	                yAxis: {
	                    axisLabel: 'Voltage (v)',
	                    tickFormat: function(d){
	                        return d3.format('.02f')(d);
	                    },
	                    axisLabelDistance: -10
	                },
	                callback: function(chart){
	                    console.log("!!! lineChart callback !!!");
	                }
	            },
	            title: {
	                enable: false,
	                text: '데이터 변화량'
	            }
	        };

	        
	        

		
	}

	angular.module('singApp.chart-line').controller('chartLineController', chartLineController);

})();
