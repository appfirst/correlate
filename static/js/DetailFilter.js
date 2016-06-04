define(['backgrid-filter'], function() {

	//custom backgrid filter that avoids using a <form>
	var simpleFilter = Backgrid.Extension.ClientSideFilter.extend({
	    events: _.extend({}, Backgrid.Extension.ClientSideFilter.prototype.events, {
	      "keyup input[type=text]": "search",
	    }),
		tagName: 'div',
		className: 'input-group input-group-sm filter',
		template: _.template('<span class="input-group-addon"><span class="glyphicon glyphicon-search"></span></span><input type="search" class="form-control filter-input" <% if (placeholder) { %> placeholder="<%- placeholder %>" <% } %>>'),
		wait: 150
	});

	var DetailFilter = simpleFilter.extend({

		makeMatcher: function (query) {
			var regexp = this.makeRegExp(query);
			return function (model) {
				var keys = this.fields || model.keys();

				if (this.selectFilter && this.selectFilter != "all"
					&& model.get('resource_id') != this.selectFilter) {return false};

				for (var i = 0, l = keys.length; i < l; i++) {
					// check if message text matches query
					if (regexp.test(model.get(keys[i]) + "")) {
						return true
					}
				}
				return false;
			};
		}

	});

	return DetailFilter;
});