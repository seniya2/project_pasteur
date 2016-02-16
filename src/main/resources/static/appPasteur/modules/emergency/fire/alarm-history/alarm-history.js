(function() {
  'use strict';

  	fireHistoryModelController.$inject = ['config', '$scope', '$resource', '$http', '$location', '$filter', '$timeout', 'usSpinnerService', '$compile','$sce' ];
    function fireHistoryModelController (config, $scope, $resource, $http, $location, $filter, $timeout, usSpinnerService, $compile, $sce) {
    	
    	var search = $location.search();
    	var s_page = search.page || 0;
		var s_size = search.size || 9999;
		var s_sort = search.sort || 'id,desc';
		
		$scope.template_base = "appPasteur/modules/emergency/fire/alarm-history/";
		$scope.resources_base = "appPasteur/modules/emergency/fire/point-manage/resources/";
		$scope.categoryName = "fire";
		$scope.alarmEntity = "alarmFire";
		$scope.baseUiUrl = config.settings.network.ui;
		$scope.baseRestUrl = config.settings.network.rest;	
		$scope.baseXdUrl = config.settings.network.xd;
		$scope.alarmUrl = $scope.baseRestUrl + $scope.alarmEntity;
		$scope.listUrl = config.settings.network.rest+$scope.alarmEntity;
		$scope.listUrlXd = $scope.baseXdUrl+"history/"+$scope.categoryName+"/";
		
		//console.log("listUrl : " + $scope.listUrl);		
		
		$scope.pointList = null;
		$scope.dataList = new Array();
		$scope.page = null;
		$scope.pageLinks = null;
		$scope.sortAttr = "id";
		$scope.sortOder = "desc";
		$scope.orderProperty = "-no";							
		$scope.currentPath = $location.path();
		$scope.currentPoint = {"tagID" : undefined};
		$scope.alarmList = new HashMap();
		$scope.alarmEventLog = new HashMap();
		
		$scope.searchName = "";
		$scope.searchDate1 = "";
		$scope.searchDate2 = "";
		
		$scope.searchDate1_error = false;
		$scope.searchDate2_error = false;
		
		$scope.listShow = false;
		
		
		Messenger.options = {
    		    extraClasses: 'messenger-fixed messenger-on-top',
    		    theme: 'air'
		}
		

		$scope.$watch('searchDate1', function() {		
			if ($scope.searchDate1.length > 0){				
				$scope.searchDate1_error = false;
			}
		});
		$scope.$watch('searchDate2', function() {		
			if ($scope.searchDate2.length > 0){				
				$scope.searchDate2_error = false;
			}
		});
		
		
	    $scope.prepareAction = function() {
	    	
	    	$scope.searchNo_error = false;
			$scope.searchDate1_error = false;
			$scope.searchDate2_error = false;
			
			usSpinnerService.spin('app-spinner-hah');
			$scope.dataList = {};
			$scope.page = null;
			$scope.alarmEventLog = "";
			
			$http({
				method : 'GET',
				url : $scope.alarmUrl+"?sort="+s_sort,
				headers: {'Content-type': 'application/json'}					
			}).success(function(data) {
				var dataList = null;
				eval("dataList = data._embedded."+$scope.alarmEntity);
				
				var tagID = "";
				var tagName = "";
				var alarmName = "";
				var condition = "";
				var alarmNo = 0;
				
				for (var key in dataList) {
					//console.log(dataList[key]);
					alarmNo=dataList[key].no;
					tagName=dataList[key].tagID.split(":")[0];
					tagID=dataList[key].tagID.split(":")[1];
					alarmName=dataList[key].condition.split(":")[0];
					condition=dataList[key].condition.split(":")[1];
					
					$scope.alarmList.set(alarmNo, {
						"alarmNo" : alarmNo,
						"tagID" : tagID,
						"tagName" : tagName,
						"alarmName" :alarmName,
						"condition" :condition
					}); 
					
				}
				$timeout(function(){usSpinnerService.stop('app-spinner-hah')}, 1000);
				console.log($scope.alarmList);
				//console.log($scope.alarmList.values());
				
			}).error(function(error) {
				// $scope.widgetsError = error;
			});
			
			//console.log($scope.alarmList.get("TAG_2001_0_21"));
			
			$("#searchDate1").on("dp.change", function (e) {
	            $('#searchDate2').data("DateTimePicker").minDate(e.date);
	        });
	        $("#searchDate2").on("dp.change", function (e) {
	            $('#searchDate1').data("DateTimePicker").maxDate(e.date);
	        });
			
		}
		
	    
		$scope.searchNameFormSubmit = function(valid){			
			console.log("--> Submitting form valid : " + valid);
			
			if (!valid) {
				return;
			}
			
			var searchDate1 = document.getElementById("searchDate1");
			var searchDate2 = document.getElementById("searchDate2");
			$scope.searchDate1 = searchDate1.value;
			$scope.searchDate2 = searchDate2.value;
			
			var errCnt = 0;	
			
			if (angular.isUndefined($scope.searchDate1) || $scope.searchDate1 == "") {
				$scope.searchDate1_error=true;
				errCnt++;
			}
			if (angular.isUndefined($scope.searchDate2) || $scope.searchDate2 == "") {
				$scope.searchDate2_error=true;
				errCnt++;
			}
			
			if (errCnt>0) {
				return;
			}
			
			$scope.searchName = $scope.alarmList.get(1).tagID;
			$scope.searchDate1 = String($scope.searchDate1).substring(0, 10);
			$scope.searchDate2 = String($scope.searchDate2).substring(0, 10);
			$scope.searchDate1 = $scope.searchDate1 + " 00:00:01";
			$scope.searchDate2 = $scope.searchDate2 + " 23:59:59";
			
			$scope.listAction(0);
		}
		
		
		
		$scope.listAction = function(pageNumber) {

			var tagID = String($scope.searchName).replace("TAG_", "");	
			var sort = $scope.sortAttr + "," + $scope.sortOder;
			var listUrl = $scope.listUrlXd + tagID + '?page=' + pageNumber + '&size=' + s_size +"&sort="+sort
						+ '&min='+$scope.searchDate1 + '&max='+$scope.searchDate2 
			
			
			console.log("listUrl : " + listUrl);

			$http(
					{
						method : 'GET',
						url : listUrl
					}).success(function(data) {

						console.log(data);
						
				var newData = {
						'id' : null,
						'value' : null,
						'datatime' : null,
						'alarmName' : null
				};
				var dataList = new Array();
				var alarm = $scope.alarmList.get(1);
				var alarmName = alarm.alarmName;
				var condition = alarm.condition;
				var old_val = undefined;
				
				for (var key in data.content) {
					
					newData = data.content[key];
					newData.alarmName = alarmName;
					var val = data.content[key].value;
					if (key != 0) {
						old_val = data.content[key-1].value;
					}
					
					eval("if ("+condition+") {dataList.push(newData);}");	
				}
				
				$scope.dataList = dataList;
				//console.log($scope.dataList);
								
				var page = {
						size : data.size,
						totalPage : data.totalPages,
						totalElements : data.totalElements,
						number : data.number
				}
				
				$scope.page = page;
				
				
				console.log("data.totalElements : " + data.totalElements);
				
				if (data.totalElements == 0) {
					$scope.dataList = new Array();
				}
				
				console.log("$scope.dataList.length : " + $scope.dataList.length);
				// $scope.widgets = data.content;
				// $scope.page = data.page;
				// $scope.sort = sort;
			}).error(function(error) {
				// $scope.widgetsError = error;
			});

		}

		
		$scope.getSortClass = function(attr) {
			if ($scope.sortAttr != attr) {
				return "sorting";
			}
			if ($scope.sortOder == "desc") {
				return "sorting_desc";
			} else {
				return "sorting_asc";
			}
		}
		
		$scope.sortAction = function(attr) {
			
			if ($scope.sortAttr != attr) {
				$scope.sortOder = "desc"
				$scope.sortAttr = attr;
			} else {
				if ($scope.sortOder == "desc") {
					$scope.sortOder = "asc"
				} else {
					$scope.sortOder = "desc"
				}
			}
			
			$scope.listAction($scope.page.number, $scope.page.size);
			
		}
		
		$scope.alarmCheck = function(key) {
			
			var key = key+1;
			var tagIDArray =[
"http://192.168.245.3:9898/reset/electric/4560_2_10"
,"http://192.168.245.3:9898/reset/electric/4560_2_100"
,"http://192.168.245.3:9898/reset/electric/4560_2_101"
,"http://192.168.245.3:9898/reset/electric/4560_2_102"
,"http://192.168.245.3:9898/reset/electric/4560_2_103"
,"http://192.168.245.3:9898/reset/electric/4560_2_104"
,"http://192.168.245.3:9898/reset/electric/4560_2_105"
,"http://192.168.245.3:9898/reset/electric/4560_2_106"
,"http://192.168.245.3:9898/reset/electric/4560_2_107"
,"http://192.168.245.3:9898/reset/electric/4560_2_108"
,"http://192.168.245.3:9898/reset/electric/4560_2_11"
,"http://192.168.245.3:9898/reset/electric/4560_2_119"
,"http://192.168.245.3:9898/reset/electric/4560_2_12"
,"http://192.168.245.3:9898/reset/electric/4560_2_120"
,"http://192.168.245.3:9898/reset/electric/4560_2_121"
,"http://192.168.245.3:9898/reset/electric/4560_2_122"
,"http://192.168.245.3:9898/reset/electric/4560_2_123"
,"http://192.168.245.3:9898/reset/electric/4560_2_124"
,"http://192.168.245.3:9898/reset/electric/4560_2_125"
,"http://192.168.245.3:9898/reset/electric/4560_2_126"
,"http://192.168.245.3:9898/reset/electric/4560_2_127"
,"http://192.168.245.3:9898/reset/electric/4560_2_13"
,"http://192.168.245.3:9898/reset/electric/4560_2_138"
,"http://192.168.245.3:9898/reset/electric/4560_2_139"
,"http://192.168.245.3:9898/reset/electric/4560_2_14"
,"http://192.168.245.3:9898/reset/electric/4560_2_140"
,"http://192.168.245.3:9898/reset/electric/4560_2_141"
,"http://192.168.245.3:9898/reset/electric/4560_2_142"
,"http://192.168.245.3:9898/reset/electric/4560_2_143"
,"http://192.168.245.3:9898/reset/electric/4560_2_144"
,"http://192.168.245.3:9898/reset/electric/4560_2_145"
,"http://192.168.245.3:9898/reset/electric/4560_2_146"
,"http://192.168.245.3:9898/reset/electric/4560_2_15"
,"http://192.168.245.3:9898/reset/electric/4560_2_157"
,"http://192.168.245.3:9898/reset/electric/4560_2_158"
,"http://192.168.245.3:9898/reset/electric/4560_2_159"
,"http://192.168.245.3:9898/reset/electric/4560_2_16"
,"http://192.168.245.3:9898/reset/electric/4560_2_160"
,"http://192.168.245.3:9898/reset/electric/4560_2_161"
,"http://192.168.245.3:9898/reset/electric/4560_2_162"
,"http://192.168.245.3:9898/reset/electric/4560_2_163"
,"http://192.168.245.3:9898/reset/electric/4560_2_164"
,"http://192.168.245.3:9898/reset/electric/4560_2_165"
,"http://192.168.245.3:9898/reset/electric/4560_2_17"
,"http://192.168.245.3:9898/reset/electric/4560_2_176"
,"http://192.168.245.3:9898/reset/electric/4560_2_177"
,"http://192.168.245.3:9898/reset/electric/4560_2_178"
,"http://192.168.245.3:9898/reset/electric/4560_2_179"
,"http://192.168.245.3:9898/reset/electric/4560_2_18"
,"http://192.168.245.3:9898/reset/electric/4560_2_180"
,"http://192.168.245.3:9898/reset/electric/4560_2_181"
,"http://192.168.245.3:9898/reset/electric/4560_2_182"
,"http://192.168.245.3:9898/reset/electric/4560_2_183"
,"http://192.168.245.3:9898/reset/electric/4560_2_184"
,"http://192.168.245.3:9898/reset/electric/4560_2_195"
,"http://192.168.245.3:9898/reset/electric/4560_2_196"
,"http://192.168.245.3:9898/reset/electric/4560_2_197"
,"http://192.168.245.3:9898/reset/electric/4560_2_198"
,"http://192.168.245.3:9898/reset/electric/4560_2_199"
,"http://192.168.245.3:9898/reset/electric/4560_2_200"
,"http://192.168.245.3:9898/reset/electric/4560_2_201"
,"http://192.168.245.3:9898/reset/electric/4560_2_202"
,"http://192.168.245.3:9898/reset/electric/4560_2_203"
,"http://192.168.245.3:9898/reset/electric/4560_2_218"
,"http://192.168.245.3:9898/reset/electric/4560_2_226"
,"http://192.168.245.3:9898/reset/electric/4560_2_234"
,"http://192.168.245.3:9898/reset/electric/4560_2_242"
,"http://192.168.245.3:9898/reset/electric/4560_2_252"
,"http://192.168.245.3:9898/reset/electric/4560_2_253"
,"http://192.168.245.3:9898/reset/electric/4560_2_254"
,"http://192.168.245.3:9898/reset/electric/4560_2_255"
,"http://192.168.245.3:9898/reset/electric/4560_2_256"
,"http://192.168.245.3:9898/reset/electric/4560_2_257"
,"http://192.168.245.3:9898/reset/electric/4560_2_258"
,"http://192.168.245.3:9898/reset/electric/4560_2_259"
,"http://192.168.245.3:9898/reset/electric/4560_2_260"
,"http://192.168.245.3:9898/reset/electric/4560_2_261"
,"http://192.168.245.3:9898/reset/electric/4560_2_262"
,"http://192.168.245.3:9898/reset/electric/4560_2_263"
,"http://192.168.245.3:9898/reset/electric/4560_2_264"
,"http://192.168.245.3:9898/reset/electric/4560_2_265"
,"http://192.168.245.3:9898/reset/electric/4560_2_266"
,"http://192.168.245.3:9898/reset/electric/4560_2_267"
,"http://192.168.245.3:9898/reset/electric/4560_2_268"
,"http://192.168.245.3:9898/reset/electric/4560_2_269"
,"http://192.168.245.3:9898/reset/electric/4560_2_270"
,"http://192.168.245.3:9898/reset/electric/4560_2_271"
,"http://192.168.245.3:9898/reset/electric/4560_2_272"
,"http://192.168.245.3:9898/reset/electric/4560_2_273"
,"http://192.168.245.3:9898/reset/electric/4560_2_274"
,"http://192.168.245.3:9898/reset/electric/4560_2_275"
,"http://192.168.245.3:9898/reset/electric/4560_2_276"
,"http://192.168.245.3:9898/reset/electric/4560_2_277"
,"http://192.168.245.3:9898/reset/electric/4560_2_278"
,"http://192.168.245.3:9898/reset/electric/4560_2_279"
,"http://192.168.245.3:9898/reset/electric/4560_2_28"
,"http://192.168.245.3:9898/reset/electric/4560_2_280"
,"http://192.168.245.3:9898/reset/electric/4560_2_281"
,"http://192.168.245.3:9898/reset/electric/4560_2_282"
,"http://192.168.245.3:9898/reset/electric/4560_2_283"
,"http://192.168.245.3:9898/reset/electric/4560_2_284"
,"http://192.168.245.3:9898/reset/electric/4560_2_285"
,"http://192.168.245.3:9898/reset/electric/4560_2_286"
,"http://192.168.245.3:9898/reset/electric/4560_2_287"
,"http://192.168.245.3:9898/reset/electric/4560_2_288"
,"http://192.168.245.3:9898/reset/electric/4560_2_289"
,"http://192.168.245.3:9898/reset/electric/4560_2_29"
,"http://192.168.245.3:9898/reset/electric/4560_2_290"
,"http://192.168.245.3:9898/reset/electric/4560_2_291"
,"http://192.168.245.3:9898/reset/electric/4560_2_292"
,"http://192.168.245.3:9898/reset/electric/4560_2_293"
,"http://192.168.245.3:9898/reset/electric/4560_2_294"
,"http://192.168.245.3:9898/reset/electric/4560_2_295"
,"http://192.168.245.3:9898/reset/electric/4560_2_296"
,"http://192.168.245.3:9898/reset/electric/4560_2_297"
,"http://192.168.245.3:9898/reset/electric/4560_2_298"
,"http://192.168.245.3:9898/reset/electric/4560_2_299"
,"http://192.168.245.3:9898/reset/electric/4560_2_30"
,"http://192.168.245.3:9898/reset/electric/4560_2_300"
,"http://192.168.245.3:9898/reset/electric/4560_2_301"
,"http://192.168.245.3:9898/reset/electric/4560_2_302"
,"http://192.168.245.3:9898/reset/electric/4560_2_303"
,"http://192.168.245.3:9898/reset/electric/4560_2_304"
,"http://192.168.245.3:9898/reset/electric/4560_2_305"
,"http://192.168.245.3:9898/reset/electric/4560_2_306"
,"http://192.168.245.3:9898/reset/electric/4560_2_307"
,"http://192.168.245.3:9898/reset/electric/4560_2_308"
,"http://192.168.245.3:9898/reset/electric/4560_2_309"
,"http://192.168.245.3:9898/reset/electric/4560_2_31"
,"http://192.168.245.3:9898/reset/electric/4560_2_310"
,"http://192.168.245.3:9898/reset/electric/4560_2_311"
,"http://192.168.245.3:9898/reset/electric/4560_2_312"
,"http://192.168.245.3:9898/reset/electric/4560_2_313"
,"http://192.168.245.3:9898/reset/electric/4560_2_314"
,"http://192.168.245.3:9898/reset/electric/4560_2_315"
,"http://192.168.245.3:9898/reset/electric/4560_2_316"
,"http://192.168.245.3:9898/reset/electric/4560_2_317"
,"http://192.168.245.3:9898/reset/electric/4560_2_318"
,"http://192.168.245.3:9898/reset/electric/4560_2_319"
,"http://192.168.245.3:9898/reset/electric/4560_2_32"
,"http://192.168.245.3:9898/reset/electric/4560_2_320"
,"http://192.168.245.3:9898/reset/electric/4560_2_321"
,"http://192.168.245.3:9898/reset/electric/4560_2_322"
,"http://192.168.245.3:9898/reset/electric/4560_2_323"
,"http://192.168.245.3:9898/reset/electric/4560_2_324"
,"http://192.168.245.3:9898/reset/electric/4560_2_325"
,"http://192.168.245.3:9898/reset/electric/4560_2_326"
,"http://192.168.245.3:9898/reset/electric/4560_2_327"
,"http://192.168.245.3:9898/reset/electric/4560_2_328"
,"http://192.168.245.3:9898/reset/electric/4560_2_329"
,"http://192.168.245.3:9898/reset/electric/4560_2_33"
,"http://192.168.245.3:9898/reset/electric/4560_2_330"
,"http://192.168.245.3:9898/reset/electric/4560_2_331"
,"http://192.168.245.3:9898/reset/electric/4560_2_332"
,"http://192.168.245.3:9898/reset/electric/4560_2_333"
,"http://192.168.245.3:9898/reset/electric/4560_2_334"
,"http://192.168.245.3:9898/reset/electric/4560_2_335"
,"http://192.168.245.3:9898/reset/electric/4560_2_336"
,"http://192.168.245.3:9898/reset/electric/4560_2_337"
,"http://192.168.245.3:9898/reset/electric/4560_2_338"
,"http://192.168.245.3:9898/reset/electric/4560_2_339"
,"http://192.168.245.3:9898/reset/electric/4560_2_34"
,"http://192.168.245.3:9898/reset/electric/4560_2_340"
,"http://192.168.245.3:9898/reset/electric/4560_2_341"
,"http://192.168.245.3:9898/reset/electric/4560_2_342"
,"http://192.168.245.3:9898/reset/electric/4560_2_343"
,"http://192.168.245.3:9898/reset/electric/4560_2_344"
,"http://192.168.245.3:9898/reset/electric/4560_2_345"
,"http://192.168.245.3:9898/reset/electric/4560_2_346"
,"http://192.168.245.3:9898/reset/electric/4560_2_347"
,"http://192.168.245.3:9898/reset/electric/4560_2_348"
,"http://192.168.245.3:9898/reset/electric/4560_2_349"
,"http://192.168.245.3:9898/reset/electric/4560_2_35"
,"http://192.168.245.3:9898/reset/electric/4560_2_350"
,"http://192.168.245.3:9898/reset/electric/4560_2_351"
,"http://192.168.245.3:9898/reset/electric/4560_2_352"
,"http://192.168.245.3:9898/reset/electric/4560_2_353"
,"http://192.168.245.3:9898/reset/electric/4560_2_354"
,"http://192.168.245.3:9898/reset/electric/4560_2_355"
,"http://192.168.245.3:9898/reset/electric/4560_2_356"
,"http://192.168.245.3:9898/reset/electric/4560_2_36"
,"http://192.168.245.3:9898/reset/electric/4560_2_46"
,"http://192.168.245.3:9898/reset/electric/4560_2_47"
,"http://192.168.245.3:9898/reset/electric/4560_2_48"
,"http://192.168.245.3:9898/reset/electric/4560_2_49"
,"http://192.168.245.3:9898/reset/electric/4560_2_50"
,"http://192.168.245.3:9898/reset/electric/4560_2_51"
,"http://192.168.245.3:9898/reset/electric/4560_2_52"
,"http://192.168.245.3:9898/reset/electric/4560_2_53"
,"http://192.168.245.3:9898/reset/electric/4560_2_54"
,"http://192.168.245.3:9898/reset/electric/4560_2_64"
,"http://192.168.245.3:9898/reset/electric/4560_2_65"
,"http://192.168.245.3:9898/reset/electric/4560_2_66"
,"http://192.168.245.3:9898/reset/electric/4560_2_67"
,"http://192.168.245.3:9898/reset/electric/4560_2_68"
,"http://192.168.245.3:9898/reset/electric/4560_2_69"
,"http://192.168.245.3:9898/reset/electric/4560_2_70"
,"http://192.168.245.3:9898/reset/electric/4560_2_71"
,"http://192.168.245.3:9898/reset/electric/4560_2_72"
,"http://192.168.245.3:9898/reset/electric/4560_2_82"
,"http://192.168.245.3:9898/reset/electric/4560_2_83"
,"http://192.168.245.3:9898/reset/electric/4560_2_84"
,"http://192.168.245.3:9898/reset/electric/4560_2_85"
,"http://192.168.245.3:9898/reset/electric/4560_2_86"
,"http://192.168.245.3:9898/reset/electric/4560_2_87"
,"http://192.168.245.3:9898/reset/electric/4560_2_88"
,"http://192.168.245.3:9898/reset/electric/4560_2_89"
,"http://192.168.245.3:9898/reset/electric/4560_2_90"
,"http://192.168.245.3:9898/reset/hvac/2001_0_23"
,"http://192.168.245.3:9898/reset/hvac/2001_0_21"
,"http://192.168.245.3:9898/reset/hvac/2002_0_4"
,"http://192.168.245.3:9898/reset/hvac/2002_0_5"
,"http://192.168.245.3:9898/reset/hvac/2002_0_3"
,"http://192.168.245.3:9898/reset/hvac/2002_0_17"
,"http://192.168.245.3:9898/reset/hvac/2011_0_8"
,"http://192.168.245.3:9898/reset/hvac/2011_0_7"
,"http://192.168.245.3:9898/reset/hvac/2003_0_9"
,"http://192.168.245.3:9898/reset/hvac/2003_0_8"
,"http://192.168.245.3:9898/reset/hvac/2003_0_14"
,"http://192.168.245.3:9898/reset/hvac/2003_0_13"
,"http://192.168.245.3:9898/reset/hvac/2007_0_1"
,"http://192.168.245.3:9898/reset/hvac/2007_0_2"
,"http://192.168.245.3:9898/reset/hvac/2005_0_9"
,"http://192.168.245.3:9898/reset/hvac/2005_0_8"
,"http://192.168.245.3:9898/reset/hvac/2001_2_34"
,"http://192.168.245.3:9898/reset/hvac/2001_0_36"
,"http://192.168.245.3:9898/reset/hvac/2002_2_2"
,"http://192.168.245.3:9898/reset/hvac/2002_0_15"
,"http://192.168.245.3:9898/reset/hvac/2001_2_29"
,"http://192.168.245.3:9898/reset/hvac/2001_0_37"
,"http://192.168.245.3:9898/reset/hvac/2001_2_30"
,"http://192.168.245.3:9898/reset/hvac/2001_0_34"
,"http://192.168.245.3:9898/reset/hvac/2001_2_33"
,"http://192.168.245.3:9898/reset/hvac/2001_2_32"
,"http://192.168.245.3:9898/reset/hvac/2001_2_31"
,"http://192.168.245.3:9898/reset/hvac/2001_0_35"
,"http://192.168.245.3:9898/reset/hvac/2002_2_1"
,"http://192.168.245.3:9898/reset/hvac/2002_0_16"
,"http://192.168.245.3:9898/reset/hvac/2003_2_12"
,"http://192.168.245.3:9898/reset/hvac/2003_0_16"
,"http://192.168.245.3:9898/reset/hvac/2003_2_8"
,"http://192.168.245.3:9898/reset/hvac/2003_0_15"
,"http://192.168.245.3:9898/reset/hvac/2004_2_9"
,"http://192.168.245.3:9898/reset/hvac/2004_0_15"
,"http://192.168.245.3:9898/reset/hvac/2004_2_10"
,"http://192.168.245.3:9898/reset/hvac/2004_0_16"
,"http://192.168.245.3:9898/reset/hvac/2004_2_8"
,"http://192.168.245.3:9898/reset/hvac/2004_0_17"
,"http://192.168.245.3:9898/reset/hvac/2005_2_8"
,"http://192.168.245.3:9898/reset/hvac/2005_0_14"
,"http://192.168.245.3:9898/reset/hvac/2006_2_10"
,"http://192.168.245.3:9898/reset/hvac/2006_0_12"
,"http://192.168.245.3:9898/reset/hvac/2006_2_11"
,"http://192.168.245.3:9898/reset/hvac/2006_0_13"
,"http://192.168.245.3:9898/reset/hvac/2006_2_9"
,"http://192.168.245.3:9898/reset/hvac/2006_0_14"
,"http://192.168.245.3:9898/reset/hvac/2005_2_9"
,"http://192.168.245.3:9898/reset/hvac/2005_0_15"
,"http://192.168.245.3:9898/reset/hvac/2008_2_8"
,"http://192.168.245.3:9898/reset/hvac/2008_0_12"
,"http://192.168.245.3:9898/reset/hvac/2008_2_9"
,"http://192.168.245.3:9898/reset/hvac/2008_0_13"
,"http://192.168.245.3:9898/reset/hvac/2008_2_10"
,"http://192.168.245.3:9898/reset/hvac/2008_0_14"
,"http://192.168.245.3:9898/reset/hvac/2007_2_12"
,"http://192.168.245.3:9898/reset/hvac/2007_0_13"
,"http://192.168.245.3:9898/reset/hvac/2010_2_22"
,"http://192.168.245.3:9898/reset/hvac/2010_0_15"
,"http://192.168.245.3:9898/reset/hvac/2010_2_23"
,"http://192.168.245.3:9898/reset/hvac/2010_0_16"
,"http://192.168.245.3:9898/reset/hvac/2010_2_24"
,"http://192.168.245.3:9898/reset/hvac/2010_0_17"
,"http://192.168.245.3:9898/reset/hvac/2009_2_15"
,"http://192.168.245.3:9898/reset/hvac/2009_0_15"
,"http://192.168.245.3:9898/reset/hvac/2010_0_18"
,"http://192.168.245.3:9898/reset/hvac/2009_2_8"
,"http://192.168.245.3:9898/reset/hvac/2009_2_10"
,"http://192.168.245.3:9898/reset/hvac/2009_2_9"
,"http://192.168.245.3:9898/reset/hvac/2010_2_18"
,"http://192.168.245.3:9898/reset/hvac/2010_2_8"
,"http://192.168.245.3:9898/reset/hvac/2010_2_11"
,"http://192.168.245.3:9898/reset/hvac/2010_2_9"
,"http://192.168.245.3:9898/reset/hvac/2010_2_12"
,"http://192.168.245.3:9898/reset/hvac/2010_2_10"
,"http://192.168.245.3:9898/reset/hvac/2010_2_13"
,"http://192.168.245.3:9898/reset/hvac/2011_2_8"
,"http://192.168.245.3:9898/reset/hvac/2011_0_6"
,"http://192.168.245.3:9898/reset/hvac/2013_2_8"
,"http://192.168.245.3:9898/reset/hvac/2013_0_5"
,"http://192.168.245.3:9898/reset/hvac/2001_0_13"
,"http://192.168.245.3:9898/reset/hvac/2001_2_24"
,"http://192.168.245.3:9898/reset/hvac/2001_0_11"
,"http://192.168.245.3:9898/reset/hvac/2001_0_12"
,"http://192.168.245.3:9898/reset/hvac/2001_0_14"
,"http://192.168.245.3:9898/reset/hvac/2001_0_32"
,"http://192.168.245.3:9898/reset/hvac/2001_2_14"
,"http://192.168.245.3:9898/reset/hvac/2001_0_31"
,"http://192.168.245.3:9898/reset/hvac/2001_2_16"
,"http://192.168.245.3:9898/reset/hvac/2001_0_33"
,"http://192.168.245.3:9898/reset/hvac/2001_0_17"
,"http://192.168.245.3:9898/reset/hvac/2001_0_15"
,"http://192.168.245.3:9898/reset/hvac/2001_0_16"
,"http://192.168.245.3:9898/reset/hvac/2001_0_18"
,"http://192.168.245.3:9898/reset/hvac/2001_2_18"
,"http://192.168.245.3:9898/reset/hvac/2001_2_20"
,"http://192.168.245.3:9898/reset/hvac/2002_0_13"
,"http://192.168.245.3:9898/reset/hvac/2002_0_14"
,"http://192.168.245.3:9898/reset/hvac/2001_2_6"
,"http://192.168.245.3:9898/reset/hvac/2001_2_5"
,"http://192.168.245.3:9898/reset/hvac/2002_0_7"
,"http://192.168.245.3:9898/reset/hvac/2002_0_2"
,"http://192.168.245.3:9898/reset/hvac/2002_0_1"
,"http://192.168.245.3:9898/reset/hvac/2001_0_26"
,"http://192.168.245.3:9898/reset/hvac/2001_0_25"
,"http://192.168.245.3:9898/reset/hvac/2001_2_39"
,"http://192.168.245.3:9898/reset/hvac/2001_2_38"
,"http://192.168.245.3:9898/reset/hvac/2001_0_29"
,"http://192.168.245.3:9898/reset/hvac/2001_0_28"
,"http://192.168.245.3:9898/reset/hvac/2001_0_27"
,"http://192.168.245.3:9898/reset/hvac/2003_0_4"
,"http://192.168.245.3:9898/reset/hvac/2003_0_1"
,"http://192.168.245.3:9898/reset/hvac/2003_2_6"
,"http://192.168.245.3:9898/reset/hvac/2003_2_5"
,"http://192.168.245.3:9898/reset/hvac/2003_0_3"
,"http://192.168.245.3:9898/reset/hvac/2003_0_5"
,"http://192.168.245.3:9898/reset/hvac/2003_0_2"
,"http://192.168.245.3:9898/reset/hvac/2004_0_4"
,"http://192.168.245.3:9898/reset/hvac/2004_0_1"
,"http://192.168.245.3:9898/reset/hvac/2004_2_6"
,"http://192.168.245.3:9898/reset/hvac/2004_2_5"
,"http://192.168.245.3:9898/reset/hvac/2004_0_3"
,"http://192.168.245.3:9898/reset/hvac/2004_0_5"
,"http://192.168.245.3:9898/reset/hvac/2004_0_2"
,"http://192.168.245.3:9898/reset/hvac/2005_0_4"
,"http://192.168.245.3:9898/reset/hvac/2005_0_1"
,"http://192.168.245.3:9898/reset/hvac/2005_2_6"
,"http://192.168.245.3:9898/reset/hvac/2005_2_5"
,"http://192.168.245.3:9898/reset/hvac/2005_0_3"
,"http://192.168.245.3:9898/reset/hvac/2005_0_5"
,"http://192.168.245.3:9898/reset/hvac/2005_0_2"
,"http://192.168.245.3:9898/reset/hvac/2006_0_3"
,"http://192.168.245.3:9898/reset/hvac/2006_0_1"
,"http://192.168.245.3:9898/reset/hvac/2006_2_7"
,"http://192.168.245.3:9898/reset/hvac/2006_2_6"
,"http://192.168.245.3:9898/reset/hvac/2006_2_16"
,"http://192.168.245.3:9898/reset/hvac/2006_0_2"
,"http://192.168.245.3:9898/reset/hvac/2006_2_8"
,"http://192.168.245.3:9898/reset/hvac/2007_0_6"
,"http://192.168.245.3:9898/reset/hvac/2007_0_3"
,"http://192.168.245.3:9898/reset/hvac/2007_2_6"
,"http://192.168.245.3:9898/reset/hvac/2007_2_5"
,"http://192.168.245.3:9898/reset/hvac/2007_0_5"
,"http://192.168.245.3:9898/reset/hvac/2007_0_7"
,"http://192.168.245.3:9898/reset/hvac/2007_0_4"
,"http://192.168.245.3:9898/reset/hvac/2008_0_3"
,"http://192.168.245.3:9898/reset/hvac/2008_0_1"
,"http://192.168.245.3:9898/reset/hvac/2008_2_7"
,"http://192.168.245.3:9898/reset/hvac/2008_2_6"
,"http://192.168.245.3:9898/reset/hvac/2008_2_13"
,"http://192.168.245.3:9898/reset/hvac/2008_0_2"
,"http://192.168.245.3:9898/reset/hvac/2009_0_4"
,"http://192.168.245.3:9898/reset/hvac/2009_0_1"
,"http://192.168.245.3:9898/reset/hvac/2009_2_6"
,"http://192.168.245.3:9898/reset/hvac/2009_2_5"
,"http://192.168.245.3:9898/reset/hvac/2009_0_3"
,"http://192.168.245.3:9898/reset/hvac/2009_0_5"
,"http://192.168.245.3:9898/reset/hvac/2009_0_2"
,"http://192.168.245.3:9898/reset/hvac/2010_0_4"
,"http://192.168.245.3:9898/reset/hvac/2010_0_1"
,"http://192.168.245.3:9898/reset/hvac/2010_2_6"
,"http://192.168.245.3:9898/reset/hvac/2010_2_5"
,"http://192.168.245.3:9898/reset/hvac/2010_0_3"
,"http://192.168.245.3:9898/reset/hvac/2010_0_5"
,"http://192.168.245.3:9898/reset/hvac/2010_0_2"
,"http://192.168.245.3:9898/reset/hvac/2011_0_1"
,"http://192.168.245.3:9898/reset/hvac/2011_2_6"
,"http://192.168.245.3:9898/reset/hvac/2011_2_5"
,"http://192.168.245.3:9898/reset/hvac/2011_5_17"
,"http://192.168.245.3:9898/reset/hvac/2011_0_3"
,"http://192.168.245.3:9898/reset/hvac/2011_0_2"
,"http://192.168.245.3:9898/reset/hvac/2013_0_1"
,"http://192.168.245.3:9898/reset/hvac/2013_2_6"
,"http://192.168.245.3:9898/reset/hvac/2013_2_5"
,"http://192.168.245.3:9898/reset/hvac/2013_5_10"
,"http://192.168.245.3:9898/reset/hvac/2013_0_3"
,"http://192.168.245.3:9898/reset/hvac/2013_0_4"
,"http://192.168.245.3:9898/reset/hvac/2013_0_2"
,"http://192.168.245.3:9898/reset/hvac/2012_0_1"
,"http://192.168.245.3:9898/reset/hvac/2012_2_6"
,"http://192.168.245.3:9898/reset/hvac/2012_2_5"
,"http://192.168.245.3:9898/reset/hvac/2012_5_7"
,"http://192.168.245.3:9898/reset/hvac/2012_2_8"
,"http://192.168.245.3:9898/reset/hvac/2012_0_3"
,"http://192.168.245.3:9898/reset/hvac/2012_0_2"
,"http://192.168.245.3:9898/reset/hvac/2011_0_4"
,"http://192.168.245.3:9898/reset/hvac/2011_2_14"
,"http://192.168.245.3:9898/reset/hvac/2011_2_13"
,"http://192.168.245.3:9898/reset/hvac/2011_2_19"
,"http://192.168.245.3:9898/reset/hvac/2011_0_5"
,"http://192.168.245.3:9898/reset/hvac/2001_0_7"
,"http://192.168.245.3:9898/reset/hvac/2001_2_8"
,"http://192.168.245.3:9898/reset/hvac/2001_2_9"
,"http://192.168.245.3:9898/reset/hvac/2001_0_8"
,"http://192.168.245.3:9898/reset/hvac/2001_2_10"
,"http://192.168.245.3:9898/reset/hvac/2001_2_11"
,"http://192.168.245.3:9898/reset/hvac/2001_0_9"
,"http://192.168.245.3:9898/reset/hvac/2001_2_12"
,"http://192.168.245.3:9898/reset/hvac/2001_2_13"
,"http://192.168.245.3:9898/reset/hvac/2001_0_10"
,"http://192.168.245.3:9898/reset/hvac/2001_2_42"
,"http://192.168.245.3:9898/reset/hvac/2001_2_47"
,"http://192.168.245.3:9898/reset/hvac/2001_2_43"
,"http://192.168.245.3:9898/reset/hvac/2001_2_48"
,"http://192.168.245.3:9898/reset/hvac/2001_2_45"
,"http://192.168.245.3:9898/reset/hvac/2001_2_51"
,"http://192.168.245.3:9898/reset/hvac/2001_2_44"
,"http://192.168.245.3:9898/reset/hvac/2001_2_49"
,"http://192.168.245.3:9898/reset/hvac/2001_2_46"
,"http://192.168.245.3:9898/reset/hvac/2001_2_50"
,"http://192.168.245.3:9898/reset/hvac/2001_0_44"
,"http://192.168.245.3:9898/reset/hvac/2001_0_45"
,"http://192.168.245.3:9898/reset/hvac/2001_0_1"
,"http://192.168.245.3:9898/reset/hvac/2001_0_2"
,"http://192.168.245.3:9898/reset/hvac/2001_0_3"
,"http://192.168.245.3:9898/reset/hvac/2001_0_4"
,"http://192.168.245.3:9898/reset/hvac/2001_0_5"
,"http://192.168.245.3:9898/reset/hvac/2001_0_6"
,"http://192.168.245.3:9898/reset/hvac/2001_0_19"
,"http://192.168.245.3:9898/reset/hvac/2001_0_20"
,"http://192.168.245.3:9898/reset/elevator/1_mode"
,"http://192.168.245.3:9898/reset/elevator/2_mode"
,"http://192.168.245.3:9898/reset/elevator/3_mode"
,"http://192.168.245.3:9898/reset/elevator/4_mode"
,"http://192.168.245.3:9898/reset/hvac/2002_3_8"
,"http://192.168.245.3:9898/reset/hvac/2002_3_7"
,"http://192.168.245.3:9898/reset/hvac/2011_3_8"
,"http://192.168.245.3:9898/reset/hvac/2003_3_10"
,"http://192.168.245.3:9898/reset/hvac/2003_3_14"
,"http://192.168.245.3:9898/reset/hvac/2007_3_13"
,"http://192.168.245.3:9898/reset/hvac/2005_3_11"
,"http://192.168.245.3:9898/reset/hvac/2001_3_36"
,"http://192.168.245.3:9898/reset/hvac/2001_3_37"
,"http://192.168.245.3:9898/reset/hvac/2011_3_9"
,"http://192.168.245.3:9898/reset/hvac/2011_3_10"
,"http://192.168.245.3:9898/reset/hvac/2014_3_7"
,"http://192.168.245.3:9898/reset/hvac/2001_3_53"
,"http://192.168.245.3:9898/reset/hvac/2001_3_39"
,"http://192.168.245.3:9898/reset/hvac/2001_3_40"
,"http://192.168.245.3:9898/reset/hvac/2002_3_10"
,"http://192.168.245.3:9898/reset/hvac/2002_3_5"
,"http://192.168.245.3:9898/reset/hvac/2002_3_3"
,"http://192.168.245.3:9898/reset/hvac/2002_3_2"
,"http://192.168.245.3:9898/reset/hvac/2001_5_32"
,"http://192.168.245.3:9898/reset/hvac/2001_5_33"
,"http://192.168.245.3:9898/reset/hvac/2001_5_34"
,"http://192.168.245.3:9898/reset/hvac/2002_3_4"
,"http://192.168.245.3:9898/reset/hvac/2001_3_33"
,"http://192.168.245.3:9898/reset/hvac/2001_3_43"
,"http://192.168.245.3:9898/reset/hvac/2001_3_42"
,"http://192.168.245.3:9898/reset/hvac/2001_3_28"
,"http://192.168.245.3:9898/reset/hvac/2001_3_41"
,"http://192.168.245.3:9898/reset/hvac/2003_3_2"
,"http://192.168.245.3:9898/reset/hvac/2003_3_6"
,"http://192.168.245.3:9898/reset/hvac/2003_3_7"
,"http://192.168.245.3:9898/reset/hvac/2003_3_8"
,"http://192.168.245.3:9898/reset/hvac/2003_3_4"
,"http://192.168.245.3:9898/reset/hvac/2004_3_2"
,"http://192.168.245.3:9898/reset/hvac/2004_3_6"
,"http://192.168.245.3:9898/reset/hvac/2004_3_7"
,"http://192.168.245.3:9898/reset/hvac/2004_3_9"
,"http://192.168.245.3:9898/reset/hvac/2004_3_4"
,"http://192.168.245.3:9898/reset/hvac/2005_3_3"
,"http://192.168.245.3:9898/reset/hvac/2005_3_7"
,"http://192.168.245.3:9898/reset/hvac/2005_3_8"
,"http://192.168.245.3:9898/reset/hvac/2005_3_9"
,"http://192.168.245.3:9898/reset/hvac/2005_3_5"
,"http://192.168.245.3:9898/reset/hvac/2006_3_3"
,"http://192.168.245.3:9898/reset/hvac/2006_3_5"
,"http://192.168.245.3:9898/reset/hvac/2006_3_6"
,"http://192.168.245.3:9898/reset/hvac/2007_3_4"
,"http://192.168.245.3:9898/reset/hvac/2007_3_7"
,"http://192.168.245.3:9898/reset/hvac/2007_3_8"
,"http://192.168.245.3:9898/reset/hvac/2007_3_9"
,"http://192.168.245.3:9898/reset/hvac/2007_3_6"
,"http://192.168.245.3:9898/reset/hvac/2008_3_2"
,"http://192.168.245.3:9898/reset/hvac/2008_3_4"
,"http://192.168.245.3:9898/reset/hvac/2008_3_5"
,"http://192.168.245.3:9898/reset/hvac/2009_3_3"
,"http://192.168.245.3:9898/reset/hvac/2009_3_7"
,"http://192.168.245.3:9898/reset/hvac/2009_3_8"
,"http://192.168.245.3:9898/reset/hvac/2009_3_9"
,"http://192.168.245.3:9898/reset/hvac/2009_5_13"
,"http://192.168.245.3:9898/reset/hvac/2009_3_5"
,"http://192.168.245.3:9898/reset/hvac/2010_3_2"
,"http://192.168.245.3:9898/reset/hvac/2010_3_6"
,"http://192.168.245.3:9898/reset/hvac/2010_3_5"
,"http://192.168.245.3:9898/reset/hvac/2010_3_8"
,"http://192.168.245.3:9898/reset/hvac/2010_3_4"
,"http://192.168.245.3:9898/reset/hvac/2011_3_3"
,"http://192.168.245.3:9898/reset/hvac/2011_3_5"
,"http://192.168.245.3:9898/reset/hvac/2013_3_4"
,"http://192.168.245.3:9898/reset/hvac/2013_3_5"
,"http://192.168.245.3:9898/reset/hvac/2012_3_5"
,"http://192.168.245.3:9898/reset/hvac/2012_3_6"
,"http://192.168.245.3:9898/reset/hvac/2011_3_12"
,"http://192.168.245.3:9898/reset/hvac/2001_3_2"
,"http://192.168.245.3:9898/reset/hvac/2001_3_4"
,"http://192.168.245.3:9898/reset/hvac/2001_3_12"
,"http://192.168.245.3:9898/reset/hvac/2001_3_18"
,"http://192.168.245.3:9898/reset/hvac/2001_3_20"
,"http://192.168.245.3:9898/reset/hvac/2001_3_29"
,"http://192.168.245.3:9898/reset/hvac/2014_3_10"
,"http://192.168.245.3:9898/reset/hvac/2014_3_11"
,"http://192.168.245.3:9898/reset/hvac/2014_3_13"
,"http://192.168.245.3:9898/reset/hvac/2001_3_21"
,"http://192.168.245.3:9898/reset/hvac/2001_3_22"
,"http://192.168.245.3:9898/reset/hvac/2014_3_1"
,"http://192.168.245.3:9898/reset/hvac/2014_3_15"
,"http://192.168.245.3:9898/reset/hvac/2014_3_3"
,"http://192.168.245.3:9898/reset/hvac/2014_3_2"
,"http://192.168.245.3:9898/reset/hvac/2014_3_14"
,"http://192.168.245.3:9898/reset/hvac/2001_5_57"
,"http://192.168.245.3:9898/reset/hvac/2014_3_8"
,"http://192.168.245.3:9898/reset/hvac/2014_3_9"
,"http://192.168.245.3:9898/reset/hvac/2002_3_14"
,"http://192.168.245.3:9898/reset/hvac/2002_3_17"
,"http://192.168.245.3:9898/reset/hvac/2002_3_16"
,"http://192.168.245.3:9898/reset/electric/4560_5_10"
,"http://192.168.245.3:9898/reset/electric/4560_5_108"
,"http://192.168.245.3:9898/reset/electric/4560_5_109"
,"http://192.168.245.3:9898/reset/electric/4560_5_11"
,"http://192.168.245.3:9898/reset/electric/4560_5_110"
,"http://192.168.245.3:9898/reset/electric/4560_5_111"
,"http://192.168.245.3:9898/reset/electric/4560_5_112"
,"http://192.168.245.3:9898/reset/electric/4560_5_113"
,"http://192.168.245.3:9898/reset/electric/4560_5_114"
,"http://192.168.245.3:9898/reset/electric/4560_5_12"
,"http://192.168.245.3:9898/reset/electric/4560_5_121"
,"http://192.168.245.3:9898/reset/electric/4560_5_13"
,"http://192.168.245.3:9898/reset/electric/4560_5_137"
,"http://192.168.245.3:9898/reset/electric/4560_5_138"
,"http://192.168.245.3:9898/reset/electric/4560_5_139"
,"http://192.168.245.3:9898/reset/electric/4560_5_14"
,"http://192.168.245.3:9898/reset/electric/4560_5_140"
,"http://192.168.245.3:9898/reset/electric/4560_5_147"
,"http://192.168.245.3:9898/reset/electric/4560_5_15"
,"http://192.168.245.3:9898/reset/electric/4560_5_16"
,"http://192.168.245.3:9898/reset/electric/4560_5_162"
,"http://192.168.245.3:9898/reset/electric/4560_5_163"
,"http://192.168.245.3:9898/reset/electric/4560_5_164"
,"http://192.168.245.3:9898/reset/electric/4560_5_165"
,"http://192.168.245.3:9898/reset/electric/4560_5_166"
,"http://192.168.245.3:9898/reset/electric/4560_5_17"
,"http://192.168.245.3:9898/reset/electric/4560_5_173"
,"http://192.168.245.3:9898/reset/electric/4560_5_18"
,"http://192.168.245.3:9898/reset/electric/4560_5_182"
,"http://192.168.245.3:9898/reset/electric/4560_5_183"
,"http://192.168.245.3:9898/reset/electric/4560_5_187"
,"http://192.168.245.3:9898/reset/electric/4560_5_188"
,"http://192.168.245.3:9898/reset/electric/4560_5_189"
,"http://192.168.245.3:9898/reset/electric/4560_5_190"
,"http://192.168.245.3:9898/reset/electric/4560_5_191"
,"http://192.168.245.3:9898/reset/electric/4560_5_192"
,"http://192.168.245.3:9898/reset/electric/4560_5_199"
,"http://192.168.245.3:9898/reset/electric/4560_5_208"
,"http://192.168.245.3:9898/reset/electric/4560_5_215"
,"http://192.168.245.3:9898/reset/electric/4560_5_216"
,"http://192.168.245.3:9898/reset/electric/4560_5_217"
,"http://192.168.245.3:9898/reset/electric/4560_5_218"
,"http://192.168.245.3:9898/reset/electric/4560_5_225"
,"http://192.168.245.3:9898/reset/electric/4560_5_228"
,"http://192.168.245.3:9898/reset/electric/4560_5_232"
,"http://192.168.245.3:9898/reset/electric/4560_5_233"
,"http://192.168.245.3:9898/reset/electric/4560_5_234"
,"http://192.168.245.3:9898/reset/electric/4560_5_244"
,"http://192.168.245.3:9898/reset/electric/4560_5_247"
,"http://192.168.245.3:9898/reset/electric/4560_5_25"
,"http://192.168.245.3:9898/reset/electric/4560_5_258"
,"http://192.168.245.3:9898/reset/electric/4560_5_259"
,"http://192.168.245.3:9898/reset/electric/4560_5_264"
,"http://192.168.245.3:9898/reset/electric/4560_5_265"
,"http://192.168.245.3:9898/reset/electric/4560_5_266"
,"http://192.168.245.3:9898/reset/electric/4560_5_267"
,"http://192.168.245.3:9898/reset/electric/4560_5_278"
,"http://192.168.245.3:9898/reset/electric/4560_5_279"
,"http://192.168.245.3:9898/reset/electric/4560_5_280"
,"http://192.168.245.3:9898/reset/electric/4560_5_281"
,"http://192.168.245.3:9898/reset/electric/4560_5_292"
,"http://192.168.245.3:9898/reset/electric/4560_5_293"
,"http://192.168.245.3:9898/reset/electric/4560_5_294"
,"http://192.168.245.3:9898/reset/electric/4560_5_295"
,"http://192.168.245.3:9898/reset/electric/4560_5_309"
,"http://192.168.245.3:9898/reset/electric/4560_5_32"
,"http://192.168.245.3:9898/reset/electric/4560_5_33"
,"http://192.168.245.3:9898/reset/electric/4560_5_34"
,"http://192.168.245.3:9898/reset/electric/4560_5_35"
,"http://192.168.245.3:9898/reset/electric/4560_5_36"
,"http://192.168.245.3:9898/reset/electric/4560_5_37"
,"http://192.168.245.3:9898/reset/electric/4560_5_38"
,"http://192.168.245.3:9898/reset/electric/4560_5_51"
,"http://192.168.245.3:9898/reset/electric/4560_5_52"
,"http://192.168.245.3:9898/reset/electric/4560_5_53"
,"http://192.168.245.3:9898/reset/electric/4560_5_54"
,"http://192.168.245.3:9898/reset/electric/4560_5_55"
,"http://192.168.245.3:9898/reset/electric/4560_5_56"
,"http://192.168.245.3:9898/reset/electric/4560_5_57"
,"http://192.168.245.3:9898/reset/electric/4560_5_62"
,"http://192.168.245.3:9898/reset/electric/4560_5_70"
,"http://192.168.245.3:9898/reset/electric/4560_5_71"
,"http://192.168.245.3:9898/reset/electric/4560_5_72"
,"http://192.168.245.3:9898/reset/electric/4560_5_73"
,"http://192.168.245.3:9898/reset/electric/4560_5_74"
,"http://192.168.245.3:9898/reset/electric/4560_5_75"
,"http://192.168.245.3:9898/reset/electric/4560_5_76"
,"http://192.168.245.3:9898/reset/electric/4560_5_89"
,"http://192.168.245.3:9898/reset/electric/4560_5_90"
,"http://192.168.245.3:9898/reset/electric/4560_5_91"
,"http://192.168.245.3:9898/reset/electric/4560_5_92"
,"http://192.168.245.3:9898/reset/electric/4560_5_93"
,"http://192.168.245.3:9898/reset/electric/4560_5_94"
,"http://192.168.245.3:9898/reset/electric/4560_5_95"];
			
			
			if (key < tagIDArray.length) {
				
				var tagUrl = tagIDArray[key];
				
				$http(
						{
							method : 'POST',
							url : tagUrl,
							
						}).success(function(data) {
							console.log("tagUrl success: "+ tagUrl);
							
							$timeout(function(){
								$scope.alarmCheck(key);
							}, 200);
							
				}).error(function(error) {
					console.log("tagUrl error : "+ tagUrl);
					
					$timeout(function(){
						$scope.alarmCheck(key);
					}, 200);
				});
				
				
			}
			
			
		}
		
    }

    angular.module('singApp.fire-history').controller('fireHistoryModelController', fireHistoryModelController);

})();
