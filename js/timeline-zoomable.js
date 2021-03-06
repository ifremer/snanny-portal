var timelineSelection = null;
var timelineScale = 1;
var timelineWidth;
var timelineHeight;
var timelineX;
var timelineY;
var timelineLine;
var timelineArea;
var timelineXAxis;
var timelineXTranslate = 0;
var timelineXScale = 1;
var svg;
var lastQuery = null;

var zoom
var margin = {
	top: 20,
	right: 5,
	bottom: 30,
	left: 0
};

function initializeTimeline(data) {

	var container = d3.select('#timeline');
	timelineWidth = container.node().offsetWidth - margin.left - margin.right;
	timelineHeight = container.node().offsetHeight - margin.top - margin.bottom - /* scroll */ 15;
	window.onresize = function(event) {
		var svg = container.select('svg').node();
		container.node().removeChild(svg);
		initializeTimeline(data);
	};

	// Compute X axis
	var current_first_time = Number.MAX_VALUE;
	var timeExtent = d3.extent(data, function(d) {
		var time = d.time;
		var begin = new Date(d.time.begin);
		var end = new Date(d.time.end);
		if (begin < current_first_time) {
			current_first_time = begin;
			return begin;
		} else {
			return end;
		}
	});

	timelineX = d3.time.scale()
		.range([0, timelineWidth * timelineScale])
		.domain(timeExtent);

	var timeFormat = d3.time.format.multi([
		[".%L", function(d) {
			return d.getMilliseconds();
		}],
		[":%S", function(d) {
			return d.getSeconds();
		}],
		["%I:%M", function(d) {
			return d.getMinutes();
		}],
		["%I %p", function(d) {
			return d.getHours();
		}],
		["%a %d", function(d) {
			return d.getDay() && d.getDate() != 1;
		}],
		["%b %d", function(d) {
			return d.getDate() != 1;
		}],
		["%b", function(d) {
			return d.getMonth();
		}],
		["%Y", function() {
			return true;
		}]
	]);

	timelineXAxis = d3.svg.axis()
		.scale(timelineX)
		.orient('bottom')
		.ticks(6)
		.tickPadding(8)
		.tickFormat(timeFormat);


	// Compute Y axis
	var valueExtent = d3.extent(data, function(d) {
		return d.value;
	});

	timelineY = d3.scale.linear()
		.range([timelineHeight, 0])
		.domain(valueExtent);

	var changeRequest;
	zoom = d3.behavior.zoom().x(timelineX)
		.y(timelineY)
		.scaleExtent([1, timelineWidth])
		.on("zoom", timelineZoom)
		.on('zoomend', function() {
			clearTimeout(changeRequest);
			timelineSelection = timelineX.domain();
			changeRequest = setTimeout(function() {
				var timeQuery = null;
				if (timelineSelection != null && timelineSelection.length > 0) {
					timeQuery = (+timelineSelection[0]) + "," + (+timelineSelection[1]);
				}
				if (lastQuery != timeQuery) {
					lastQuery = timeQuery;
					getObservationsCount();
					getObservationsAndSystems();
				}
			}, 500);

		});
	timelineSvg = container.append('svg')
		.attr('width', timelineWidth * timelineScale + margin.left + margin.right)
		.attr('height', timelineHeight + margin.top + margin.bottom)
		.call(zoom);

	var context = timelineSvg.append('g')
		.attr('class', 'context')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	timelineArea = d3.svg.area()
		.x(function(d) {
			return timelineX(d.event);
		})
		.y0(timelineHeight)
		.y1(function(d) {
			return timelineY(d.value);
		});

	timelineSelection = timelineX.domain();

	setTimeline(data);

	timelineSvg
		.append('g')
		.attr('class', 'x timeline')
		.attr('transform', 'scale(1)')
		.selectAll('rect')
		.attr('y', 21)
		.attr('height', timelineHeight);

	timelineSvg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + (timelineHeight + 21) + ')')
		.call(timelineXAxis);

	setTimelineAll(data);

	svg = d3.select("body").append("svg").append("g");
	initAppControls();
}

function initAppControls() {


	svg.selectAll(".zoomBtn")
		.call(zoom)
		.call(zoom.event);
	d3.selectAll('.zoomBtn').on('click', function() {
		var currentZoom = zoom.scale();
		var scale = zoom.scale(),
			extent = zoom.scaleExtent(),
			translate = zoom.translate(),
			x = translate[0],
			y = translate[1],
			factor = (this.id === 'zoomIn') ? 1.5 : 1 / 1.5,
			target_scale = scale * factor;
		// If we're already at an extent, done
		if (target_scale === extent[0] || target_scale === extent[1]) {
			return false;
		}
		// If the factor is too much, scale it down to reach the extent exactly
		var clamped_target_scale = Math.max(extent[0], Math.min(extent[1], target_scale));
		if (clamped_target_scale != target_scale) {
			target_scale = clamped_target_scale;
			factor = target_scale / scale;
		}

		// Center each vector, stretch, then put back
		center = [timelineWidth / 2, timelineHeight / 2];
		x = (x - center[0]) * factor + center[0];
		y = (y - center[1]) * factor + center[1];


		// Transition to the new view over 350ms
		d3.transition().duration(350).tween("zoom", function() {
			var interpolate_scale = d3.interpolate(scale, target_scale),
				interpolate_trans = d3.interpolate(translate, [x, y]);
			timelineXTranslate = translate[0];
			timelineXScale = target_scale;

			return function(t) {
				zoom.scale(interpolate_scale(t))
					.translate(interpolate_trans(t));
				timelineZoom();
				svg.call(zoom.event);
			};
		});
	});
}

function timelineZoom() {

	// get transformation
	if (d3.event !== null) {
		timelineXTranslate = d3.event.translate[0];
		timelineXScale = d3.event.scale;
		applyZoom();

	} else {
		// get datas 
		var container = d3.select('#timeline');
		var contextArea = container.select('svg').select('g').select("path.area");
		var dataArray = contextArea.data();
		var data = dataArray[0];
		// calculate the zone
		setTimeline(data);
		var context = container.select('svg').select('g');
		container.select('svg').select(".x.axis").call(timelineXAxis);
	}

}

function applyZoom() {

	// get the datas
	var container = d3.select('#timeline');
	var contextArea = container.select('svg').select('g').select("path.area");
	var dataArray = contextArea.data();
	var data = dataArray[0];
	// calculate zone
	setTimeline(data);
	setZoom(timelineXTranslate, timelineXScale);
}

function setZoom(translate, scale) {
	var container = d3.select('#timeline');
	var context = container.select('svg').select('g');
	container.select('svg').select(".x.axis").call(timelineXAxis);
	context.select("path.areaAll").attr("transform", "translate(" + translate + ",0)scale(" + scale + ", 1)");

}

function setTimelineAll(data) {
	var container = d3.select('#timeline');
	var context = container.select('svg').select('g');
	context
		.append("path")
		.datum(data)
		.attr("class", "areaAll")
		.attr("d", timelineArea);

	var valueExtent = d3.extent(data, function(d) {
		return d.value;
	});
	timelineY = d3.scale.linear()
		.range([timelineHeight, 0])
		.domain(valueExtent);
}

function setTimeline(data) {
	var container = d3.select('#timeline');
	var context = container.select('svg').select('g');
	context.selectAll('path.area').remove();
	context
		.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("d", timelineArea);
}