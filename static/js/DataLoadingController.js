define([], function() {
	var DataLoadingController = Backbone.View.extend({
		initialize: function(options) {
			this.listenTo(options.watchedResources, 'data-fetch-start', this.requestStart);
			this.listenTo(options.watchedResources, 'data-fetch-page', this.requestMore);
			this.listenTo(options.watchedResources, 'data-received', this.requestEnd);
			this.listenTo(options.watchedResources, 'data-error', this.requestEnd);

			this.numRequests = 0;
		},
		requestStart: function() {
			this.numRequests ++;
			this.checkRequests();
		},
		requestMore: function() {
			this.numRequests --;
		},
		requestEnd: function() {
			this.numRequests --;
			this.checkRequests();
		},
		checkRequests: function() {
			if (this.numRequests > 0) {
				showLoading($('#graph'), true, 1);
			} else {
				this.numRequests = 0;
				hideLoading();
			}
		}
	});

	return DataLoadingController;
});