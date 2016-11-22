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

function initializeTimeline(data) {

	var container = d3.select('#timeline');
	var margin = {
		top: 20,
		right: 20,
		bottom: 30,
		left: 0
	};

	timelineWidth = container.node().offsetWidth - margin.left - margin.right;
	timelineHeight = container.node().offsetHeight - margin.top - margin.bottom - 15;

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
	timelineXAxis = d3.svg.axis()
		.scale(timelineX)
		.orient('bottom')
		//		.tickFormat(d3.time.format("%Y-%b-%d"))
		//		.tickSize(0)
		.tickPadding(8);

	// Compute Y axis
	var valueExtent = d3.extent(data, function(d) {
		return d.value;
	});

	timelineY = d3.scale.linear()
		.range([timelineHeight, 0])
		.domain(valueExtent);

	timelineSelection = d3.svg.brush()
		.x(timelineX)
		.on('brushend', timelineSelectionEnd);

	timelineSvg = container.append('svg')
		.attr('width', timelineWidth * timelineScale + margin.left + margin.right)
		.attr('height', timelineHeight + margin.top + margin.bottom);

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

	setTimeline(data);

	timelineSvg
		.append('g')
		.attr('class', 'x timeline')
		.attr('transform', 'scale(1)')
		.call(timelineSelection)
		//		.call(d3.behavior.zoom().x(timelineX).y(timelineY).scaleExtent([1, 7]).on("zoom", timelineZoom))
		.selectAll('rect')
		.attr('y', 21)
		.attr('height', timelineHeight);

	timelineSvg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + (timelineHeight + 21) + ')')
		.call(timelineXAxis);

	function timelineSelectionEnd() {
		getObservationsCount();
		getObservationsAndSystems();
	}

	setTimelineAll(data);
}

function timelineDraw() {
	timelineSvg.select("g.x.axis").call(timelineXAxis);
	timelineSvg.select("g.y.axis").call(timelineYAxis);
	timelineSvg.select("path.area").attr("d", timelineArea);
}

function timelineZoomExp2() {
	d3.event.transform(timelineX); // TODO d3.behavior.zoom should support extents
	draw();
}

function timelineZoomExp1() {
	console.log("timelineZoom");

	var container = d3.select('#timeline');
	container.select('svg').select(".x.axis").call(timelineXAxis);
	var context = container.select('svg').select('g');
	//	  context.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
	timelineXTranslate = d3.event.translate[0];
	timelineXScale = d3.event.scale;
	context.select("path.areaAll").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");
	context.select("path.area").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");
}

function setTimelineAll(data) {

	var container = d3.select('#timeline');
	var context = container.select('svg').select('g');

	context
		.append("path")
		.datum(data)
		.attr("class", "areaAll")
		.attr("d", timelineArea);

}

function setTimeline(data) {

	var container = d3.select('#timeline');
	var context = container.select('svg').select('g');

	context.selectAll('path.area').remove();

	context
		.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("d", timelineArea)
		//		.attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 1 + ", " + (1 / timelineXScale) + ")")
	;

}