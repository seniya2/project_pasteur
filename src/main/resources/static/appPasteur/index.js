(function() {
    'use strict';

    angular.module('singApp', [
	                               
        'singApp.core',
        'singApp.form.elements',
        
        'singApp.pasteur-dashboard',		
        
        'singApp.energy-graph',
		'singApp.energy-report',
		
		'singApp.energy-electric-point-manage',
		'singApp.electric-monitor',	
		'singApp.electric-history',	
		'singApp.electric-graph-manage',
		'singApp.electric-graph-view',
		'singApp.electric-alarm',
		
		'singApp.energy-hvac-point-manage',	
		'singApp.hvac-monitor',
		'singApp.hvac-history',	
		'singApp.hvac-graph-manage',
		'singApp.hvac-graph-view',
		'singApp.hvac-alarm',
		
		'singApp.cctv-point-manage',
		'singApp.cctv-monitor',
		
		'singApp.fire-alarm',
		'singApp.fire-history',
		
		'singApp.lighting-point-manage',
		'singApp.lighting-monitor',
		
		'singApp.ev-point-manage',
		'singApp.ev-monitor',
		'singApp.ev-alarm',
		'singApp.ev-history',
		
		'singApp.components-reset',
		
        'mwl.confirm',
        'angularSpinner'
		
    ]);
    
    /*
    angular.module('singApp').run(function(confirmationPopoverDefaults) {
    	  console.log(confirmationPopoverDefaults); // View all the defaults you can change
    	  confirmationPopoverDefaults.confirmButtonType = 'danger'; // Set the default confirm button type to be danger
    });
    */
    
    angular.module('singApp').directive('ngConfirmClick', [
        function(){
            return {
                link: function (scope, element, attr) {
                    var msg = attr.ngConfirmClick || "삭제하시겠습니까?";
                    var clickAction = attr.confirmedClick;
                    element.bind('click',function (event) {
                        if ( window.confirm(msg) ) {
                            scope.$eval(clickAction)
                        }
                    });
                }
            };
    }]);
    
	angular.module('singApp').run(function(confirmationPopoverDefaults) {
		confirmationPopoverDefaults.templateUrl='scripts/angular-bootstrap-confirm-master/src/angular-bootstrap-confirm.html';
		//console.log(confirmationPopoverDefaults); // View all the defaults you can change
	});
    
})();
