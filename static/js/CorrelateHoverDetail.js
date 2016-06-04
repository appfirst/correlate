define(['rickshaw'], function(Rickshaw) {
	var CorrelateHoverDetail = Rickshaw.Class.create(Rickshaw.Graph.HoverDetail, {
		initialize: function(args) {
			this.vent = args.vent;
			Rickshaw.Graph.HoverDetail.prototype.initialize.apply(this, arguments);
		},
		hide: function() {
			Rickshaw.Graph.HoverDetail.prototype.hide.apply(this, arguments);
			this.vent.trigger('stop-hover', this.graph.lastActivePoint);
		},
		formatter: function(series, x, y) {
			var resource = series.display_name+'<br>';
			var swatch = '<span class="detail_swatch" style="background-color: ' + series.color + '"></span>';		
			var content = resource+swatch + series.metric_name + ": " + formatVal(y, series.unit) +'<br>';// + date;
			return content;
		},
		xFormatter: function(x) {
			return moment.unix(x).format('MM/D/YYYY HH:mm [GMT]ZZ')
		},
		render: function(args) {
			var graph = this.graph;
			var points = args.points.filter(function(d){return d.value.y !== null});

			var point = _.filter(_.sortBy(points, function(p){return p.distance}),
				function(d){return d.value.y !== null}).shift();

			if (!point) {
				// use the null point if no real points are present
				point = args.points.filter( function(p) { return p.active } ).shift();
			}

			// store the currently-hovered x coordinate
			graph.activePoint = point.value.x;

			var point_position = point.value.y

			var close_points = points.filter(function(p) {
				return Math.abs(graph.y(point_position) - graph.y(p.value.y)) < 30
			});

			this.element.innerHTML = '';

			this.element.style.left = graph.x(point.value.x) + 'px';

			var xLabel = document.createElement('div');

			xLabel.className = 'x_label';
			xLabel.innerHTML = point.formattedXValue;
			this.element.appendChild(xLabel);

			if (point.value.y === null) {
				this.element.classList.remove('inactive');
				this.vent.trigger('stop-hover', this.graph.lastActivePoint);
				var alignables = [xLabel];

			} else {

				var item = document.createElement('div');
				item.className = 'item';

				_.each(close_points, function(point) {
					
					// invert the scale if this series displays using a scale
					var series = point.series;
					var actualY = series.scale ? series.scale.invert(point.value.y) : point.value.y;

					var formattedXValue = point.formattedXValue;
					var formattedYValue = point.formattedYValue;

					item.innerHTML += this.formatter(series, point.value.x, actualY, formattedXValue, formattedYValue, point);
					item.style.top = this.graph.y(point.value.y0 + point.value.y) + 'px';

					var dot = document.createElement('div');
					dot.className = 'dot';

					dot.style.borderColor = series.color;
					dot.style.top = item.style.top;	
					dot.classList.add('active');

					this.element.appendChild(dot);

				}, this);

				this.element.appendChild(item);
				item.classList.add('active');

				var alignables = [xLabel, item];
			}

			// Assume left alignment until the element has been displayed and
			// bounding box calculations are possible.
			alignables.forEach(function(el) {
				el.classList.add('left');
			});

			this.show();

			// If left-alignment results in any error, try right-alignment.
			var leftAlignError = this._calcLayoutError(alignables);
			if (leftAlignError > 0) {
				alignables.forEach(function(el) {
					el.classList.remove('left');
					el.classList.add('right');
				});

				// If right-alignment is worse than left alignment, switch back.
				var rightAlignError = this._calcLayoutError(alignables);
				if (rightAlignError > leftAlignError) {
					alignables.forEach(function(el) {
						el.classList.remove('right');
						el.classList.add('left');
					});
				}
			}

			this.vent.trigger('hover-time', point.value.x);

		}	
	});

	return CorrelateHoverDetail;
});