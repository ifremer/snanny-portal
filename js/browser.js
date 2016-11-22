var mapRequest;
var timelineRequest;
var observationRequest;
var systemRequest;
var viewSystemsWithoutData;
var viewSystemsWithoutGeo;
var tree = [];
var treeObservations = [];
var treeSystems = [];
var treeWithoutGeo = [];

function showObservations(observations) {
    
    if (observations != undefined && observations.length > 0) {
        jQuery('#browserActions').show('slow');
        var deploymentIds = {};
        var ancestorDeploymentIds = {};

        var observationsCount = 0;
        treeObservations = [];

        // Iterate over each observation, to display informations
        observations.forEach(function (observation) {
            
            var uuid = observation.get('snanny-uuid');
            var deploymentId = observation.get('snanny-deploymentid');
            if (deploymentId == undefined) {
                deploymentId = uuid;
            }

            if (deploymentId != undefined) {
                if (deploymentIds[deploymentId] == undefined) {

                    var ancestors = observation.get('snanny-ancestors');
                    var parent = '#';
                    ancestors.forEach(function (ancestor) {

                        var uuid = ancestor['snanny-ancestor-uuid'];
                        var deploymentId = ancestor['snanny-ancestor-deploymentid'];
                        if (deploymentId == undefined) {
                            deploymentId = uuid;
                        }
                        if (ancestorDeploymentIds[deploymentId] == undefined) {
                            treeObservations.push({
                                "id": deploymentId,
                                "text": ancestor['snanny-ancestor-name'],
                                "parent": parent,
                                "icon": "sensor-ico",
                                "a_attr": {
                                    "onMouseOver": "selectObservationOnMap('" + deploymentId + "')",
                                    "onclick": "showSystem('" + deploymentId + "')"
                                }
                            });
                            ancestorDeploymentIds[deploymentId] = 1;
                        }
                        parent = deploymentId;

                    });
                    //Then add observation in the treeView
                    var uuid = observation.get('snanny-uuid');
                    var deploymentId = observation.get('snanny-deploymentid');
                    if (deploymentId == undefined) {
                        deploymentId = uuid;
                    }
                    var id = observation.get('snanny-id');
                    var author = observation.get('snanny-author');
                    var resultFilename = observation.get('snanny-result');
                    var name = observation.get('snanny-name');
                    var href = DATA_ACCESS_URI + "data/" + uuid + "/download";
                    treeObservations.push({
                        "id": deploymentId,
                        "parent": parent,
                        "text": name,
                        "icon": "download-ico",
                        "a_attr": {
                            "href": href,
                            "target": "_blank",
                            "onMouseOver": "selectObservationOnMap('" + deploymentId + "')",
                            "onClick": "downloadData('" + uuid + "')"
                        }
                    });

                    observationsCount++;
                    // Simulate a Set collection
                    deploymentIds[deploymentId] = 1;
                }

            }
        });

        return observationsCount;
        // apparently not useful as mouseover event is configured in jstree nodes
        //$("#observations").on("select_node.jstree", function(e, data) {
        //	$("#observations").jstree().toggle_node(data.node);
        //	selectObservationOnMap(data.node.id);
        //});
    } else {
        jQuery('#browserActions').hide('slow');
    }
}

