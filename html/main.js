var twitter_stack;

function create_stack() {
    this.zindex = 200;
    this.random_sign = function() {
        return Math.random() >= 0.5 ? 1 : -1;
    }
    this.prev_side = this.random_sign();
    this.push = function(frame, no_anim) {
        frame.css('zIndex', ++this.zindex);
        if(arguments.length < 2) {
            var degree = (9 * Math.random() + 1) * (this.prev_side *= -1);
            frame.rotate(degree);
            frame.animate_rotate(-degree, 100);
            frame.css('opacity', '0.9');
        }
        this.stack.append(frame);
        if(arguments.length < 2) {
            frame.center(20 - 40 * Math.random(), 20 - 40 * Math.random());
        }
    }
    this.pop = function(frame, fire_next) {
        if(frame.css('zIndex') != this.zindex) {
            // pop up
            frame.detach();
            this.push(frame, 'dont rotate');
        } else {
            // remove
            frame.remove();
        }
        $(this.stack.children().last().children()[fire_next == 'left' ? 1 : 2])
            .mouseover();
        this.zindex = this.stack.children().last().css('zIndex');
    }
    this.stack = $('<div>');
    this.stack.css('width', $(window).width());
    this.stack.css('height', $(window).height());
    this.stack.css('background-color', '#e0e0e0');
    this.body = $('body');
    this.body.append(this.stack);
    this.stack.center();
};

function create_frame() {
    var frame = $('<div>');
    frame.addClass('frame_internal');
    var underframe_left = $('<div>');
    underframe_left.addClass('underframe');
    underframe_left.addClass('underframe_left');
    var underframe_right = $('<div>');
    underframe_right.addClass('underframe');
    underframe_right.addClass('underframe_right');
    var frame_wrapper = $('<div>');
    frame_wrapper.addClass('frame_external');

    underframe_left.mouseover(function() {
        frame_wrapper.css('cursor', 'pointer');
        frame_wrapper.css('background-color', '#fff0f0');
    });
    underframe_left.mouseout(function() {
        frame_wrapper.css('cursor', 'auto');
        frame_wrapper.css('background-color', 'white');
    });
    underframe_left.click(function() {
        twitter_stack.pop(frame_wrapper, 'left');
    });

    underframe_right.mouseover(function() {
        frame_wrapper.css('cursor', 'pointer');
        frame_wrapper.css('background-color', '#f0fff0');
    });
    underframe_right.mouseout(function() {
        frame_wrapper.css('cursor', 'auto');
        frame_wrapper.css('background-color', 'white');
    });

    underframe_right.click(function() {
        twitter_stack.pop(frame_wrapper, 'right');
    });


    frame_wrapper.append(frame);
    frame_wrapper.append(underframe_left);
    frame_wrapper.append(underframe_right);
    frame_wrapper.html = function(arg) { frame.html(arg); };
    return frame_wrapper;
}

function add_window(twit) {
    var frame = create_frame();
    frame.html(extract_avatar(twit.user.profile_image_url, twit.user.screen_name) +
        highlight_hashtags(
        highlight_snames(
        highlight_urls(
            twit.text.toString()
        ))));
    twitter_stack.push(frame);
}

function extract_avatar(image_url, screen_name) {
    return $('<div>').append($('<div>').append(
        $('<div>')
            .addClass('avatar')
            .html('<img src="' + image_url + '" class="avatar">' + screen_name)
    ).addClass('middle-avatar')).html();
}

function extend_jquery() {
    jQuery.fn.center = function(xprec, yprec) {
        this.css("position","absolute");
        this.parnt = $(window);
        this.css("top", ((this.parnt.height() - this.outerHeight()) / 2) + 
            this.parnt.scrollTop() + yprec + "px");
        this.css("left", ((this.parnt.width() - this.outerWidth()) / 2) + 
            this.parnt.scrollLeft() + xprec + "px");
        return this;
    }
    jQuery.fn.rotate = function(degrees) {
        this.css({
                '-webkit-transform' : 'rotate('+degrees+'deg)',
                '-moz-transform' : 'rotate('+degrees+'deg)',  
                '-ms-transform' : 'rotate('+degrees+'deg)',  
                '-o-transform' : 'rotate('+degrees+'deg)',  
                'transform' : 'rotate('+degrees+'deg)',  
                'zoom' : 1
        });
    }
    jQuery.fn.animate_rotate = function(degrees, ms) {
        this.animate({
                '-not-existent-rotate' : degrees
        }, {
            duration: ms,
            step: function(now, fx) {
                $(this).css({
                        '-webkit-transform' : 'rotate('+now+'deg)',
                        '-moz-transform' : 'rotate('+now+'deg)',  
                        '-ms-transform' : 'rotate('+now+'deg)',  
                        '-o-transform' : 'rotate('+now+'deg)',  
                        'transform' : 'rotate('+now+'deg)',  
                        'zoom' : 1
                });
            }
        });
    }
}

function highlight_urls(text) {
    return text.replace(/(http:\/\/([^ ]+))/g, '<a href="$1" class="url">$2</a>');
}

function highlight_snames(text) {
    return text.replace(/(@([^ ]+))/g, '<a href="http://twitter.com/$2" class="screenname">$1</a>');
}

function highlight_hashtags(text) {
    return text.replace(/(#([^ ]+))/g, '<span class="hashtag">$1</span>');
}

function random_string() {
    var string = String();
    var new_sentence = true;
    var words = 70 * Math.random();
    for(var i = 0; i < words; ++i) {
        var letters = 8 * Math.random();
        for(var j = 0; j < letters; ++j) {
            var symbol = String.fromCharCode('a'.charCodeAt(0) +
                ('z'.charCodeAt(0) - 'a'.charCodeAt(0) + 1) * Math.random());
            if(new_sentence) { symbol = symbol.toUpperCase(); new_sentence = false; }
            string += symbol;
        }
        if(Math.random() < 0.15) { string += '.'; new_sentence = true;}
        string += ' ';
    }
    string = string.substr(0, string.length - 1);
    return string + '.';
}

function random_strings(num) {
    var arr = [];
    for(var i = 0; i < num; ++i) { arr.push(random_string()); }
    return arr;
}

$(document).ready(function() {
    extend_jquery();
    twitter_stack = new create_stack();
    var user_name = document.location.toString().replace(/^.*\?([^&]+).*$/, "$1");
    if(user_name == document.location) { user_name = 'mr_virtan'; }
    $.getJSON('http://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + user_name, function(data) {
        $(data.reverse()).each(function(index, el) {
            setTimeout(function() {
                add_window(el);
            }, index * 50);
        });
    });
});
