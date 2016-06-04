define(['Metrics', 'Metric', 'Resources'], function(Metrics, Metric, Resources) {
	var ResourceModel = Backbone.Model.extend({

		idAttribute: 'cid',

		defaults: function(){
			return {
				'matches_q': true,
				'metrics' : new Metrics([], {model: Metric}),
				'fetched_once': false
			}
		},

		initialize: function(attributes, options) {
			this.type = this.collection ? this.collection.name: options.name;
			this.selectedMetrics = this.collection ? this.collection.selectedMetrics : options.selectedMetrics;
			this.timeController = this.collection ? this.collection.timeController : options.timeController;
			this.watchedResources = this.collection ? this.collection.watchedResources : options.watchedResources;
			this.vent = this.collection ? this.collection.vent : options.vent;
			
			this.setup();
			
			this.listenTo(this, 'change:watching', this.addRemoveWatched);
			this.listenTo(this.vent, 'new-time-range', this.newTimeRange);
			this.listenToOnce(this.vent, 'manual-remove', this.checkUnwatch);
		},

		setup: function() {
			var self = this;

			this.meta = {
				urlBase: Resources[this.type].url,
				name: Resources[this.type].name,
				additional_info: Resources[this.type].additional_info,
				title: Resources[this.type].title,
				title_singular: Resources[this.type].title_singular,
				resourcePrefix: Resources[this.type].resourcePrefix,
				metrics: Resources[this.type].metrics,
				parser: Resources[this.type].parser,
				extra_metrics: Resources[this.type].extra_metrics,
				detailTabs: Resources[this.type].detailTabs
			}

			// keeps track of data requested already-requested data doesn't get requested again.
			// gets cleared if the time step changes.
			this.rangesRequested = [];

			// Create unique id called 'cid'
			var prefix = this.meta.resourcePrefix;
			this.set('cid', prefix + (this.get('id') || this.get('uid')).toString());

			_.each(this.meta.metrics, function(m) {
				self.get('metrics').add(_.extend(m, {resource:self}));
			})

			// Set watching to true if resource is already being watched
			if (this.watchedResources.get(this.get('cid'))) {
				this.set({'watching':true})			
			};
		},

		addRemoveWatched: function(model, watching) {
			if (watching === true) {
				this.watchedResources.add(this);
				this.fetchData()
			} else {
				this.watchedResources.remove(this.get('cid'));
				this.unselectMetrics();
				this.removeData();
			}
		},

		unselectMetrics: function() {
			this.get('metrics').each(function(metric) {
				this.selectedMetrics.get(metric.get('id')) && this.selectedMetrics.get(metric.get('id')).set({selected:false});
			}, this);
		},

		removeData: function() {
			this.unset('data');
		},

		/* 
			Gets called when a 'manual-remove' event is emitted. This ensures that the unwatching of any
			URL-added resources trigger a change:watching event on resources with the same cid. 
		*/
		checkUnwatch: function(cid) {
			if (this.get('cid') == cid && this.get('watching') === true) {
				this.set({watching: false});
			}
		},

		newTimeRange: function() {
			if (this.get('watching') === true) {
				this.fetchData();
			}
		},

		/*
			Checks if currently-stored data is identical to the data about to
			be fetched. Returns true if fetch not needed; false if needed.
		*/
		checkHasData: function() {
			var time = this.timeController.getTimeRange(); //[start, end, step]

			if (time[2] == this.time_step &&					// same time step
				this.has('data') && this.get('data').length &&  // data exists
				_.where(this.get('data'), {time: time[0]}).length && // data point exists for start time
				_.where(this.get('data'), {time: time[1]}).length)	// data point exists for end time
			{
				return true
			} else {
				return false	
			}
		},

		constructUrl:function() {
			var url = this.meta.urlBase + (this.get('id') || this.get('uid'));
			
			var timeRange = this.timeController.getTimeRange(); //[start, end, step]

			if (timeRange[2] !== this.time_step) {
				// clear requested time ranges if using a different time step
				this.rangesRequested = [];
			}

			// adjusted time range based on already-requested data
			var time = this.determineFetchTimeRange(timeRange[0], timeRange[1]);
			
			// return false if request not needed
			if (time === false) return false;

			// keep track of time ranges requested
			this.addRequestedTimeRange(time[0], time[1]);

			url += '/data/?start=' + parseInt(time[0]);
			url += '&end=' + parseInt(time[1]);
					
			if (this.meta.name == 'logs') { // logs do not have Hour or Day summaries available
				url += '&time_step=' + 'Minute';
			} else {
				url += '&time_step=' + timeRange[2];
			}
			
			return url;
		},

		determineFetchTimeRange: function(start, end) {
			low = _.min(this.rangesRequested, function(d){return d.start}).start;
			high = _.max(this.rangesRequested, function(d){return d.end}).end;
			var btwn = function(n, min, max) {return n >= low && n <= high};
			
			if (btwn(start) && btwn(end)) {
				// data for range already requested
				return false
			} else if (btwn(start) && end > high) {
				// first part of range already requested
				return [high, end]
			} else if (btwn(end) && start < low) {
				// last part of range already requested
				return [start, low]
			} else {
				// range either not yet requested, or start < low && end > high.
				return [start, end]
			}
		},

		addRequestedTimeRange: function(start, end) {
			this.rangesRequested.push({start:start, end:end});
		},

		fetchData: function(metric, value, paged_data, url) {
			var self = this;
			var timeRange = this.timeController.getTimeRange();
			var requestUrl = url || self.constructUrl();

			if (requestUrl === false) {
				// request isn't needed. ensure the data is sorted by time.
				data = _.sortBy(self.get('data'), 'time');

				// data already exists, so trigger immediately
				this.trigger('data-received', this);
				// trigger the change event
				self.trigger('change:data', self);
			} else {
				// construct ajax request for data
				self.trigger('data-fetch-start', self);

				$.ajax({
					url: requestUrl,
					dataType: 'JSON',
					success: function(resp) {
						
						// clear data if using a different time step
						if (timeRange[2] != self.time_step) { 
							self.set({'data':data}, {silent:true});
						}

						// store the time_step associated with this data
						self.time_step = timeRange[2];

						// merge data in response with data from last page, if any
						var data = _.uniq(_.union(self.get('data') || [], resp.data), false, function(d){return d.time});

						data = self.meta.parser ? self.meta.parser(data) : data;
						
						// defer the change event until after extra metrics are added
						self.set({'data': data}, {silent:true});
						self.addExtraMetrics();
						self.trigger('data-received', self);
						self.trigger('metrics-added', self);
						
						// trigger the change event
						self.trigger('change:data', self);	
						
						if (resp.pagination.next) {
							// if more data, fetch it.
							self.fetchData(metric, value, data, resp.pagination.next)
							self.trigger('data-fetch-page', self);
						}

					},
					error: function() {
						self.trigger('data-error', self);
					}
				});			
			}
		},

		parse: function(data) {
			// ensure 'name' exists for any type of resource
			data.name = data.name || data.nickname || data.source
			return data;
		},

		/*
			Some server metrics are dynamically named; we cannot get them until we see a tick of data.
			Those are added here, and trigger the metrics view to re-render.
		*/
		addExtraMetrics: function() {
			var self = this;
			if (this.get('data').length) {
				if (this.meta.extra_metrics) {
					var extras = this.meta.extra_metrics(this.get('data'));
					_.each(extras, function(m){
						if (!self.get('metrics').findWhere({value: m.value})) {
							self.get('metrics').add(_.extend(m, {resource:self}));						
						}
					});
				}
			}
		}

	});
	
	return ResourceModel;
});