function showObservationsWithoutGeo(observations) {
    
    if (observations != undefined && observations.length > 0) {
        jQuery('#browserActions').show('slow');
        var deploymentIds = {};
        var ancestorDeploymentIds = {};

        var observationsCount = 0;
        treeWithoutGeo = [];
        
        if(viewSystemsWithoutGeo) {
            treeWithoutGeo.push({
                "id": "without_geo_systems",
                "text": "Data without geolocation",
                "parent": "#"
            });
        }

        // Iterate over each observation, to display informations
        observations.forEach(function (observation) {

            var coordinates = observation.getGeometry().getCoordinates();
            
            var uuid = observation.get('snanny-uuid');
            var deploymentId = observation.get('snanny-deploymentid');

            if (deploymentId != undefined) {
                if (deploymentIds[deploymentId] == undefined) {

                    var ancestors = observation.get('snanny-ancestors');
                    var parent = 'without_geo_systems';
                    ancestors.forEach(function (ancestor) {

                        var uuid = ancestor['snanny-ancestor-uuid'];
                        var deploymentId = ancestor['snanny-ancestor-deploymentid'];
                        if (deploymentId == undefined) {
                            deploymentId = uuid;
                        }
                        if (ancestorDeploymentIds[deploymentId] == undefined) {
                            if(coordinates[0] === "200" && coordinates[1] === "0"){
                                treeWithoutGeo.push({
                                "id": deploymentId,
                                "text": ancestor['snanny-ancestor-name'],
                                "parent": "without_geo_systems",
                                "icon": "sensor-ico",
                                "a_attr": {
                                    "onMouseOver": "selectObservationOnMap('" + deploymentId + "')",
                                    "onclick": "showSystem('" + deploymentId + "')"
                                    }
                                });
                            }
                            ancestorDeploymentIds[deploymentId] = 1;
                        }

                    });
                    //Then add observation in the treeView
                    var uuid = observation.get('snanny-uuid');
                    var deploymentId = observation.get('snanny-deploymentid');
                    if (deploymentId == undefined) {
                        deploymentId = uuid;
                    }
                    var id = observation.get('snanny-id');
                    var author = observation.get('snanny-author');
                    var resultFilename = observation.get('snanny-result');
                    var name = observation.get('snanny-name');
                    var href = DATA_ACCESS_URI + "data/" + uuid + "/download";
                    treeWithoutGeo.push({
                        "id": deploymentId,
                        "parent": "without_geo_systems",
                        "text": name,
                        "icon": "download-ico",
                        "a_attr": {
                            "href": href,
                            "target": "_blank",
                            "onMouseOver": "selectObservationOnMap('" + deploymentId + "')",
                            "onClick": "downloadData('" + uuid + "')"
                        }
                    });

                    observationsCount++;
                    // Simulate a Set collection
                    deploymentIds[deploymentId] = 1;
                }

            }
            
        });
    }
}

function showSystems(systems) {
    treeSystems = [];
    
    if (systems != undefined && systems.length > 0 && viewSystemsWithoutData) {
        jQuery('#browserActions').show('slow');
        
        if(viewSystemsWithoutData) {
            treeSystems.push({
               "id": "without_data_systems",
                "text": "Systems without data",
                "parent": "#"
            });
        
            // Iterate over each observation, to display informations
            systems.forEach(function (system) {
                var name = system['snanny-systems-name'];
                var description = system['snanny-systems-description'];
                var uuid = system['snanny-systems-uuid'];

                treeSystems.push({
                    "id": uuid,
                    "text": name,
                    "parent": "without_data_systems",
                    "icon": "sensor-ico",
                    "description": description
                });
            });
        }
    } else {
        jQuery('#browserActions').hide('slow');
    }
}

function downloadData(uuid) {
    var downloadURL = DATA_ACCESS_URI + "data/" + uuid + "/download";
    window.open(downloadURL, '_blank');
}

function appendObservation(observation) {
    //
    var ancestors = observation.get('ancestors');
    ancestors.forEach(function (ancestor) {
        //append ancestor if exist
        var ancestorItem = jQuery("#" + ancestor);

    });

}

function allObservations() {
    var observations = [];

    observationsSource.forEachFeature(function (observation) {
        observations.push(observation);
    });

    return observations;
}

function filterObservationsByPosition() {
    if (selectionFeature.getGeometry() != undefined && selectionFeature.getGeometry() != null) {

        filter = function (observation) {
            var geometry = observation.getGeometry();
            if (geometry.intersectsExtent(selectionFeature.getGeometry().getExtent())) {
                return true;
            }

            return false;
        };

        observationsSource.forEachFeature(function (observation) {
            if (!filter(observation)) {
                observationsSource.removeFeature(observation);
            }
        });

    }
}

function filterObservationsByTime() {

    var filter;

    if (timelineSelection == null || timelineSelection.length == 0) {
        filter = function () {
            return true;
        };
    } else {
        filter = function (observation) {
            var observationResultTimestamp = observation.get('resulttimestamp') * 1000;

            var selectionStart = (+timelineSelection[0]);
            var selectionEnd = (+timelineSelection[1]);

            return selectionStart <= observationResultTimestamp && observationResultTimestamp <= selectionEnd;
        };
    }

    observationsSource.forEachFeature(function (observation) {
        if (!filter(observation)) {
            observationsSource.removeFeature(observation);
        }
    });
}

