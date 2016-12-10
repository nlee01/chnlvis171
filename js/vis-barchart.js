// --> CREATE SVG DRAWING AREA


// CREATE VARIABLES FOR VISUALIZATION INSTANCES
var barcharted, timeline;
function stringToDate(string) {
    return d3.time.format("%b %d %Y").parse(string.substring(4,15));
}
BarChart = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.wrangleData();
};

BarChart.prototype.wrangleData = function() {
    var vis = this;
    vis.day = d3.nest()
        .key(function(d) { return d.date_start; })
        .entries(vis.data);
    vis.day.forEach(function(d) { d.key = stringToDate(d.key); });
    vis.day.sort(function(a, b) { return a.key - b.key; });
    vis.day.forEach(function(d) {
        var total_best_est = 0,
            total_a = 0,
            total_b = 0,
            total_c = 0;
        d.values.forEach(function(e) {
            total_best_est += e.best_est;
            total_a += e.deaths_a;
            total_b += e.deaths_b;
            total_c += e.deaths_civilians;
        });
        d.total_best_est = total_best_est;
        d.total_a = total_a;
        d.total_b = total_b;
        d.total_c = total_c;
    });

    vis.createVis();
};

BarChart.prototype.createVis = function() {
    var vis = this;
    // initialize svg and group appended to svg
    barcharted = new BarCharted("barcharted", vis.day);
};

BarCharted = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.initVis();
};

BarCharted.prototype.initVis = function() {
    var vis = this;
    vis.margin = {top: 100, right: 50, bottom: 100, left: 50};
    vis.width = 5000 - vis.margin.left - vis.margin.right;
    vis.height = 1000 - vis.margin.top - vis.margin.bottom;

    // SVG DRAWING AREA
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // TOOLTIP
    vis.tooltip = d3.tip()
        .attr("class", "d3-tip tooltip")
        .html(function(d) {
            return "Date: " + d.x + "<br>Deaths: " + d.y;
        });
    vis.svg.call(vis.tooltip);



    // PATH CLIPPING
    vis.svg.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.categories = ["total_a", "total_b", "total_c"];

    vis.layers = d3.layout.stack()(vis.categories.map(function(c) {
        return vis.data.map(function(d) {
            return {x: d.key, y: d[c]};
        });
    }));
    console.log(vis.layers);
    // vis.x = d3.scale.ordinal()
    //     .rangeRoundBands([0, vis.width])
    //     .domain(vis.layers[0].map(function(d) { return d.x; }));
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.data, function(d) { return d.key; }));
    // vis.ordinalx = d3.scale.ordinal()
    //     .domain(d3.map(vis.data, function(d) { return d.key; }))
    //     .rangeBands([0, vis.width], 0.4, 0);
    vis.y = d3.scale.pow()
        .rangeRound([vis.height, 0])
        .domain([0, d3.max(vis.data, function(d) { return d.total_best_est; })]);
    vis.z = d3.scale.category10();

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("right");


    vis.layer = vis.svg.selectAll(".layer")
        .data(vis.layers)
        .enter().append("g")
        .attr("class", "layer")
        .style("fill", function(d, i) { return vis.z(i); });

    vis.layer.selectAll("rect")
        .data(function(d) { return d; })
        .enter().append("rect")
        .attr("x", function(d, i) { return i*2; })
        .attr("y", function(d) { return vis.y(d.y + d.y0); })
        .attr("height", function(d) { return vis.y(d.y0) - vis.y(d.y + d.y0); })
        .attr("width", vis.width/vis.data.length)
        .on("mouseover", vis.tooltip.show)
        .on("mouseout", vis.tooltip.hide);

    vis.svg.append("g")
        .attr("class", "axis x-axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "axis y-axis")
        .call(vis.yAxis);

    // CREATE SCALES
    // vis.x = d3.time.scale()
    //     .range([0, vis.width])
    //     .domain(d3.extent(vis.data, function(d) { return d.key; }));
    // vis.y = d3.scale.linear()
    //     .range([vis.height, 0]);
    // vis.y = d3.scale.linear()
    //     .range([vis.height, 0]);
    //
    // vis.xAxis = d3.svg.axis()
    //     .scale(vis.x)
    //     .orient("bottom");
    //
    // vis.yAxis = d3.svg.axis()
    //     .scale(vis.y)
    //     .orient("left");
    //
    // vis.svg.append("g")
    //     .attr("class", "x-axis axis")
    //     .attr("transform", "translate(0," + vis.height + ")");
    //
    // vis.svg.append("g")
    //     .attr("class", "y-axis axis");
    //
    // vis.svg.selectAll(".bar")
    //     .data(vis.data)
    //     .enter().append("rect")
    //     .attr("class", "bar")
    //     .attr("x", function(d, index) { return index * 3; })
    //     .attr("y", 0)
    //     .attr("width", 2)
    //     .attr("height", function(d) { return vis.height - vis.y(d.total_best_est); });

};
BarChart.prototype.brushed = function() {
    var vis = this;
    // Set new domain if brush (user selection) is not empty
    // barcharted.x.domain(
    //     timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent()
    // );
    // barcharted.wrangleData();
};