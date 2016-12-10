/*
 * StackedAreaChart - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the  
 */

LineChart = function(_parentElement, _data){
	this.parentElement = _parentElement;
  	this.data = _data;
  	this.displayData = []; // see data wrangling
	this.initVis();
};



/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

LineChart.prototype.initVis = function(){
	var vis = this;
	vis.margin = { top: 50,
        right: 20, bottom: 50, left: 20 };

	vis.width = $(window).width() - vis.margin.left - vis.margin.right;
  	vis.height = $(window).height() - vis.margin.top - vis.margin.bottom;


  	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
	    .attr("width", vis.width)
        .attr("height", vis.height);
	    // .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.group = vis.svg.append("g")
        .attr("width", vis.width)
	    .attr("transform", "translate(" + (vis.margin.left + vis.margin.right) + "," + (vis.margin.top - vis.height/2) + ")")
        .attr("opacity", 0);


	// Scales and axes
  	vis.x = d3.time.scale()
		.range([0, vis.width - vis.margin.left - vis.margin.right]);

	vis.y = d3.scale.linear()
		.range([vis.height, 0]);

	vis.xAxis = d3.svg.axis()
		  .scale(vis.x)
		  .orient("bottom");

	vis.yAxis = d3.svg.axis()
	    .scale(vis.y)
	    .orient("left");

	vis.group.append("g")
	    .attr("class", "x-axis axis")
	    .attr("transform", "translate(0," + (vis.height + 10) + ")")
        .attr("stroke-width", 0);

	vis.group.append("g")
        .attr("class", "y-axis axis");



    vis.defs = vis.svg.append("defs")
        .append("pattern")
        .attr("class", "image")
        .attr("id", "preview-background-image")
        .attr("patternUnits", "userSpaceOnUse")
        .attr("width", vis.width)
        .attr("height", vis.height);
    vis.backgroundimage = vis.defs.append("image")
        .attr("xlink:href", "img/syria-rubble3.jpg")
        .attr("width", this.width)
        .attr("height", this.height)
        .attr("x", -vis.margin.left);

    vis.preview = vis.group.append("rect")
        .attr("class", "rect")
        .attr("id", "preview")
        .attr("width", vis.width - vis.margin.left - vis.margin.right)
        .attr("height", vis.height - vis.margin.bottom)
        .attr("fill", "url(#preview-background-image)")
        .attr("x", 0)
        .attr("y", 0)
        .attr("opacity", 0);
    vis.previewtitlebackground = vis.svg.append("rect")
        .attr("class", "rect rect-background")
        .attr("id", "title-background")
        .attr("fill", "white")
        .attr("x", vis.width/2 + vis.margin.left - 100)
        .attr("y", vis.height/2 - 30)
        .attr("rx", 3)
        .attr("width", 200)
        .attr("height", 80)
        .attr("opacity", 0);
    vis.previewtitle = vis.svg.append("text")
        .attr("class", "preview preview-title0")
        .attr("x", vis.width/2 + vis.margin.left)
        .attr("y", vis.height/2)
        .text("Timeline Title Here")
        .attr("opacity", 0);
    vis.previewsubtitle = vis.svg.append("text")
        .attr("class", "preview preview-subtitle0")
        .attr("x", vis.width/2 + vis.margin.left)
        .attr("y", vis.height/2 + 30)
        .text("Timeline Subtitle Here")
        .attr("opacity", 0);

  	vis.wrangleData();
};



/*
 * Data wrangling
 */
LineChart.prototype.wrangleData = function(){
	var vis = this;

    function addToRegion(d) {
        if (d.region == "Africa") { africa += d.best_est; }
        else if (d.region == "Americas") { americas += d.best_est; }
        else if (d.region == "Asia") { asia += d.best_est; }
        else if (d.region == "Europe") { europe += d.best_est; }
        else if (d.region == "Middle East") { middle_east += d.best_est; }
        total += d.best_est;
    }
    for (var i = 0; i < vis.data.length; i++) {
        var africa = 0,
            americas = 0,
            asia = 0,
            europe = 0,
            middle_east = 0,
            total = 0,
            year = 2015;
        addToRegion(vis.data[i]);
        function countYear() {
            for (i; i < vis.data.length - 1; i++) {
                if (vis.data[i].date_start.getFullYear() == vis.data[i+1].date_start.getFullYear()) {
                    addToRegion(vis.data[i+1]);
                }
                else { year = vis.data[i].date_start.getFullYear(); return; }
            }
        }
        countYear();
        var newYear = {
            year: d3.time.format("%Y").parse(year.toString()),
            Africa: africa,
            Americas: americas,
            Asia: asia,
            Europe: europe,
            Middle_East: middle_east,
            Total: total
        };
        vis.displayData.push(newYear);
    }
    vis.displayData.forEach(function(d) { d.avg = d3.max(vis.displayData, function(d) { return d.Total; })/2; });

    function getTotal(data) {
        var t = 0;
        data.forEach(function(d) {
            t += d.best_est;
        });
        return t;
    }
	// console.log(getTotal(vis.displayData));
    // console.log(getTotal(vis.data));
	// INITIALIZE STACK LAYOUT

    console.log(vis.displayData);
	// Update the visualization
  	vis.updateVis();
};

