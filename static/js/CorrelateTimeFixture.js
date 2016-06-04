define(['rickshaw'], function(Rickshaw) {
	/* 
		Allows array to be returned from a splice (chaining-friendly)
		Syntax:
		array.insert(index, value1, value2, ..., valueN) */

	Array.prototype.insert = function(index) {
	    this.splice.apply(this, [index, 0].concat(
	        Array.prototype.slice.call(arguments, 1)));
	    return this;
	};

	/*
		Custom time fixture for formatting times on x-axis
	*/

	var CorrelateTimeFixture = function() {
		this.units = _.map(new Rickshaw.Fixtures.Time().units, function(unit, i) {

			// Replace default formatters for some of the units
			if (unit.name == 'hour' || unit.name == '6 hour' || unit.name == 'day') {
				unit.formatter = function(d) {
					return moment(d).format('MM/D HH:mm');
				}
			} else if (unit.name == '15 minute') {
				unit.formatter = function(d) {
					return moment(d).format('MM/D HH:mm');
				}
			} else if (unit.name == 'minute') {
				unit.formatter = function(d) {
					return moment(d).format('HH:mm');
				}		
			}

			return unit;
			
		}).insert(8, {
			name: '5 minute',
			seconds: 300,
			formatter: function(d) {
				return moment(d).format('MM/D HH:mm')
			}
		});
	}

	CorrelateTimeFixture.prototype = new Rickshaw.Fixtures.Time();
	CorrelateTimeFixture.prototype.constructor = CorrelateTimeFixture;

	return CorrelateTimeFixture;
});