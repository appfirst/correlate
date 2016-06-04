define([], function() {
	var DetailTableController = Backbone.View.extend({

		el: '#table_container',

		initialize: function(options) {
			this.graphController = options.graphController;
			this.tabViews = options.tabViews;
			this.timeController = options.timeController;
			this.watchedResources = options.watchedResources;
			this.vent = options.vent

			this.listenTo(this.vent, 'graph-clicked', this.clickGraph);
			this.listenTo(this.vent, 'series-removed', this.toggleTabInstructions);
			this.listenTo(this.vent, 'series-added', this.toggleTabInstructions);
			this.listenTo(this.vent, 'fetch-resource-details', this.fetchResourceDetails);
			this.requests = [];
		},

		clickGraph: function(clickedPoint) {
			this.vent.trigger('clear-rows');
			this.clicked_time = clickedPoint;
			this.cancelExstingRequests();

			// get detail metrics for each watched resource that has selected metrics
			var resourcesWithSelectedMetrics = this.watchedResources.filter(function(d){
				return d.get('metrics').where({selected:true}).length
			})

			_.each(resourcesWithSelectedMetrics, this.fetchResourceDetails, this);
		},

		cancelExstingRequests: function() {
			_.each(this.requests, function(request) {
				request.abort()
			});
			this.requests = []; //empty requests array
		},

		toggleTabInstructions: function() {
			if (this.graphController.getSeries().length === 0) {
				this.$('.no-table-data').removeClass('hidden');
			} else {
				this.$('.no-table-data').addClass('hidden');
			}
		},

		requestParams: function(detail_name, clicked_time) {
			if (detail_name == 'strf') {
				return {time: clicked_time}
			} else if (detail_name == 'alerts') {
				var timeStepPeriod = this.timeController.getTimeStepPeriod(clicked_time);
				return {start: timeStepPeriod[0], end: timeStepPeriod[1]}
			} else {
				return {start: clicked_time, end: clicked_time}
			}
		},

		fetchResourceDetails: function(resource) {
			var self = this;
			var tabsToFetch = resource.meta.detailTabs;
			
			_.each(resource.meta.detailTabs, function(detail) {
				detail.name == 'strf' ? self.strfShowLoading() : this.tabViews[detail.name].showLoading();
				
				var request = $.ajax({
					url: _.template(detail.url)(resource.toJSON()),
					dataType: 'JSON',
					data: self.requestParams(detail.name, self.clicked_time)
				
				}).done(function(data) {
					data = detail.parse ? detail.parse(data, resource, self.clicked_time) : data;

					// process data differently if 'strf'
					if (detail.name == 'strf') {
						self.processStrfDetails(data, resource);
					} else {
						self.processDetails(data, resource, detail.name);
					}
				
				}).fail(function(req, status, text) {
					detail.name == 'strf' ? self.strfErrorLoading() : self.tabViews[detail.name].showError();

				}).always(function() {
					detail.name == 'strf' ? self.strfCheckDone() : self.tabViews[detail.name].checkDone();
				});

				// store all requests so they can all be cancelled at once 
				self.requests.push(request);
			}, this);
		},

		processDetails: function(data, resource, detail_name) {
			
			_.each(data, function(d) {
				if (!d.resource_name) d.resource_name = resource.get('name');
				if (!d.resource_id) d.resource_id = resource.get('cid');
			});							
			this.tabViews[detail_name].addRows(data);
		},

		/*
			Since only one call is needed to retrieve sockets, threads, files, and registries,
			a separate fetching method is needed to avoid calling the same api multiple times
		*/
		processStrfDetails: function(data, resource) {
			
			_.each(data, function(s) {
				_.each(s, function(d) {
					d.resource_name = resource.get('name');
					d.resource_id = resource.get('cid');				
				});
			});

			this.tabViews['sockets'].addRows(data.sockets);
			this.tabViews['threads'].addRows(data.threads);
			this.tabViews['files'].addRows(data.files);
			this.tabViews['registries'].addRows(data.registries);
		},

		strfShowLoading: function() {
			this.tabViews['sockets'].showLoading();
			this.tabViews['threads'].showLoading();
			this.tabViews['files'].showLoading();
			this.tabViews['registries'].showLoading();
		},

		strfCheckDone: function() {
			this.tabViews['sockets'].checkDone();
			this.tabViews['threads'].checkDone();
			this.tabViews['files'].checkDone();
			this.tabViews['registries'].checkDone();
		},

		strfErrorLoading: function() {
			this.tabViews['sockets'].showError();
			this.tabViews['threads'].showError();
			this.tabViews['files'].showError();
			this.tabViews['registries'].showError();
		}

	});

	return DetailTableController;
});
