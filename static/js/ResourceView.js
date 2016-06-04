define([], function() {
	var ResourceView = Backbone.View.extend({
		tagName: 'li',
		className: 'resource-item hover-theme-background',
		template: _.template($('#resource_item_template').html()),
		
		events: {
			'click' : 'click',
		},

		initialize: function() {
			this.listenTo(this.model, 'change:watching', this.render);
			this.vent = this.model.vent;
		},

		parseAdditionalInfo: function() {
			if (this.model.meta.additional_info) {
				return this.model.meta.additional_info(this.model);
			} else {return ''}
		},

		render: function() {
			this.model.get('watching') ? this.$el.addClass('watching') : this.$el.removeClass('watching');
			this.$el.html(this.template(_.extend(
				this.model.toJSON(),
				{'info': this.parseAdditionalInfo()}
			)));
			this.delegateEvents();
			return this;
		},

		click: function(e) {
			var newVal = Boolean(this.model.get('watching'));
			this.model.set('watching', !newVal);
			
			this.vent.trigger('focus-input');

			// create fake keysPressed array if not available
			if (typeof(keysPressed) == 'undefined') {
				var keysPressed = []
			}

			// don't close dropdown if removing resource or if user holds down shift key
			if (newVal || keysPressed[16]) e.stopPropagation();
			// clear query on add as long as shift key isn't pressed
			if (!newVal && !keysPressed[16]) this.vent.trigger('clear-query');
		}

	});

	return ResourceView;
});