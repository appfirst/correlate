define([], function() {
	/*
		The Router updates the browser's url each time a change is made.
	*/
	var Router = Backbone.Router.extend({

		initialize: function(options) {
			var self = this;

			this.selectedMetrics = options.selectedMetrics;
			this.watchedResources = options.watchedResources;
			this.vent = options.vent;
			this.graph = options.graph;
			
			this.listenTo(this.vent, 'new-time-range', this.setTimeRange);
			this.listenTo(this.vent, 'graph-clicked', this.setClickedTime);
			this.listenTo(this.watchedResources, 'add', this.updateResources);
			this.listenTo(this.watchedResources, 'remove', this.updateResources);
			this.listenTo(this.selectedMetrics, 'add', this.updateResources);
			this.listenTo(this.selectedMetrics, 'remove', this.updateResources);
			this.listenTo(this.vent, 'time-line-removed', this.unsetClickedTime);

			this.clickedTime = this.graph.lastActivePoint;
			this.startTime = options.timeController.getTimeRange()[0];
			this.endTime = options.timeController.getTimeRange()[1];

			this.resources = {};

			// throttle url updating so it does update more than twice per second
			this.updateUrl = _.throttle(this.updateUrl, 500);
		},

		setTimeRange: function(timeRange) {
			this.startTime = timeRange[0];
			this.endTime = timeRange[1];
			this.updateResources();		
			this.updateUrl();
		},

		setClickedTime: function(clickedTime) {
			this.clickedTime = clickedTime;
			this.updateResources();		
			this.updateUrl();
		},

		unsetClickedTime: function() {
			this.clickedTime = undefined;
			this.updateUrl();
		},

		updateResources: function() {
			var resources = {};
			this.watchedResources.each(function(r) {
				resources[r.get('cid')] = _.invoke(r.get('metrics').where({selected:true}), 'get', 'value');
			});
			this.resources = resources;
			this.updateUrl();
		},

		updateUrl: function() {
			var url = '';
			if (this.startTime && this.endTime) {
				url = '/start@' + this.startTime + ',end@' + this.endTime;
			}	
			if (this.clickedTime) {
				url += ',detail@' + this.clickedTime;
			}
			_.each(this.resources, function(metrics, cid) {
				if (metrics !== undefined) {
					url += ',' + cid;
				}
				_.each(metrics, function(value) {
					url += '+'+value
				});
			});

			this.navigate(url, {replace:true});
		}

	});
	
	return Router;
});