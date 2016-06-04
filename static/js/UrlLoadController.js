define(['PresetHandler'], function(PresetHandler) {
	/*
		The UrlLoadController parses the url on page load and creates a new PresetHandler with the parsed information 
	*/
	var UrlLoadController = Backbone.View.extend({

		initialize: function(options) {

			this.selectedMetrics = options.selectedMetrics;
			this.timeController = options.timeController;
			this.watchedResources = options.watchedResources;
			this.vent = options.vent;
			
			this.resources = [];

			var url = Backbone.history.fragment;
			url = this.url = url.split(',');

			_.each(url, function(param) {
				if (!param.length) return;

				var startRe = new RegExp('^start');
				var endRe = new RegExp('^end');
				var detailRe = new RegExp('^detail');

				if (startRe.test(param)) { //param is start timestamp
					this.start = parseInt(param.split('@')[1])
				} else if (endRe.test(param)) { //param is end timestamp
					this.end = parseInt(param.split('@')[1])
				} else if (detailRe.test(param)) { //param is clicked timestamp
					this.clickedTime = parseInt(param.split('@')[1])
				} else {
					this.parseResource(param)
				}

			}, this);

			// don't do anything if there are no url arguments
			if (url.length < 2 && url[0].length == 0) return;

			this.createState();
		},

		parseResource: function(resource) {
			var typeMap = {
				's' : 'servers', 'a' : 'process_groups', 'n' : 'polled_data',
				'l' : 'logs', 'b' : 'buckets', 'p': 'processes'
			}

			var r = resource.split('+')
			var type = r[0][0];//.match(/\D*/)[0];
			var id = r[0].substring(1);//.match("([A-Za-z]+)([0-9_]*)")[2];
			var metrics = _.rest(r, 1);

			this.resources.push({
				id: id,
				metrics: metrics,
				type: typeMap[type]
			});
		},

		createState: function() {
			var args = {
				resources: this.resources,
				selectedMetrics: this.selectedMetrics,
				timeController: this.timeController,
				watchedResources: this.watchedResources,
				vent: this.vent
			}

			if (this.start && this.end) {
				args['timeRange'] = [parseInt(this.start), parseInt(this.end)];
			}
			if (this.clickedTime) {
				args['clickedTime'] = parseInt(this.clickedTime);
			}

			new PresetHandler(args);
		}

	});

	return UrlLoadController;
});