function selectObservations(observations) {
    selectedFeatures.clear();
    observations.forEach(function (observation) {
        selectedFeatures.push(observation);
    });
}

function selectFeatureInBrowser(feature) {
    var jstree = $("#observations").jstree();
    var deploymentId = feature.get("snanny-deploymentid");
    var node = jstree.get_node(deploymentId);
    openTreeToRoot(node, jstree);
    var parent = node.parent
    $("#" + deploymentId).attr("style", "color:rgba(255, 128, 0, 1.0)");
    var position = $("#" + parent).position();
    if (position != undefined) {
        $("#observations").scrollTop($("#observations").scrollTop() - 55 + position.top);
    }
}

function openTreeToRoot(node, jstree) {
    //Open parents
    var parents = node.parents;
    if (parents != undefined) {
        parents.forEach(function (deploymentId) {
            if (deploymentId != "#") {
                var parentNode = jstree.get_node(deploymentId);
                if (jstree.is_closed(parentNode)) {
                    jstree.open_node(parentNode);
                } else {
                    return;
                }
            }
        });
    }
}

function filterObservations() {
    filterObservationsByTime();
    return observations;
}

function getObservationsCount() {
    var bboxQuery = getBboxQuery();
    var timeQuery = getTimeQuery();
    var kwordsQuery = getKeywordsQuery();
    var hasCoords = getHasGeoQuery();

    loadObservationsCount(MAP_RESOURCES + bboxQuery + timeQuery + kwordsQuery + hasCoords, TIMELINE_RESOURCES + bboxQuery + kwordsQuery + hasCoords);
}

function getBboxQuery() {
    var extent = map.getView().calculateExtent(map.getSize());
    var bottomLeft = ol.extent.getBottomLeft(extent);
    var topRight = ol.extent.getTopRight(extent);

    var bbox = [parseFloat(bottomLeft[1].toFixed(2)), parseFloat(bottomLeft[0].toFixed(2)), parseFloat(topRight[1].toFixed(2)), parseFloat(topRight[0].toFixed(2))];

    var bboxQuery = "?bbox=" + bbox.join(",");
    return bboxQuery;
}

function getTimeQuery() {
    var timeQuery = "";


    if (timelineSelection != null && timelineSelection.length > 0) {
        timeQuery = "&time=" + (+timelineSelection[0]) + "," + (+timelineSelection[1]);
    }
    return timeQuery;

}

function getKeywordsQuery() {
    var kwordsQuery = "";
    var searchText = $("#searchInput").val();
    if (searchText != "") {
        kwordsQuery = "&kwords=" + searchText;
    }
    return kwordsQuery;
}

function getHasDataQuery() {
    var withData = localStorage.getItem('withoutData');
    if (!withData || withData === "on") {
        viewSystemsWithoutData = true;
        return "?hasdata=false";
    } else {
        viewSystemsWithoutData = false;
        return "?hasdata=true";
    }
}

function getHasGeoQuery() {
    var withGeo = localStorage.getItem('withoutGeo');
    if (!withGeo || withGeo === "on") {
        viewSystemsWithoutGeo = true;
        return "&hasCoords=false";
    } else {
        viewSystemsWithoutGeo = false;
        return "&hasCoords=true";
    }
}

function getObservationsAndSystems() {
    var observationsContainerHeader = jQuery('#observationsHeader');
    var observationsContainer = jQuery('#observations');
    // Clear "observations" panel
    observationsContainerHeader.html("");
    observationsContainer.html("");
    
    var observationsCount = getObservations();
    getSystems();
    
    // Display header with observation's count
    observationsContainerHeader.append(jQuery("<h4>" + $('#individualObsPointCount').text() + " points from " + observationsCount + " observation" + (observationsCount > 1 ? "s" : "") + "</h4>"));

    if (timelineSelection != null && timelineSelection.length > 0) {
        observationsContainerHeader.append(jQuery("<p>from " + moment(+timelineSelection[0]).format('lll') + " to " + moment(+timelineSelection[1]).format('lll') + "</p>"));
    } else {
        observationsContainerHeader.append(jQuery("<p>on full time range</p>"));
    }

    tree = treeSystems.concat(treeObservations).concat(treeWithoutGeo);
    observationsContainer.jstree('destroy');
    //$.jstree.defaults.core.themes.variant = "large";
    observationsContainer.jstree({
        "core": {
            //'themes': {
            //        'name': 'default-dark',
            // 'responsive': true
            //},
            "data": tree,
            "plugins": ["wholerow"]
        }
    });
}

