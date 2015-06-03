// Javascript version of https://github.com/abeusher/timehash/blob/master/timehash.py
//
// This module creates a fuzzy precision representation of a time interval.
// It makes calculations based on a 64 year representation of time from January 1, 1970 to January 1, 2098.
// Values are encoded with a number of bits(represented by an ASCII character) that indicate the amount of time to add to 1970.
// Times prior to 1970 or after 2098 are not accounted for by this scale.
// Each character added to the timehash reduces the time interval ambiguity by a factor of 8.
// Valid characters for encoding the floating point time into ASCII characters include {01abcdef}
//  0 +/- 64 years
//  1 +/- 8 years
//  2 +/- 1 years
//  3 +/- 45.65625 days
//  4 +/- 5.707 days
//  5 +/- 0.71337 days = 17.121 hours
//  6 +/- 2.14013671875 hours
//  7 +/- 0.26751708984375 hours = 16.05 minutes
//  8 +/- 2.006378173828125 minutes
//  9 +/- 0.2507 minutes = 15 seconds
//  10 +/- 1.88097 seconds

TIMEHASH_BITS = [4, 2, 1];

TIMEHASH_BASE32 = "01abcdef";

// Encode a timestamp given as a floating point epoch time to a timehash which will have the character count precision.
function encodeTimeHash(timeseconds, precision) {
	var precision = typeof precision !== 'undefined' ? precision : 10;
	
	var time_interval = [0.0, 4039372800.0]; // from January 1, 1970 to January 1, 2098
    var timehash = new Array();
    var bit = 0;
    var ch = 0;
    
    while (timehash.length < precision) {
        var mid = (time_interval[0] + time_interval[1]) / 2;
        if (timeseconds > mid) {
            ch |= TIMEHASH_BITS[bit];
            time_interval[0] = mid;
        } else {
        	time_interval[1] = mid;
        }
        
        if (bit < 2) {
            bit += 1;
        } else {
            timehash.push(TIMEHASH_BASE32[ch]);
            bit = 0;
            ch = 0;
        }
    }
    
    return timehash.join('');
}
