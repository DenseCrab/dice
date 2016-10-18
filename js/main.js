var chat_sock = new WebSocket('ws://localhost:9002');

function htmlEncode(value){
  //create a in-memory div, set it's inner text(which jQuery automatically encodes)
  //then grab the encoded contents back out.  The div never exists on the page.
  return $('<div/>').text(value).html();
}

function htmlDecode(value){
  return $('<div/>').html(value).text();
}

function get_active_chat_tab() {
    var nav_tabs = $(".nav.nav-tabs");
    var active = nav_tabs.find(".active").attr('id');
    console.log(active);

    if (active === "server-information-tab")
        active = "";
    return active;
}

function chat_submit() {
    var input = $("#btn-input").val();
    if (input === "")
        return;

    var active = get_active_chat_tab();
    if (active !== "")
        chat_sock.send('{"send":{"to":"#' + active + '","msg":"' + input + '"}}');
    $("#btn-input").val("");
}

$("#btn-chat").click(chat_submit);
$("#btn-input").bind('keypress',
    function(evt) {
        var code = evt.keyCode || e.which;
        if (code === 13)
            chat_submit();
    }
);

chat_sock.onopen = function(){
    console.log("Connection established");

    var username = localStorage.getItem('username');
    var token = localStorage.getItem('token');
    //console.log(username, token);

    chat_sock.send('{"auth":{"user":"' + username + '","token":"' + token + '"}}');
    var server_info = $("#server-information").find("ul");

    var item = make_chat_entry("", "Authenticating as user " + username + ".");
    server_info.append(item);
};

function make_chat_entry(header, body, time) {
    var item = '<li class="left clearfix"><div class="chat-body clearfix"><div class="header"><strong class="primary-font">' 
	 + header + '</strong>' + (time !== undefined ? '<small class="pull-right text-muted"><span class="glyphicon glyphicon-time"></span>' + time + '</small>' : '') + '</div>' + body + '</div></li>';
    return item;
}

function make_chat_tab(channel) {
    var item = '<li id="' + channel + '"><a data-toggle="tab" href="#chat-' + channel + '">#' + channel + '</a></li>';
    return item;
}

function make_chat_body(channel) {
    var item = '<div id="chat-' + channel + '" class="tab-pane fade"><ul class="chat"></ul></div>';
    return item;
}

function create_chat_message(input) {
    console.log(input);
}

chat_sock.onmessage = function(evt) {
    var msg = JSON.stringify(evt.data);
    var obj = JSON.parse(evt.data);

    var server_info = $("#server-information").find("ul");

    if (obj["auth"]) {
        var auth_res = obj["auth"]["success"] === true ? "success" : "failure";
        server_info.append(make_chat_entry("", "Authentication " + auth_res));
        chat_sock.send('{"join":{"channel":"#FightClub"}}');
    } else if (obj["join"]) {
        if (!obj["join"]["success"] === true) {
            server_info.append(make_chat_entry("", "Failed to join channel " + obj["join"]["channel"]));
            return;
        }

        var channel = obj["join"]["channel"];
        server_info.append(make_chat_entry("", 'You have joined ' + channel)); 
        channel = channel.substr(1, channel.length);

	var chat_tab = make_chat_tab(channel);
        var chat_body = make_chat_body(channel);

        $(".nav.nav-tabs").append(chat_tab);
        $(".tab-content").append(chat_body);
    } else if (obj["send"]) {
	var success = obj["send"]["success"] === true;

        server_info.append(make_chat_entry("", "send " + (success ? "success" : "failure")));
    } else if (obj["msg"]) {
        var from = obj["msg"]["from"];
        if (from[0] === '#')
            from = from.substr(1, from.length);

        var user = obj["msg"]["user"];
        console.log(user);
        var chat_msg = obj["msg"]["msg"];
        var chat_entry = make_chat_entry('&lt;' + user + '&gt;&nbsp;', chat_msg);
        var chan = $("#chat-" + from).find("ul");
        console.log(chan.length);
        chan.append(chat_entry);
    } else {
        console.log("other", obj);
        var item = make_chat_entry("", msg, new Date().toLocaleString());
        server_info.append(item);
    }
};


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
