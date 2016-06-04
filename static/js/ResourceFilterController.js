define([], function() {
	var ResourceFilterController = Backbone.View.extend({
		el: '#resource_select .search',
		
		events: {
			'click' : 'stopProp',
			'input' : 'search'
		},

		initialize: function(options) {
			this.vent = options.vent;

			this.search = _.debounce(this.search, 300);
			this.listenTo(this.vent, 'clear-query', this.clearQuery);
		},

		stopProp: function(e) {
			e.stopPropagation();
		},

		getQueryString: function() {
			return this.$el.val();
		},

		search: function() {
			var query = this.$el.val();
			this.vent.trigger('resource-filter', query);
		},
		
		clearQuery: function() {
			return;
			if (this.$el.val() !== '') {
				this.$el.val('');
				this.search();
			}
		}
	});
	
	return ResourceFilterController;
});