// LANDING.JS FOR LANDING PAGE MANIPULATION
$(document).ready(function() {
    fire("#s1");
    for (var i = 1; i <= 9; i++) {
        var section = "#s" + parseInt(i);
        bind(section);
    }
});
function bind(section) {
    var prev = "#s" + (parseInt(section.substring(2, section.length)) - 1).toString();
    var next = "#s" + (parseInt(section.substring(2, section.length)) + 1).toString();
    if (section == "#s1" || section == "#s2") {
        $(section).find(".title").click(function() { fire(next); });
    }
    $(section).find(".prev-lg").click(function() { fire(prev); });
    if (section == "#s9") { $(section).find(".next-lg").click(function() { fire("#s1"); }); }
    else { $(section).find(".next-lg").click(function() { fire(next); }); }
}
function fire(section) {
    var q = "#q" + section.substring(2, section.length);
    $(".section").fadeOut(1000);
    if (section != "#s1" && section != "#s2" && section != "#s3" && section != "#s8" && section != "#s9") {
        $(q).fadeIn(1000);
        $(q).click(function() { $(q).fadeOut(1000); $(section).fadeIn(1000); go(section); });
    }
    else { setTimeout(function() { $(section).fadeIn(1000); go(section); }, 1000); }


    function go(section) {
        if (section == "#s1") { $(".navbar-xs").hide(); }
        if (section == "#s2") {
            $(".navbar-xs").hide();
            $(".title").find(":header, img, p").css("opacity", 0);
            player.setCurrentTime(0); player.play();
        }
        if (section != "#s1" && section != "#s2") {
            var currentNav = "#nav-" + section.substring(1, section.length);
            setNav(currentNav);
            $(".navbar-xs").fadeIn(1000);
            if (section == "#s6") { stackedareachart.updateVis(); }
        }
        setTimeout(function() {
            $(section).find(".next-lg img, .prev-lg img").fadeTo(1000, 1);
        }, 3000);
    }

}
function setNav(selector) {
    $(".navbar-xs").find("a").removeAttr('style');
    $(selector).css("background-color", "white").css("color", "black");
}