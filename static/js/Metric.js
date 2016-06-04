define([], function() {
	var Metric = Backbone.Model.extend({
		
		defaults: {
			'selected' : false,
			'color' : undefined
		},

		initialize: function(attrs, options) {
			
			this.selectedMetrics = this.get('resource').selectedMetrics;

			this.listenTo(this, 'change:selected', this.addRemoveSelectedMetrics);
			this.createId();
		},

		createId: function() {
			this.set('id', this.get('resource').get('cid') + '_' + this.get('value'));
		},

		addRemoveSelectedMetrics: function(model, selected) {
			if (selected === true) {
				this.selectedMetrics.add(this);
			} else {
				this.selectedMetrics.remove(this.get('id'));
			}
		}

	});

	return Metric
});