define([], function() {
	var MetricView = Backbone.View.extend({
		tagName: 'li',
		template: _.template($('#watched_resource_metric_template').html()),

		events: {
			'click [type="checkbox"]' : 'click'
		},

		initialize: function() {
			this.vent = this.model.get('resource').vent;

			this.listenTo(this.model, 'change:selected', this.toggleSelect);
			this.listenTo(this.model, 'change:color', this.changeColor);
			this.listenTo(this.model.get('resource'), 'change:watching', this.removeOnUnwatch);
			this.listenTo(this.vent, 'hover-time', this.showDataValue);
			this.listenTo(this.vent, 'stop-hover', this.hideDataValue);
			this.listenTo(this.vent, 'graph-clicked', this.showDataValue);
		},

		render: function() {
			this.model.get('selected') ? this.$el.addClass('selected') : null;
			this.$el.html(this.template(this.model.toJSON()));
			this.changeColor();
			return this;
		},

		showDataValue: function(timestamp) {
			var dataPoint = _.findWhere(this.model.get('resource').get('data'), {time: timestamp});

			var value = dataPoint && dataPoint[this.model.get('value')];

			if (value !== undefined && this.model.get('selected') === true) {
				var unit = this.model.get('value');
				this.$('.value').html(formatVal(value, unit));
			} else {
				this.$('.value').empty();
			}
		},

		hideDataValue: function(lastActivePoint) {
			if (lastActivePoint) {
				this.showDataValue(lastActivePoint);
			} else {
				this.$('.value').empty();			
			}
		},

		changeColor: function() {
			this.$el.css('color', this.model.get('color') || '');
		},

		toggleSelect: function() {
			// TODO also ensure metric's resource is being watched
			if (this.model.get('selected') == true) {
				this.$el.addClass('selected');
				this.$('[type=checkbox]').prop('checked', true);
			} else {
				this.$el.removeClass('selected');
				this.$('[type=checkbox]').prop('checked', false);
				this.model.unset('color');
			}
		},

		removeOnUnwatch: function(resource_model) {
			if (resource_model.get('watching') == false) {
				this.remove();
			}
		},

		click: function() {
			var checked = this.$('[type="checkbox"]').prop('checked');
			this.model.set({selected:checked});
		}

	});

	return MetricView;
});