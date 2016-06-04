define([], function() {
	var DetailRows = Backbone.PageableCollection.extend({
		mode: 'client',
		state: {
			pageSize: 50
		}
	});

	return DetailRows;
});