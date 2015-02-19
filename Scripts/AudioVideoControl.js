function setAudioVideoFunctionalities(audioVideoElement) {
    var manualSeek = false;
    var loaded = false;

    audioVideoElement.load();

    $(audioVideoElement).removeAttr('controls');

    $("#slider-loudness").slider({
        orientation: "vertical",
        range: "min",
        min: 0,
        max: 100,
        value: (audioVideoElement.volume * 100),
        step: 1,
        slide: function (event, ui) {
        },
        change: function (event, ui) {
            audioVideoElement.volume = (ui.value / 100);
        }
    });

    $("#audiovolume").unbind().click(function () {
        if ($(this).hasClass("active_volumepanel")) {
            $(this).removeClass("active_volumepanel");
        } else {
            $(this).addClass("active_volumepanel");
        }

        $("#slider-loudness").toggle();
        $("#slider-loudness").position({
            my: "center top",
            at: "center top",
            of: $("#audiovolume"),
            collision: "flipfit"
        });

        //damed positioning....
        if ($("#slider-loudness").is(":visible")) {
            if ($("#slider").length > 0) {
                $("#slider-loudness").addClass("loudness-margin-video");
            }else {
                $("#slider-loudness").addClass("loudness-margin-audio");
            }
        }else {
            $("#slider-loudness").removeClass("loudness-margin-video").removeClass("loudness-margin-audio");
        }

    });

    $(audioVideoElement).bind('play', function () {
        $("#playtoggle").addClass('playing');
    }).bind('pause ended', function () {
        $("#playtoggle").removeClass('playing');
    });

    $("#playtoggle").unbind().click(function () {
        if (audioVideoElement.paused) {
            audioVideoElement.play();
            $("#playtoggle").text("0");
        }
        else {
            audioVideoElement.pause();
            $("#playtoggle").text("3");
        }
    });

    $("#playtoggle").text("3");

    var loadingIndicator = $('#audiovideo_container #loading');
    var positionIndicator = $('#audiovideo_container #handle');
    var timeleft = $('#audiovideo_container #timeleft');
    var sliderBar;


    $(audioVideoElement).unbind();
    $('#gutter .ui-slider-range').width(0);

    if ((audioVideoElement.buffered != undefined) && (audioVideoElement.buffered.length != 0)) {
        $(audioVideoElement).bind('progress', function () {
            loaded = parseInt(((audioVideoElement.buffered.end(0) / audioVideoElement.duration) * 100), 10);
            loadingIndicator.css({ width: loaded + '%' });
        });
        audioVideoElement.currentTime = 0;

    }
    else {
        loadingIndicator.remove();
    }

    $(audioVideoElement).bind('timeupdate', function () {

        var rem = parseInt(audioVideoElement.currentTime, 10),
                pos = (audioVideoElement.currentTime / audioVideoElement.duration) * 100,
                mins = Math.floor(rem / 60, 10),
                secs = rem - mins * 60;

        if (mins <= 9) {
            mins = "0" + mins;
        }

        timeleft.text(mins + ':' + (secs > 9 ? secs : '0' + secs));

        if (!manualSeek) {

            if ($(sliderBar).length == 0) {
                sliderBar = $('#gutter .ui-slider-range').first();
            }

            $(sliderBar).width(pos + '%');
            positionIndicator.css({ left: pos + '%' });
        }
        if (!loaded && $(sliderBar).length == 0) {
            loaded = true;

            $('.player #gutter').slider({
                value: 0,
                step: 0.01,
                orientation: "horizontal",
                range: "min",
                max: audioVideoElement.duration,
                animate: true,
                slide: function () {
                    manualSeek = true;
                },
                stop: function (e, ui) {
                    manualSeek = false;
                    audioVideoElement.currentTime = ui.value;
                }
            });
        }

    });
}

interactiveExerciseAudio = {
    init: function () {

        var audio = $('.drag-box-audio');
        var isLowIosVersion = false;

        if (/iP(hone|od|ad)/.test(navigator.platform)) {
            // supports iOS 2.0 and later: <http://bit.ly/TJjs1V>
            var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
            var ver = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)];
            if (ver[0] < 6) {
                isLowIosVersion = true;
            }
        }

        //windows safari
        var ua = navigator.userAgent.toLowerCase();
        if (ua.indexOf("safari/") !== -1 &&  // It says it's Safari
            ua.indexOf("windows") !== -1 &&  // It says it's on Windows
            ua.indexOf("chrom") === -1     // It DOESN'T say it's Chrome/Chromium
            ) {
            alert('Diese Übung wird von Safari iOS6 leider nicht unterstützt.');
        }

        if (isLowIosVersion && (audio.length > 1)) {
            alert('Diese Übung wird von Safari iOS6 leider nicht unterstützt.');
        }

        audio.click(function (e) { interactiveExerciseAudio.select(this); });
        //$('.exercise_audio audio.show').appendTo('.exercise_audio');
    },
    unselectAll: function () {
        $('.drag-box-audio').removeClass('shape-selected');

        $('.exercise_audio audio.show').parent().hide();

        $('.exercise_audio audio').each(function () {
            this.pause();
        });
    },
    select: function (elem) {
        interactiveExerciseAudio.unselectAll();
        $(elem).addClass('shape-selected');
        var name = $(elem).attr('data-name');
        var audio = $('.exercise_audio audio.show[data-name="' + name + '"]')[0];
        var audioWrapper = $(audio).parent();
        $(audioWrapper).show();

        audio.load();
        audio.play();
    }
};