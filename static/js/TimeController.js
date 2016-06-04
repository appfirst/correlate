define(['DatepickerConfig'], function(DATEPICKER_CONFIG) {

	var TimeController = Backbone.View.extend({
		el: '#date_select .dropdown',
		
		initialize: function(options) {
			this.startTime = DATEPICKER_CONFIG.ranges['Last 3 Hours'][0];;
			this.endTime = DATEPICKER_CONFIG.ranges['Last 3 Hours'][1];
			this.previousTimeStep = 'Minute';
			this.timeStep = 'Minute';
			this.updateTitle();
			this.vent = options.vent;

			this.listenTo(this.vent, 'set-new-time', this.changeTime)
			this.listenTo(this.vent, 'new-time-range', this.showTooltip);
		},

		getTimeRange: function() {
			return [this.startTime/1000, this.endTime/1000, this.timeStep]
		},

		/*
			Returns a timerange for detail data based on the current timeStep
			of resource data that has been requested.
		*/
		getTimeStepPeriod: function(timestamp) {
			if (this.timeStep == 'Minute') return [timestamp, timestamp];
			if (this.timeStep == 'Hour')   return [timestamp, timestamp+60*60];
			if (this.timeStep == 'Day')    return [timestamp, timestamp+60*60*24];
		},

		isPointInRange: function(timestamp) {
			return timestamp >= this.startTime.unix() && timestamp <= this.endTime.unix();
		},

		setTimeStep: function() {
			this.previousTimeStep = this.timeStep;
			if (this.endTime - this.startTime >= 86400000*7) {
			    this.timeStep = "Day";     
			} else if (this.endTime - this.startTime > 86400000*2) {
			    this.timeStep = "Hour";
			} else {
				this.timeStep = "Minute";
			}
			return this.timeStep;
		},

		updateTitle: function() {
			var start = this.startTime.format('MM/D HH:mm');
			var end = this.endTime.format('MM/D HH:mm');
			this.$('.name').html(start + ' - ' + end);
		},

		changeTime: function(start, end) {
			// TODO trigger change date event
			this.setTime(start || this.startTime, end || this.endTime);
			this.setTimeStep();
			this.vent.trigger('new-time-range', this.getTimeRange());
			
			$('#date_select .dropdown').data('daterangepicker').setStartDate(start);
			$('#date_select .dropdown').data('daterangepicker').setEndDate(end);
		},

		setTime: function(start, end) {
			this.startTime = start;
			this.endTime = end;
			this.updateTitle();
		},

		showTooltip: function() {
			if (this.previousTimeStep == this.timeStep) return;
			this.$el.tooltip('destroy');
			this.$el.tooltip({
				title: 'using '+this.timeStep.toLowerCase()+'-aggregated data',
				placement: 'bottom',
				trigger: 'manual'
			}).tooltip('show');

			var self = this;
			setTimeout(function(){self.$el.tooltip('destroy')}, 2500);
		}
	});
	
	return TimeController;
});