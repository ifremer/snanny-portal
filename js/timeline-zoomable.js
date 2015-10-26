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
		top : 20,
		right : 20,
		bottom : 30,
		left : 0
	};
	
	timelineWidth  = container.node().offsetWidth - margin.left - margin.right;
	timelineHeight = container.node().offsetHeight - margin.top - margin.bottom - /* scroll */15;

	// Compute X axis
	var current_first_time = Number.MAX_VALUE;
	var timeExtent = d3.extent(data, function(d) {
		var time  = d.time;
		var begin = new Date(d.time.begin);
		var end   = new Date(d.time.end);
		if (begin < current_first_time) {
			current_first_time = begin;
			return begin;
		} else {
			return end;
		}
	});
	timelineX = d3.time.scale()
		.range([ 0, timelineWidth * timelineScale ])
		.domain(timeExtent)
	;
	timelineXAxis = d3.svg.axis()
		.scale(timelineX)
		.orient('bottom')
		.tickPadding(8)
	;
	
	// Compute Y axis
	var valueExtent = d3.extent(data, function(d) {
		return d.value;
	});

	timelineY = d3.scale.linear()
		.range([ timelineHeight, 0 ])
		.domain(valueExtent)
	;

	
	timelineSvg = container.append('svg')
		.attr('width', timelineWidth * timelineScale + margin.left + margin.right)
		.attr('height', timelineHeight + margin.top + margin.bottom)
		.call(d3.behavior.zoom().x(timelineX).y(timelineY).scaleExtent([1, timelineWidth]).on("zoom", timelineZoom))
	;

	var context = timelineSvg.append('g')
		.attr('class', 'context')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
		
	;
	
	timelineArea = d3.svg.area()
	    .x(function(d) { return timelineX(d.event); })
	    .y0(timelineHeight)
	    .y1(function(d) { return timelineY(d.value); })
    ;
	
	setTimeline(data);

	timelineSvg
		.append('g')
		.attr('class', 'x timeline')
		.attr('transform', 'scale(1)')
		.selectAll('rect')
		.attr('y', 21)
		.attr('height', timelineHeight)
	;

	timelineSvg
		.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + (timelineHeight + 21) + ')')
		.call(timelineXAxis)
	;

	function timelineSelectionEnd() {
		getObservationsCount();
		getObservations();
	}
	
	setTimelineAll(data);
}

function timelineZoom() {
	  var container = d3.select('#timeline');
	  var context   = container.select('svg').select('g');
	  timelineXTranslate = d3.event.translate[0];
	  timelineXScale = d3.event.scale;
	  applyZoom();
}

function applyZoom(){
	 var container = d3.select('#timeline');
	 var context   = container.select('svg').select('g');
	 container.select('svg').select(".x.axis").call(timelineXAxis);
	 console.log("timelineZoom z="+timelineXScale+" t="+timelineXTranslate);
	 context.select("path.areaAll").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");
	 context.select("path.area").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");
}

function setTimelineAll(data) {
	
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g');

	context
		.append("path")
		.datum(data)
		.attr("class", "areaAll")
		.attr("d", timelineArea);
}

function setTimeline(data) {
	
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g');

	context.selectAll('path.area').remove();

	context
		.append("path")
		.datum(data)
		.attr("class", "area")
		.attr("d", timelineArea);

}

