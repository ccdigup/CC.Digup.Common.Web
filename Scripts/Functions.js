$(function () {
    detectOS();
    setTitle();
    initLessonIndex();
    initUserSettings();
    loadCommonElements();
    loadExerciseShortCutNavigationElements();
    loadNavigationElements();
    loadToolbarElements();
    loadExercisePopup();
    createWorkSheetGenerator();
    createCrosswordGenerator();
    loadIndex(loadMaximizedMenuEntries);
    initCanvas();
    loadEditorPopup();

    //$("#printPage").click(readZipFile);
});

function showExerciseViewNotification(text, type) {
    var notificationBox = $(".notification_box");
    $(notificationBox).removeClass("success_notification");
    $(notificationBox).removeClass("error_notification");
    var notificationClass = "";

    switch (type) {
        case "success":
            notificationClass = "success_notification";
            break;
        case "error":
            notificationClass = "error_notification";
            break;
    default:
        break;
    }
    $(notificationBox).addClass(notificationClass);
    $(notificationBox).text(text).fadeIn('slow', function () {
        $(notificationBox).delay(1300).fadeOut("slow");
    });
}

function loadCommonElements() {
    $("#custom_modal_dialog").dialog({
        modal: true,
        dialogClass: "custom_modal_dialog",
        draggable: false,
        resizable: false,
        zIndex: 0,
        autoOpen: false,
        closeOnEscape: false,
        open: function () {
            $("#custom_modal_dialog").parent().addClass("active");
            $(".ui-widget-overlay").addClass("dialogActive");
        },
        close: function () {
            $("#custom_modal_dialog").parent().removeClass("active");
            $(".ui-widget-overlay").removeClass("dialogActive");
        }
    });
}

function stringIsNullOrEmpty(objectString) {

    if (typeof objectString == 'undefined') { return true; }

    switch (objectString) {
        case null:
            return true;
            break;
        case undefined:
            return true;
            break;
        case "":
            return true;
            break;
        default:
            return false;
            break;
    }
}

//Open exercise-popup and put in all information
function openDialogs(exercise, exerciseType, isExercise) {
    setTeacherMaterials();
    if (!stringIsNullOrEmpty(exercise)) {
        showExerciseMenuEntries();
        fillOutExercise(exercise, exerciseType);
        $("#navigationExercise").show("fade");
        $("#btnDialogMinimize").show();
    }
    else if(!isExercise) {
        hideExerciseMenuEntries();
        $("#exercise").html('<div id="welcome_panel" class="tools_panel"><br/><h1>Hilfsmittel</h1><br/><h4 id="welcome_desciption">Bitte wählen Sie im Menü links ein Hilfsmittel aus.</h4><hr/></div>');
        $("#exercise_content").html("");
        $("#exerciseSplitter").hide();
        $("#btnMaximizeExerciseMenu").click();
        $("#btnDialogMinimize").hide();
        
        
    }

    $("#file_handle_options_box").hide();

    $("#exerciseView").dialog("open");
    $("#exerciseMenu").dialog("open");
 
    fontColoration($("#material_options_singleView"), null);

    /** Unbind alternative navigationElements & set correct styles **/
    $("#section_back").unbind().parent().addClass("disabled");
    $("#page_back").unbind().parent().addClass("disabled");
    $("#page_forward").unbind().parent().addClass("disabled");
    $("#section_forward").unbind().parent().addClass("disabled");
}



function setTeacherMaterials() {
    $("#teacher_materials_vocabulary").unbind().click(function () {
        loadVocabulary(null, setVocabulary, true);

        hideExerciseMenuEntries();
        fontColoration(null, "#teacher_materials_vocabulary");
    });
    $("#teacher_materials_media").unbind().click(function () {
        loadMediaLibrary(setMediaLibrary);
        hideExerciseMenuEntries();
        fontColoration(null, "#teacher_materials_media");
    });
    $("#teacher_materials_worksheet").unbind().click(function () {
        // createWorkSheetGenerator();
        //toggleWorkSheetEditor();
        hideExerciseMenuEntries();
        
        initWorkSheetFunctions();
        fontColoration(null, "#teacher_materials_worksheet");
    });
    $("#teacher_materials_textElements").unbind().click(function() {
        // createWorkSheetGenerator();
        //toggleWorkSheetEditor();
        hideExerciseMenuEntries();
        
        initTextElementFunctions();
        fontColoration(null, "#teacher_materials_textElements");
    });
    
    $("#teacher_materials_educationReference").unbind().click(function () {
        loadTimeTableView();
        fontColoration(null, "#teacher_materials_educationReference");
    });

    $("#teacher_materials_crossword").unbind().click(function () {
        hideExerciseMenuEntries();
        initCrosswordFunctions();
        fontColoration(null, "#teacher_materials_crossword");
    });

}

