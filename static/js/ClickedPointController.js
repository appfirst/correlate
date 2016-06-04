define([], function() {
	/*
		Listens to 'graph-clicked' event and 'series-removed' event and
		sets the active point on afgraph.
	*/
	var ClickedPointController = Backbone.View.extend({
		initialize: function(options) {
			this.graph = options.graph;
			this.graphController = options.graphController;
			this.vent = options.vent;

			this.listenTo(this.vent, 'graph-clicked', this.graphClicked);
			this.listenTo(this.vent, 'series-removed', this.checkRemoveLine);
		},
		graphClicked: function(activePoint) {
			this.graph.lastActivePoint = activePoint;
			this.graph.renderer.renderTimeLine();
		},
		checkRemoveLine: function() {
			if (this.graphController.getSeries().length === 0) {
				this.graph.lastActivePoint = undefined;
				this.graph.renderer.renderTimeLine();
				this.vent.trigger('time-line-removed');
			}
		}
	});

	return ClickedPointController;
});