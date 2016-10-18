//Users animation
$("#users").on("click", function() {
    if ($("#chatcol-users").hasClass("invisible")) {
        TweenMax.to($("#chatcol-chat"), .5, {
            width: "70%",
            onComplete: makevisible
        });
        TweenMax.to($("#chatcol-users"), .5, {
            paddingLeft: "2"
        });

    } else {
        TweenMax.to($("#chatcol-chat"), .5, {
            width: "100%"
        });
        $("#chatcol-users").addClass("invisible").removeClass("col-xs-3");
    }
});

var makevisible = function() {
    $("#chatcol-users").removeClass("invisible").addClass("col-xs-3");

};


//SWITCH HI/LO
$("#arrow").on("click", function() {
    if ($("i", this).hasClass("fa-arrow-up")) {
        $("i", this).removeClass("fa-arrow-up").addClass("fa-arrow-down");
        $("#betcol #game").prop('checked', false);

    } else {
        if ($("i", this).hasClass("fa-arrow-down")) {
            $("i", this).removeClass("fa-arrow-down").addClass("fa-arrow-up");
            $("#betcol #game").prop('checked', true);
        }
    }
});

//MIN MAX DOUBLE HALF
$("#btnsbet #max").on("click", function(){
	$("#betcol #bet").val($("#betcol #bal").html());
});

$("#btnsbet #min").on("click", function(){
	$("#betcol #bet").val("0.00000000");
});

$("#btnsbet #half").on("click", function(){
	$("#betcol #bet").val(($("#betcol #bet").val()/2).toFixed(8));
});

$("#btnsbet #double").on("click", function(){
	$("#betcol #bet").val(($("#betcol #bet").val()*2).toFixed(8));
});


//Winchance - Multiplier 
$("#betcol #multiplier").numeric();
$("#betcol #winchance").numeric();

var edge = 1/100;

$("#betcol #winchance").on("keyup", function(){
	$("#betcol #multiplier").val(calculateWinchanceMultiplier($(this).val()));
});

$("#betcol #multiplier").on("keyup", function(){
	$("#betcol #winchance").val(calculateWinchanceMultiplier($(this).val()));
});

function calculateWinchanceMultiplier(winchance) {
	var wm = 100/winchance; 
	var edgedwm = (wm - wm*edge).toFixed(2);
	// console.log(wm);
	// console.log(edgedwm);
	
	return edgedwm;
}


//add table dummybets
$("#betcol #roll").on("click", function() {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

    $("#bets tbody").prepend(
        "<tr>" +
        "<td>" + Math.floor(Math.random() * 10000000) + 1 + "</td>" +
        "<td>" + "DenseCrab" + "</td>" +
        "<td>" + time + "</td>" +
        "<td>" + $("#betcol #bet").val() + "</td>" +
        "<td>" + $("#betcol #multiplier").val() + "x</td>" +
        "<td>" + (($("#betcol #game").prop("checked") == true) ? "HI" : "LO") + "</td>" +
        "<td>" + (Math.random() * (99.99)).toFixed(2) + "</td>" +
        "<td>" + "kwet" + "</td>" +
        "</tr>"
    )
});