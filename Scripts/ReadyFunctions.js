// **** GENERAL DATA **** //


function setMacOSCSS() {
    $(".btnContainer  a").css("margin-top", 2);
    $(".btnToolContainer  a").css("margin-top", 2);
    $(".inputContainer span").css("top", 7);
    $("#goto_page_input").css("top", 10);
    $("#maximize_menu").css("margin-left", 3);
    $("#audioElement_symbol span").css("top", 1);
    $("#playtoggle").css("text-indent", 3);
    $("#playtoggle").css("text-indent", 3);
    $(".tools_extended_icon_background span").css("margin-top", 0);
  
}

function isOSX() {
    return (navigator.appVersion.indexOf("Mac") != -1);
}

function setTitle() {
     $.getJSON('/manifest.json', function (data) {
        $(document).ready(function() {
        document.title = data.name;
    });
    }).error(function (data) {
        //console.log("Error: failed to load json");
    });
}



function detectOS() {
    var OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
    if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

    if (OSName == "MacOS") {
        setMacOSCSS();
    }
}

function hideExerciseContent() {
    $("#exerciseSplitter").hide();
    $("#exercise_content").html("");
    clearMaterialFontColoration();
}

function loadExerciseShortCutNavigationElements() {
    $("#exercise_back").click(function () {
//        loadExercise(parseInt(currentExercise.Number) - 1, currentExercise.Lesson, function (exercise, exerciseType) {
//            fillOutExercise(exercise, exerciseType);
        //        });
        var previousExerciseNumber = exerciseIndex[exerciseIndex.indexOf(currentExercise.Number) - 1];
        loadExercise(previousExerciseNumber, currentExercise.Lesson, function (exercise, exerciseType) {
            fillOutExercise(exercise, exerciseType);
            $('#material_options_singleView').addClass('activeMenuEntry');
        });
   });

   $("#exercise_forward").click(function () {
       var nextExerciseNumber = exerciseIndex[exerciseIndex.indexOf(currentExercise.Number) + 1];
       loadExercise(nextExerciseNumber, currentExercise.Lesson, function (exercise, exerciseType) {
           fillOutExercise(exercise, exerciseType);
           $('#material_options_singleView').addClass('activeMenuEntry');
       });
   });
}


function loadToolbarElements() {
    $("#tools").find(".disabled").each(function () {
        
        $(this).removeClass("disabled");
    });
    $("#whiteboard_tools").unbind().click(function () {
        toggleSecondToolMenu(this);
        toolsButtonColoration("#whiteboard_tools");
    });

    $("#utilities").unbind().click(function () {
        if ($("#utilities").parent().hasClass("activeMenuEntry")) {
            toolsButtonColoration("#utilities");
            $("#exerciseView").dialog("close");
            $("#exerciseMenu").dialog("close");
        } else {

            openDialogs(null, null, false);
            hideCanvas();
            //toolsButtonColoration("#utilities");
        }

        //toggleSecondToolMenu(this);

    });

    $("#settings").unbind().click(function () {
        toggleSecondToolMenu(this);
        toolsButtonColoration("#settings");
    });

    $("#info").unbind().click(function () {
        toggleSecondToolMenu(this); 
        toolsButtonColoration("#info");
    });

    $("#btnAdditionalExercises").unbind().click(function () {
        toggleSecondToolMenu(this);
    });

    $("#btnToolsShowImprint").unbind().click(function () {
        showImprint();
        toggleSecondToolMenu(this);
        toolsButtonColoration("close");
    });
    $("#btnToolsShowIntro").unbind().click(function () {
        loadIntro(false, false);
        toggleSecondToolMenu(this);
        toolsButtonColoration("close");
    });
    $("#btnToolsShowSourceDirectory").unbind().click(function () {
        showSourceDirectory();
        toggleSecondToolMenu(this);
        toolsButtonColoration("close");
    });
    $("#btnToolsShowSupport").unbind().click(function () {
        showSupport();
        toggleSecondToolMenu(this);
        toolsButtonColoration("close");
    });
    $("#btnToolsShowLicense").unbind().click(function () {
        showLicense();
        toggleSecondToolMenu(this);
        toolsButtonColoration("close");
    });
    $("#btnToolsShowMediaLibrary").unbind().click(function () {
        showMediaLibrary();
        toggleSecondToolMenu(this);
        toolsButtonColoration("close");
    });
}


