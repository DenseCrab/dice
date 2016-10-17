$("#users").on("click", function() {
    if ($("#chatcol-users").hasClass("invisible")) {
        TweenMax.to($("#chatcol-chat"), .5, {
            width: "70%",
            paddingRight: "2",
            borderRightColor: "#337AB7",
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


//SWITCH
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

//MINMAXSHIT
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
var edge = 1/100;

$("#betcol #winchance").numeric();
$("#betcol #winchance").on("keyup", function(){
	var multiplier = 100/$(this).val(); 
	var edgedmultiplier = (multiplier - multiplier*edge).toFixed(2);
	console.log(multiplier);
	console.log(edgedmultiplier);
	
	$("#betcol #multiplier").val(edgedmultiplier);	
});

$("#betcol #multiplier").numeric();
$("#betcol #multiplier").on("keyup", function(){
	var winchance = 100/$(this).val();
	var edgedwinchance = (winchance - winchance*edge).toFixed(2);
	console.log(winchance);
	console.log(edgedwinchance);
	
	$("#betcol #winchance").val(edgedwinchance);
});


//table bets
$("#betcol #roll").on("click", function() {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes() + ":" + dt.getSeconds();

    $("#bets tbody").prepend(
        "<tr>" +
        "<td>" + Math.floor(Math.random() * 10000000) + 1 + "</td>" +
        "<td>" + "DenseCrab" + "</td>" +
        "<td>" + time + "</td>" +
        "<td>" + $("#betcol #bet").val() + "</td>" +
        "<td>" + $("#betcol #payout").val() + "x</td>" +
        "<td>" + (($("#betcol #game").prop("checked") == true) ? "HI" : "LO") + "</td>" +
        "<td>" + (Math.random() * (99.99)).toFixed(2) + "</td>" +
        "<td>" + "kwet" + "</td>" +
        "</tr>"
    )
});