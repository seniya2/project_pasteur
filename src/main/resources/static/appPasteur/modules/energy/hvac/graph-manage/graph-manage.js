(function() {
  'use strict';

  	hvacGraphController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService' ];
    function hvacGraphController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService) {
	
		var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 2000;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/energy/hvac/graph-manage/";
		$scope.template = $scope.template_base + "graph-manage-list.html";
		$scope.entityNameForPoint = "pointHvac";
		$scope.entityName = "graphHvac";
		$scope.categoryName = "hvac";		
		$scope.resources_base_point = "appPasteur/modules/energy/hvac/point-manage/resources/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.chartUrl = $scope.baseXdUrl+"chart/"+$scope.categoryName+"/";
		$scope.tagCsvUrl = $scope.baseUiUrl + $scope.resources_base_point + $scope.categoryName + ".csv";
		$scope.listUrlForPoint = config.settings.network.rest+$scope.entityNameForPoint;
		$scope.listUrl = config.settings.network.rest+$scope.entityName;
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByTagIDsContains";
				
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.dataList = null;
		$scope.page = {
				"size" : 12,
				"totalPage" : 0,
				"totalElements" : 0,
				"number" : 0
			};
		$scope.paginationDisplay = true;
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.graphList = null;
		$scope.chartEnable = false;
		$scope.searchName = "";
				
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
		
		$scope.tagCsvConfig = {
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
					//$scope.tagList = results.data;
					//console.log($scope.tagList);
					$scope.dataList = results.data;						
					$timeout(function(){usSpinnerService.stop('app-spinner-hg')}, 1000);
					
				},
				error: undefined,
				download: true,
				skipEmptyLines: false,
				chunk: undefined,
				fastMode: undefined,
				beforeFirstChunk: undefined,
				withCredentials: undefined
		};
		
		$scope.$watch('currentData.subject', function() {
			//console.log("watch : " + $scope.currentData.subject);
			//console.log("watch : " + $scope.currentData.subject.length);			
			if ($scope.currentData.subject.length > 0){
				angular.element("#subject").removeClass("custom_input_text_error");
				$scope.subject_error = false;
			}
		});
		
		$scope.$watch('currentData.tagIDs', function() {
			//console.log("watch : " + $scope.currentData.tagIDs);
			//console.log("watch : " + $scope.currentData.tagIDs.length);			
			if ($scope.currentData.tagIDs.length > 0){
				//angular.element("#s2id_autogen1").parent().removeClass("custom_input_text_error");
				$scope.tagIDs_error = false;
			}
		});
		
		
		$scope.searchClickFn = function(){			
			console.log("--> searchClickFn ------------- ");
			var searchName = document.getElementById("searchName");
			$scope.searchName = searchName.value;
			
			console.log("searchName : " + $scope.searchName);
			
			if (angular.isUndefined($scope.searchName) || $scope.searchName == "") {
				$scope.listAction(0, 12);
				return;
			}
			$scope.searchAction($scope.searchName);
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
		
		$scope.datetimepickerView1=false;
		$scope.datetimepickerView2=false;
		$scope.datetimepickerView3=false;
		
		$scope.datetimepickerChange = function(type) {
			
			$scope.datetimepickerView1=false;
			$scope.datetimepickerView2=false;
			$scope.datetimepickerView3=false;
			
			$timeout(function () {
				
				if (type == "HOUR") {				
					$scope.datetimepickerView1=true;
					$scope.datetimepickerView2=false;
					$scope.datetimepickerView3=false;
				} else if (type == "DAY") {
					$scope.datetimepickerView1=false;
					$scope.datetimepickerView2=true;
					$scope.datetimepickerView3=false;
				} else if (type == "MONTH") {
					$scope.datetimepickerView1=false;
					$scope.datetimepickerView2=false;
					$scope.datetimepickerView3=true;
				}

			}, 300 , true );
			
			
		}; 
				
		
		$scope.prepareAction = function() {
			
			usSpinnerService.spin("app-spinner-hg");
			Papa.parse($scope.tagCsvUrl, $scope.tagCsvConfig);
			$scope.page = null;
			
		}
		
		
		$scope.searchAction = function(searchStr) {
			var sort = $scope.sortAttr + "," + $scope.sortOder;			
			searchStr = encodeURI(searchStr);
			
			$http(
					{
						method : 'GET',
						url : $scope.searchUrl + '?tagIDs='+searchStr
					}).success(function(data) {
						eval("$scope.graphList = data._embedded."+$scope.entityName);
						$scope.page = null;
				//$scope.graphList = data._embedded.graphHvac;
						$scope.paginationDisplay = false;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.listAction = function(pageNumber, size) {
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			$http(
					{
						method : 'GET',
						url : $scope.listUrl + '?page=' + pageNumber + '&size=' + size + '&sort='+sort
					}).success(function(data) {
						eval("$scope.graphList = data._embedded."+$scope.entityName);
						$scope.page = {
								"size" : data.page.size,
								"totalPage" : data.page.totalPages,
								"totalElements" : data.page.totalElements,
								"number" : data.page.number+1
						}
						$scope.paginationDisplay = true;
				//$scope.graphList = data._embedded.graphHvac;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
						
		$scope.formSubmit = function(valid) {
			console.log("--> Submitting form valid : " + valid);
			
			if (!valid) {
				return;
			}
			
			var errCnt = 0;
			
			var subject = document.getElementById("subject");
			$scope.currentData.subject = subject.value;
			
			if ($scope.currentData.subject == undefined || $scope.currentData.subject == ""){
				//console.log("$scope.currentData.subject : " + $scope.currentData.subject);
				//angular.element("#subject").addClass("custom_input_text_error");
				$scope.subject_error = true;
				errCnt++;
			}
			
			if ($scope.currentData.tagIDs == undefined || $scope.currentData.tagIDs == "" || $scope.currentData.tagIDs.length == 0){
				console.log("$scope.currentData.tagIDs : " + $scope.currentData.tagIDs);
				//angular.element("#s2id_autogen1").parent().addClass("custom_input_text_error");
				$scope.tagIDs_error = true;
				errCnt++;
			}	
						
			if (errCnt>0) {
				return;
			}
			
			var newData = $scope.currentData;
			
			//console.log("newData.tagIDs1 : " + newData.tagIDs);
			var newTagIDS = "";
			angular.forEach(newData.tagIDs, function(value, key) {				
				newTagIDS = newTagIDS + ","+ value;
			});
			
			newTagIDS = newTagIDS.substr(1,newTagIDS.length);
			newData.tagIDs = newTagIDS;
			//console.log("newData.tagIDs2 : " + newData.tagIDs);
			
			$scope.createAction($scope.currentData);
			
			
		}
		
		$scope.createAction = function(point) {
			console.log("--> createAction");
			console.log(point);
			$http({
				method : 'POST',
				url : $scope.baseRestUrl + $scope.entityName,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : point
			}).success(function(data) {
				//console.log(data);
				//$scope.displayMode = "list";				
				$scope.template = $scope.template_base + "graph-manage-list.html";				
				$scope.listAction(0, 12);

				Messenger().post({
					  message: '저장 되었습니다.',
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
				url : $scope.baseRestUrl + $scope.entityName+'/' + id
			}).success(function(data) {
				//console.log(data);
				$scope.template = $scope.template_base + "graph-manage-list.html";
				$scope.listAction(0, 12);
				
				Messenger().post({
					  message: '삭제 되었습니다.',
					  type: 'success',
					  showCloseButton: false
				});
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.viewAction = function(point) {
			$scope.currentPoint = point;
			$scope.template = $scope.template_base + "graph-manage-view.html";			
						
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
			});
		}
		
		$scope.editAction = function(point) {
			$scope.currentData = {
					subject : "",
					interval : "HOUR",
					dateType : "c",
					valueType : "MIN",
					dateTime : $scope.currentDate,
					datetimepicker : $scope.currentDate,
					tagIDs : []
			};
			$scope.chartEnable = false;
			$scope.template = $scope.template_base + "graph-manage-edit.html";
			$scope.subject_error = false;
			$scope.tagIDs_error = false;
		}
		
		$scope.cancelAction = function() {			
			//console.log("--> cancelAction displayMode : " + $scope.displayMode);
			$scope.template = $scope.template_base + "graph-manage-list.html";
		}
		
		$scope.previewAction = function() {
			
			var errCnt = 0;
			
			var subject = document.getElementById("subject");
			$scope.currentData.subject = subject.value;
			
			if ($scope.currentData.subject == undefined || $scope.currentData.subject == ""){
				//console.log("$scope.currentData.subject : " + $scope.currentData.subject);
				//angular.element("#subject").addClass("custom_input_text_error");
				$scope.subject_error = true;
				errCnt++;
			}
			
			if ($scope.currentData.tagIDs == undefined || $scope.currentData.tagIDs == "" || $scope.currentData.tagIDs.length == 0){
				console.log("$scope.currentData.tagIDs : " + $scope.currentData.tagIDs);
				//angular.element("#s2id_autogen1").parent().addClass("custom_input_text_error");
				$scope.tagIDs_error = true;
				errCnt++;
			}	
						
			if (errCnt>0) {
				return;
			}
			
			$scope.chartEnable = true;
			$scope.chartData = [];
			$scope.chartOptions.chart.xAxis.axisLabel = 'Time ('+$scope.currentData.interval+')';
			$scope.chartOptions.title.text = $scope.currentData.subject;
			
			var dateTime = $scope.getCurrentDate();
			console.log("currentData.dateType : " +$scope.currentData.dateType);
			console.log("currentData.interval : " +$scope.currentData.interval);
			if ($scope.currentData.dateType == "s") {
				
				if ($scope.currentData.interval == "HOUR") {
					dateTime = angular.element("#datetimepicker1").val() + " " + "01:00:00"
				} else if ($scope.currentData.interval == "DAY") {
					dateTime = angular.element("#datetimepicker2").val() + "-01" + " " + "01:00:00"
				} else if ($scope.currentData.interval == "MONTH") {
					dateTime = angular.element("#datetimepicker3").val() + "-01-01"+" " + "01:00:00"
				}
				
			}
			$scope.currentData.dateTime = dateTime;
			
			$scope.chartOptions.title.text = $scope.currentData.subject;
			$scope.chartOptions.caption.html = 
				'<small class="fw-bold">시간 단위 : '+$scope.currentData.interval
				+'<br /> Value 측정 : '+$scope.currentData.valueType+'</small>';
			$scope.chartOptions.subtitle.html = '<small>기준 시간 : '+$scope.currentData.dateTime+'</small>';
			
			var urlQurey = "?interval="+$scope.currentData.interval
							+"&calculation="+$scope.currentData.valueType
							+"&datetime="+$scope.currentData.dateTime;
			
			angular.forEach($scope.currentData.tagIDs, function(value, key) {
				
				var splitValue = value.split(":");
				var tagName = splitValue[0];
				var tagID = splitValue[1];
				//console.log("tagName : " + tagName);
				//console.log("tagID : " + tagID);
				tagID = tagID.replace("TAG_","");
				tagID = tagID.replace("_clone","");	
				//console.log(value);	
				$scope.fetchData(tagName, tagID, urlQurey);
			});
			
		}
					
		
		$scope.fetchData = function(tagID, tagIDReplace, urlQurey) {
			
			console.log("fetchData tagIDReplace:" +tagIDReplace);
			console.log("$scope.chartUrl+tagID+urlQurey : " + $scope.chartUrl+tagIDReplace+urlQurey);
			$http(
					{
						method : 'GET',
						url : $scope.chartUrl+tagIDReplace+urlQurey
					}).success(function(data) {	
						
						console.log("fetch data.data : " + data.data);
						console.log("fetch data.dataCount : " + data.dataCount);
						
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
	                height: 430,
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
		
		$scope.pageChangeHandler = function(num) {
			//console.log(tagID);
			//console.log(num);
			// $scope.pageNumber = num;
			$scope.page.number = num;
			$scope.listAction(num - 1, $scope.page.size);
		}
		
		
    }
    
   

  angular.module('singApp.hvac-graph-manage').controller('hvacGraphController', hvacGraphController);

})();
