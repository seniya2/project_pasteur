(function() {
	'use strict';

	chartBarController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$interval' ];
	function chartBarController(config, $scope, $resource, $http, $location, $filter, $interval) {
		
		$scope.baseUiUrl = config.settings.network.ui;
		
		$scope.options1 = {
		    chart: {
		        type: 'discreteBarChart',
		        height: 450,
		        margin : {
		            top: 20,
		            right: 20,
		            bottom: 60,
		            left: 55
		        },
		        x: function(d){ return d.label; },
		        y: function(d){ return d.value; },
		        showValues: true,
		        valueFormat: function(d){
		            return d3.format(',.4f')(d);
		        },
		        transitionDuration: 500,
		        xAxis: {
		            axisLabel: 'X Axis'
		        },
		        yAxis: {
		            axisLabel: 'Y Axis',
		            axisLabelDistance: 30
		        }
		    }
		};
				
		$scope.fetchData = function(tagID) {
			$http(
					{
						method : 'GET',
						url : $scope.baseUiUrl+"appReference/modules/chart-bar/data/chart_bar_data.json"
					}).success(function(data) {
						$scope.data1 = [{
						    key: "Cumulative Return",
						    values: data
						}];
						
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.fetchData();
		
		
	}

	angular.module('singApp.chart-bar').controller('chartBarController', chartBarController);

})();
