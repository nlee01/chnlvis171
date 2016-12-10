// --> CREATE SVG DRAWING AREA
var marginHolo = {top: 100, right: 50, bottom: 100, left: 50};
var widthHolo = 1800 - marginHolo.left - marginHolo.right,
    heightHolo = 1000 - marginHolo.top - marginHolo.bottom;

// CREATE SCALES
var radius = d3.scale.pow()
    .range([1, 120]);
var strokeWidth = d3.scale.linear()
    .range([1, 50]);
var strokeOpacity = d3.scale.linear()
    .range([.1, .95]);

HoloVis = function(_parentElement, _data) {
    this.parentElement = _parentElement;
    this.allData = _data;
    this.wrangleData();
};

HoloVis.prototype.initVis = function() {
    var vis = this;
    // update domains
    radius.domain([0, d3.max(vis.forceData.nodes.map(function(d) { return d.total_best_est; }))]);
    strokeWidth.domain([0, d3.max(vis.forceData.links.map(function(d) { return d.total; }))]);
    strokeOpacity.domain([0, d3.max(vis.forceData.links.map(function(d) { return d.total; }))]);

    // initialize svg and group appended to svg
    var svgHolo = d3.select("#" + vis.parentElement).append("svg")
        .attr("class", "svgHolo")
        .attr("width", widthHolo + marginHolo.left + marginHolo.right)
        .attr("height", heightHolo + marginHolo.top + marginHolo.bottom);
    var groupHolo = svgHolo.append("g")
        .attr("class", "groupHolo")
        .attr("width", widthHolo)
        .attr("height", heightHolo);

    // initialize force layout
    var force = d3.layout.force()
        .size([widthHolo, heightHolo])
        .linkDistance(350)
        .charge(-300)
        .gravity(.5);

    // Find blank links, which give the error
    // "Uncaught TypeError: Cannot read property 'weight' of undefined"
    vis.forceData.links.forEach(function(link, index, list) {
        if (typeof vis.forceData.nodes[link.source] === 'undefined') {
            console.log('undefined source', link);
        }
        if (typeof vis.forceData.nodes[link.target] === 'undefined') {
            console.log('undefined target', link);
        }
    });

    force
        .nodes(vis.forceData.nodes)
        .links(vis.forceData.links);

    force.start();

    var link = groupHolo.selectAll(".link")
        .data(vis.forceData.links)
        .enter().append("line")
        .attr("class", "link")
        .attr("stroke", "steelblue")
        .attr("stroke-opacity", function(d) {
            return strokeOpacity(d.total);
        })
        .attr("stroke-width", function(d) {
            return strokeWidth(d.total);
        });

    var node = groupHolo.selectAll(".node")
        .data(vis.forceData.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return radius(d.total_best_est); })
        .attr("fill", "#1F2D96")
        .attr("opacity", 0.95)
        .call(force.drag);

    force.on("tick", function() {
        // Update node coordinates
        node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        // Update edge coordinates
        link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    });
};

HoloVis.prototype.wrangleData = function() {
    var vis = this;
    var count = 4;
    vis.data = d3.nest()
        .key(function(d) { return d.conflict_new_id; })
        // .rollup(function(leaves) { return leaves.length; })
        .entries(allCSV);
    var grandTotal_best_est = 0,
        grandTotal_deaths_a = 0,
        grandTotal_deaths_b = 0,
        grandTotal_deaths_civilians = 0;
    vis.data.forEach(function(conflict) {
        conflict.id = count;
        count++;
        conflict.key = +conflict.key;
        conflict.conflict_name = conflict.values[0].conflict_name;
        conflict.country = conflict.values[0].country;
        conflict.region = conflict.values[0].region;
        conflict.side_a = conflict.values[0].side_a;
        conflict.side_b = conflict.values[0].side_b;
        var total_be = 0,
            total_a = 0,
            total_b = 0,
            total_c = 0,
            total_u = 0;
        conflict.values.forEach(function(d) {
            total_be += d.best_est;
            total_a += d.deaths_a;
            total_b += d.deaths_b;
            total_c += d.deaths_civilians;
            total_u += d.deaths_unknown;
        });
        conflict.total_best_est = total_be;
        conflict.total_deaths_a = total_a;
        conflict.total_deaths_b = total_b;
        conflict.total_deaths_civilians = total_c;
        conflict.total_deaths_unknown = total_u;
        grandTotal_best_est += conflict.total_best_est;
        grandTotal_deaths_a += conflict.total_deaths_a;
        grandTotal_deaths_b += conflict.total_deaths_b;
        grandTotal_deaths_civilians += conflict.total_deaths_civilians;

    });
    vis.forceData = {
        links: [],
        nodes: [
            {
                "id": 0,
                "category": "best_est",
                "total_best_est" : grandTotal_best_est
            },
            {
                "id": 1,
                "category" : "deaths_a",
                "total_best_est" : grandTotal_deaths_a
            },
            {
                "id": 2,
                "category": "deaths_b",
                "total_best_est": grandTotal_deaths_b
            },
            {
                "id": 3,
                "category": "deaths_civilians",
                "total_best_est": grandTotal_deaths_civilians
            }
        ]
    };

    vis.data.forEach(function(d) {
        vis.forceData.nodes.push(d);
        // console.log(d.key);
        vis.forceData.links.push({
            "source": d.id,
            "target": 0,
            "total": d.total_best_est
        });
        vis.forceData.links.push({
            "source": d.id,
            "target": 1,
            "total": d.total_deaths_a
        });
        vis.forceData.links.push({
            "source": d.id,
            "target": 2,
            "total": d.total_deaths_b
        });
        vis.forceData.links.push({
            "source": d.id,
            "target": 3,
            "total": d.total_deaths_civilians
        });
    });
    console.log("HoloVis.data:");
    console.log(vis.data);
    console.log("HoloVis.forceData:");
    console.log(vis.forceData);
    vis.initVis();
};