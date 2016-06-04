define(['DatepickerConfig'], function(DATEPICKER_CONFIG) {
	var AutoUpdateController = Backbone.View.extend({

		el: '#auto_update',

		events: {
			'click input' : 'click'
		},

		initialize: function(options) {
			var self = this;

			this.timeController = options.timeController;
			this.vent = options.vent;

			setInterval(function(){self.updateTime()}, 60000);

			this.hasManuallyClicked = false;
			this.listenTo(this.vent, 'new-time-range', this.checkShouldAutoUpdate);

			$('#date_select .dropdown').on('show.daterangepicker', function() {
				self.pickerOpen = true;
			});
			$('#date_select .dropdown').on('hide.daterangepicker', function() {
				self.pickerOpen = false;
			});
		},

		/*
			If user has clicked the checkbox, don't modify
			their choice in this.checkShouldAutoUpdate().
		*/
		click: function() {
			this.hasManuallyClicked = true;
		},

		getAutoUpdate: function() {
			return this.$('input').prop('checked');
		},

		updateTime: function() {
			var self = this;
			
			// don't allow autoupdate if picker is open
			if (this.getAutoUpdate() === true && !this.pickerOpen) {

				// Update daterangepicker's ranges
				$('#date_select .dropdown').data('daterangepicker').setOptions(_.extend(DATEPICKER_CONFIG, {
					ranges: getTimeRanges(),
					maxDate: getMaxDate()
				}), function(start, end) { self.timeController.changeTime(start, end) });

				var currentDate = this.timeController.getTimeRange(); 
				var start = moment.unix(currentDate[0]).add(1, 'minute');
				var end = moment.unix(currentDate[1]).add(1, 'minute');
				this.vent.trigger('set-new-time', start, end);
			}
		},

		/*
			If end time is more than 5 minutes difference from right now,
			uncheck the auto-update box.
		*/
		checkShouldAutoUpdate: function(time_range) {

			if (Math.abs(moment.duration(moment.unix(time_range[1]).diff(moment())).asMinutes()) > 5) {
				!this.hasManuallyClicked && this.$('input').prop('checked', false);
			}
		}

	});	

	return AutoUpdateController;
})
