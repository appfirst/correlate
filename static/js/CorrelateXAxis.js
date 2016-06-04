define([], function() {
	/*
		Better placement of xAxis tick values so they don't get cut off
		on the right side of the graph.
	*/
	var CorrelateXAxis = function(args) {
		Rickshaw.Graph.Axis.Time.call(this, args);

	/*	Immediately override render(). Can't use protypal inheritance here
		because instantiating Rickshaw.Graph.Axis.Time requires a args.graph
		which is not defined until CorrelateXAxis is instantiated */
		this.render = function() {
			var self = this;

			this.elements.forEach( function(e) {
				e.parentNode.removeChild(e);
			} );

			this.elements = [];

			var offsets = this.tickOffsets();

			offsets.forEach( function(o, i) {

				if (self.graph.x(o.value) > self.graph.x.range()[1]) return;

				var element = document.createElement('div');
				element.style.left = self.graph.x(o.value) + 'px';
				element.classList.add('x_tick');
				element.classList.add(self.ticksTreatment);

				var title = document.createElement('div');
				title.classList.add('title');
				title.innerHTML = o.unit.formatter(new Date(o.value * 1000));

				element.appendChild(title);
				self.graph.element.appendChild(element);

				// Place title to the left of the line if it's going to get cut off
				if (element.getElementsByClassName('title')[0].getBoundingClientRect().right >
					self.graph.element.getBoundingClientRect().right) {
					title.style.right = '2px'
				}

				// Remove title if it's going to intersect with its neighbor
				if (i > 0 &&element.getElementsByClassName('title')[0].getBoundingClientRect().left <
					self.graph.element.getElementsByClassName('title')[i-1].getBoundingClientRect().right) {
					element.removeChild(title);
				}

				self.elements.push(element);

			} );		
		}
	}

	return CorrelateXAxis;

});