/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */
LineChart.prototype.updateVis = function(){
	var vis = this;

    vis.x.domain(d3.extent(vis.displayData, function(d) { return d.year; }));
    vis.y.domain([0, d3.max(vis.displayData, function(d) { return d.Total; })]);
    var valueline = d3.svg.line()
        .x(function(d) { return vis.x(d.year); })
        .y(function(d) { return vis.y(0); });

    var line = vis.group.append("path")
        .attr("class", "line")
        .attr("d", valueline(vis.displayData))
        .attr("stroke", "red")
        .attr("stroke-width", 3);

    var points = vis.group.selectAll("point")
        .data(vis.displayData)
        .enter().append("circle")
        .attr("class", "point")
        .attr("id", function(d) { return "point-" + d.year.getFullYear(); })
        .attr("r", 6)
        .attr("fill", "black")
        .attr("stroke", "white")
        .attr("cx", function(d) { return vis.x(d.year); })
        .attr("cy", function(d) { return vis.y(0); })
        .on("start", function(d) { console.log("teststart"); })
        .on("mouseover", function(d) {
            vis.group.selectAll(".point").transition().attr("opacity", 0.4).attr("r", 6).attr("stroke-width", 1);
            vis.group.select(".line").transition().attr("opacity", 0.5);
            vis.group.select("#point-" + d.year.getFullYear()).transition().attr("opacity", 1).attr("r", 12).attr("stroke-width", 3);
            view(d.year.getFullYear());
        })
        .on("mouseout", function() {
            vis.group.selectAll(".point").transition().delay(3000).attr("opacity", 1);
            vis.group.select(".line").transition().delay(3000).attr("opacity", 1);
        });

    vis.group
        .transition()
        .attr("opacity", 1)
        .transition()
        .delay(500)
        .duration(1000)
        .attr("transform", "translate(" + (vis.margin.left + vis.margin.right) + "," + vis.margin.top + ")");

    vis.preview
        .transition()
        .delay(1500)
        .duration(1000)
        .attr("opacity", 1);
    vis.previewtitlebackground
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", .8);
    vis.previewtitle
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);
    vis.previewsubtitle
        .transition()
        .delay(2000)
        .duration(500)
        .attr("opacity", 1);

    vis.svg.selectAll("text.preview-title")
        .data(vis.displayData)
        .enter()
        .append("text")
        .attr("class", "preview preview-title")
        .attr("id", function(d) { return "preview-title-" + d.year.getFullYear(); })
        .attr("x", vis.width/2 + vis.margin.left)
        .attr("y", vis.margin.top + vis.margin.bottom + 30)
        .text(function(d) {
            return d.year.getFullYear()
        })
        .attr("opacity", 0);

    function view(year) {
        vis.svg.selectAll(".preview").transition().duration(500).attr("opacity", 0);
        vis.svg.select("#preview-title-" + year).transition().delay(500).duration(500).attr("opacity", 1);
        vis.previewtitlebackground
            .transition()
            .duration(500)
            .attr("class", "rect rect-background")
            .attr("id", "title-background")
            .attr("fill", "white")
            .attr("x", 0)
            .attr("y", 0)
            .attr("rx", 3)
            .attr("width", function() {
                console.log(vis.preview.node().getBBox());
                return (vis.backgroundimage.node().getBBox().width - vis.margin.left - vis.margin.right);
            })
            .attr("height", vis.height - vis.margin.top - vis.margin.bottom)
            .attr("transform", "translate(" +
                (vis.width/2 + vis.margin.left - (vis.width - vis.margin.left/2 - vis.margin.right/2)/2) + "," +
                ((vis.height + vis.margin.top)/2 - (vis.height - vis.margin.top - vis.margin.bottom)/2) + ")");
    }
    // Call axis functions with the new domain
    vis.group.select(".x-axis").call(vis.xAxis);
    // vis.group.select(".y-axis").call(vis.yAxis);
};
// function mousemove takes the position of the viewer's cursor on the focus svg rectangle and dynamically
// maps the circle and vertical line to the currently focused cursor position.