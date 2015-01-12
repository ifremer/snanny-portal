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
		var time  = d.get('time');
		var begin = new Date(d.get('time').begin);
		var end   = new Date(d.get('time').end);
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
//		.tickFormat(d3.time.format("%Y-%b-%d"))
//		.tickSize(0)
		.tickPadding(8)
	;
	
	// Accumulate data for Y axis
	var accumulated = accumulateData(data);

	// Compute Y axis
	var valueExtent = d3.extent(accumulated, function(d) {
		return d.value;
	});

	timelineY = d3.scale.linear()
		.range([ timelineHeight, 0 ])
		.domain(valueExtent)
	;

	timelineSelection = d3.svg.brush()
		.x(timelineX)
		.on('brushend', timelineSelectionEnd)
	;
	
	timelineSvg = container.append('svg')
		.attr('width', timelineWidth * timelineScale + margin.left + margin.right)
		.attr('height', timelineHeight + margin.top + margin.bottom)
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
		.call(timelineSelection)
//		.call(d3.behavior.zoom().x(timelineX).y(timelineY).scaleExtent([1, 7]).on("zoom", timelineZoom))
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
		startLoading();
		
		var observations = filterObservationsByPosition();
		observations     = filterObservationsByTime(observations);
		selectObservations(observations);
		showObservations(observations);
		
		stopLoading();
	}
	
	setTimelineAll(allObservations());
	
}

function timelineDraw() {
	timelineSvg.select("g.x.axis").call(timelineXAxis);
	timelineSvg.select("g.y.axis").call(timelineYAxis);
	timelineSvg.select("path.area").attr("d", timelineArea);
}

function timelineZoom3() {
	d3.event.transform(timelineX); // TODO d3.behavior.zoom should support extents
	draw();
}

function timelineZoom() {
	console.log("timelineZoom");
	
	  var container = d3.select('#timeline');
	  container.select('svg').select(".x.axis").call(timelineXAxis);
	  var context   = container.select('svg').select('g');
//	  context.attr("transform", "translate(" + d3.event.translate + ")" + "scale(" + d3.event.scale + ")");
	  timelineXTranslate = d3.event.translate[0];
	  timelineXScale = d3.event.scale;
	  context.select("path.areaAll").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");
	  context.select("path.area").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");
}

function setTimelineAll(data) {
	
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g');
	
	// Accumulate data for Y axis
	var accumulated = accumulateData(data);

	context
		.append("path")
		.datum(accumulated)
		.attr("class", "areaAll")
		.attr("d", timelineArea)
	;
	
}

function setTimeline(data) {
	
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g');

	context.selectAll('path.area').remove();
	
	// Accumulate data for Y axis
	var accumulated = accumulateData(data);

	context
		.append("path")
		.datum(accumulated)
		.attr("class", "area")
		.attr("d", timelineArea)
//		.attr("transform", "translate(" + 0 + "," + 0 + ")scale(" + 1 + ", " + (1 / timelineXScale) + ")")
	;
	
}

function accumulateData(data) {
	var accumulated = {};
	var ret = [];
	
	var rising  = [];
	var falling = [];
	
	data.forEach(function(observation) {
		var time = observation.get('time');
		rising.push(time.begin);
		falling.push(time.end);
	});
	
	rising.sort();
	falling.sort();
	
	var current = 0;
	var decreasing;
	var incrementing;
	rising.forEach(function(event) {
		
		while (falling.length > 0 && falling[0] <= event) {
			var decrease = falling.shift();
			if (decreasing != decrease && incrementing != event) {
				accumulated[decrease - 1] = current;
			}
			current--;
			accumulated[decrease] = current;
			decreasing = decrease;
		}
		
		if (incrementing != event && decreasing != event) {
			accumulated[event - 1] = current;
		}
		current++;
		accumulated[event] = current;
		incrementing = event;
		
	});
	
	falling.forEach(function(event) {
		accumulated[event - 1] = current;
		current--;
		accumulated[event] = current;
	});
	
	falling.length = 0;
	
	var events = [];
	for (var event in accumulated) {
		events.push(event);
	}
	
	events.sort();
	
	events.forEach(function(event) {
		ret.push({ "event": +event, "value": +accumulated[event] });
	});

	/*
	ret.forEach(function(each) {
		console.log(each.event + " " + each.value);
	});
	*/
	
	return ret;
}
