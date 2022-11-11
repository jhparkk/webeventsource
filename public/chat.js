$(function(){
    if (!window.EventSource) {
        alert("no event source")
        return
    }

    var $chatlog = $('#chat-log');
    var $chatmsg = $('#chat-msg');
    var isBlank = function(string) {
        return string == null|| string.trim() === "";

    };

    var username;
    while (isBlank(username)) {
        username = prompt("What's your name");
        if (!isBlank(username)) {
            $('#user-name').html('<b>' + username + '</b>')
        }
    }

    $('#input-form').on('submit', function(e) {
        $.post('/messages', {
            msg : $chatmsg.val(),
            name : username
        });
        $chatmsg.val("");
        $chatmsg.focus();
        return false;
    });

    var addMessage = function(data) {
        var text = "";
        if (!isBlank(data.name)) {
            text = '<strong>' + data.name + '</strong>';
        }
        text += data.msg;
        $chatlog.prepend('<div><span>' + text + '</span></div>');
    };

    // addMessage({
    //     msg: 'hello',
    //     name : 'aaa'
    // })

    // addMessage({
    //     msg: 'hello2',
    //     name : 'aaa2'
    // })

    var es = new EventSource('/stream');
    es.onopen = function(e) {
        console.log("chat.js- es.onopen");
        $.post('/users', {
            name: username
        });
    };
    es.onmessage = function(e) {
        console.log("chat.js- es.onmessage");
        var msg = JSON.parse(e.data);
        addMessage(msg);
    };

    window.onbeforeunload = function() {
        console.log("chat.js- window.onbeforeunload");
        $.ajax({
            url: "/users?username=" + username,
            type : "DELETE"
        });
        es.close();
    };

})