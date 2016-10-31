function htmlEncode(value) {
    //create a in-memory div, set it's inner text(which jQuery automatically encodes)
    //then grab the encoded contents back out.  The div never exists on the page.
    return $('<div/>').text(value).html();
}

function htmlDecode(value) {
    return $('<div/>').html(value).text();
}

function get_console_tab() {
    return $("#server-information .table");
}

function get_chat_tab(name) {
    return $("#chat-" + name + " .table");
}

function get_active_chat_tab() {
    var nav_tabs = $(".nav.nav-tabs");
    var active = nav_tabs.find(".active").attr('id');
    console.log("get_active_chat_tab:", active);

    if (active === "server-information-tab")
        active = "";
    return active;
}

function chat_submit() {
    // $("#server-information .table").append(make_chat_entry("DenseCrab", "Test NEW UI",""));
    var input = $("#btn-input").val();
    if (input === "")
        return;

    var active = get_active_chat_tab();
    if (active !== "") {
        console.log(active, input);
        chat_sock.send('{"send":{"to":"#' + active + '","msg":"' + input + '"}}');
    }
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

function make_chat_entry(header, body, time) {
    var item = '<tr class="chat-entry"><td class="time">' + (time !== undefined ? time : '') + '</td>' +
        '<td class="usr">' + header + '</td>' +
        '<td class="msg">' + body + '</td></tr>';
    return item;
}

function make_chat_tab(channel) {
    var item = '<li id="' + channel + '"><a data-toggle="tab" href="#chat-' + channel + '">#' + channel + '<i class="fa fa-times pull-right close-tab" aria-hidden="true"></i></a></li>';
    return item;
}

function make_chat_body(channel) {
    var item = '<div id="chat-' + channel + '" class="tab-pane fade"> <div class="col-xs-8 chatcol"><table class="table"></table></div><div class="col-xs-4 userscol"></div></div>';
    return item;
}

function create_chat_message(input) {
    console.log(input);
}

var demo_modes = {
    local: { value: 0, name: "Local demo (Generated content)" },
    production: { valie: 1, name: "Production demo ()" }
};

var config = {
    // Generation configuration
    demo_mode: null,

    username: null,
    token: null,

    // Socket configuration
    game_authed: false,
    chat_authed: false,

    game_sock: null,
    chat_sock: null,
};

function load_stored_settings() {
    var settings = {
        demo_mode: demo_modes.local,
        username: "",
        token: ""
    };

    var mode = localStorage.getItem('demo_mode');
    if (mode === "production") {
        settings.demo_mode = demo_modes.production;
    }

    var username = localStorage.getItem('username');
    if (username !== null) {
        settings.username = username;
    }

    var token = localStorage.getItem('token');
    if (token !== null) {
        settings.token = token;
    }

    return settings;
}

var settings = load_stored_settings();
if (settings === null) {
    console.log('unable to load stored settings');
} else {
    config.demo_mode = settings.demo_mode;
    config.username = settings.username;
    config.token = settings.token;

    if (config.demo_mode === demo_modes.local) {
        console.log('local demo enabled');

        // Generate content for local developer mode here
        // ...


    } else {
        console.log('production demo enabled');

        config.game_sock = new WebSocket('ws://localhost:9003');
        config.chat_sock = new WebSocket('ws://localhost:9002');

        if (!config.game_authed && config.username !== "" && config.token !== "") {
            //...
        }

        if (!config.chat_authed && config.username !== "" && config.token !== "") {
            //...
        }
    }
}


if (config.demo_mode === demo_modes.production) {

    // set socket callbacks
    config.game_sock.onopen = on_gamesock_open;
    config.game_sock.onmessage = on_gamesock_message;

    config.chat_sock.onopen = on_chatsock_open;
    config.chat_sock.onmessage = on_chatsock_message;
}

function on_gamesock_open() {
    console.log("Connection to game server established");

    config.game_sock.send('{"auth":{"user":"' + config.username + '","token":"' + config.token + '"}}');
    var server_info = get_console_tab();

    var item = make_chat_entry("", "Authenticating as user " + settings.username + " on game server.");
    server_info.append(item);
}

function on_gamesock_message(evt) {
    var msg = JSON.stringify(evt.data);
    var obj = JSON.parse(evt.data);

    console.log(msg);

    var server_info = get_console_tab();

    if (obj["auth"]) {
        var auth_res = obj["auth"]["success"] === true ? "success" : "failure";
        server_info.append(make_chat_entry("", "Authentication " + auth_res));
        if (obj["auth"]["success"] === true) {
        }
    } else if (obj["roll"]) {
        //server_info.append(make_chat_entry("", msg));
        if (obj["roll"]["success"] === true) {
        }
    } else {
        console.log("other", obj);
        var item = make_chat_entry("", msg, new Date().toLocaleString());
        server_info.append(item);
    }
};

function on_chatsock_open() {
    console.log("Connection to chat server established");

    var username = localStorage.getItem('username');
    var token = localStorage.getItem('token');
    //console.log(username, token);

    chat_sock.send('{"auth":{"user":"' + username + '","token":"' + token + '"}}');
    var server_info = get_console_tab();

    var item = make_chat_entry("", "Authenticating as user " + username + ".");
    server_info.append(item);
};

function on_chatsock_message(evt) {
    var msg = JSON.stringify(evt.data);
    var obj = JSON.parse(evt.data);

    var server_info = get_console_tab();

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
        console.log("incoming msg", from, user, msg);
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


//Add chat-tab
var newtab = 1;
$("#add-tab-tab").on("click", function() {
    //add dummy tab
    $('#chatcol-chat .nav-tabs #add-tab-tab').before(make_chat_tab("new-tab-" + newtab));
    $('#chatcol-chat .tab-content').append(make_chat_body("new-tab-" + newtab));
    newtab++;
});

$("a[href!='#add-tab']").on("click", function() {
    $("#chatcol .panel-footer").removeClass("invisible");
});

$("#add-tab #usrname").on("keyup", function(event) {
    if ($(this).val() !== "")
        $("#add-tab #add-user").removeClass("disabled");
    else
        $("#add-tab #add-user").addClass("disabled");
});

$("#add-tab #usrname").keypress(function(e) {
    if (e.which == 13)
        $("#add-tab #add-user").trigger("click");
});

$("#add-tab #add-user").on("click", function() {
    if (!$(this).hasClass("disabled")) {
        var usernameinput = $("#add-tab #usrname");

        $("#add-tab #added-users").prepend('<a href="#" class="list-group-item">' + usernameinput.val() + '</a>');
        usernameinput.val("").focus();
    }
});

//close-tab
$(document).on('click', "i.close-tab", function() {
    //remove tab
    $(this).parent().parent().remove();
    //remove body
    $($(this).parent().attr("href")).remove();

    activateTab('server-information');
});

function activateTab(tab) {
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
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
$("#btnsbet #max").on("click", function() {
    $("#betcol #bet").val($("#betcol #bal").html());
});

$("#btnsbet #min").on("click", function() {
    $("#betcol #bet").val("0.00000000");
});

$("#btnsbet #half").on("click", function() {
    $("#betcol #bet").val(($("#betcol #bet").val() / 2).toFixed(8));
});

$("#btnsbet #double").on("click", function() {
    $("#betcol #bet").val(($("#betcol #bet").val() * 2).toFixed(8));
});


//Winchance - Multiplier 
var edge = 1;
var curr_chance = 50.0;
var curr_payout = get_payout(curr_chance, edge);

$("#betcol #multiplier").numeric();
$("#betcol #winchance").numeric();

var rollover_ = $('#rollover_');
var rollunder_ = $('#rollunder_');
calculateOverUnder($('#betcol #winchance').val());
$("#betcol #multiplier").val(get_payout($('#betcol #winchance').val(), edge));

$("#betcol #winchance").on("keyup", function() { 
    $("#betcol #multiplier").val(get_payout($(this).val(), edge));
    calculateOverUnder($(this).val());
});

$("#betcol #multiplier").on("keyup", function() {
    $("#betcol #winchance").val(get_chance($(this).val(), edge));
    calculateOverUnder($('#betcol #winchance').val());
});

function round_to_precision(value, precision) {
    var power = Math.pow(10, precision);
    return Math.floor(value*power)/power;
}

function get_payout(chance, edge) {
    var payout = 1/chance*(100-edge);
    payout = round_to_precision(payout, 10);

    console.log('get_payout', 'chance ' + chance, 'payout ' + payout, 'edge ' + edge);
    return payout;
}

function get_chance(payout, edge) {
    var chance = 0;
    if (edge > 0) {
        chance = (1/payout)*(100-edge);
    } else {
        chance = (1/payout)*100;
    }
    chance = Math.round(chance*100)/100;

    console.log('get_chance', 'chance ' + chance, 'payout ' + payout, 'edge ' + edge);
    return chance;
}

function calculateOverUnder(winchance) {
    rollunder_.html(winchance);
    rollover_.html((99.99 - winchance).toFixed(2));
}

function make_bet_table_entry(username, bet_id, condition_high, amount, balance, profit, target, roll) {
    var dt = new Date();
    var time = dt.getHours() + ":" + dt.getMinutes();

    $("#bets tbody").prepend(
        "<tr id='" + betid + "'>" +
        '<td><a class="open-modal clickable" data-toggle="modal" data-target="#myModal">' + betid + "</a></td>" +
        "<td>" + username + "</td>" +
        "<td>" + time + "</td>" +
        "<td>" + $("#betcol #bet").val() + "</td>" +
        "<td>" + $("#betcol #multiplier").val() + "x</td>" +
        "<td>" + (condition_high ? "> " : "< ") + $('#rollover_').html() + "</td>" +
        "<td>" + roll + "</td>" +
        "<td>" + profit + "</td>" +
        "</tr>"
    );
}

//table bets
$("#betcol #rollhi").on("click", function() {
    if (config.demo_mode == demo_modes.local) {
        var betid = Math.floor(Math.random() * 10000000) + 1;
        var balance = 0;
        var target = (Math.random() * 99.99)*100;
        var roll = (Math.random() * 99.99)*100;

        make_bet_table_entry("DenseCrab", betid, true, $("#betcol #bet").val(), balance, (0.1).toFixed(8), target, roll);
    } else {
        config.game_sock.send('{"roll":{"condition_high":true,"target":' 
            + $("#betcol #winchance").val() 
            + ',"amount":' + Math.round($("#betcol #bet").val()*1e8) + '}}'
        );
    }
});

$("#betcol #rolllo").on("click", function() {
    if (config.demo_mode == demo_modes.local) {
        var betid = Math.floor(Math.random() * 10000000) + 1;
        var balance = 0;
        var target = (Math.random() * 99.99)*100;
        var roll = (Math.random() * 99.99)*100;

        make_bet_table_entry("DenseCrab", betid, true, $("#betcol #bet").val(), balance, (0.1).toFixed(8), target, roll);
    } else {
        config.game_sock.send('{"roll":{"condition_high":false,"target":'
            + $("#betcol #winchance").val()*100
            + ',"amount":' + Math.round($("#betcol #bet").val()*1e8) + '}}'
        );
    }
});


$('.navbar-brand').on("click", function() {
    showNotification("info", "test");
});

//notification
function showNotification(type, message) {
    $.notify(
        {
            // options
            message: message, 
	    newest_on_top: true
        }, {
	    // settings
            type: type //success,danger,info, warning
        }
    );
}

function removeFromChat(channel, id) {
    $('#' + channel  + ' #'+id).remove();
}

function removeFromBets(betid) {
    $('#bets-table #' + betid).remove();
}

$(".open-modal-bets").click(function () {
    $('#bet-modal-title').html("TEST");
});

