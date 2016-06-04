define([], function() {
	var Metrics = Backbone.Collection.extend({
		comparator: 'order'
	});
	return Metrics;
});
