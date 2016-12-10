// LANDING.JS FOR LANDING PAGE MANIPULATION
$(document).ready(function() {
    $("#start").on("click", function() {
        console.log("clicked!");
        $("#main").fadeOut("slow");
        $(".title").fadeOut("slow");
        $(".quote").delay(1000).fadeIn("slow");
        $(".next").delay(2000).fadeIn("slow");
        $("#linechart").fadeOut("fast");
    });
    $(".next").on("click", function() {
        $(".quote").fadeOut("slow");
        $(".next").fadeOut("slow");
        $("#linechart").delay(500).fadeIn("slow");
        $(".next1").delay(2000).fadeIn("slow");
    });
    $(".next1").on("click", function() {
        $("#linechart").fadeOut("slow");
        $(".next1").fadeOut("slow");
        $("#stackedareachart").delay(500).fadeIn("slow");
        $(".next2").delay(2000).fadeIn("slow");
    });
    $(".next2").on("click", function() {
        $("#stackedareachart").fadeOut("slow");
        $(".next2").fadeOut("slow");
        $("#globe").delay(1000).fadeIn("slow");
        $("#globe-title").delay(1500).fadeIn("slow");
        $(".next3").delay(2000).fadeIn("slow");
    });
    $(".next3").on("click", function() {
        $("#globe").fadeOut("slow");
        $("#globe-title").fadeOut("slow");
        $(".next3").fadeOut("slow");
        $("#conclusion").delay(1000).fadeIn("slow");
        $(".home").delay(2000).fadeIn("slow");
    });
    $(".home").on("click", function() {
        $("#conclusion").fadeOut("slow");
        $(".home").fadeOut("slow");
        $(".title").delay(1000).fadeIn("slow");
        $("#main").delay(2000).fadeIn("slow");
    });
});