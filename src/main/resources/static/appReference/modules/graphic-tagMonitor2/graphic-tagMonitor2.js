(function() {
	'use strict';

	graphicTagMonitor2Controller.$inject = ['config','$scope', '$resource', '$http', '$location', '$filter', '$interval' ];
	function graphicTagMonitor2Controller(config, $scope, $resource, $http, $location, $filter, $interval) {

		Messenger.options = {
			extraClasses : 'messenger-fixed messenger-on-top',
			theme : 'air'
		}
		
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;	
		
		$scope.currentPath = $location.path();
		//$scope.pointList = null;
		$scope.point = new Array();
		
		$scope.template_base = "appReference/modules/graphic-tagMonitor2/svg/";
		$scope.template = $scope.template_base + $scope.svgFile;		
		$scope.template_url = "appReference/modules/graphic-tagMonitor2/svg/test.svg";
		
		
		$scope.svgFileChange = function(file) {
			
			console.log("file : " + file);
			$scope.svgFile = file;
			$scope.template = $scope.template_base + $scope.svgFile;
			
			document.getElementById("svg_render").innerHTML = "";
			
			d3.xml($scope.template, function(error, documentFragment) {

			    if (error) {console.log(error); return;}
			    $scope.point = new Array();			    
			    document.getElementById("svg_render").appendChild(documentFragment.documentElement);
			    d3.selectAll("svg>g>*").each(function() {
					  //console.log(d3.select(this).attr('id'));
					  var tagID = d3.select(this).attr('id');
					  if (tagID != null) {						  
						  $scope.point[tagID] = "";
					  }
				});
			    d3.selectAll("svg>*").each(function() {
					  //console.log(d3.select(this).attr('id'));
					  var tagID = d3.select(this).attr('id');
					  if (tagID != null) {						  
						  $scope.point[tagID] = "";
						  //console.log("tagID:"+tagID);
					  }
				});
			    
			    $scope.asyncStartAction();
			    //$scope.callAtInterval();
			    
			});
			
		}
		
		
		$scope.asyncStartAction = function() {
			$scope.intervalJob = $interval(function(){ $scope.callAtInterval(); }, 3000);        
			
		}
		
		$scope.asyncStopAction = function() {
			 $interval.cancel($scope.intervalJob);
		}
		
		$scope.callAtInterval = function() {		
			
			if ($location.path() != $scope.currentPath){
				$scope.asyncStopAction();
				return;
			}			
			
			for (var key in $scope.point) {
        		//console.log("key : " + key);
				try {
					$scope.fetchData(key);
				}
				catch(err) {
				   console.log(err);
				}
        	}
			
        }
		
		
		$scope.fetchData = function(tagID) {
				$http(
						{
							method : 'GET',
							url : $scope.baseRestUrl + 'tagMetaModel/search/findByTagID?tagID='+tagID
						}).success(function(data) {			
							
							//console.log("fetch tagID : " + tagID);
							var point = data._embedded.tagMetaModel[0];							
							if (!angular.isUndefined(point)) {
								$scope.point[tagID] = point;
								$scope.eventApply(tagID);
							}
							//console.log($scope.point[tagID].value);
							
				}).error(function(error) {
					// $scope.widgetsError = error;
				});
		}
		
		
		$scope.eventApply = function(tagID) {
			
			var point = $scope.point[tagID];
			var tagType = point.type;
			var tagValue = point.value;
			var selectedD3 = d3.select("#"+tagID);
			
			var tagAddr = point.tagAddr;
			if (angular.isUndefined(tagAddr)) {
				return;
			}
			
			$http({
				method : 'GET',
				url : tagAddr,
				headers: {'Content-type': 'application/json'}
					
			}).success(function(data) {
				
				
				var tagValue = data.value;					
				var selectedD3 = d3.select("#"+tagID);
				var animateType = point.animateType;
				
				//var animate = selectedD3.attr('animate');	
										
				if (animateType != null){
					
					try {
						eval("$scope.eventPoint."+animateType+"(selectedD3, tagValue);");
					}
					catch(err) {
					   console.log(err);
					}
					
				} else {
					//selectedD3.text(tagValue);
				}
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
			
			
			/*
			var event = selectedD3.attr('event');
			//console.log("event : " + event);			
			if (event != null){				
				eval("$scope.eventPoint."+event+"(selectedD3, tagValue);");
			} else {
				selectedD3.text(tagValue);
			}			
			*/
			
		}
		
		
		$scope.eventPoint = {
			
			//changeText : // 태그값 출력하기
			//chageColor : // 디지털 색 변경
			//chageImage : // 디지털 이미지 변경
			
			onValues : ["Active", "true", "on", "1", "1.0", "ON"],
				
			changeText : function(selectedD3, tagValue) {
				selectedD3.text(tagValue);
				return;
			},
			
			changeColor : function(selectedD3, tagValue) {				
				//console.log("tagValue : " + tagValue);
				//console.log($scope.eventPoint.onValues.indexOf(tagValue));				
				if ($scope.eventPoint.onValues.indexOf(tagValue) > -1) {
					selectedD3.attr("fill", "red");
				} else {
					selectedD3.attr("fill", "blue");
				}
				return;
			},
			
			changeImage : function(selectedD3, tagValue) {
				
				var imageObject = [];				
				selectedD3.selectAll("image").each(function() {						
					//console.log(d3.select(this));
					imageObject.push(d3.select(this));					
				});
				
				if ($scope.eventPoint.onValues.indexOf(tagValue) > -1) {
					imageObject[0].style("visibility", "visible");
					imageObject[1].style("visibility", "hidden");
					imageObject[2].style("visibility", "hidden");					
				} else {					
					imageObject[0].style("visibility", "hidden");
					imageObject[1].style("visibility", "visible");
					imageObject[2].style("visibility", "hidden");
				}
				
				return;
			}
			
		}
		
	}

	angular.module('singApp.graphic-tagMonitor2').controller('graphicTagMonitor2Controller', graphicTagMonitor2Controller);

})();
