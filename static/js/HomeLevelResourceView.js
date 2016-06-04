define(['ResourceView'], function(ResourceView) {
	var HomeLevelResourceView = Backbone.View.extend({
		tagName: 'li',
		className: 'sp resource-type',
		template: _.template($('#home_level_resource_template').html()),

		events: {
			'click .resource-type-heading' : 'clickHeading',
			'click .more' : 'clickHeading'
		},

		initialize: function(options) {
			this.resourceFilterController = options.resourceFilterController;
			
			this.listenTo(this.collection, 'sync', this.renderPreviewResources);
			this.listenTo(this.collection, 'request', this.showLoading);
			this.listenTo(this.collection, 'sync', this.updateCount);
		},

		render: function() {
			this.$el.html(this.template({
				'title' : this.collection.title
			}));
			return this;
		},

		clickHeading: function(e) {
			e.stopPropagation();
			this.collection.trigger('click-level');
		},

		showLoading: function() {
			this.$('.badge').text('...');
		},

		updateCount: function() {
			var count = this.collection.state.count;
			this.$('.badge').text(count);
		},

		renderPreviewResources: function() {
			this.$('.results-preview').empty();

			if (this.resourceFilterController.getQueryString()) {
				var three = this.collection.fullCollection.first(3);
				
				_.each(three, function(model) {
					var view = new ResourceView({model:model});
					this.$('.results-preview').append(view.render().el);
				}, this);

				this.updateMore(true, three.length);
			} else {
				this.updateMore(false, 0);
			}
		},

		updateMore: function(show, num_previewed) {
			total = this.collection.state.count;
			
			if (show && (total-num_previewed) > 0) {
				this.$('.more').show().text(total - num_previewed + ' more...');
			} else {
				this.$('.more').empty().hide();
			}
		}

	});

	return HomeLevelResourceView;
});
