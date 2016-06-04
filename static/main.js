define('jquery', [], function() {
    return jQuery;
});

// if (Backbone.PageableCollection) {
// 	define('backbone-paginator', [], function() {
// 		return Backbone.PageableCollection
// 	});	
// }

requirejs.config({
	baseUrl: '/static/js/',
	paths: {
		'common': '../common/js/common',
		'backgrid': '../lib/backgrid/lib/backgrid',
		'backgrid-filter': '../lib/backgrid-filter/backgrid-filter',
		'backbone-paginator': '../lib/backbone.paginator/lib/backbone.paginator',
		'moment': '../lib/moment/moment',
		'daterangepicker': '../lib/bootstrap-daterangepicker/daterangepicker',
		'backbone' : '../lib/backbone/backbone',
		'underscore' : '../lib/underscore/underscore',
		'd3' : '../lib/d3/d3',
		'rickshaw': '../lib/rickshaw/rickshaw',
		'correlate_graph_plugin': '../correlate_graph_plugin'
	},
	shim: {
		'd3' : {
			exports: 'd3'
		},
		'rickshaw': {
			deps: ['d3'],
			exports: ['Rickshaw']
		},
	}
});

requirejs(['backbone-paginator', 'app'], function(PageableCollection, app) {
	
	// Attach PageableCollection to Backbone
	Backbone.PageableCollection = PageableCollection;
	
	var Correlate = app();
});