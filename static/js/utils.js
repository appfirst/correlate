/*
	Utilities
*/

var WINDOWS_TICK = 1000000;
var SEC_TO_UNIX_EPOCH = 11644473600;
var windowsEpochToLinuxEpoch = function(windows_epoch) {
	return Number(windows_epoch) / WINDOWS_TICK - SEC_TO_UNIX_EPOCH;
}

var formatVal = function(number, unitsOrMetric) {

    var unitTypes = ["microseconds", "percentage", "number", "bytes", "currency"];

    var unitsMap = {
        avg_response_time:     "microseconds",
        cpu:                   "percentage",
        critical_log:          "number",
        disk_busy:             "percentage",
        disk_busy_max:         "percentage",
        disk_percent:          "percentage",
        diskp_max:             "percentage",
        file_num:              "number",
        file_read:             "bytes",
        file_write:            "bytes",
        mem:                   "bytes",
        memory:                "bytes",
        num_critical:          "number",
        num_info:              "number",
        num_warning:           "number",
        page_faults:           "number",
        process_num:           "number",
        registry_num:          "number",
        response_num:          "number",
        socket_num:            "number",
        socket_read:           "bytes",
        socket_write:          "bytes",
        s_time:                "microseconds",
        thread_num:            "number",
        total_log:             "number",
        currency:              "currency",
        dollars:               "currency",
    };

    var dynamicUnit = function(metric) {
        if (/^disk_busy/.test(metric)) return unitsMap['disk_busy'];
        if (/^diskp/.test(metric)) return unitsMap['disk_percent'];
        return false;
    }

    function commas(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    }

    function isInt(num) {
       return num % 1 === 0;
    }

    function bigNum(num) {
        if (num >= 1000000000000) {
            return (num / 1000000000000).toFixed(1) + 'T';
        }
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        }
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else {
            return commas(num);
        }
    }

    function formatSeconds(num) {
        var result;
        if (num > 1000000){
            result = isInt(num/1000000) ? num/1000000 : (num/1000000).toFixed(1);
            result += "s";
        } else if (num > 1000) {
            result = isInt(num/1000) ? num/1000 : (num/1000).toFixed(1);
            result += "ms";
        } else {
            result = isInt(num) ? num : (num).toFixed(1);
            result += "µs"
        }
        return result;
    }

    function formatCurrency(num) {
        var value = num >= 1000000 ? bigNum(num) : commas(num);
        return '$' + value;
    }

    function format1024(y) {
        var abs_y = Math.abs(y);
        if (abs_y >= 1125899906842624)  { return (y / 1125899906842624).toFixed(2) + " P" }
        else if (abs_y >= 1099511627776){ return (y / 1099511627776).toFixed(2) + " T" }
        else if (abs_y >= 1073741824)   { return (y / 1073741824).toFixed(2) + " G" }
        else if (abs_y >= 1048576)      { return (y / 1048576).toFixed(2) + " M" }
        else if (abs_y >= 1024)         { return (y / 1024).toFixed(2) + " K" }
        else if (abs_y < 1 && y > 0)    { return y.toFixed(2) + " " }
        else if (abs_y === 0)           { return 0 + " " }
        else                        { return y + " " }
    };  

    function preventFloatProbs(x, n) {
        // rounds floats to 2 digits and gets rid of any floating point long-decimal issues
        // method suggested at https://github.com/mbostock/d3/issues/210
        var ten_n = Math.pow(10,n); return Math.round(x * ten_n) / ten_n;
    }  

    var unit, metric, value;

    if (unitTypes.indexOf(unitsOrMetric) != -1) {
        unit = unitsOrMetric;
    } else {
        unit = unitsMap[unitsOrMetric] || dynamicUnit(unitsOrMetric) || "number";
    }

    if (number === undefined || number === null) return number;

    if (isNaN(number)) {
        return number;
    } else {
        number = preventFloatProbs(number, 2);
    }

    if (unit == 'number') {
        value = number >= 1000000 ? bigNum(number) : commas(number); //+100-100 gets rid of weird float decimals
    
    } else if (unit == 'percentage') {
        value = isInt(number) ? commas(number) : commas(number.toFixed(2));
        value += '%';
   
    } else if (unit == 'bytes') {
        value = format1024(number);
        value += 'B';
    
    } else if (unit  == 'microseconds') {
        value = formatSeconds(number);

    } else if (unit  == 'currency') {
        value = formatCurrency(number);
    }

    return value;
}




formatNumberTests = function() {
    var num, unit;

    numbers = [null, undefined, 0, "0", 1, "1", 1.0, "1.0", 1.1, "1.1", 1.10, "1.10", 1.123, "1.123", 1.1234, "1.1234", 1.00001, "1.00001",
                1000, 10000, 100000, 1000000, 10000000, 100000000, 1000000000, 100000000000, 1000000000000, 10000000000000, "foo", "23foo", "0foo"];

    units = [null, undefined, 0, "0", "microseconds", "percentage", "number", "bytes", "foo"];

    results = []
    for (u in units) {
        for (n in numbers) {
            var result = formatVal(numbers[n], units[u])
            console.log(' unit: ', units[u], 'number: ', numbers[n], ' result: ', result);
            results.push(result);
        }
    }
    return results
}

/*
    Sorting function that treats undefined values as -Infinity
*/
var sortByAttribute = function(model, sortKey) {
    return model.has(sortKey) ? model.get(sortKey) : -Infinity;
}

var sortByNumber = function(model, sortKey) {
    return parseFloat(model.get(sortKey))
}


/*
    moment locale setup
*/

if (typeof(moment) == 'function' && moment.locale && moment.locale() == 'en') {
    moment.locale('en', {
        relativeTime : {
            future: "in %s",
            past:   "%s ago",
            s:  "< 1 minute",
            m:  "1 minute",
            mm: "%d minutes",
            h:  "1 hour",
            hh: "%d hours",
            d:  "1 day",
            dd: "%d days",
            M:  "1 month",
            MM: "%d months",
            y:  "1 year",
            yy: "%d years"
        }
    }); 
}

var getTimeRanges = function() {
    return {
           'Last Hour': [moment().subtract(1, 'hour').subtract(1, 'minute').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')],
           'Last 3 Hours': [moment().subtract(3, 'hour').subtract(1, 'minute').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')],
           'Last 6 Hours': [moment().subtract(6, 'hour').subtract(1, 'minute').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')],
           'Last 12 Hours': [moment().subtract(12, 'hour').subtract(1, 'minute').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')],
           'Today': [moment().startOf('day'), moment().startOf('minute').subtract(1, 'minute')],
           'Last 24 Hours': [moment().subtract(24, 'hour').subtract(1, 'minute').startOf('hour'), moment().startOf('hour').subtract(1, 'minute')],
           'Last 2 days': [moment().subtract(2, 'days').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')],
           'Last 3 days': [moment().subtract(3, 'days').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')],
           'Last 7 days': [moment().subtract(7, 'days').startOf('minute'), moment().startOf('minute').subtract(1, 'minute')]
        }   
}

var getMaxDate = function() {
    return moment().add(1, 'minute')
}   