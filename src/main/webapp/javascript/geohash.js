// geohash.js
// Geohash library for Javascript
// (c) 2008 David Troy
// Distributed under the MIT License

GEOHASH_BITS = [16, 8, 4, 2, 1];

GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";
GEOHASH_NEIGHBORS = { right  : { even :  "bc01fg45238967deuvhjyznpkmstqrwx" },
							left   : { even :  "238967debc01fg45kmstqrwxuvhjyznp" },
							top    : { even :  "p0r21436x8zb9dcf5h7kjnmqesgutwvy" },
							bottom : { even :  "14365h7k9dcfesgujnmqp0r2twvyx8zb" } };
GEOHASH_BORDERS = { right  : { even : "bcfguvyz" },
							left   : { even : "0145hjnp" },
							top    : { even : "prxz" },
							bottom : { even : "028b" } };

GEOHASH_NEIGHBORS.bottom.odd = GEOHASH_NEIGHBORS.left.even;
GEOHASH_NEIGHBORS.top.odd = GEOHASH_NEIGHBORS.right.even;
GEOHASH_NEIGHBORS.left.odd = GEOHASH_NEIGHBORS.bottom.even;
GEOHASH_NEIGHBORS.right.odd = GEOHASH_NEIGHBORS.top.even;

GEOHASH_BORDERS.bottom.odd = GEOHASH_BORDERS.left.even;
GEOHASH_BORDERS.top.odd = GEOHASH_BORDERS.right.even;
GEOHASH_BORDERS.left.odd = GEOHASH_BORDERS.bottom.even;
GEOHASH_BORDERS.right.odd = GEOHASH_BORDERS.top.even;

function refine_interval(interval, cd, mask) {
	if (cd&mask)
		interval[0] = (interval[0] + interval[1])/2;
  else
		interval[1] = (interval[0] + interval[1])/2;
}

function calculateAdjacent(srcHash, dir) {
	srcHash = srcHash.toLowerCase();
	var lastChr = srcHash.charAt(srcHash.length-1);
	var type = (srcHash.length % 2) ? 'odd' : 'even';
	var base = srcHash.substring(0,srcHash.length-1);
	if (GEOHASH_BORDERS[dir][type].indexOf(lastChr)!=-1)
		base = calculateAdjacent(base, dir);
	return base + GEOHASH_BASE32[GEOHASH_NEIGHBORS[dir][type].indexOf(lastChr)];
}

function decodeGeoHash(geohash) {
	var is_even = 1;
	var lat = []; var lon = [];
	lat[0] = -90.0;  lat[1] = 90.0;
	lon[0] = -180.0; lon[1] = 180.0;
	lat_err = 90.0;  lon_err = 180.0;
	
	for (i=0; i<geohash.length; i++) {
		c = geohash[i];
		cd = GEOHASH_BASE32.indexOf(c);
		for (j=0; j<5; j++) {
			mask = GEOHASH_BITS[j];
			if (is_even) {
				lon_err /= 2;
				refine_interval(lon, cd, mask);
			} else {
				lat_err /= 2;
				refine_interval(lat, cd, mask);
			}
			is_even = !is_even;
		}
	}
	lat[2] = (lat[0] + lat[1])/2;
	lon[2] = (lon[0] + lon[1])/2;

	return { latitude: lat, longitude: lon};
}

function encodeGeoHash(latitude, longitude) {
	var is_even=1;
	var i=0;
	var lat = []; var lon = [];
	var bit=0;
	var ch=0;
	var precision = 12;
	geohash = "";

	lat[0] = -90.0;  lat[1] = 90.0;
	lon[0] = -180.0; lon[1] = 180.0;
	
	while (geohash.length < precision) {
	  if (is_even) {
			mid = (lon[0] + lon[1]) / 2;
	    if (longitude > mid) {
				ch |= GEOHASH_BITS[bit];
				lon[0] = mid;
	    } else
				lon[1] = mid;
	  } else {
			mid = (lat[0] + lat[1]) / 2;
	    if (latitude > mid) {
				ch |= GEOHASH_BITS[bit];
				lat[0] = mid;
	    } else
				lat[1] = mid;
	  }

		is_even = !is_even;
	  if (bit < 4)
			bit++;
	  else {
			geohash += GEOHASH_BASE32[ch];
			bit = 0;
			ch = 0;
	  }
	}
	return geohash;
}
