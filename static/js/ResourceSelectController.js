define([], function() {
	var ResourceSelectController = Backbone.View.extend({
		el: '#resource_dropdown',
		
		initialize: function(options) {
			this.registerDropdownEvents();
			this.listenTo(options.vent, 'focus-input', this.focusInput);
		},

		events: {
			'click' : 'focusInput',
			'keydown' : 'keyController',
		},

		registerDropdownEvents: function() {
			var self = this;
			this.$el.on('shown.bs.dropdown', function() {
				self.focusInput();
			});
		},

		focusInput: function() {
				this.$('input').select();			
		},

		keyController: function(e) {
			if (e.which  == 38) this.highlightNext('up');
			else if (e.which  == 40) this.highlightNext('down');
			else if (e.which  == 13) this.clickHighlighted();
		},

		highlightNext: function(direction) {
			// TODO scroll to highlighted if not in view

			// get currently highlighted li
			var highlighted = this.$('.menu-single:visible li.highlighted').first();
			
			if (!highlighted.length) {
				// if none are highlighted yet, choose the first or last depending on direction
				if (direction == 'up') this.$('.menu-single:visible li:not(.resource-type)').last().addClass('highlighted theme-background');
				else this.$('.menu-single:visible li:not(.resource-type)').first().addClass('highlighted theme-background');
			} else {
				// remove highlight from current li and add it to the one after it
				var allItems = this.$('.menu-single:visible li:not(.resource-type)');
				var highlightedIndex;
				var found = allItems.each(function(i, el) {
					if ($(el).hasClass('highlighted')) {
						$(el).removeClass('highlighted theme-background');
						highlightedIndex = direction=='up' ? i-1 : i+1;
						return false;
					}
				});
				$(allItems[highlightedIndex]).addClass('highlighted theme-background');
			}
		},
		
		clickHighlighted: function() {
			this.$('.menu-single:visible .highlighted').click();
		}
	});

	return ResourceSelectController;
});