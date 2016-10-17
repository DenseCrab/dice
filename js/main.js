var socket = new WebSocket('ws://localhost:9002');

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

$("#btn-chat").click(
    function() {
        var input = $("#btn-input").val();
        if (input === "")
            return;

        var active = get_active_chat_tab();
        if (active !== "")
            socket.send('{"send":{"to":"#' + active + '","msg":"' + input + '"}}');
	$("#btn-input").val("");
    }
);

socket.onopen = function(){
    console.log("Connection established");
    var token = localStorage.getItem('token');
    console.log(token);

    socket.send('{"auth":{"user":"TestClient","token":"' + token + '"}}');
    var server_info = $("#server-information").find("ul");

    var item = make_chat_entry("", "Authenticating as user TestClient.");
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

socket.onmessage = function(evt) {
    var msg = JSON.stringify(evt.data);
    var obj = JSON.parse(evt.data);

    var server_info = $("#server-information").find("ul");

    if (obj["auth"]) {
        var auth_res = obj["auth"]["success"] === true ? "success" : "failure";
        server_info.append(make_chat_entry("", "Authentication " + auth_res));
        socket.send('{"join":{"channel":"#FightClub"}}');
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