//Load specific exercise and open up exercise-popup on callback
function openExercise(element) {
    loadExercise(element.data("exercisenumber"), element.data("lessonnumber"), function (exercise, exerciseType) {
        openDialogs(exercise, exerciseType, true);
    });
}

//Sets the correct lesson to the content when two pages with different lessons are visible
function setLessonInfoOnPageBreak(pageNumber) {
    var actualLessonStartInfo = $(".lessonInfo[data-startpage='" + convertNumberToString(parseInt(pageNumber)) + "']");
    if (actualLessonStartInfo.length > 0) {
        $("#content").data("actuallesson", $(actualLessonStartInfo).first().data("lessonnumber"));
    }
    var actualLessonEndInfo = $(".lessonInfo[data-endpage='" + convertNumberToString(parseInt(pageNumber)) + "']");
    if (actualLessonEndInfo.length > 0) {
        $("#content").data("actuallesson", $(actualLessonEndInfo).first().data("lessonnumber"));
    }
}

function convertNumberToString(number) {
    if (number.toString().length == 2) {
        number = "0" + number;
    } else {
        if (number.toString().length == 1) {
            number = "00" + number;
        }
    }
    return number;
}

function toggleExerciseMenuEntry(animated) {
    if ($(this).data("toggle") == true) {
        $(this).find("span").removeClass("ui-icon-triangle-1-s");
        $(this).find("span").addClass("ui-icon-triangle-1-e");
        if(animated || stringIsNullOrEmpty(animated))
            $("#" + this.id + "_options").hide("blind");
        else
            $("#" + this.id + "_options").hide();
        
        $(this).data("toggle", false);
    } else {
        $(this).find("span").removeClass("ui-icon-triangle-1-e");
        $(this).find("span").addClass("ui-icon-triangle-1-s");
        if (animated || stringIsNullOrEmpty(animated))
            $("#" + this.id + "_options").show("blind");
        else
            $("#" + this.id + "_options").show();
        
        $(this).data("toggle", true);
    }
    
//            
//    $(this).find("span").toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-e");
//    $("#" + this.id + "_options").toggle("blind");
}


function showExerciseMenuEntries() {
//    $("#teacher_toolbox").addClass("bottom");
    //    
    
    $("#exerciseMenu .exerciseMenu_entry").each(function () {
        if (this.id != "teacher_tools") {
            $(this).show();
        }
    });
    $("#exerciseMenu .exerciseMenu_options").each(function () {
        if (this.id != "teacher_tools_options" && $(this).css('display') != "none") {
            $(this).show();
        }
        if (this.id == "coursebook_options" && $("#coursebook").data("toggle") == true) {
            $(this).show();
        }
        if (this.id == "material_options" && $(this).data("toggle") ==  true) {
            $(this).show();
        }
        
    });
}

function disableToolBoxEntries() {
    $($("#whiteboard_tools").unbind().parent()).addClass("disabled");
    $($("#settings").unbind().parent()).addClass("disabled");
    $($("#info").unbind().parent()).addClass("disabled");
}

function hideExerciseMenuEntries() {
    //    $("#teacher_toolbox").removeClass("bottom");
    disableToolBoxEntries();
    if(!$("#utilities").parent().hasClass("activeMenuEntry"))
        toolsButtonColoration("#utilities");
    toggleSecondToolMenu("");
    $("#btnDialogMinimize").hide();
    $("#exerciseMenu .exerciseMenu_entry").each(function() {
        if (this.id != "teacher_tools") {
            $(this).hide();
            
        }
    });
    $("#exerciseMenu .exerciseMenu_options").each(function() {
        if (this.id != "teacher_tools_options" ) {
            $(this).hide();
        }
    });
    
    $("#exerciseMenu .exerciseMenu_options").each(function () {
        if (this.id == "teacher_tools_options" ) {
           
            $("#teacher_tools").find("span").removeClass("ui-icon-triangle-1-e");
            $("#teacher_tools").find("span").addClass("ui-icon-triangle-1-s");
            $("#teacher_tools_options").show();
            $("#teacher_tools").data("toggle", true);
        }
    });
    $("#navigationExercise").hide("fade");

    $(".inputContainer").addClass("disabled");
    
}

function hideToolsMenuEntries() {
  
    $("#teacher_tools_options").css("display", "none");
    $("#teacher_tools").hide();
  

}
function showToolsMenuEntries() {
    $("#teacher_tools_options").css("display", "inherit");
    $("#teacher_tools_options").show();
    $("#teacher_tools").show();

}

$(window).resize(function () {
    var body = $("body");
    var windowHeight = $(window).height();

    $(body).data("height", (windowHeight));
    
    if ($(body).attr("style")) {
        $(body).height(windowHeight);
    }
    $('#markableContext').attr("width", $(window).width());
    $('#markableContext').attr("height", $(window).height());
});