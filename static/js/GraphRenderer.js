define(['rickshaw'], function(Rickshaw) {
	/*
		A dot is rendered for a point whose neighboring points are both null values.
		Also handles rendering the vertical 'time line' when the graph is clicked.
	*/
	Rickshaw.namespace('Rickshaw.Graph.Renderer.LineDot');
	Rickshaw.Graph.Renderer.LineDot = Rickshaw.Class.create( Rickshaw.Graph.Renderer.Line, {

		name: 'linedot',

		render: function(args) {
			args = args || {};

			var graph = this.graph;

			var series = args.series || graph.series;
			var vis = args.vis || graph.vis;

			var dotSize = this.strokeWidth;

			vis.selectAll('*').remove();

			var data = series
				.filter(function(s) { return !s.disabled })
				.map(function(s) { return s.stack });

			var nodes = vis.selectAll("path")
				.data(data)
				.enter().append("svg:path")
				.attr("d", this.seriesPathFactory());

			var i = 0;
			series.forEach(function(series) {
				if (series.disabled) return;
				series.path = nodes[0][i++];
				this._styleSeries(series);
			}, this);

			series.forEach(function(series) {

				if (series.disabled) return;

				var nodes = vis.selectAll("x")
					.data(series.stack.filter( function(d, i, data) {
						// filter points whose neighbors are undefined
						return (d.y !== null && (data[i-1] && data[i-1].y === null)
							&& (data[i+1] && data[i+1].y === null))
					} ))
					.enter().append("svg:circle")
					.attr("cx", function(d) { return graph.x(d.x) })
					// offset 0-values by 2 so they don't get cut off
					.attr("cy", function(d) { return d.y == 0 ? graph.y(d.y)-2 : graph.y(d.y) })
					.attr("r", function(d) { return ("r" in d) ? d.r : dotSize});

				Array.prototype.forEach.call(nodes[0], function(n) {
					if (!n) return;
					n.setAttribute('data-color', series.color);
					n.setAttribute('fill', series.color);
					n.setAttribute('stroke', series.color);
					n.setAttribute('stroke-width', this.strokeWidth-1 || 1);

				}.bind(this));

				this.renderTimeLine();

			}, this);
		},
		renderTimeLine: function() {
			var graph = this.graph,
				vis = graph.vis,
				xCoord = graph.lastActivePoint;

			// Remove any existing time line
			vis.select("#active_time_line").remove()
			vis.select("#active_time_text").remove()

			if (!xCoord) return;

			// Draw the time line on the graph's vis
			vis.append("svg:line")
				.attr("id", "active_time_line")
				.attr("x1", graph.x(xCoord))
				.attr("x2", graph.x(xCoord))
				.attr("y1", 0)
				.attr("y2", graph.height)
				.attr("stroke", '#555c64')
				.attr("stroke-width", 1);

			// place text to left of the line if close to the right edge of the graph
			var textX = graph.x(xCoord)+2;
			if (graph.width - graph.x(xCoord) < 35) {
				textX = graph.x(xCoord)-30;
			}

			vis.append("svg:text")
				.attr("id", "active_time_text")
				// .attr("transform", "rotate(-90,"+graph.x(xCoord)+","+296+")")
				.attr("x", textX)
				.attr("y", 9)
				.attr("text-anchor", "right")
				.text(moment.unix(xCoord).format('H:mm'));
		}
	} );

	return Rickshaw.Graph.Renderer.LineDot;
});