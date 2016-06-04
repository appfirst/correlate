define(['ResourceModel', 'backgrid'], function(ResourceModel, Backgrid) {
	var ProcessClickableRow = Backgrid.Row.extend({

		events: {
			'click .name' : 'click',
	 	 	'mouseenter .proc-name' : 'showArgs',
	 	 	'mouseleave .proc-name' : 'showArgs',
		},

		click: function() {
			var newModelAttrs = _.extend(_.clone(this.model.attributes), {
				name: this.model.get('name') + ' (pid: '+this.model.get('uid').split('_')[1]+')',
				cid: 'p'+this.model.get('uid')
			});

			var procResource = new ResourceModel(newModelAttrs, {
				name: 'processes',
				selectedMetrics: this.model.collection.pageableCollection.selectedMetrics,
				timeController: this.model.collection.pageableCollection.timeController,
				watchedResources: this.model.collection.pageableCollection.watchedResources,
				vent: this.model.collection.pageableCollection.vent
			});
			procResource.set({watching: true});

			this.model.collection.pageableCollection.watchedResources.add(procResource);
		},

		showArgs: function() {
			var self = this;

			this.$firstTd = this.$('td:first');
			this.$restTd = this.$('td').not(this.$firstTd);

			if (this.showingArgs) {
				clearTimeout(this.timeout);
				this.showingArgs = false;
				this.$restTd.show();
				this.$firstTd.removeAttr('colspan');
				this.$firstTd.css('white-space', '');
				this.$el.html(this.$allTd)
			} else {
				var elWidth = this.$firstTd[0].getBoundingClientRect().width;
				var innerWidth = this.$('.name')[0].getBoundingClientRect().width + this.$('em')[0].getBoundingClientRect().width + 20;
				if (elWidth >= innerWidth) return;

				self.showingArgs = true;
				this.timeout = setTimeout(function() {
					/* Delay the hover action by a bit */
					self.$restTd.hide();
					self.$firstTd.attr('colspan', 99);
					self.$firstTd.css('white-space', 'normal')
				}, 500);
			}
		}
	});

	return ProcessClickableRow;
});