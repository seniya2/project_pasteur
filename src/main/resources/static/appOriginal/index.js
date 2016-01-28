(function() {
    'use strict';

    angular.module('singApp', [

	                               
        'singApp.core', 
        'singApp.dashboard', 
        'singApp.form.elements', 
        'singApp.inbox', 
        'singApp.maps.google',
        'singApp.maps.vector', 
		'singApp.ui.components', 
		'singApp.ui.notifications', 
		'singApp.ui.icons',
		'singApp.ui.buttons', 
		'singApp.ui.tabs-accordion', 
		'singApp.ui.list-groups', 
		'singApp.extra.calendar',
		'singApp.extra.invoice', 
		'singApp.login', 
		'singApp.error', 
		'singApp.extra.gallery', 
		'singApp.extra.search',
		'singApp.extra.timeline', 
		'singApp.grid', 
		'singApp.profile', 
		'singApp.widgets', 
		'singApp.charts',
		'singApp.form.validation', 
		'singApp.form.wizard', 
		'singApp.tables.basic', 
		'singApp.tables.dynamic'
    ]);
})();
