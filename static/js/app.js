define([
	'ResourceFilterController','TimeController','SelectedMetrics','WatchedResources',
	'WatchedResourcesView','ResourceCollection','ResourceModel','ResourcesView','Metric',
	'CorrelateTimeFixture','CorrelateXAxis','CorrelateHoverDetail','ResourceSelectController',
	'AutoUpdateController','GraphController','GraphRenderer','ClickedPointController',
	'DataLoadingController','DetailTabView','DetailTableController','ProcessClickableRow',
	'UrlLoadController','Router', 'DetailColumns', 'daterangepicker', 'DatepickerConfig', 'Resources'
], function(	
	ResourceFilterController,TimeController,SelectedMetrics,WatchedResources,
	WatchedResourcesView,ResourceCollection,ResourceModel,ResourcesView,Metric,
	CorrelateTimeFixture,CorrelateXAxis,CorrelateHoverDetail,ResourceSelectController,
	AutoUpdateController,GraphController,GraphRenderer,ClickedPointController,
	DataLoadingController,DetailTabView,DetailTableController,ProcessClickableRow,
	UrlLoadController,Router, DetailColumns, daterangepicker, DATEPICKER_CONFIG, Resources
) {

	var C = {};

	function initCorrelateApp(args) {
		
		/*	args.disable is a list of features not to include
			when initializing correlate */
		function preventInit(feature) {
			if (!args || !args.disable) return false;
			return args.disable.indexOf(feature) != -1
		}

		/*	Initialize daterange picker and settings */
		$('#date_select .dropdown').daterangepicker(DATEPICKER_CONFIG,
			function(start, end) {
				C.timeController.changeTime(start, end);
			}
		);
			
		$('#date_select .dropdown').on('show.daterangepicker', function(ev, picker) {
			$(picker.container).addClass('show-calendar');
		});

		/*	Trigger click on resource dropdown on user click 'Click Here' */
		$('body').on('click', '#click_here', function() {
			setTimeout(function(){
				$('#resource_dropdown .dropdown-selected').dropdown('toggle');	
			}, 0);
		});

		/*	Global object to store resources */
		C.vent = _.extend({}, Backbone.Events);

		/* Search box for resource select dropdown */
		C.resourceFilterController = new ResourceFilterController({
			vent: C.vent
		});

		/*	Timerange controller */
		C.timeController = new TimeController({
			vent: C.vent
		});		

		/*	Collection for metrics shown on graph */
		C.selectedMetrics = new SelectedMetrics([], {model: Metric});

		/*	Collection of resources being 'watched', aka in the sidebar */
		C.watchedResources = new WatchedResources([], {model: ResourceModel});

		/*	View for watched resources */
		C.watchedResourcesView = new WatchedResourcesView({
			collection: C.watchedResources,
			vent: C.vent
		});


		/*	Collections for each resource types */
		C.resourceCollections = {};
		
		C.resourceCollections.servers = new ResourceCollection([], _.extend(Resources.servers, {
			resourceFilterController: C.resourceFilterController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		}));

		C.resourceCollections.process_groups = new ResourceCollection([], _.extend(Resources.process_groups, {
			resourceFilterController: C.resourceFilterController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		}));

		C.resourceCollections.polled_data = new ResourceCollection([], _.extend(Resources.polled_data, {
			resourceFilterController: C.resourceFilterController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		}));

		C.resourceCollections.logs = new ResourceCollection([], _.extend(Resources.logs, {
			resourceFilterController: C.resourceFilterController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		}));

		C.resourceCollections.buckets = new ResourceCollection([], _.extend(Resources.buckets, {
			resourceFilterController: C.resourceFilterController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		}));


		/*	Views for each resource collection */
		C.resourceViews = {};

		C.resourceViews.servers = new ResourcesView({
			collection: C.resourceCollections.servers,
			resourceFilterController: C.resourceFilterController,
			vent: C.vent
		});

		C.resourceViews.process_groups = new ResourcesView({
			collection: C.resourceCollections.process_groups,
			resourceFilterController: C.resourceFilterController,
			vent: C.vent
		});

		C.resourceViews.polled_data = new ResourcesView({
			collection: C.resourceCollections.polled_data,
			resourceFilterController: C.resourceFilterController,
			vent: C.vent
		});

		C.resourceViews.logs = new ResourcesView({
			collection: C.resourceCollections.logs,
			resourceFilterController: C.resourceFilterController,
			vent: C.vent
		});

		C.resourceViews.buckets = new ResourcesView({
			collection: C.resourceCollections.buckets,
			resourceFilterController: C.resourceFilterController,
			vent: C.vent
		});

		/*	The main graph */
		C.afgraph = new Rickshaw.Graph({
			element: $('#graph')[0],
			width: $('#graph').parent().width()-2,
			renderer: 'linedot',
			stack: false,
			interpolation: 'linear',
			height: 300,
			series: [],
			strokeWidth: 2,
			padding: {bottom: 10},
		});

		// add 1px to the height so 2px paths don't get cut off on the bottom
		$(C.afgraph.element).find('svg').attr('height', 301);

		/*	Resize the width of the graph to its container */
		var resizeGraph = function() {
			C.afgraph.configure({
				width: $('#graph').parent().width()-2,
				height: 300
			});
			C.afgraph.render();

			// add 1px to the height so 2px paths don't get cut off on the bottom
			$(C.afgraph.element).find('svg').attr('height', 301);
		}

		/*	Listen to window resize event */
		window.addEventListener('resize', resizeGraph);
		C.vent.on('resize-graph', resizeGraph);


		/*	Custom x-axis formatting for timestamps */
		C.correlateTimeFixture = new CorrelateTimeFixture();

		/*	Custom x-axis */
		C.xAxis = new CorrelateXAxis({
			grid:false,
			graph: C.afgraph,
			timeFixture: C.correlateTimeFixture
		});

		/*	Custom hover */
		C.hoverDetail = new CorrelateHoverDetail({
			graph: C.afgraph,
			vent: C.vent
		});

		/*	Creates an interactive preview graph below the main graph */
		C.previewSlider = new Rickshaw.Graph.RangeSlider.Preview({
			graph: C.afgraph,
			element: document.querySelector('#preview'),
			frameOpacity: 1,
		});

		/*	Graph click handler */
		$(C.afgraph.element).on('click', function() {
			// get clicked timestamp from C.afgraph.activePoint.domainX (if exists)
			if (C.graphController.getSeries().length === 0) return;
			C.afgraph.activePoint && C.vent.trigger('graph-clicked', C.afgraph.activePoint);
		});

		/*	UI controller for resource select dropdown*/
		C.resourceSelectController = new ResourceSelectController({
			vent: C.vent
		});

		/*	Auto-increments the time range */
		if (!preventInit('autoUpdateController')) {
			C.autoUpdateController = new AutoUpdateController({
				timeController: C.timeController,
				vent: C.vent
			});		
		}

		/*	Controls the graph's series set */
		C.graphController = new GraphController({
			graph: C.afgraph,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		});

		/*	Sets the active point on the graph when clicked */
		C.clickedPointController = new ClickedPointController({
			graph: C.afgraph,
			graphController: C.graphController,
			vent: C.vent
		});

		/*	Keeps track of concurrent api requests */
		C.dataLoadingController = new DataLoadingController({
			watchedResources: C.watchedResources
		});

		/*	Views for each detail tab */
		C.tabViews = {}

		C.tabViews.processes = new DetailTabView({
			id: 'detail_tab_processes', name: 'processes',
			columns: DetailColumns.processes, row: ProcessClickableRow,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.sockets = new DetailTabView({
			id: 'detail_tab_sockets', name: 'strf',
			columns: DetailColumns.sockets,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.threads = new DetailTabView({
			id: 'detail_tab_threads', name: 'strf',
			columns: DetailColumns.threads,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.files = new DetailTabView({
			id: 'detail_tab_files', name: 'strf',
			columns: DetailColumns.files,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.registries = new DetailTabView({
			id: 'detail_tab_registries', name: 'strf',
			columns: DetailColumns.registries,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.logs = new DetailTabView({
			id: 'detail_tab_logs', name: 'logs',
			columns: DetailColumns.logs,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.polled_data = new DetailTabView({
			id: 'detail_tab_polled_data', name: 'polled_data',
			columns: DetailColumns.polled_data,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		C.tabViews.alerts = new DetailTabView({
			id: 'detail_tab_alerts', name: 'alerts',
			columns: DetailColumns.alerts,
			graphController: C.graphController,
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		/*	Handles the rendering and api requests for detail tabs */
		C.detailTableController = new DetailTableController({
			graphController: C.graphController,
			tabViews: C.tabViews,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent
		});


		/* Route the initial url */
		if (!preventInit('routeHistory')) {
			Backbone.history.start({pushState: true, root: '/correlate'});
		}

		/*	Parses the url on page load */
		if (!preventInit('urlLoadController')) {
			C.urlLoadController = new UrlLoadController({
				selectedMetrics: C.selectedMetrics,
				timeController: C.timeController,
				watchedResources: C.watchedResources,
				vent: C.vent
			});
		}

		/*	Keeps the browser's URL in sync with the current view */
		C.router = new Router({
			selectedMetrics: C.selectedMetrics,
			timeController: C.timeController,
			watchedResources: C.watchedResources,
			vent: C.vent,
			graph: C.afgraph
		});

		/*  Initialize Bootstrap popovers. Applies to any element with class '.list-popover' */
		$("body").popover({
		    selector: ".list-popover",
			trigger: "hover",
			container: "body",
			html: true
		});

		$('#show_sidebar').click(function() {
			C.vent.trigger('show-sidebar');
		});

		/* Trigger a fetch on all resource collections */
		C.vent.trigger('fetch-resources');

		return C;
	};

	/*
		Keep track of keys that are currently presssed.
		Adds class to $('html') if shift key pressed to prevent text highlighting
	*/
	var keysPressed = {};
	window.addEventListener("keydown", function(e){
	    keysPressed[e.keyCode] = true;
	    if (e.keyCode == 16) {
	    	$('html').addClass('shiftkey-down');
	    }
	}, false);

	window.addEventListener('keyup', function(e){
	    keysPressed[e.keyCode] = undefined;
	    if (e.keyCode == 16) {
	    	$('html').removeClass('shiftkey-down');
	    }
	}, false);

	return initCorrelateApp;
});