function getObservations() {

    var bboxQuery = getBboxQuery();
    var timeQuery = getTimeQuery();
    var kwordsQuery = getKeywordsQuery();

    var observationsContainerHeader = jQuery('#observationsHeader');
    var observationsContainer = jQuery('#observations');
    // Clear "observations" panel
    observationsContainer.html("");
    observationsContainerHeader.html("");
    observationsContainerHeader.append("<h4>loading...</h4>");
    observationsContainerHeader.append("<p>&nbsp;</p>");

    if (observationRequest != null) {
        observationRequest.abort();
    }

    observationRequest = d3.json(OBSERVATIONS_RESOURCES + bboxQuery + timeQuery + kwordsQuery, function (err, data) {
        $('#individualObsPointLoading').text("1");
        observationsSource.clear(true);

        if (data && data.status == "success" && data.features && data.features.length > 0) {
            var vectorSource = new ol.source.GeoJSON({
                projection: 'EPSG:4326',
                object: data
            });

            observationsCountSource.clear();
            observationsSource.addFeatures(vectorSource.getFeatures());
            //filterObservations();
            showObservations(observationsSource.getFeatures());

        } else if (data && (data.status == "timeOut" || data.status == "tooMany")) {
            while ($('#syntheticMapLoading').text() == 1) {
                1;
            }
            observationsContainerHeader.html("");
            observationsContainerHeader.append("<h4>" + $('#individualObsPointCount').text() + " points available </h4> \
						      <p>refine your request to see individual observations...");
            jQuery('#browserActions').hide('fast');

        } else if (data && data.status == "empty") {
            observationsCountSource.clear();
            jQuery('#browserActions').hide('fast');
        }

        $('#individualObsPointLoading').text("0");

    });
    
    
    var withGeo = localStorage.getItem('withoutGeo');
    if (!withGeo || withGeo === "on") {
        timeQuery = timeQuery.replace("&", "?");
        observationWithoutGeo = d3.json(OBSERVATIONS_RESOURCES + '/withoutgeo' + timeQuery + kwordsQuery, function (err, data) {
            $('#individualObsPointLoading').text("1");
            observationsSource.clear(true);

            if (data && data.status == "success" && data.features && data.features.length > 0) {
                var vectorSource = new ol.source.GeoJSON({
                    projection: 'EPSG:4326',
                    object: data
                });

                observationsCountSource.clear();
                observationsSource.addFeatures(vectorSource.getFeatures());
                //filterObservations();
                showObservationsWithoutGeo(observationsSource.getFeatures());

            } else if (data && (data.status == "timeOut" || data.status == "tooMany")) {
                while ($('#syntheticMapLoading').text() == 1) {
                    1;
                }
                observationsContainerHeader.html("");
                observationsContainerHeader.append("<h4>" + $('#individualObsPointCount').text() + " points available </h4> \
                                  <p>refine your request to see individual observations...");
                jQuery('#browserActions').hide('fast');

            } else if (data && data.status == "empty") {
                observationsCountSource.clear();
                jQuery('#browserActions').hide('fast');
            }

            $('#individualObsPointLoading').text("0");

        });
    }
}

function getSystems() {
    
    var hasData = getHasDataQuery();
    
    if (systemRequest != null) {
        systemRequest.abort();
    }

    systemRequest = d3.json(SYSTEMS_RESOURCES + hasData, function (err, data) {
        $('#individualObsPointLoading').text("1");
        observationsSource.clear(true);

        if (data && data.status == "success" && data.systems && data.systems.length > 0) {
            //filterObservations();
            showSystems(data.systems);

        } else if (data && data.status == "empty") {
            observationsCountSource.clear();
            jQuery('#browserActions').hide('fast');
        }

        $('#individualObsPointLoading').text("0");
    });
}

function startLoading() {
    document.getElementsByTagName('body')[0].classList.add("chargement");
}

function stopLoading() {
    document.getElementsByTagName('body')[0].classList.remove("chargement");
}

var timelineInitialized = false;

