(function() {
  'use strict';

  	electricGraphController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService' ];
    function electricGraphController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService) {
	
    	var search = $location.search();
		var s_page = search.page || 0;
		var s_size = search.size || 12;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/energy/electric/graph-manage/";
		$scope.template = $scope.template_base + "graph-manage-list.html";
		$scope.entityNameForPoint = "pointHvac";
		$scope.entityName = "graphElectric";
		$scope.categoryName = "electric";		
		$scope.resources_base_point = "appPasteur/modules/energy/electric/point-manage/resources/";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.chartUrl = $scope.baseXdUrl+"recordChart/"+$scope.categoryName+"/";
		$scope.logUrl = $scope.baseXdUrl+"record/"+$scope.categoryName+"/";
		$scope.tagCsvUrl = $scope.baseUiUrl + $scope.resources_base_point + $scope.categoryName + ".csv";
		$scope.listUrlForPoint = config.settings.network.rest+$scope.entityNameForPoint;
		$scope.listUrl = config.settings.network.rest+$scope.entityName;
		$scope.searchUrl = config.settings.network.rest+$scope.entityName+"/search/findByTagIDsContains";		
		$scope.xdListUrl = $scope.baseXdUrl+"current/"+$scope.categoryName+"/";
				
		//console.log("listUrl : " + $scope.listUrl);		
		
$scope.logList = new HashMap();
		
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

		$scope.disableScreen = function(enable) {			
			if (enable) {
				config.globalDisable = true;
				usSpinnerService.spin('app-spinner');					
			} else {
				$timeout(function(){
					config.globalDisable = false;					
					usSpinnerService.stop('app-spinner');
				}, 500);
			}
		};
		
		$scope.massagePopup = function(msg, type) {			
			Messenger({
				extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
			}).post({
				  message: msg,
				  type: type,
				  showCloseButton: false
			});
		}
		
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
				valueType : "LAST",
				dateTime : $scope.currentDate,
				datetimepicker : $scope.currentDate,
				tagIDs : []
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
			
			usSpinnerService.spin("app-spinner");			
			$scope.xdListAction();
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
						//$scope.page.totalElements = $scope.graphList.length;
				//$scope.graphList = data._embedded.graphHvac;
						$scope.paginationDisplay = false;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
		}
		
		$scope.xdListAction = function() {
			$http(
					{
						method : 'GET',
						url : $scope.xdListUrl + '?size=2000&status=interval'
					}).success(function(data) {
						
						$scope.dataList = data.content;
						/*
						$scope.dataList = [];
						for (var key in data.content) {							
							var tagID = data.content[key].id;
							var interval = data.content[key].interval;
							var tagName = data.content[key].name;			
							
							if (interval > 0) {
								$scope.dataList.push(data.content[key]);
							}
						}
						*/
						$timeout(function(){usSpinnerService.stop('app-spinner')}, 1000);
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
			
			var dateTime = $scope.getCurrentDate();
			console.log("currentData.dateType : " +$scope.currentData.dateType);
			console.log("currentData.interval : " +$scope.currentData.interval);
			if ($scope.currentData.dateType == "s") {				
				if ($scope.currentData.interval == "HOUR") {
					dateTime = angular.element("#datetimepicker1").val() + " " + "00:00:01"
				} else if ($scope.currentData.interval == "DAY") {
					dateTime = angular.element("#datetimepicker2").val() + "-01" + " " + "00:00:01"
				} else if ($scope.currentData.interval == "MONTH") {
					dateTime = angular.element("#datetimepicker3").val() + "-01-01"+" " + "00:00:01"
				}				
			}
			$scope.currentData.dateTime = dateTime;
			
			
			var newData = $scope.currentData;
			
			//console.log("newData.tagIDs1 : " + newData.tagIDs);
			var newTagIDS = "";
			angular.forEach(newData.tagIDs, function(value, key) {				
				newTagIDS = newTagIDS + ","+ value;
			});
			
			newTagIDS = newTagIDS.substr(1,newTagIDS.length);
			newData.tagIDs = newTagIDS;
			//console.log("newData.tagIDs2 : " + newData.tagIDs);
			
			$scope.disableScreen(true);
			if (angular.isDefined($scope.currentData.no)) {	
				//$scope.resetXdRequest(newTagIDS, "updateAction", newData);
				$scope.updateAction(newData);
			}else {
				//$scope.resetXdRequest(newTagIDS, "createAction", newData);
				$scope.createAction(newData);
			}
			//$scope.createAction($scope.currentData);
			
			
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
				$scope.disableScreen(false);
				//console.log(data);
				//$scope.displayMode = "list";				
				$scope.template = $scope.template_base + "graph-manage-list.html";				
				$scope.listAction(0, 12);
				$scope.massagePopup("저장 되었습니다.", "success");
				
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";	
				$scope.listAction(0, 12);
				$scope.massagePopup("저장 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
		$scope.updateAction = function(point) {
			console.log("--> updateAction");
			console.log(point);
			$http({
				method : 'PUT',
				url : $scope.baseRestUrl + $scope.entityName + "/" + point.no,
				headers : {
					'Content-Type' : 'application/json; charset=UTF-8'
				},
				data : point
			}).success(function(data) {
				$scope.disableScreen(false);
				//console.log(data);
				$scope.template = $scope.template_base + "graph-manage-list.html";				
				$scope.listAction(0, 12);
				$scope.massagePopup("변경 되었습니다.", "success");
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";	
				$scope.listAction(0, 12);
				$scope.massagePopup("변경 실패", "error");
				// $scope.widgetsError = error;
			});
		}
		
				
		$scope.deleteAction = function(id) {
			$scope.disableScreen(true);
			$http({
				method : 'DELETE',
				url : $scope.baseRestUrl + $scope.entityName+'/' + id
			}).success(function(data) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";
				$scope.listAction(0, 12);
				$scope.massagePopup("삭제 되었습니다.", "success");
			}).error(function(error) {
				$scope.disableScreen(false);
				$scope.template = $scope.template_base + "graph-manage-list.html";
				$scope.listAction(0, 12);
				$scope.massagePopup("삭제 실패", "error");
			});
		}
		
		
		$scope.editAction = function(selectData) {
			console.log("--> editAction");
			usSpinnerService.spin('app-spinner');			
		
			if (selectData == null) {
				$scope.currentData = {
						subject : "",
						interval : "HOUR",
						dateType : "c",
						valueType : "LAST",
						dateTime : $scope.currentDate,
						datetimepicker : $scope.currentDate,
						tagIDs : []
				};
				
			} else {
				
				//console.log(selectData);		
				
				var tagIds=new Array();				
				var tagIDSArray = selectData.tagIDs.split(",");
				for (var key in tagIDSArray) {
					//console.log("tagIDSArray : " +tagIDSArray[key]);
					var tagIDOne = tagIDSArray[key];
					tagIds.push(tagIDOne);
				}
				
				console.log(tagIds);
				
				$scope.currentData = {
						no : selectData.no,
						subject : selectData.subject,
						interval : selectData.interval,
						dateType : selectData.dateType,
						valueType : selectData.valueType,
						dateTime : selectData.dateTime,
						datetimepicker : selectData.dateTime,
						tagIDs : tagIds
				};
				
				$scope.datetimepickerChange(selectData.interval);
				
			}
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
			$timeout(function(){				
				$scope.template = $scope.template_base + "graph-manage-edit.html";
				$scope.subject_error = false;
				$scope.tagIDs_error = false;
			}, 500);
		}
		
		$scope.viewAction = function(point) {
			console.log("--> viewAction ");
			
			usSpinnerService.spin("app-spinner");
			$scope.template = $scope.template_base + "graph-manage-view.html";
			
			$scope.logList = new HashMap();
			$scope.currentPoint = point;
			$scope.chartEnable = true;
			$scope.chartData = [];
			
			var subTitle = $scope.getPointDate($scope.currentPoint.dateType, $scope.currentPoint.dateTime);
			
			var datetime = $scope.currentPoint.dateTime;
			if ($scope.currentPoint.dateType == "c") {
				datetime = $scope.getCurrentDate();
			}
			
			//console.log("datetime : " + datetime);
			
			$scope.chartOptions.title.text = $scope.currentPoint.subject;
			$scope.chartOptions.caption.html = 
				'<small class="fw-bold">시간 단위 : '+$scope.currentPoint.interval
				+'<br /> Value 측정 : '+$scope.currentPoint.valueType+'</small>';
			$scope.chartOptions.subtitle.html = '<small>기준 시간 : '+subTitle+'</small>';
			
			var urlQurey = "?interval="+$scope.currentPoint.interval
							+"&calculation="+$scope.currentPoint.valueType
							+"&datetime="+datetime;
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
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
		}
		
		
		$scope.getLogData = function(pageNumber, tagIDReplace) {
			
			var sort = $scope.logList.get(tagIDReplace).sort.sortAttr + "," + $scope.logList.get(tagIDReplace).sort.sortOder;
			var size = $scope.logList.get(tagIDReplace).page.size;
			var interval = $scope.currentPoint.interval;
			var datetime = $scope.currentPoint.dateTime;
			if ($scope.currentPoint.dateType == "c") {
				datetime = $scope.getCurrentDate();
			}
			
			var listUrl = $scope.logUrl + tagIDReplace + '?page=' + pageNumber + '&size=' + size +"&sort="+sort
						+ '&interval='+interval + '&datetime='+datetime 
			
			//console.log("getLogData listUrl : " + listUrl);
						
			$http(
					{
						method : 'GET',
						url : listUrl
					}).success(function(data) {
						
						$scope.logList.get(tagIDReplace).content = data.content;
						console.log(data.content);
						
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
		
		
		$scope.cancelAction = function() {			
			console.log("--> cancelAction ");
			usSpinnerService.spin('app-spinner');
			
			$timeout(function(){				
				usSpinnerService.stop('app-spinner');
			}, 2000);
			
			$timeout(function(){				
				$scope.template = $scope.template_base + "graph-manage-list.html";
			}, 500);			
		}		
		
		$scope.pageChangeHandler = function(num) {
			if ($scope.page != null) {
				$scope.page.number = num;
				$scope.listAction(num - 1, $scope.page.size);
			}
		}
		
		$scope.logPageChangeHandler = function(num, tagID) {
			console.log(tagID);
			console.log(num);
			// $scope.pageNumber = num;
			if ($scope.logList.get(tagID).page != undefined) {
				$scope.logList.get(tagID).page.number = num;
				$scope.getLogData(num - 1, tagID);
			}
		}
		
		$scope.chageLogSectionClass = function (isFirst, li_id) {			
			if (isFirst) {				
				return "active";
			}
		}		
		
		$scope.logGetSortClass = function(attr,tagID) {			
			if ($scope.logList.get(tagID).sort.sortAttr != attr) {
				return "sorting";
			}
			if ($scope.logList.get(tagID).sort.sortOder == "desc") {
				return "sorting_desc";
			} else {
				return "sorting_asc";
			}			
		}
		
		$scope.logSortAction = function(attr,tagID) {
			
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
    
   

  angular.module('singApp.electric-graph-manage').controller('electricGraphController', electricGraphController);

})();
