define(['WatchedResourceView'], function(WatchedResourceView) {
	var WatchedResourcesView = Backbone.View.extend({
		el: '#watched_resources',
		
		events: {
			'click #hide_sidebar' : 'toggleSidebar',
			'click #expand_all' : 'expandAll',
			'click #collapse_all' : 'collapseAll',
		},

		initialize: function(options) {
			this.vent = options.vent;

			this.listenTo(this.collection, 'add', this.appendWatchedResource);
			this.listenTo(this.collection, 'add', this.toggleInstructions);
			this.listenTo(this.collection, 'remove', this.toggleInstructions);
			this.listenTo(this.collection, 'remove', this.removeWatchedResource);
			this.listenTo(this.vent, 'show-sidebar', this.toggleSidebar);
		},

		renderWatchedResource: function(view) {
			$('#watched_resources_list').append(view.render().el);
		},

		toggleInstructions: function() {
			if (this.collection.length) {
				$('#add_resource_instructions').addClass('hidden');
			} else {
				$('#add_resource_instructions').removeClass('hidden');
			}
		},

		appendWatchedResource: function(model) {
			var watchedResourceView = new WatchedResourceView({model: model});
			this.renderWatchedResource(watchedResourceView);
		    
		    // scroll to the added resources
		    this.$('#watched_resources_list').animate({
		        scrollTop: watchedResourceView.$el.offset().top
		    }, 500);
		},

		removeWatchedResource: function(model) {
			model.trigger('remove-view', model);
		},

		expandAll: function() {
			this.collection.each(function(wr) {
				wr.set('collapsed', false);
			});
		},

		collapseAll: function() {
			this.collection.each(function(wr) {
				wr.set('collapsed', true);
			});
		},
		
		toggleSidebar: function() {
			var self = this;
			this.$el.toggleClass('collapsed');
			setTimeout(function() {
				self.vent.trigger('resize-graph');
			}, 501);
		}	
	});

	return WatchedResourcesView;
});
