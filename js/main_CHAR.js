// TOTAL BEST_EST = 1898724

// GLOBAL DATA VARIABLES
var allCSV, allJSON;

// Use the Queue.js library to read two files
var format = d3.time.format("%Y-%m-%d");

queue()
    .defer(d3.json, "data/world-countries.json")
    .defer(d3.csv, "data/conflict_data.csv")
    .await(function(error, json, csv){

        // PROCESS CSV DATA
        csv.forEach(function(d) {
            d.type_of_violence = +d.type_of_violence;
            d.conflict_new_id = +d.conflict_new_id;
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            d.deaths_a = +d.deaths_a;
            d.deaths_b = +d.deaths_b;
            d.deaths_civilians = +d.deaths_civilians;
            d.deaths_unknown = +d.deaths_unknown;
            d.best_est = +d.best_est;
            d.date_start = format.parse(d.date_start);
        });

        // // SORT CSV DATA BY TIME
        csv.sort(function(a, b) {
            return a.date_start - b.date_start;
        });
        allCSV = csv.slice(0);
        allJSON = json;
        console.log("--> allCSV:");
        console.log(allCSV);
        console.log("--> allJSON:");
        console.log(allJSON);
        allVisualizations();
    });

function allVisualizations() {
    // var barchart = new BarChart("barchart", allCSV);

    // console.log("allvisafterglobe");
    var globevis = new GlobeVis("globe", allJSON, allCSV);
    // var stackedareachart = new StackedAreaChart("stackedareachart", allCSV);
    // $(".loading").fadeOut(2000);
}