function loadObservationsCount(mapZoomURL, timelineZoomURL) {
    var loadingCount = 0;

    if (mapZoomURL) {

        if (mapRequest != null) {
            mapRequest.abort();
        }

        mapRequest = d3.json(mapZoomURL, function (err, data) {
            $('#syntheticMapLoading').text("1");
            var vectorSource = new ol.source.GeoJSON({
                projection: 'EPSG:4326',
                object: data
            });
            if (data != undefined) {
                $('#individualObsPointCount').text(data['totalCount']);
                //Display count only if observations details will not be displayed
                observationsCountSource.clear();
                if (data['status'] != undefined && data['status'] == "tooMany") {
                    observationsCountSource.addFeatures(vectorSource.getFeatures());
                    if (--loadingCount == 0) {
                        stopLoading();
                    }
                }
            }
            $('#syntheticMapLoading').text("0");
        });
        if (!timelineInitialized) {
            loadingCount++;
        }
    }

    if (timelineZoomURL) {

        if (timelineRequest != null) {
            timelineRequest.abort();
        }

        timelineRequest = d3.json(timelineZoomURL, function (err, data) {
            $('#timelineLoading').text("1");
            if (!timelineInitialized) {
                
                initializeTimeline(smoothData(data));
                timelineInitialized = true;
            } else {
                setTimeline(smoothData(data));
            }

            if (--loadingCount == 0) {
                stopLoading();
            }
            $('#timelineLoading').text("0");
        });
        if (!timelineInitialized) {
            loadingCount++;
        }
    }

    if (loadingCount > 0) {
        startLoading();
    }
}

/*function loadObservations(observationsURL) {
    startLoading();

    d3.json(observationsURL, function (err, data) {
        debugger;
        var vectorSource = new ol.source.GeoJSON({
            projection: 'EPSG:4326',
            object: data
        });

        observationsSource.clear();
        observationsSource.addFeatures(vectorSource.getFeatures());

        observations = filterObservations();

        showObservations(observations);

        initializeTimeline(observations);

        stopLoading();
    });
}*/

function smoothData(data) {
    var smoothedData = [];
    data.forEach(function (each, index) {
        var smoothData = each;
        smoothData.value = (1.0 - (1.0 / (1.0 + each.value / RESOLUTION)));
        smoothedData.push(smoothData);
    });
    
    return smoothedData;
}

function showDetail(observationID, container, title) {
    showDetailDygraph(observationID, container, title);
}

function showDetailEnvision(observationID, container, title) {
    container = document.getElementById(container);
    d3.json(SNANNY_API + '/observations/' + observationID + '/results.json', function (data) {
        var options = {
            container: container,
            data: {
                detail: data[0].values,
                summary: data[0].values
            },
        };

        new envision.templates.TimeSeries(options);
    });
}

var graphs = [];
var graphsSync = null;

function showDetailDygraph(observationID, container, title) {

    document.getElementById(container).style.cssText = '';
    graphs.push(new Dygraph(container, SNANNY_API + '/observations/' + observationID + '/results', {
        legend: 'always'
    }));

    if (graphsSync != null) {
        graphsSync.detach();
    }
    if (graphs.length >= 2) {
        graphsSync = Dygraph.synchronize(graphs, {
            selection: true,
            zoom: false,
            range: false
        });
    }

}

function showDetailNVD3(observationID, container, title) {
    d3.json(SNANNY_API + '/observations/' + observationID + '/results.json', function (data) {

        document.getElementById(container).style.cssText = '';

        data.forEach(function (each, index) {
            var eachContainer = container + '-' + index;
            nv.addGraph(function () {
                var chart = nv.models.lineChart()
                    .x(function (d) {
                        return d[0]
                    })
                    .y(function (d) {
                        return d[1]
                    })
                    .color(d3.scale.category10().range())
                    .useInteractiveGuideline(true);

                chart.xAxis
                    .axisLabel('Time')
                    .tickFormat(function (d) {
                        return d3.time.format('%x')(new Date(d))
                    });

                chart.yAxis
                    .axisLabel(each.key)
                    .tickFormat(d3.format(',.1f'))
                ;

                chart.y2Axis.tickFormat(d3.format(',.1f'))
                ;

                if (data == null || data.length == 0) {
                    d3.select('#' + eachContainer).html("");
                }

                d3.select('#' + eachContainer)
                    .datum([each])
                    .transition().duration(500)
                    .call(chart);

                //TODO: Figure out a good way to do this automatically
                nv.utils.windowResize(chart.update);

                return chart;
            });
        });
    });
}


