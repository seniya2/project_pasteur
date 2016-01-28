(function() {
  'use strict';

  	hvacGraphViewController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService' ];
    function hvacGraphViewController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService) {
			
		$scope.template_base = "appPasteur/modules/energy/hvac/graph-view/";
		$scope.entityName = "graphHvac";
		$scope.categoryName = "hvac";		
		$scope.resources_base_point = "appPasteur/modules/energy/hvac/point-manage/resources/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.chartUrl = $scope.baseXdUrl+"chart/"+$scope.categoryName+"/";
		$scope.logUrl = $scope.baseXdUrl+"history/"+$scope.categoryName+"/";
		$scope.listUrl = config.settings.network.rest+$scope.entityName;
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByTagIDsContains";
		
		$scope.pointList = new HashMap();
		$scope.logList = new HashMap();
		$scope.dataList = null;
		$scope.chartEnable = false;
		$scope.searchName = "";
		$scope.searchName_error = false;		
				
		Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
		};
		
		$scope.currentDate = "";
		
		$scope.getCurrentDate = function() {
			var nowDate = new Date();			
			var nowDateStr = nowDate.toISOString();
			nowDateStr = nowDateStr.substr(0,19);
			nowDateStr = nowDateStr.replace("T"," ");
			return nowDateStr;			
		}
		
		$scope.setCurrentDate = function() {
			$scope.currentDate = $scope.getCurrentDate();
		}
		
		$scope.setCurrentDate();
		
		$scope.currentData = {
				subject : "",
				interval : "HOUR",
				dateType : "c",
				valueType : "MIN",
				dateTime : $scope.currentDate,
				datetimepicker : $scope.currentDate,
				tagIDs : []
		};
		
		$scope.chageLogSectionClass = function (isFirst, li_id) {			
			if (isFirst) {				
				return "active";
			}
		}		
		
		$scope.$watch('searchName', function() {	
			if ($scope.searchName.length > 0){				
				$scope.searchName_error = false;
			}
		});	
		
		$scope.searchNameFormSubmit = function(valid) {
			//console.log("searchNameFormSubmit valid : " + valid);			
			if (!valid) {
				return;
			}
			//console.log("searchName : " + $scope.searchName);	
			if (angular.isUndefined($scope.searchName) || $scope.searchName == "") {
				$scope.searchName_error = true;
				return;
			}			
			var pointNo = $scope.searchName;			
			var point = $scope.pointList.get(parseInt(pointNo));
			//console.log($scope.pointList);
			//console.log(point);
			$scope.viewAction(point);
			
		}
		
		
		$scope.getPointDate = function(dateType, dateTime) {
			if (dateType == "c") {
				return "현재시간";
			} else {
				return dateTime;
			}
		}
		
		
		$scope.getPointNames = function(tagIDs) {
			//console.log("getPointNames : " + tagIDs);
			var tagNames = "";
			var tagIDSArray = tagIDs.split(",");
			for (var key in tagIDSArray) {
				//console.log("tagIDSArray : " +tagIDSArray[key]);
				var tagName = tagIDSArray[key].split(":");
				tagNames = tagNames + ", " + tagName[0];
			}
			return tagNames.substr(1,tagNames.length);
		}
		
		
		$scope.prepareAction = function() {
			
			usSpinnerService.spin("app-spinner-hg");
			$scope.searchName_error = false;
			$scope.pointList = new HashMap();
			$scope.logList = new HashMap();
			
			$http({
				method : 'GET',
				url : $scope.listUrl+"?page=0&size=9999&sort=id,desc",
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				var dataList = null;
				eval("dataList = data._embedded."+$scope.entityName);
				$scope.dataList = dataList;				
				var no = null;
				var tagNames = "";
				for (var key in dataList){
					no = dataList[key].no;
					tagNames = $scope.getPointNames(dataList[key].tagIDs);
					dataList[key].tagNames = tagNames;
					$scope.pointList.set(no, dataList[key]);
					//console.log("key : " + key);
					//console.log("dataList[key] : " + dataList[key]);
					//console.log("$scope.pointList[key] : " + $scope.pointList[key]);					
				}
				usSpinnerService.stop('app-spinner-hg');
				//console.log("prepareAction -----");
				//console.log($scope.pointList);				
				//$scope.pointList = pointList;
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
		}
		
		$scope.viewAction = function(point) {
			
			console.log("viewAction --------------------------");
			//console.log(point);
			
			$scope.logList = new HashMap();
			$scope.currentPoint = point;
			$scope.chartEnable = true;
			$scope.chartData = [];
			
			var subTitle = $scope.getPointDate($scope.currentPoint.dateType, $scope.currentPoint.dateTime);
			
			$scope.chartOptions.title.text = $scope.currentPoint.subject;
			$scope.chartOptions.caption.html = 
				'<small class="fw-bold">시간 단위 : '+$scope.currentPoint.interval
				+'<br /> Value 측정 : '+$scope.currentPoint.valueType+'</small>';
			$scope.chartOptions.subtitle.html = '<small>기준 시간 : '+subTitle+'</small>';
			
			var urlQurey = "?interval="+$scope.currentPoint.interval
							+"&calculation="+$scope.currentPoint.valueType
							+"&datetime="+$scope.currentPoint.dateTime;
			var tagIDs = $scope.currentPoint.tagIDs.split(",");
			
			
			angular.forEach(tagIDs, function(value, key) {
				
				var splitValue = value.split(":");
				var tagName = splitValue[0];
				var tagID = splitValue[1];
				//console.log("tagName : " + tagName);
				//console.log("tagID : " + tagID);
				tagID = tagID.replace("TAG_","");
				tagID = tagID.replace("_clone","");	
				$scope.fetchData(tagName, tagID, urlQurey);
				
				$scope.logList.set(tagID,{
					"tagName" : tagName,
					"tagID" : tagID,
					"page" : {
						"size" : 10,
						"totalPage" : 0,
						"totalElements" : 0,
						"number" : 0
					},
					"sort" : {
						"sortAttr" : "id",
						"sortOder" : "desc",	
					},
					"content" : null
				});
				
			});
			
			
			var logListKeys = $scope.logList.keys();			
			for (var key in logListKeys) {
				//console.log($scope.logList.get(logListKeys[key]));
				$scope.getLogData(0,logListKeys[key]);
			} 
			
		}
		
		
		$scope.getLogData = function(pageNumber, tagIDReplace) {
			
			var sort = $scope.logList.get(tagIDReplace).sort.sortAttr + "," + $scope.logList.get(tagIDReplace).sort.sortOder;
			var size = $scope.logList.get(tagIDReplace).page.size;
			var interval = $scope.currentPoint.interval;
			var datetime = $scope.currentPoint.dateTime;
			
			var listUrl = $scope.logUrl + tagIDReplace + '?page=' + pageNumber + '&size=' + size +"&sort="+sort
						+ '&interval='+interval + '&datetime='+datetime 
			
			$http(
					{
						method : 'GET',
						url : listUrl
					}).success(function(data) {
						console.log($scope.logList.get(tagIDReplace).content);
						$scope.logList.get(tagIDReplace).content = data.content;
						
						var page = {
								"size" : 10,
								"totalPage" : data.totalPages,
								"totalElements" : data.totalElements,
								"number" : data.number+1
						}
						$scope.logList.get(tagIDReplace).page = page;
						//console.log($scope.logList.get(tagIDReplace).content);
						//$scope.logList = data.content;
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
						
		}
		
		
		$scope.getSortClass = function(attr,tagID) {			
			if ($scope.logList.get(tagID).sort.sortAttr != attr) {
				return "sorting";
			}
			if ($scope.logList.get(tagID).sort.sortOder == "desc") {
				return "sorting_desc";
			} else {
				return "sorting_asc";
			}			
		}
		
		$scope.sortAction = function(attr,tagID) {
			
			if ($scope.logList.get(tagID).sort.sortAttr != attr) {
				$scope.logList.get(tagID).sort.sortOder = "desc"
				$scope.logList.get(tagID).sort.sortAttr = attr;
			} else {
				if ($scope.logList.get(tagID).sort.sortOder == "desc") {
					$scope.logList.get(tagID).sort.sortOder = "asc"
				} else {
					$scope.logList.get(tagID).sort.sortOder = "desc"
				}
			}
			var num = $scope.logList.get(tagID).page.number
			$scope.getLogData(num - 1, tagID);
		}
		
		$scope.pageChangeHandler = function(num, tagID) {
			console.log(tagID);
			console.log(num);
			// $scope.pageNumber = num;
			$scope.logList.get(tagID).page.number = num;
			$scope.getLogData(num - 1, tagID);
		}
		
		$scope.fetchData = function(tagID, tagIDReplace, urlQurey) {
			
			//console.log("fetchData tagIDReplace:" +tagIDReplace);
			console.log("$scope.chartUrl+tagID+urlQurey : " + $scope.chartUrl+tagIDReplace+urlQurey);
			$http(
					{
						method : 'GET',
						url : $scope.chartUrl+tagIDReplace+urlQurey
					}).success(function(data) {	
						
						//console.log("fetch data.data : " + data.data);
						//console.log("fetch data.dataCount : " + data.dataCount);
						
						$scope.chartOptions.chart.xAxis.ticks = data.dataCount;
						
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
						
						$scope.chartData.push(chartDataSub);
						
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		

		
		$scope.chartOptions = {
	            chart: {
	                type: 'lineChart',
	                height: 450,
	                margin : {
	                    top: 20,
	                    right: 20,
	                    bottom: 40,
	                    left: 70
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
	                    axisLabel: 'Time',
	                    ticks:24
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
	        }
		
		
    }
    
   

  angular.module('singApp.hvac-graph-view').controller('hvacGraphViewController', hvacGraphViewController);

})();
