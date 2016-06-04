define(['MetricView'], function(MetricView) {
	var MetricsView = Backbone.View.extend({
		tagName: 'ul',
		className: 'metric-list',

		initialize: function() {
			var self = this;
			this.listenTo(this.model, 'change:watching', this.removeOnUnwatch);
			this.listenTo(this.model.get('metrics'), 'add', this.appendMetricView);
		},

		render: function() {
			this.$el.empty();
			this.model.get('metrics').each(this.appendMetricView, this);
			return this;
		},

		appendMetricView: function(metric, index) {
			var metricView = new MetricView({model: metric});
			this.$el.append(metricView.render().el);
		},

		removeOnUnwatch: function(model) {
			if (model.get('watching') == false) {
				this.remove();
			}
		}

	});

	return MetricsView;
});