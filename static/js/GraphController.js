define(['ColorScheme'], function(ColorScheme) {
	/*
		Manages the series array for a Rickshaw Graph.
	*/
	var GraphController = Backbone.View.extend({

		initialize: function(options) {
			this.graph = options.graph;
			this.timeController = options.timeController;
			this.selectedMetrics = options.selectedMetrics;
			this.watchedResources = options.watchedResources;
			this.vent = options.vent

			this.listenTo(this.selectedMetrics, 'add', this.toggleMetric, this);
			this.listenTo(this.selectedMetrics, 'remove', this.toggleMetric, this);
			this.listenTo(this.watchedResources, 'change:data', this.updateSeries, this);
			this.listenTo(this.vent, 'new-time-range', this.updatePlaceholderSeriesEmpty, this);
			this.palette = new Rickshaw.Color.Palette({scheme: ColorScheme});
			this.toggleGraphInstructions();
			this.updatePlaceholderSeries();
		},

		/*
			Returns series without the placeholder set
		*/	
		getSeries: function() {
			return this.graph.series.filter(function(d){return d.name != 'placeholder'})
		},

		/*
			Returns a list of detail categories that should be active for the series sets
			TODO could use _.reduce()
		*/	
		getDetailMetricsCategories: function() {
			var metrics = {};
			_.each(this.getSeries(), function(set) {
				_.each(set.metric_model.get('resource').meta.detailTabs, function(tab) {
					metrics[tab.name] = 1
				});
			});
			return metrics;
		},

		/*
			The graph always needs to have a placeholder series to prevent errors. the empty
			series contains x-values appropriate for the time range, and null y-values.
		*/	
		updatePlaceholderSeries: function() {
			var existingSeries = this.graph.series.filter(function(s){return s.name == 'placeholder'});
			var placeholderData = [];
			var timeRange = this.timeController.getTimeRange();
			var minMap = {'Minute':60, 'Hour':3600, 'Day':86400}
			for (var i=timeRange[0]; i<=timeRange[1]; i+=minMap[timeRange[2]]) {
				//y0 needs to be negative so this can never be the closest point to the mouse
				placeholderData.push({x:i, y:null, y0:-1})
			}
			if (existingSeries[0]) existingSeries[0].data = placeholderData;
			else this.graph.series.push({name:'placeholder', data:placeholderData});
			// this.clearGraph();
			this.graph.update();
		},

		/*
			If the series has no sets, update the placeholder series immediately
			(don't wait for updateSeries to be triggered)
		*/
		updatePlaceholderSeriesEmpty: function() {
			!this.getSeries().length && this.updatePlaceholderSeries();
		},

		/*
			Show div#graph_instructions if there are no series sets; hide if one or more
		*/
		toggleGraphInstructions: function() {
			if (!this.getSeries().length) {
				$('#graph_instructions').html(_.template($('#graph_instructions_template').html())());
			} else {
				$('#graph_instructions').empty();
			}
		},

		toggleMetric: function(metric_model) {
			if (metric_model.get('selected') === true) {
				this.addUpdateSeries(metric_model);
			} else {
				this.removeSeries(metric_model);
			}
		},

		updateSeries: function(resource_model) {
			var selectedMetrics = resource_model.get('metrics').where({selected:true});
			_.each(selectedMetrics, this.addUpdateSeries, this);
			this.updatePlaceholderSeries();
		},

		addUpdateSeries: function(metric_model) {
			var self = this;

			var existingMetrics = this.graph.series.filter(function(d){
				return d.name==metric_model.get('resource').get('cid') && d.metric == metric_model.get('value')
			});

			var parsedData = this.parseData(metric_model.get('resource').get('data'), metric_model.get('value'));

			var color = metric_model.get('color') || this.palette.color();

			var unit = metric_model.get('value');

			// update the data if the series already exists
			if (existingMetrics.length) {
				_.each(existingMetrics, function(series) {
					if (parsedData.length) {
						series.data = parsedData
					} else {
						// remove the series if there's no data
						self.removeSeries(metric_model);
					}
				}, this);
				this.graph.update();
				return;
			}

			if (!parsedData.length) {
				!this.graph.series.length && this.graph.update();
				return;	
			}

			this.graph.series.push({
				name: metric_model.get('resource').get('cid'),
				display_name: metric_model.get('resource').get('name'),
				metric: metric_model.get('value'),
				metric_name: metric_model.get('name'),
				metric_model: metric_model,
				data: parsedData,
				unit: unit,
				color: color
			});

			/*		
				Trigger a graph click if graph has been clicked prior to this metric being
				added and no other metrics from this resource have been added yet.
			*/
			if (this.graph.lastActivePoint) {
				var resourcesSets = this.getSeries().filter(function(d){return d.name == metric_model.get('resource').get('cid')})
				if (resourcesSets.length == 1) {
					this.vent.trigger('fetch-resource-details', metric_model.get('resource'));
				}
			}

			metric_model.set({color: color});
			this.updateScales(metric_model.get('value'));
			this.toggleGraphInstructions();

			this.graph.update();

			this.vent.trigger('series-added', metric_model, this.getSeries());
		},

		removeSeries: function(metric_model) {

			var metricsToRemove = this.graph.series.filter(function(d){
				return d.name==metric_model.get('resource').get('cid') && d.metric == metric_model.get('value')
			});
			
			_.each(metricsToRemove, function(metricToRemove) {
				var index = this.graph.series.indexOf(metricToRemove);
				this.graph.series.splice(index, 1);
				this.updateScales(metric_model.get('value'));			
				this.graph.update();
			}, this);

			this.vent.trigger('series-removed', metric_model, this.getSeries());

			this.toggleGraphInstructions();
		},

		parseData: function(data, metric) {
			var timeRange = this.timeController.getTimeRange();
			var numMins = timeRange[1] - timeRange[0];
			var timeStep = timeRange[2];
			var tsConvert = {'Minute': 60, 'Hour': 3600, 'Day': 86400}

			// filter data down to selected timeRange
			data = _.filter(data, function(d) {
				return d.time >= timeRange[0] && d.time <= timeRange[1];
			});

			var dataObject = {};
			_(data).each(function(d) {
				dataObject[d.time] = d[metric]
			});

			if (!data.length) return [];

			var startTime = timeRange[0]
			if (timeStep == 'Hour') {
				startTime = moment.unix(timeRange[0]).startOf('hour').unix();
			} else if (timeStep == 'Day') {
				startTime = moment.unix(timeRange[0]).startOf('day').subtract(moment().zone(), 'minutes').unix();
			}

			// create ticks for any missing values, set value to null
			for (var i=0; i < (numMins/tsConvert[timeStep]); i++) {
				if (dataObject[startTime + tsConvert[timeStep]*i] === undefined) {
					dataObject[startTime + tsConvert[timeStep]*i] = null
				}
			}

			// map to {x, y} object and round value to one decimal place
			var mapped = _.map(dataObject, function(value, time) {
				var yVal = value === null ? null : Math.round( value * 10) / 10;
				return {x:parseInt(time), y: yVal}
			});

			// make sure data is sorted by x, or else firefox doesn't render hoverDetail correctly.
			mapped = _.sortBy(mapped, 'x');

			return mapped;
		},

		updateScales: function(metric_name) {
			
			// 'disk_busy_*' or 'diskp_*' metrics use the same scale
			if (metric_name.indexOf('disk_busy_') === 0) {
				var filterFn = function(d) {return d.metric.indexOf('disk_busy_') === 0};
			} else if (metric_name.indexOf('diskp_') === 0) {
				var filterFn = function(d) {return d.metric.indexOf('diskp_') === 0};
			} else {
				var filterFn = function(d) {return d.metric == metric_name};
			}

			var sameMetric = this.getSeries().filter(filterFn);

			if (!sameMetric.length) return;
			var pluckedData = _.pluck(sameMetric, 'data');
			var allDataSets = _.flatten(pluckedData);
			var maxVal = d3.max(allDataSets, function(d){return d.y});
			var scale = d3.scale.linear().domain([0, maxVal]);
	 		
	 		var newScale = function(val){
				if (val === null) return null;
				return scale(val);
			}
			// since we're creating a custom scale function, we need to
			// add any d3.scale methods that can get called by Rickshaw
			newScale.invert = scale.invert;
			
			var self = this;
			_.each(sameMetric, function(seriesItem) {
				self.updateScale(seriesItem, newScale);
			});
		},

		updateScale: function(seriesItem, newScale) {
			var index = this.graph.series.indexOf(seriesItem);
			this.graph.series[index].scale = newScale;
		}

	});

	return GraphController;
});