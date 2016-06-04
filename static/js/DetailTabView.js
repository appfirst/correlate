define(['DetailRows', 'DetailRow', 'DetailFilter'], function(DetailRows, DetailRow, DetailFilter) {
	var DetailTabView = Backbone.View.extend({

		template: _.template($('#detail_tab_panel_template').html()),
		className: 'tab-pane hidden',

		events: {
			'change select' : 'selectFilter',
			'click .prev-page' : 'clickPrevPage',
			'click .next-page' : 'clickNextPage'
		},

		initialize: function(options) {
			this.currentRequestsNum = 0;
			this.graphController = options.graphController;
			this.selectedMetrics = options.selectedMetrics;
			this.timeController = options.timeController;
			this.watchedResources = options.watchedResources;
			this.graph = options.graph;
			this.vent = options.vent;
			this.$tab = $('#detail_tabs a[href="#'+this.$el.attr('id')+'"]');
			this.info = options.info;
			this.id = options.id;
			this.name = options.name;

			// store sorted column and direction
			this.sortedColumn = undefined;
			this.sortedDirection = undefined;

			this.collection = new DetailRows([], {model: DetailRow});
			this.collection.selectedMetrics = this.selectedMetrics;
			this.collection.timeController = this.timeController;
			this.collection.watchedResources = this.watchedResources;
			this.collection.vent = this.vent;
			
			this.table = new Backgrid.Grid({
				columns: options.columns,
				collection: this.collection,
				className: 'backgrid',
				row: options.row,
				emptyText: 'No data to show'
			});

			this.listenTo(this.vent, 'clear-rows', this.resetTable);
			this.listenTo(this.vent, 'series-removed', this.removeResource);
			this.listenTo(this.vent, 'series-removed', this.checkMetrics);
			this.listenTo(this.collection, 'backgrid:sorted', this.setSorting);
			this.listenTo(this.collection, 'reset', this.updateCounts);

			this.render();

			this.filter = new DetailFilter({
				el: this.$('.filter'),
				collection: this.collection
			});	
		},

		render: function() {

			if (this.name == 'strf') {
				this.$el.addClass('strf');
			}

			this.$el.attr('id', this.id);
			this.$el.html(this.template());
			$('#table_container .tab-content').append(this.$el);
			this.$('.table-container').append(this.table.render().el);
		},

		showTab: function() {
			this.$el.removeClass('hidden');
			this.$tab.parent().removeClass('hidden');

			// Set tab to active if no visible tabs are active
			if ($('#detail_tabs.nav-tabs li:not(.hidden)').hasClass('active') === false) {
				// Don't select a tab until all of the tabs that should be visible are visible
				if ($('#detail_tabs.nav-tabs li:not(.hidden)').length == _.keys(this.graphController.getDetailMetricsCategories()).length) {
					$('#detail_tabs li:not(.hidden) a').first().click();
				}
			}
		},

		hideTab: function() {
			this.$el.addClass('hidden');
			this.$tab.parent().addClass('hidden');	
			this.$tab.parent().removeClass('active');
			
			// Set first tab (that's not this one) to active
			if ($('#detail_tabs.nav-tabs li:not(.hidden)').not(this.$tab).hasClass('active') === false) {
				$('#detail_tabs li a').not(this.$tab).first().click();
			}
		},

		checkDone: function() {
			this.currentRequestsNum--;
			if (this.currentRequestsNum === 0) {
				this.hideLoading();
				this.checkMetrics();
			}
		},

		showLoading: function() {
			this.currentRequestsNum++;
			this.hideTime();
			this.hideError();
			this.$('.loading').show();
		},

		hideLoading: function() {
			this.$('.loading').hide();
			this.showTime();
			this.triggerSavedState();
		},

		showError: function() {
			this.hideLoading();
			this.hideTime();
			this.$('.error').show();
		},

		hideError: function() {
			this.$('.error').hide();
		},

		showTime: function() {
			this.$('.time')
				.html(this.collection.length + ' ' + this.$tab.text().toLowerCase() + ' at ' )
				.append(moment.unix(this.graph.lastActivePoint).format('MM/D/YYYY HH:mm [GMT]ZZ'))
				.show();
		},

		hideTime: function() {
			this.$('.time').hide();
		},

		triggerSavedState: function() {
			this.filter.search();
			this.sortedColumn && this.sortedDirection && this.table.sort(this.sortedColumn, this.sortedDirection);
		},

		renderResourceSelect: function() {
			var self = this;		
			
			var resources = _.uniq(this.collection.fullCollection.map(function(r) {
				return {name: r.get('resource_name'), id: r.get('resource_id')}
			}), function(d) {return d.id});
			
			this.$('select').empty();
			
			if (resources.length < 2) {
				this.$('select').addClass('hidden');
			} else {
				this.$('select').append('<option value="all">all</option>');			
				
				_.each(resources, function(r) {
					this.$('select').append('<option value="'+r.id+'">'+r.name+'</option>');
				}, this);

				this.$('select').removeClass('hidden');
			}
		},

		selectFilter: function() {
			this.filter.selectFilter = this.$('select').val();
			this.filter.search();
		},

		addRows: function(detailItems) {
			this.collection.fullCollection.add(detailItems);
			this.renderResourceSelect();
			return this;
		},

		resetTable: function() {
			this.collection.fullCollection.reset();
			// this.filter.clear();
		},

		clickPrevPage: function() {
			this.collection.getPreviousPage();
		},

		clickNextPage: function() {
			this.collection.getNextPage();
		},

		updateCounts: function() {
	    	var state = this.collection.state;
	    	var total = state.totalRecords || 0;
	    	var numOnPage = this.collection.length;
	    	var start = state.pageSize * state.currentPage - (state.pageSize-1);
	    	var end = start + numOnPage - 1;
			
			// var text = '';
			// if (total) {text = 'Showing '+addCommas(start) + ' - ' + addCommas(end) + ' of ' + addCommas(total) + ' messages'}
			// else {text = 'No matched messages'};
			// if (state.originalSize > total) text += ' (filtered from ' + addCommas(state.originalSize) + ' total)'
			// this.renderResultsText(text);
			if (total > state.pageSize) {
				this.$('.time').html(start+'–'+end+' of '+total+' '+this.$tab.text().toLowerCase()+' at ' )
			} else {
				this.$('.time').html(total+' '+this.$tab.text().toLowerCase()+' at ' )
			}
			this.$('.time').append(moment.unix(this.graph.lastActivePoint).format('MM/D/YYYY HH:mm [GMT]ZZ')).show();
			
			if (start == 1) {
				this.$('.prev-page').attr('disabled', 'disabled');
			} else {
				this.$('.prev-page').removeAttr('disabled');
			}

			if (end == total) {
				this.$('.next-page').attr('disabled', 'disabled');
			} else {
				this.$('.next-page').removeAttr('disabled');
			}

	        if (total > state.pageSize) {
	            this.$(".prev-page, .next-page").show();
	        } else {
	            this.$(".prev-page, .next-page").hide();
	        }			
		},		

		setSorting: function(column, direction) {
			this.sortedColumn = column;
			this.sortedDirection = direction;
			
			// Go to first page on sort
			this.collection.getFirstPage({reset: true});
		},

		checkMetrics: function(metric_model, series) {
			
			if (this.graph.lastActivePoint && this.name in this.graphController.getDetailMetricsCategories()) {
				
				// Show Registries tab only if there is registry data
				if (this.el.id == 'detail_tab_registries') {
					this.collection.length && this.showTab();
				} else {
					this.showTab();
				}

			} else {
				this.resetTab();
				this.hideTab();
			}
		},

		resetTab: function() {
			this.collection.reset();
			this.hideError();
			this.hideLoading();
			this.hideTime();
			this.filter.clear();
		},

		/*
			If a metric is removed from the graph and none of a resource's metrics remain on the graph,
			remove the resource from the table. Note: might want to trigger this only on resource unwatch.
		*/
		removeResource: function(metric_model, series) {
			var remaining = series.filter(function(d){return d.metric_model.get('resource') == metric_model.get('resource')});
			
			if (remaining.length === 0) {
				var toRemove = this.collection.where({resource_id:metric_model.get('resource').get('cid')});
				this.collection.remove(toRemove);
				this.renderResourceSelect();
			}
		}

	});

	return DetailTabView;
});