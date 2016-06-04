define(['ResourceModel', 'Resources'], function(ResourceModel, Resources) {
	var PresetHandler = Backbone.View.extend({

		initialize: function(args) {
			this.selectedMetrics = args.selectedMetrics;
			this.timeController = args.timeController;
			this.watchedResources = args.watchedResources;
			this.vent = args.vent;

			this.start = args.timeRange && args.timeRange[0] ? args.timeRange[0] : this.timeController.getTimeRange()[0];
			this.end = args.timeRange && args.timeRange[1] ? args.timeRange[1] : this.timeController.getTimeRange()[1];
			this.clickedTime = args.clickedTime;
			
			this.start && this.end && this.setTimeRange([this.start, this.end]);
			this.clickedTime && this.setClickedTime(this.clickedTime);
			_.each(args.resources, this.addResource, this);
		},

		setTimeRange: function(timeRange) {
			this.vent.trigger('set-new-time', moment.unix(timeRange[0]), moment.unix(timeRange[1]));
		},

		setClickedTime: function(timestamp) {
			if (this.clickedTime >= this.start && this.clickedTime <= this.end) {
				this.vent.trigger('graph-clicked', timestamp);
			}	
		},
		
		addResource: function(resource) {
			var UrlResourceModel = ResourceModel.extend({
				initialize: function() {
					ResourceModel.prototype.initialize.apply(this, arguments);
					this.listenTo(this, 'change:watching', this.manualUnwatch);
				},
				manualUnwatch: function(model, watching) {
					watching === false && this.vent.trigger('manual-remove', this.get('cid'));
				}
			});

			var model = new UrlResourceModel({
				id: resource.id,
				uid: resource.id,
			}, {
				name: resource.type,
				selectedMetrics: this.selectedMetrics,
				timeController: this.timeController,
				watchedResources: this.watchedResources,
				vent: this.vent
			});

			var url = Resources[resource.type].url+resource.id+'/';
			model.fetch({url:url})
				.done(function() {
					
					// if process, append pid to name
					if (resource.type == 'processes') {
						model.set('name', model.get('name') + ' (pid: '+model.get('uid').split('_')[1]+')')	
					}

					model.set({watching:true});
					model.once('data-received', function() {
						_.each(resource.metrics, function(metric) {
							var m = model.get('metrics').findWhere({value: metric})
							m ? m.set({selected:true}) : null;
						});
					});
				});
		}

	});
	
	return PresetHandler;
});