(function () {
  'use strict';

  angular.module('app.widgets')
    .directive('snpTimeline', snpTimeline);

  /* @ngInject */
  function snpTimeline(config, $window, moment, d3, $timeout) {

    var MARGIN = {
      top: 20,
      right: 5,
      bottom: 30,
      left: 0
    };
    var SCALE = 1;

    var directive = {
      link: link,
      controller: snpTimelineController,
      controllerAs: 'vm',
      bindToController: true,
      templateUrl: 'app/widgets/snp-timeline.html',
      scope: {
        data: '<',
        update: '&onUpdate'
      }
    };

    return directive;

    function snpTimelineController() {
      var vm = this;

      vm.init = init;
      vm.setData = setData;

      function init() {
        //force node init
        vm.container.node().innerHTML = '';
        vm.width = vm.container.node().offsetWidth - MARGIN.left - MARGIN.right;
        vm.height = vm.container.node().offsetHeight - MARGIN.top - MARGIN.bottom;

        generateZoom();

        var svg = vm.container.append('svg')
          .attr('width', vm.width * SCALE + MARGIN.left + MARGIN.right)
          .attr('height', vm.height + MARGIN.top + MARGIN.bottom)
          .call(vm.zoom);

        var context = svg.append('g')
          .attr('class', 'context')
          .attr('transform', 'translate(' + MARGIN.left + ',' + MARGIN.top + ')');

        //build X axis components (scale,
        vm.timelineXScaleFunction = buildXScale();
        vm.timelineXAxisFunction = d3.axisBottom(vm.timelineXScaleFunction)
          .ticks(6)
          .tickPadding(8);

        vm.timelineXAxis = svg
          .append('g')
          .attr('class', 'x axis')
          .attr('transform', 'translate(0,' + (vm.height + 21) + ')')
          .call(vm.timelineXAxisFunction);

        //build Y axis component (scale)
        vm.timelineYScaleFunction = buildYScale();

        vm.timelineArea = d3.area()
          .x(function (d) {
            return vm.timelineXScaleFunction(d.event);
          })
          .y0(vm.height)
          .y1(function (d) {
            return vm.timelineYScaleFunction(d.value);
          });

        setAllData();
        initControls();
      }

      function buildXScale() {
        // Compute X axis
        // Get all dates
        var dates = [];
        angular.forEach(vm.fullData, function (e) {
          dates.push(moment(e.time.begin, 'x').toDate());
          dates.push(moment(e.time.end, 'x').toDate());
        });
        var timeExtent = d3.extent(dates);
        return d3.scaleTime()
          .range([0, vm.width * SCALE])
          .domain(timeExtent);
      }

      function buildYScale() {
        // Compute Y axis
        var valueExtent = d3.extent(vm.fullData, function (d) {
          return d.value;
        });

        return d3.scaleLinear()
          .range([vm.height, 0])
          .domain(valueExtent);
      }

      function setData(data) {
        var context = vm.container.select('g.context');
        var transform = null;
        try {
          transform = context.select('path.area').attr('transform');
        } catch(e){
        }
        context.selectAll('path.area').remove();
        var pathArea = context
          .append('path')
          .datum(data)
          .attr('class', 'area')
          .attr('d', vm.timelineArea);

        if(transform !== null){
          pathArea.attr('transform', transform);
        }
      }

      function setAllData() {
        var context = vm.container.select('g.context');
        context
          .append('path')
          .datum(vm.fullData)
          .attr('class', 'areaAll')
          .attr('d', vm.timelineArea);

        vm.timelineYScaleFunction = buildYScale();
      }

      function initControls() {

        d3.selectAll('snp-timeline .zoom-button').on('click', function () {
          var factor = (this.id === 'zoom-in') ? 1.5 : 1 / 1.5;
          vm.zoom.scaleBy(vm.container.select('svg').select('g'), factor);
        });
      }

      function generateZoom() {
        var promise = null;
        vm.zoom = d3.zoom()
          .duration(350)
          .scaleExtent([1, vm.width])
          .on('zoom', onZoom)
          .on('end', function () {
            if (promise !== null) {
              $timeout.cancel(promise);
            }
            promise = $timeout(function () {
              vm.update({$timeRange : vm.timelineXAxisFunction.scale().domain()});
            }, 500);
          });
      }

      function onZoom() {
        //x axis transform
        var xScale = d3.event.transform.rescaleX(vm.timelineXScaleFunction);
        vm.timelineXAxis.call(vm.timelineXAxisFunction.scale(xScale));
        vm.domain = xScale.domain();

        //data transform
        var context = vm.container.select('g.context');
        context.select('path.areaAll').attr('transform', 'translate(' + d3.event.transform.x + ',0)scale(' + d3.event.transform.k + ', 1)');
        context.select('path.area').attr('transform', 'translate(' + d3.event.transform.x + ',0)scale(' + d3.event.transform.k + ', 1)');
      }
    }

    function link(scope, element, attrs, vm) {
      vm.container = d3.select(element[0]).select('#timeline-container');

      function smoothData(data){
        return data.map(function(d){
          d.value = (1.0 - (1.0 / (1.0 + d.value / config.resolution)));
          return d;
        });
      }

      var deregister = scope.$watch('vm.data', function (newValue) {
        if (angular.isDefined(newValue)) {
          //smooth data
          vm.fullData = smoothData(vm.data);
          vm.init();
          deregister();
          scope.$watch('vm.data', function(){
            vm.setData(smoothData(vm.data));
          });
        }
      });

      $window.onresize = function () {
        vm.init();
        vm.setData(smoothData(vm.data));
      };
    }
  }
})();