function loadMaximizedMenuElements() {
    $("#maximized_navigation_slideRight_btn").click(function () {
        $("#maximized_navigation_slideLeft_btn").mask();
        $("#maximized_navigation_slideRight_btn").mask();

        if (($("#maximized_menu_content").width() + $("#maximized_menu_content").position().left) > ($("#maximized_navigation").width() - 70)) {

            $("#maximized_menu_content").animate({
                left: "-=300px"
            }, 300, function () {
                $("#maximized_navigation_slideLeft_btn").unmask();

                if (($("#maximized_menu_content").width() + $("#maximized_menu_content").position().left) < ($("#maximized_navigation").width() - 70)) {
                    $("#maximized_navigation_slideRight_btn").mask();
                } else {
                    $("#maximized_navigation_slideRight_btn").unmask();
                }
            });
        } else {
            $("#maximized_navigation_slideLeft_btn").unmask();
            $("#maximized_navigation_slideRight_btn").mask();
        }


    });
    $("#maximized_navigation_slideLeft_btn").click(function () {
        $("#maximized_navigation_slideLeft_btn").mask();
        $("#maximized_navigation_slideRight_btn").mask();

        if ($("#maximized_menu_content").position().left < 0) {
            var slideBy = 300;
            if ($("#maximized_menu_content").position().left > -300) {
                slideBy = parseInt($("#maximized_menu_content").position().left) * -1;
            }
            $("#maximized_menu_content").animate({
                left: "+=" + slideBy + "px"
            }, 300, function () {
                $("#maximized_navigation_slideRight_btn").unmask();
                if ($("#maximized_menu_content").position().left >= 0) {
                    $("#maximized_navigation_slideLeft_btn").mask();
                } else {
                    $("#maximized_navigation_slideLeft_btn").unmask();
                }
            });
        } else {
            $("#maximized_navigation_slideRight_btn").unmask();
            $("#maximized_navigation_slideLeft_btn").mask();
        }


    });

    //Add toggle-functionalities to lesson bars
    $(".activeLessonBar").click(function () {
        transformLessonBarContent($(this).parent().parent().parent(), $(this));
    });

    $(".inactiveLessonBar").click(function () {
        transformLessonBarContent($(this).parent(), $(this));
    });
}

function loadExercisePopup() {

    $("#exerciseView").dialog({
        modal: true,
        dialogClass: "exercisePopup",
        draggable: false,
        resizable: false,
        zIndex: 15,
        closeText: "x",
        closeOnEscape: false,
        width: 702,
        height: 697,
        create: function () {

            $("#btnCloseExerciseContent").click(function () {
                hideExerciseContent();
            });
        },
        autoOpen: false,
        close: function () {
            //clear content
            $("#exercise_content").html('');
            $("#exerciseMenu").dialog('close');

            $("#exercise img").toggleClass("imgMaximized");
            $(".exercisePopupMaximized").toggleClass("exercisePopupMaximized");

            setOptionalPageNavigationElements();
            hideExerciseContent();

            toolsButtonColoration("close");
            loadToolbarElements();
            //stop audio
            $.each($('audio'), function () {
                this.pause();
            });
        },
        open: function () {
            //Fix Overlay Z-Indexes
            $(".ui-widget-overlay").css("z-index", 10);
        }
    });

    $("#exerciseMenu").dialog({
        modal: false,
        dialogClass: "exercisePopupMenu",
        draggable: false,
        resizable: false,
        closeOnEscape: false,
        zIndex: 15,
        closeText: "x",
        width: 250,
        height: 697,
        create: function (event, ui) {
            //remove close-button from dialog-headline
            $(this).parent('.ui-dialog').find('.ui-dialog-titlebar .ui-dialog-titlebar-close').remove();

            //append minimizing-button to dialog-headline
            var titlebar = $(this).parents('.ui-dialog').find('.ui-dialog-titlebar');
            $('<a href="#" id="btnDialogMinimize" class="ui-dialog-titlebar-minimize ui-corner-all" role="button"><span class="ui-icon ui-icon-carat-1-w"><</span></a>')
                .appendTo(titlebar);
            if (isOSX()) { //custom macOSX css
                $("#btnDialogMinimize span").css("top", -1);
                $(".ui-dialog-titlebar-close span").css("top", -3);
                $(".ui-icon-closethick").css("top", -1);
            }

            $(".exerciseMenu_entry").unbind().click(toggleExerciseMenuEntry);


            $("#btnDialogMinimize").click(function () {
                //maximize exercise view
                $(".exercisePopup").toggleClass("exercisePopupMaximized");
                //minimize exercise menu
                $(".exercisePopupMenu").toggleClass("exercisePopupMenuMinimized");
                //maximize image
                //$("#exercise img").toggleClass("imgMaximized");
                //show minimize menu
                $("#exerciseMenuMinimized").show("fade");

                if ($("#exercise_content").data("content") != "Video" && $("#exercise_content").data("content") != "Audio" && $("#exercise_content").data("content") != "Bilder" && $("#exercise_content").data("content") != "Lösung") {
                    clearMaterialFontColoration();
                    menuButtonColoration("clear");
                    $("#exercise_content").html("");
                    $("#exerciseSplitter").hide();
                }

            });

        },
        close: function (event, ui) {
            //maximize and hide exercise menu
            $(".exercisePopupMenuMinimized").toggleClass("exercisePopupMenuMinimized");


            //hide menubars
            $("#exerciseMenuMinimized").hide("fade");
            $("#navigationExercise").hide("fade");

            //reenable input
            $(".inputContainer").removeClass("disabled");    
        },
        autoOpen: false
    });

   

    $("#btnMaximizeExerciseMenu").click(function () {
        $(".exercisePopupMenuMinimized").toggleClass("exercisePopupMenuMinimized");
        $(".exercisePopupMaximized").toggleClass("exercisePopupMaximized");
        $("#exerciseMenuMinimized").hide("fade");
    });
}
