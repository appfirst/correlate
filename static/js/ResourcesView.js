define(['HomeLevelResourceView', 'ResourceView'], function(HomeLevelResourceView, ResourceView) {
	var ResourcesView = Backbone.View.extend({
		className: 'menu-single level',
		template: _.template($('#resource_level_template').html()),
		
		events: {
			'click .back' : 'clickBack',
			'click .sp' : 'stopProp',
		},

		initialize: function(options) {
			this.resourceFilterController = options.resourceFilterController;
			this.vent = options.vent;
			
			this.renderHomeLevel();
			this.listenTo(this.collection, 'clear-list', this.renderList);
			this.listenTo(this.collection.fullCollection, 'add', this.appendResource);
			this.listenTo(this.collection, 'click-level', this.goToLevel);
		},

		renderList: function() {
			var self = this;
			this.$el.html(this.template({
				title: this.collection.title
			}));
			this.$('ul').css('max-height', Math.min($(window).height()-168, 600)+'px');
			this.$('ul').scroll(function(){self.scrollHandler()});
		},

		renderHomeLevel: function() {
			this.renderList();
			$('#resource_select .dropdown-menu').append(this.$el);
			var homeLevel = new HomeLevelResourceView({
				collection: this.collection,
				resourceFilterController: this.resourceFilterController
			});
			$('#home_level_list').append(homeLevel.render().el);
		},

		appendResources: function() {
			this.renderList();
			this.collection.each(this.appendResource, this);
		},

		appendResource: function(model) {
			var resourceView = new ResourceView({model: model});
			this.$('ul').append(resourceView.render().el);
		},

		filterResources: function() {
			this.collection.each(this.checkResource, this);
			this.collection.trigger('preview-resources');
		},

		checkResource: function(resource) {
			var query = this.resourceFilterController.getQueryString();
			if (!query.length) {
				resource.set('matches_q', true);
			}
			if (resource.get('name').indexOf(query) > -1) {
				resource.set('matches_q', true);
			} else {
				resource.set('matches_q', false);
			}
		},

		goToLevel: function() {
			$('#home_level').hide();
			this.$el.show();
			this.vent.trigger('focus-input');
		},

		clickBack: function() {
			this.$el.hide();
			$('#home_level').show();
			this.vent.trigger('focus-input');
		},

		stopProp: function(e) {
			e.stopPropagation();
		},

		scrollHandler: function() {
			var self = this;
	        if(this.$('ul').scrollTop() + this.$('ul').innerHeight() >= this.$('ul')[0].scrollHeight) {
	            if (this.collection.doesNextPageExist()) {
		            this.$('.status').removeClass('hidden');
		            this.collection.getNextPage()
			            .always(function() {
			            	self.$('.status').addClass('hidden');
			            });
	            }
	        }
		}
			
	});

	return ResourcesView;
});