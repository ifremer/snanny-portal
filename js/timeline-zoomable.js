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
var 	margin = {
		top : 20,
		right : 20,
		bottom : 30,
		left : 0
	};

function initializeTimeline(data) {

	var container = d3.select('#timeline');
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
	
//	var customTimeFormat = d3.time.format.multi([
//	                                             [".%L", function(d) { return d.getMilliseconds(); }],
//	                                             [":%S", function(d) { return d.getSeconds(); }],
//	                                             ["%I:%M", function(d) { return d.getMinutes(); }],
//	                                             ["%I %p", function(d) { return d.getHours(); }],
//	                                             ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
//	                                             ["%b %d", function(d) { return d.getDate() != 1; }],
//	                                             ["%B", function(d) { console.log(d.getMonth()); return d.getMonth(); }],
//	                                             ["%Y", function() { return true; }]
//	                                           ]);

	
	timelineXAxis = d3.svg.axis()
	.scale(timelineX)
	.orient('bottom')
	.tickPadding(8)	
//	.tickFormat(customTimeFormat)
	;
	
	
	// Compute Y axis
	var valueExtent = d3.extent(data, function(d) {
		return d.value;
	});

	timelineY = d3.scale.linear()
	.range([ timelineHeight, 0 ])
	.domain(valueExtent)
	;

	var changeRequest;
	timelineSvg = container.append('svg')
	.attr('width', timelineWidth * timelineScale + margin.left + margin.right)
	.attr('height', timelineHeight + margin.top + margin.bottom)
	.call(d3.behavior.zoom().x(timelineX).y(timelineY).scaleExtent([1, timelineWidth]).on("zoom",  timelineZoom).on('zoomend', function(){
		clearTimeout(changeRequest);
		timelineSelection = timelineX.domain();
		changeRequest = setTimeout(function(){
			getObservationsCount();
			getObservations();
		}, 500);		
	}))
	;

	var context = timelineSvg.append('g')
	.attr('class', 'context')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

	;

	timelineArea = d3.svg.area()
	.x(function(d) { return timelineX(d.event); })
	.y0(timelineHeight)
	.y1(function(d) { return  timelineY(d.value); })
	;
	
	timelineSelection = timelineX.domain();
	
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
//	.selectAll("text")
//    .attr("transform", "rotate(90)")
//    .style("text-anchor", "start")
    ;

	setTimelineAll(data);
}

function timelineZoom() {

	// recupération de la transformation
	timelineXTranslate = d3.event.translate[0];	
	timelineXScale = d3.event.scale;
	applyZoom();
}

function applyZoom(){
	
	// récupération des données 
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g').select("path.area");	
	var dataArray = context.data();
	var data = dataArray[0];
	// recalcul de la zonr
	setTimeline(data);
	setZoom(timelineXTranslate, timelineXScale);
	
}

function setZoom(translate, scale){
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g');
	context.select("path.areaAll").attr("transform", "translate(" + translate + ",0)scale(" + scale + ", 1)");
	container.select('svg').select(".x.axis").call(timelineXAxis);
	
}

function setTimelineAll(data) {
	
	var container = d3.select('#timeline');
	var context   = container.select('svg').select('g');
	//setTimeLineArea(data);	
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
	setTimeLineArea(data);

	context
	.append("path")
	.datum(data)
	.attr("class", "area")
	.attr("d", timelineArea);
	
}
	 //context.select("path.area").attr("transform", "translate(" + timelineXTranslate + ",0)scale(" + timelineXScale + ", 1)");

function setTimeLineArea(data){
	var valueExtent = d3.extent(data, function(d) {
		return d.value;
	});
	timelineY = d3.scale.linear()
	.range([ timelineHeight, 0 ])
	.domain(valueExtent)
	;
}
