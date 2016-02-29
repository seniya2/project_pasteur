(function() {
  'use strict';

  	hvacGraphViewController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService' ];
    function hvacGraphViewController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService) {
    	 $scope.options = {
    			 chart: {
 	                type: 'lineChart',
 	                height: 450,
 	                margin : {
 	                    top: 20,
 	                    right: 30,
 	                    bottom: 40,
 	                    left: 70
 	                },
 	                x: function(d){ return d.x; },
 	                y: function(d){ return d.y; },
 	                useInteractiveGuideline: true,
 	                transitionDuration:500,
 	                dispatch: {
 	                    stateChange: function(e){ console.log("stateChange"); },
 	                    changeState: function(e){ console.log("changeState"); },
 	                    tooltipShow: function(e){ console.log("tooltipShow"); },
 	                    tooltipHide: function(e){ console.log("tooltipHide"); }
 	                },
 	                xAxis: {
 	                    axisLabel: 'Time',
 	                    ticks:10,
 	                    tickFormat: function(d) { 
 	                	   return d3.time.format('%H:%M:%S')(new Date(d)) 
 	                   }
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
 	                text: '',
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
   };
    		    
    		    
    		    $scope.data = [{ values: [], key: 'Random Walk' }];
    		        
    		    $scope.run = true;
    		    
    		    var x = 0;
    		    var ti = setInterval(function(){
    		    	//chart.xAxis.tickFormat(function(d) { return d3.time.format('%x')(new Date(d)) });
    		    	//$scope.options.chart.xAxis.ticks = $scope.data[0].values.length+2;
    		    	
    			    if (!$scope.run) return;
    			    //var dd = ($scope.data);//BUG HERE!!!!!!USE angular.copy INSTEAD
    			    var dd = angular.copy($scope.data);
    			    dd[0].values.push({ x: new Date().getTime(), y: Math.random() - 0.5});
    			    
    			    
    			    $scope.data = dd;
    			    //$scope.data[0].values.push({ x: x,	y: Math.random() - 0.5});
    		      if ($scope.data[0].values.length > 10) $scope.data[0].values.shift();
    			    x++;
    			   // console.log($scope.nvd3Api);
    		      $scope.nvd3Api.updateWithData($scope.data);
    		    }, 1000);  
    		    
    		    // $scope.fresh = function(){
    		    //   if (!$scope.run) return;
    			   // var dd = ($scope.data);//BUG HERE!!!!!!USE angular.copy INSTEAD
    			   //// var dd = angular.copy($scope.data);
    			   // dd[0].values.push({ x: x,	y: Math.random() - 0.5});
    			   // $scope.data = dd;
    			   // //$scope.data[0].values.push({ x: x,	y: Math.random() - 0.5});
    		    //   if ($scope.data[0].values.length > 20) $scope.data[0].values.shift();
    			   // x++;
    		    // }
		
    		    
    		    $scope.getCurrentTime = function() {
    				var nowDate = new Date();			
    				var nowTimeStr = nowDate.toTimeString();
    				nowTimeStr = nowTimeStr.substr(0,8);
    				return nowTimeStr;			
    			}
    }
    
   

  angular.module('singApp.hvac-graph-view').controller('hvacGraphViewController', hvacGraphViewController);

})();
