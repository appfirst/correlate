define(['moment', 'utils'], function(moment) {

	var DATEPICKER_CONFIG = {
		startDate: moment().subtract(3, 'hour').subtract(1, 'minute').startOf('minute'),
		endDate: moment().startOf('minute').subtract(1, 'minute'),
		minDate: '01/01/2012',
		maxDate: getMaxDate(),
		dateLimit: { days: 91 },
		showDropdowns: false,
		showWeekNumbers: false,
		timePicker: true,
		timePickerIncrement: 1,
		timePicker12Hour: false,
		ranges: getTimeRanges(),
		opens: 'left',
		buttonClasses: ['btn'],
		applyClass: 'btn-sm btn-theme',
		cancelClass: 'btn-sm btn-default',
		arrowLeftClass: 'glyphicon glyphicon-chevron-left',
		arrowRightClass: 'glyphicon glyphicon-chevron-right',
		format: 'MM/DD/YYYY',
		separator: ' to ',
		locale: {
			applyLabel: 'Apply',
			fromLabel: 'From',
			toLabel: 'To',
			customRangeLabel: 'Custom Range',
			daysOfWeek: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr','Sa'],
			monthNames: ['January', 'February', 'March', 'April', 'May', 'June',
				'July', 'August', 'September', 'October', 'November', 'December'],
			firstDay: 0
		}
	 };

	 return	DATEPICKER_CONFIG;
	
});