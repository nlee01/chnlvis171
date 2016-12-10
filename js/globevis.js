GlobeVis = function(_parentElement, _data, _data2) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.conflictData = _data2;
    this.wrangleData();
};

GlobeVis.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 50, right: 50, bottom: 50, left: 50};

    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 700 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left +vis.margin.right)
        .attr("height", vis.height +vis.margin.top + vis.margin.bottom);


    vis.projection = d3.geo.mercator()
        .translate([vis.width/2, vis.height/1.5])
        .scale(150);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.g = vis.svg.append("g");

    vis.g.append("defs").append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);

    vis.g.selectAll("path")
        .attr("id", "countries")
        .data(vis.data.features)
        .enter().append("path")
        .attr("id", function(d) {
            return d.id;
        })
        .style("fill-opacity", .7)
        .attr("d", vis.path)
        .on("mouseover", function(d) {
            d3.select(this).style("fill-opacity", 1)
        })
        .on("mouseout", function(d) {
            d3.selectAll("path")
                .style("fill-opacity", .7)
        });


    vis.g.selectAll("circle")
        .data(vis.monthlyDataArray)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
            var loc = [d.longitude, d.latitude];
            return vis.projection(loc)[0];
        })
        .attr("cy", function (d) {
            var loc = [d.longitude, d.latitude];
            return vis.projection(loc)[1];
        })
        .attr("r", function (d) {
            if (d.count < 100)
                return 1;
            else if (d.count < 500)
                return 3;
            else if (d.count < 1000)
                return 5;
            else if (d.count < 5000)
                return 10;
            else return 20;
        })
        .attr("opacity", 0)
        .transition().delay(function(d,i) {
        return i*0.25;
    })
        .attr("opacity", .7)
        .duration(function(d) {
            if (d.count < 500) {
                return 1000;
            }
            else if (d.count < 1000) {
                return 4000;
            }
            else return 8000;
        })
        .attr("fill", "red")
        .remove();


    vis.zoom = d3.behavior.zoom()
        .on("zoom",function() {
            vis.g.attr("transform","translate("+
                d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            vis.g.selectAll("circle")
                .attr("d", vis.path.projection(vis.projection));
            vis.g.selectAll("path")
                .attr("d", vis.path.projection(vis.projection));
        });

    vis.svg.call(vis.zoom);

};


GlobeVis.prototype.wrangleData = function() {
    var vis = this;

    var monthlyData = {};
    vis.monthlyDataArray = [];
    vis.conflictData.forEach(function (d) {
        var month= d.date_start.getMonth();
        var year = d.date_start.getYear();
        var name = d.conflict_name;

        var pair = String(month) + String(year) + String(name);
        if (pair in monthlyData) {
            monthlyData[pair].count += d.best_est;
        } else {
            var dNew = {
                "month":month,
                "year":year,
                "name":name,
                "count":d.best_est,
                "latitude": d.latitude,
                "longitude": d.longitude
            };
            monthlyData[pair] = dNew;
        }
    });

    for (var key in monthlyData) {
        vis.monthlyDataArray.push(monthlyData[key])
    }

    vis.min = d3.min(vis.monthlyDataArray, function(d) {
        return d.count;
    });
    vis.max = d3.max(vis.monthlyDataArray, function(d) {
        return d.count;
    });

    vis.scale = d3.scale.linear()
        .domain([vis.min, vis.max])
        .range([2, 20]);

    vis.initVis();
};



