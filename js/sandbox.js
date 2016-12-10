var myApp = angular.module('app', []);
myApp.directive("lineChart", function() {
    return {
        restrict: 'E',
        scope: {
            data: '=',
            id: '@'
        },
        link: function (scope, element, attrs) {
            scope.$watch( 'data', function ( data ) {
                d3.select("#"+attrs.id).select("svg").remove();
                if (data) {
                    var margin = {top: 20, right: 20, bottom: 30, left: 40},
                        width = element[ 0 ].parentElement.offsetWidth - margin.left - margin.right,
                        height = element[ 0 ].parentElement.offsetHeight - margin.top - margin.bottom;
                    var parseDate = d3.time.format("%d-%b-%y").parse;
                    var bisectDate = d3.bisector(function(d) { return d[0]; }).left;
                    var x = d3.time.scale()
                        .range([0, width]);
                    var y = d3.scale.linear()
                        .range([height, 0]);
                    var xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("bottom")
                        .innerTickSize(-height)
                        .ticks(4)
                        .outerTickSize(0)
                        .tickPadding(5)
                        .tickFormat(function(d) { return d3.time.format('%d/%m %H:%M')(new Date(d)); });
                    var yAxis = d3.svg.axis()
                        .scale(y)
                        .orient("left")
                        .innerTickSize(-width)
                        .outerTickSize(0)
                        .tickPadding(10);
                    var line = d3.svg.line()
                        .x(function(d) { return x(d[0]); })
                        .y(function(d) { return y(d[1]); });
                    var svg = d3.select(element[0]).append("svg")
                        .attr("width", '100%')
                        .attr("height", '100%')
                        .attr('viewBox','0 0 '+ element[ 0 ].parentElement.offsetWidth +' '+ element[ 0 ].parentElement.offsetHeight )
                        .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
                    var minX = d3.min(data, function (item) { return d3.min(item.values, function (d) { return d[0]; }); });
                    var maxX = d3.max(data, function (item) { return d3.max(item.values, function (d) { return d[0]; }); });
                    var minY = d3.min(data, function (item) { return d3.min(item.values, function (d) { return d[1]; }); });
                    var maxY = d3.max(data, function (item) { return d3.max(item.values, function (d) { return d[1]; }); });
                    x.domain([minX, maxX]);
                    y.domain([0, maxY]);
                    svg.append("g")
                        .attr("class", "x axis")
                        .attr("transform", "translate(0," + height + ")")
                        .call(xAxis);
                    svg.append("g")
                        .attr("class", "y axis")
                        .call(yAxis);
                    var domaine = svg.selectAll(".domaine")
                        .data(data)
                        .enter().append("g")
                        .attr("class", "domaine");
                    domaine.append("path")
                        .attr("class", "line")
                        .attr("d", function (d) {
                            return line(d.values);
                        })
                        .style("stroke", function (d) {
                            return d.color;
                        });
                    var focus = svg.append("g")
                        .attr("class", "focus")
                        .style("display", "none");

                    for(var i=0;i<data.length;i++){
                        focus.append("g")
                            .attr("class", "focus"+i)
                            .append("circle")
                            .attr("r", 4.5);
                        svg.select(".focus"+i)
                            .append("text")
                            .attr("x", 9)
                            .attr("dy", ".35em");
                    }
                    svg.append("rect")
                        .attr("class", "overlay")
                        .attr("width", width)
                        .attr("height", height)
                        .on("mouseover", function() { focus.style("display", null); })
                        .on("mouseout", function() { focus.style("display", "none"); })
                        .on("mousemove", mousemove);
                    function mousemove() {
                        var x0 = x.invert(d3.mouse(this)[0]);
                        var series = data.map(function(e) {
                            var i = bisectDate(e.values, x0, 1),
                                d0 = e.values[i - 1],
                                d1 = e.values[i];
                            return x0 - d0[0] > d1[0] - x0 ? d1 : d0;
                        });
                        for(var i=0; i<series.length;i++){
                            var selectedFocus = svg.selectAll(".focus"+i);
                            selectedFocus.attr("transform", "translate(" + x(series[i][0]) + "," + y(series[i][1]) + ")");
                            selectedFocus.select("text").text(series[i][1]);
                        }
                    }
                }
            });
        }
    };
});
function MainCtrl($scope) {
    $scope.lineData = [{"key": "users","color": "#16a085","values": [[1413814800000,4034.418],[1413815400000,5604.155000000001],[1413816000000,6343.079],[1413816600000,7308.226],[1413817200000,9841.185],[1413817800000,6571.891],[1413818400000,4660.6005000000005],[1413819000000,4555.4795],[1413819600000,5963.723],[1413820200000,9179.9595]]},{"key": "users 2","color": "#d95600","values": [[1413814800000,3168.183],[1413815400000,1530.8435],[1413816000000,2416.071],[1413816600000,1274.309],[1413817200000,1105.0445],[1413817800000,2086.0299999999997],[1413818400000,712.642],[1413819000000,1676.725],[1413819600000,3721.46],[1413820200000,2887.7975]]}];
}