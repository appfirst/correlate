define(['MetricsView'], function(MetricsView) {
	var WatchedResourceView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#watched_resource_template').html()),
		
		events: {
			'click .remove' : 'clickRemove',
			'click .watched-resource-header' : 'toggleCollapse'
		},

		initialize: function() {
			this.listenTo(this.model, 'remove-view', this.remove);
			this.listenTo(this.model, 'change:collapsed', this.changeCollapsed);
			this.listenToOnce(this.model, 'data-received', this.createMetricView);
			this.listenToOnce(this.model, 'metrics-added', this.selectFirstMetric);
			this.listenTo(this.model, 'data-fetch-start', this.renderLoadingStatus);
			this.listenTo(this.model, 'data-received', this.hideStatus);
			this.listenTo(this.model, 'data-error', this.renderErrorStatus);
		},

		selectFirstMetric: function() {
			if (this.model.get('metrics').where({selected:true}).length == 0) {
				this.model.get('metrics').models[0].set({selected:true});
			}
		},

		createMetricView: function() {
			var metricsView = new MetricsView({model: this.model});
			this.$('.watched-resource-metrics-container').append(metricsView.render().el);
		},

		toggleCollapse: function() {
			var currentState = this.model.get('collapsed');
			this.model.set('collapsed', !currentState);
		},

		changeCollapsed: function(model, state) {
			if (state === true) this.$('.metric-list').addClass('list-collapsed');
			if (state === false) this.$('.metric-list').removeClass('list-collapsed');
		},

		render: function() {
			this.$el.html(this.template({
				info: this.model.meta.additional_info ? this.model.meta.additional_info(this.model) : null,
				type: this.model.meta.title_singular,
				name: this.model.get('name'),
				args: this.model.get('args')
			}));
			return this;
		},

		renderLoadingStatus: function() {
			this.$('.status').removeClass('hidden');
			this.$('.status').removeClass('error').html('<img src="/static/img/loading.gif" width="20" style="position:absolute">');
		},

		renderErrorStatus: function() {
			this.$('.status').removeClass('hidden');
			this.$('.status').addClass('error').html('Error loading data');
		},

		hideStatus: function() {
			if (this.model.get('data').length) {
				this.$('.status').addClass('hidden');
			} else {
				this.$('.status').removeClass('hidden').addClass('error').html('No data was found');
			}
		},

		clickRemove: function() {
			this.model.set({watching: false});
		},
		
		removeWatchedResource: function(model) {
			if (state === false) {
				this.remove();
			}
		}
	});

	return WatchedResourceView;
});