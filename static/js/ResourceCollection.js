define(['ResourceModel'], function(ResourceModel) {
	var ResourceCollection = Backbone.PageableCollection.extend({
		
		model: ResourceModel,
		mode: 'infinite',
		
		state: {
			pageSize: 25,
			count: 0
		},
		
		queryParams: {
			currentPage: "page",
			pageSize: "page_size"
		},

		initialize: function(models, options) {
			this.urlBase = options.url;
			this.name = options.name;
			this.title = options.title;

			this.resourceFilterController = options.resourceFilterController;
			this.selectedMetrics = options.selectedMetrics;
			this.timeController = options.timeController;
			this.watchedResources = options.watchedResources;
			this.vent = options.vent;

			this.listenTo(this.vent, 'fetch-resources', this.fetch);
			this.listenTo(this.vent, 'resource-filter', this.filterCollection);
		},

		url: function() {
			var url = this.urlBase + '?'
			var params = {};
			var query = this.resourceFilterController.getQueryString();
			if (query) params['search'] = query;
			if (this.name == 'buckets') params['wildcards'] = true;
			return url + $.param(params);
		},

		filterCollection: function() {
			this.trigger('clear-list');
			this.fullCollection.reset();
			this.getFirstPage({reset:true});
		},

		doesNextPageExist: function() {
			return this.fullCollection.length < (this.state.count)
		},

		parseRecords: function (resp) {
			return resp.data;
		},

		parseLinks: function (resp, xhr) {
			this.state.count = resp.pagination.count;
			return resp.pagination;
		}

	});
	return ResourceCollection;
});