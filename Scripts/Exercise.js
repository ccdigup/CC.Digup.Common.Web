var currentExercise;
var currentExerciseType = "Exercise";
var currentExerciseContent;

function setExerciseContentHeader(header) {
    $("#exercise_content").data("content", header);
    $("#exerciseSplitter").show();
    $("#exerciseContentHeader").text(header);
}

function loadInteractiveExercise(exercisePath, exerciseType) {
    $.get(exercisePath, function (data) {

        $("#exercise").html(data);

        switch (exerciseType) {
            case "DragAndDropTextFields":
                setDnDTextFieldsExerciseFunctionalities();
                break;
            case "RadioButton":
                setRadioButtonExerciseFunctionalities();
                break;
            case "Sortable":
                setSortableExerciseFunctionalities();
                break;
            case "Entry":
                setEntryExerciseFunctionalities();
                break;
            case "CheckBox":
                setCheckBoxExerciseFunctionalities();
                break;
            case "ComboBox":    
                setComboBoxExerciseFunctionalities();
                break;
            case "Markable":
                setMarkableExerciseFunctionalities();
                break;
            default:
                break;
        }

    }).done(function () {
        interactiveExerciseAudio.init();
    });
}

function clearExerciseFontColoration() {
    $("#coursebook_options a, #workbook_options a").each(function () {
        $(this).removeClass("activeMenuEntry");
    });
}

function clearMaterialFontColoration() {
    $("#material_options a, #eucationalreference_options a, #teacher_tools_options a, .first_menu .btnResource").each(function () {
        $(this).removeClass("activeMenuEntry");
    });
}

function fontColoration(exercise, material) {
    if (!stringIsNullOrEmpty(exercise) && !$(exercise).hasClass("activeMenuEntry")) {
        clearExerciseFontColoration();
        $(exercise).addClass("activeMenuEntry");
    }

    if (!stringIsNullOrEmpty(material) && !$(material).hasClass("activeMenuEntry")) {
        clearMaterialFontColoration();
        $(material).addClass("activeMenuEntry");
    }
}

function toolsButtonColoration(tool) {
    var isActive = $(tool).parent().hasClass("activeMenuEntry");
    if (!stringIsNullOrEmpty(tool) ) {
        $("#tools .btnToolContainer").each(function() {
            $(this).removeClass("activeMenuEntry");
            
        });
        if(!isActive) {
            $(tool).parent().addClass("activeMenuEntry");
        }

        if (tool != "close" && tool != "#utilities" /*&& tool != "#whiteboard_tools"*/) {
            $("#clickFaker").css("display", "block");
            $("#clickFaker").unbind().click(function () {
                if (!$("#mark").hasClass("enabled")) {
                    toolsButtonColoration("close");
                    toggleSecondToolMenu();
                    $("#clickFaker").unbind();
                    $("#clickFaker").css("display", "none");    
                }
                
            });    
        }
        
        
    }
}

function menuButtonColoration(menuItem) {
    //var isActive = $(menuItem).parent().hasClass("activeMenuEntry");
    if (!stringIsNullOrEmpty(menuItem)) {
        $("#exerciseMenuMinimized .btnToolContainer").each(function () {
            if (($(menuItem).hasClass("btnExercise") && $(this).hasClass("btnExercise")) || ($(menuItem).hasClass("btnResource") && $(this).hasClass("btnResource"))) {
                $(this).removeClass("activeMenuEntry");    
            }
        });
        
        //  if (!isActive)
            $(menuItem).parent().addClass("activeMenuEntry");
    }
}

function fillOutExercise(exercise, exerciseType) {
    if (exercise == null || exercise == undefined)
        return;


    /*** DEFAULT ***/
    //Clean Hover/Highlighted menu entries
    $("#coursebook_options a, #workbook_options a").each(function() {
        $(this).removeClass("activeMenuEntry");
    });
    $("#material_options a, #eucationalreference_options a, #teacher_tools_options a").each(function() {
        $(this).removeClass("activeMenuEntry");
    });
    $(".first_menu .btnToolContainer").each(function() {
        $(this).removeClass("disabled");
    });


    if (exerciseType == "Exercise") {
        currentExercise = exercise;

        /*** COURSEBOOK ***/
        //Set singleView

        function setSingleView() {

            if (this.id != "btnExerciseOnly")
                fontColoration(this, null);

            menuButtonColoration("#btnExerciseOnly");
            $("#exercise").html("<img src='../Media/Lessons/L_" + exercise.Lesson + "/Exercises/" + exercise.Image + "' />");

            if (currentExerciseType != exerciseType) {
                var successFunction = function(refreshedExercise, type) {
                    fillOutExercise(refreshedExercise, type);
                    fontColoration($("#material_options_singleView"), null);
                    menuButtonColoration("#btnExerciseOnly");
                };

                loadExercise(exercise.Number, exercise.Lesson, successFunction, exerciseType);
            } else {
                if (this.id != "btnExerciseOnly")
                    fontColoration(this, null);
                else {
                    fontColoration("#material_options_singleView");

                }
            }
        }

        //Set Image
        //$("#exercise").html("<img src='../Media/Lessons/L_" + exercise.Lesson + "/Exercises/" + exercise.Image + "' />");
        setSingleView();

        $("#btnExerciseOnly").unbind().click(setSingleView);
        $("#material_options_singleView").unbind().click(setSingleView);

        //Set interactive Version
        //Clear old list-elements
        $("#interactive_exercise_list").html("");
        $("#interactive_exercise_list a").unbind();


        if (exercise.InteractiveExercise.length > 0) {

            $("#btnInterActiceExercise").removeClass("disabled").unbind().click(function() {
                if ($("#interactive_exercise_list").children().length > 1) {
                    showPopUpMenu(this, $("#interactive_exercise_list").contents().clone(true));
                } else {
                    $("#interactive_exercise_list").children().first().click();
                }
            });
            $(exercise.InteractiveExercise).each(function(index, elem) {
                var iExName = elem.FileName.replace("E_", "").split(".")[0];
                var iExNameDetailsArr = iExName.split("_");
                var finalIExName = parseInt(iExNameDetailsArr[0]);

                if (iExNameDetailsArr.length > 1) {
                    finalIExName += iExNameDetailsArr[1].toLowerCase();
                }
                var interactiveExerciseName = "Interaktive Version (" + finalIExName + ")";
                if (!stringIsNullOrEmpty(this.DisplayName))
                    interactiveExerciseName = this.DisplayName;

                var interactiveExercise = $("<a id='interactive_exercise_" + index + "'  data-number='" + (index + 1) + "' class='material_options_interactiveExercise' >" + interactiveExerciseName + "</a>")
                    .unbind().click(function() {
                        //toggleMenu
                        hidePopUpMenus();
                        if (currentExerciseType != exerciseType) {
                            var successFunction = function(refreshedExercise, type) {
                                fillOutExercise(refreshedExercise, type);
                                fontColoration($("#interactive_exercise_" + index), null);

                                menuButtonColoration("#btnInterActiceExercise");

                            };
                            loadExercise(exercise.Number, exercise.Lesson, successFunction, exerciseType);
                        } else {
                            fontColoration($("#interactive_exercise_" + index), null);
                            menuButtonColoration("#btnInterActiceExercise");
                        }

                        loadInteractiveExercise("../Media/Lessons/L_" + exercise.Lesson + "/Exercises/" + elem.FileName, elem.Type);
                    });

                if (index > 0) {
                    $("#interactive_exercise_list").append("<br/>");
                }
                $("#interactive_exercise_list").append(interactiveExercise);
            });

        } else {
            $("#interactive_exercise_list").append("<a class='unselectable'>Interaktive Version</a>");
            $("#btnInterActiceExercise").unbind().parent().addClass("disabled");
        }
        if (digUPSettings.enableWorkBook) {
            $("#workbook_exercises_container").show();
            $("#workbook_exercises_menu_container").show();
            $("#workbook_options").html(null);
            $("#workbook_options a").unbind();

            //$("#workbook_exercises_container").html("");
            //$("#workbook_exercises").remove();

            if (exercise.WorkBookExercises.length == 0) {
                $("#workbook_exercises_splitter").hide();
            } else {
                $("#workbook_exercises_splitter").show();
            }

            $(exercise.WorkBookExercises).each(function(index) {
                var workBookExerciseNumber = this.Number;

                var workbookExercise = $("<a id='material_options_workBookExercise_" + (index + 1) + "' data-number='" + (index + 1) + "' class='material_options_workBookExercise'>" + (index + 1) + ". Übung</a><br/>")
                    .click(function() {

                        hidePopUpMenus();
                        var currentHref = this;

                        var successFunction = function(workBookExercise, type) {
                            fillOutExercise(workBookExercise, type);
                            fontColoration("#material_options_workBookExercise_" + $(currentHref).data("number"));
                            menuButtonColoration("#btnAdditionalExercises");
                        };

                        loadExercise(workBookExerciseNumber, exercise.Lesson, successFunction, "WorkBookExercise");
                        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Lösung") {
                            //hideExerciseContent();
                        }
                    });
                $("#workbook_options").append(workbookExercise);

            });

            if (exercise.WorkBookExercises.length == 0) {
                $("#workbook").addClass("unselectable").find("span").hide();
                $("#btnAdditionalExercises").unbind().parent().addClass("disabled");
            } else {
                $("#workbook").removeClass("unselectable").find("span").show();
                $("#btnAdditionalExercises").removeClass("disabled").unbind().click(function() {
                    if ($(".material_options_workBookExercise").length > 1)
                        showPopUpMenu(this, $("#workbook_options").contents().clone(true));
                    else {
                        $(".material_options_workBookExercise").first().click();
                    }
                });
            }
        } else {
            $("#workbook_exercises_container").hide();
            $("#workbook_exercises_menu_container").hide();
            $("#workbook_exercises_splitter").hide();
        }
        currentExerciseType = exerciseType;
    }

    if (digUPSettings.enableWorkBook && exerciseType == "WorkBookExercise") {
        $("#exercise").html("<img src='../Media/Lessons/L_" + exercise.Lesson + "/WB_Exercises/" + exercise.Image + "' />");
        currentExerciseType = exerciseType;
        //workbook exercise has no interactive exercises
        $("#btnInterActiceExercise").unbind().parent().addClass("disabled");
    }
    

    /*** MATERIAL ***/
    //
    checkMaterials(exercise);
    //Set Audio
    setExerciseAudio(exercise);

    //Set Video
    setExerciseVideo(exercise);

    //Set Images
    setExerciseImages(exercise);

    //Set Text
    setExerciseText(exercise);


    /*** MATERIAL FOR TEACHERS ***/
    checkIfVocabularyExistsForExercise(exercise, checkTeacherMaterials);
    //checkTeacherMaterials(exercise);
    //Set Solution/SolutionImage
    setSolution(exercise);

    //Set EducationalReference
    setEducationalReference(exercise);

    //Set Vocabulary
    setExerciseVocabulary(exercise);

    //Set MasterCopies
    setMasterCopies(exercise);

    //set BlackBoardView
    setBlackBoard(exercise);
}

function checkMaterials(exercise) {
    if(exercise.Materials.Audio.length <= 0 && exercise.Materials.Video.length <= 0 && exercise.Materials.Image.length <= 0 && (currentExerciseType == "WorkBookExercise" && stringIsNullOrEmpty(exercise.TeacherMaterials.Solution.FileName) && stringIsNullOrEmpty(exercise.TeacherMaterials.SolutionImage.FileName))) {
        $("#material").addClass("unselectable");
        $("#material").find("span").removeClass("ui-icon ui-icon-triangle-1-s ui-icon-triangle-1-e");
        $("#material").find("span").addClass("ui-icon ui-icon-triangle-1-e");
        $("#material_options").hide();
        $("#material").unbind();
        //$("#material").data("toggle", false);
    }
    else {
        $("#material").removeClass("unselectable");
        $("#material").find("span").removeClass("ui-icon ui-icon-triangle-1-s ui-icon-triangle-1-e");
        if ($("#material").data("toggle") == true)
        {
            $("#material").find("span").addClass("ui-icon ui-icon-triangle-1-s");
            $("#material" + "_options").show();
            $("#material").data("toggle", true);
        }

        else {
            $("#material").find("span").addClass("ui-icon ui-icon-triangle-1-e");
            $("#material" + "_options").hide();
            $("#material").data("toggle", false);
        }

        $("#material").unbind().click(toggleExerciseMenuEntry);
        

        
        
    } 
}

function checkTeacherMaterials(exercise, vocabularyExists) {
    if (stringIsNullOrEmpty(exercise.TeacherMaterials.Solution.FileName) && stringIsNullOrEmpty(exercise.TeacherMaterials.SolutionImage.FileName) && exercise.TeacherMaterials.EducationalReference.length <= 0 && exercise.TeacherMaterials.MasterCopies.length <= 0 && stringIsNullOrEmpty(exercise.TeacherMaterials.BlackBoardView.FileName) && exercise.Materials.Text.length <= 0 && !vocabularyExists) {
        $("#eucationalreference").addClass("unselectable");

        $("#eucationalreference").find("span").removeClass("ui-icon ui-icon-triangle-1-s ui-icon-triangle-1-e");
        $("#eucationalreference").find("span").addClass("ui-icon ui-icon-triangle-1-e");
        
        $("#eucationalreference_options").hide();
        $("#eucationalreference").unbind();
        //$("#eucationalreference").data("toggle", false);
    }
    else {
        
        $("#eucationalreference").removeClass("unselectable");
        $("#eucationalreference").find("span").removeClass("ui-icon ui-icon-triangle-1-s ui-icon-triangle-1-e");
        if ($("#eucationalreference").data("toggle") == true) {
            $("#eucationalreference").find("span").addClass("ui-icon ui-icon-triangle-1-s");
            $("#eucationalreference" + "_options").show();
            $("#eucationalreference").data("toggle", true);
        }

        else {
            $("#eucationalreference").find("span").addClass("ui-icon ui-icon-triangle-1-e");
            $("#eucationalreference" + "_options").hide();
            $("#eucationalreference").data("toggle", false);
        }

      
        $("#eucationalreference").unbind().click(toggleExerciseMenuEntry);
        //$("#eucationalreference").data("toggle", true);
    } 
}

function appendPlayableAudio() {
    var audio = $("#audiovideo_container audio").get(0);
    setAudioVideoFunctionalities(audio);

    $("#playtoggle").text("3");
}

function saveAudioFile() {
    var currentFileName = $("#audio_elements .active_audio").first().data("filename");
    getAndSaveFile($("#audiovideo_container audio source").attr("src").replace(".ogg", ".mp3"), currentFileName.substr(0, (currentFileName.length - 4)));
}

function saveAudioFiles() {
    var files = new Array();
    $("#audio_elements .audioElement").each(function () {
        var fileDisplayName = stringIsNullOrEmpty(currentExercise.DisplayName) ? "Lektion_" + parseInt(currentExercise.Lesson) : currentExercise.DisplayName;
        files.push({ fileName: '../Media/Lessons/L_' + currentExercise.Lesson + '/Resources/Audio/' + $(this).data("filename"), fileDescription: fileDisplayName + "-" + $(this).data("filename") });
    });
    if (files.length == 1) {
        var element = $("#audio_elements .audioElement").first();
        var currentFileName = $(element).data("filename");
        getAndSaveFile('../Media/Lessons/L_' + currentExercise.Lesson + '/Resources/Audio/' + $(element).data("filename"), currentFileName.substr(0, (currentFileName.length - 4)));
    }
        
    else {
        getAndSaveFiles(files);    
    }
    
}

function setExerciseAudio(exercise) {
    function setAudio() {
        fontColoration(null, $("#material_options_audio"));
        menuButtonColoration("#btnExerciseAudio");
        $("#exercise_content")
            .html("<div style='margin-bottom:0;text-align:left;'><span>Klicken Sie auf einen Track und dann auf Play, um das Audio zu starten.<br/><span/><div/>")
            .append("<div id='audio_elements'></div>");

        $(exercise.Materials.Audio).each(function (index) {
            var element = $("<div class='audioElement' data-filename='" + this.FileName + "'><p>Track " + (index + 1) + "</p><div class='audioElement_symbol'><span>³</span></div></div>");
            if (index == 0) {

                $("#exercise_content").append("<div id='audiovideo_container'>"
                        + '<p class="player">'
                        + '<span id="saveaudio_btn">Audio speichern...</span>'
                        + '</p>'
                + "</div><div id='slider-loudness'></div>");

                //$(element).addClass("active_audio");
                //appendPlayableAudio();
            }

            $(element).unbind().click(function () {
                if (!$(this).hasClass("active_audio")) {
                    $(".player").html("");
                    $(".player").append('<span id="saveaudio_btn">Audio speichern...</span>'
                        + '<span id="playtoggle">3</span>'
                        + '<span id="audiovolume">³</span>'
                        + '<span id="gutter">'
                        + '<span id="loading" />'
                        + '<span id="handle" class="ui-slider-handle" />'
                        + '</span>'
                        + '<span id="timeleft" />'
                        + "<audio  style='display:none; width:0; height:0;'><source src='../Media/Lessons/L_" + currentExercise.Lesson + "/Resources/Audio/" + $(this).data("filename").replace(".mp3", ".ogg") + "' type='audio/ogg' /></audio>");

                    $("#audiovideo_container audio source").attr("src", '../Media/Lessons/L_' + currentExercise.Lesson + '/Resources/Audio/' + $(this).data("filename").replace(".mp3", ".ogg"));
                    $("#audio_elements .audioElement").removeClass("active_audio");
                    $(this).addClass("active_audio");
                    appendPlayableAudio();
                    $("#saveaudio_btn").html("Audio speichern...");
                    $("#saveaudio_btn").unbind().click(saveAudioFile);

                    if (isOSX()) {
                        $("#audiovolume, #playtoggle").css("line-height", "20px");
                        
                    }

                } else {
                    $(this).removeClass("active_audio");
                    if (exercise.Materials.Audio.length > 1) {
                        $(".player").html('<span id="saveaudio_btn">alle Audios speichern...</span>');
                        $("#saveaudio_btn").unbind().click(saveAudioFiles);
                    } else {
                        $(".player").html('<span id="saveaudio_btn">Audio speichern...</span>');
                        $("#saveaudio_btn").unbind().click(saveAudioFiles);
                    }
                }



            });

            $("#audio_elements").append(element);

        });
        $("#saveaudio_btn").unbind().click(saveAudioFiles);

        if (exercise.Materials.Audio.length > 1) {
            //var element = $("<div id='saveAll_btn'><p>SaveALL</p><div class='audioElement_symbol'><span>e</span></div></div>");
            //$(element).unbind().click(saveAudioFiles);
            //$("#audio_elements").append(element);
            $("#saveaudio_btn").html("alle Audios speichern...");
            $("#saveaudio_btn").unbind().click(saveAudioFiles);
        }

/* Changed by AR: "top": 10; previous: 0 */
        if (isOSX())
            $("#audio_elements .audioElement .audioElement_symbol span").css("top", 10);
        setExerciseContentHeader("Audio");
    }

    if (exercise.Materials.Audio.length > 0) {
        $("#material_options_audio").removeClass("unselectable").unbind().click(setAudio);
        $("#btnExerciseAudio").removeClass("disabled").unbind().click(setAudio);

    } else {
        $("#material_options_audio").unbind().addClass("unselectable");
        $("#btnExerciseAudio").unbind().parent().addClass("disabled");
    }

    if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Audio") {
        if (exercise.Materials.Audio.length > 0) {
            setAudio();
        }else {
            setHtmlText("<p id='no_exercise_content_available'>Für diese Übung stehen keine Audios zur Verfügung.</p>");
        }
    }
}

function showExerciseVideoPopUp(filePath, thumb) {
    $("#digUp").mask();
    $("#digUp").append("<div class='flexslider' id='slider' >" +

                        "<div class='popup_video_container_container'><video poster='" + thumb + "' id='popup_video_container' controls><source src='" + filePath + "' type='video/ogg; codecs=\"theora, vorbis\"' /></video></div>" +
        
                        "<div class='btnCloseContainer'><div id='btnCloseSlider' class='btnCloseSlider'/></div>" +

                        "<div id='audiovideo_container'>"
                            + '<p class="player">'
                              + '<span id="playtoggle">3</span>'
                              + '<span id="audiovolume">³</span>'
                              + '<span id="gutter">'
                                + '<span id="loading" />'
                                + '<span id="handle" class="ui-slider-handle" />'
                              + '</span>'
                              + '<span id="timeleft" />'
                              
                            + '</p>'
                        + "</div><div id='slider-loudness'></div>" +

                        /*"<div class='btnSaveContainer'><div id='btnSaveVideo' class='btnSaveVideo'>Video speichern...</div></div>"*/ 
                        "</div>");

    if (isOSX()) {
        $("#audiovolume, #playtoggle").css("line-height", "20px");

    }
    
//    $('#btnSaveVideo').button({ icons: { primary: "ui-icon-circle-arrow-s" }, text: true }).unbind().click(function () {
//        var currentFileName = $("#popup_video_container source").attr("src");
//        getAndSaveFile(currentFileName.replace(".ogv", ".mp4"), currentFileName.substr(0, (currentFileName.length - 4)));
//    });

    var video = $("#popup_video_container").get(0);

    $(video).unbind().removeAttr('controls');

    setAudioVideoFunctionalities(video);

    $(video).click(function () {
        if (video.paused) {
            $("#slider .player").show();
            $("#slider .btnSaveContainer").hide();
            
            video.play();
            $("#playtoggle").text("0");
        }
        else {
            video.pause();
            $("#playtoggle").text("3");
        }
    });

    $('#btnCloseSlider').button({ icons: { primary: "ui-icon-close" }, text: false }).unbind().click(function () {
        $(".flexslider").remove();
        $("#digUp").unmask();
    });
}

function setExerciseVideo(exercise) {
    function setVideo() {
        fontColoration(null, $("#material_options_video"));
        menuButtonColoration("#btnExerciseVideo");
        $("#exercise_content").html("<div style='margin-bottom:15px; text-align:left; margin-top:15px;'><span >Klicken Sie ein Video an, um es abzuspielen.<br/><span/><div/>");
        $(exercise.Materials.Video).each(function () {
            //$("#exercise_content").append("<div class='video_thumb_container' data-filepath='../Media/Lessons/L_" + exercise.Lesson + "/Resources/Video/" + this.FileName + "'>click</div><video poster='../Media/Lessons/L_01/Exercises/E_00.png' style='width:250px;height: 150px;border: 1px solid black; margin-right:10px;' controls><source src='../Media/Lessons/L_" + exercise.Lesson + "/Resources/Video/" + this.FileName + "' type='video/ogg; codecs=\"theora, vorbis\"' /></video>");
            $("#exercise_content").append("<div class='video_thumb_container boxShadow' data-thumb='" + "../Media/Lessons/L_" + exercise.Lesson + "/Resources/Video/" + this.FileName.split(".")[0] + ".jpg' data-filename='" + this.FileName + "' data-filepath='../Media/Lessons/L_" + exercise.Lesson + "/Resources/Video/" + this.FileName + "'><img src='" + "../Media/Lessons/L_" + exercise.Lesson + "/Resources/Video/" + this.FileName.split(".")[0] + "_tn.jpg' /><img class='playIcon' src='" + "../CSS/images/play_icon.png' />" + "</div>");
        });
        $("#exercise_content").append("<div class='clear'/>");

//        $("#exercise_content").append('<br/><a id="edit_text_btn"><span class="symbol">v</span>alle Videos speichern...</a>');
//        $("#edit_text_btn").unbind().button().click(function () {
//            var files = new Array();
//            $("#exercise_content .video_thumb_container").first().each(function () {
//                files.push({ fileName: $(this).data("filepath"), fileDescription: "Lektion_" + parseInt(currentExercise.Lesson) + "-" + $(this).data("filename") });
//            });
//            getAndSaveFiles(files);
//        });

        $(".video_thumb_container").click(function () {
            showExerciseVideoPopUp($(this).data("filepath"), $(this).data("thumb"));
        });

        setExerciseContentHeader("Video");
    }
    if (exercise.Materials.Video.length > 0) {
        $("#material_options_video").removeClass("unselectable").unbind().click(setVideo);
        $("#btnExerciseVideo").removeClass("disabled").unbind().click(setVideo);
    } else {
        $("#material_options_video").unbind().addClass("unselectable");
        $("#btnExerciseVideo").unbind().parent().addClass("disabled");
    }

    if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Video") {
        if (exercise.Materials.Video.length > 0) {
            setVideo();
        } else {
            setHtmlText("<p id='no_exercise_content_available'>Für diese Übung stehen keine Videos zur Verfügung.</p>");
        }
    }
}

function appendImages(lesson, exerciseImages, isPdf) {
    $(exerciseImages).each(function () {
        var imageId = this.FileName.substring(0, this.FileName.indexOf("."));
        var fileDisplayName = stringIsNullOrEmpty(currentExercise.DisplayName) ? "Lektion_" + parseInt(lesson) : currentExercise.DisplayName;
        $("#imagesContainer").append("<img style='width:auto; height:auto; cursor:pointer;' data-filedescription='" + fileDisplayName + "-" + imageId + "' id='" + imageId + "' class='resourceImg' src='../Media/Lessons/L_" + lesson + "/Resources/Image/" + this.FileName + "'/>");
        $("#" + imageId).unbind().click(function () {

            var images = "";
            $(exerciseImages).each(function () {
                var currentImageId = this.FileName.substring(0, this.FileName.indexOf("."));

                images += "<li><div > <img data-filedescription='" + fileDisplayName + "-" + currentImageId + "' id='" + currentImageId + "' src='/Media/Lessons/L_" + lesson + "/Resources/Image/" + this.FileName + "'/></div></li>";
            });
            $("#digUp").mask();
            $("#digUp").append("<div class='flexslider' id='slider' >" +
                        "<div class='btnCloseContainer'><div id='btnCloseSlider' class='btnCloseSlider'/></div>" +
                        "<ul class='slides'>" + images + "</ul>");
            if (digUPSettings.enableImageDownload) {
                $("#slider").append("<div class='btnSaveContainer'><div id='btnSaveImage' class='btnSaveImage'>Bild speichern...</div></div></div>");

                $('.btnSaveImage').button({ icons: { primary: "ui-icon-circle-arrow-s" }, text: true }).unbind().click(function () {
                    var images = $(".flex-active-slide").first().find("img");
                    var src;
                    if (images.length > 0) {
                        src = images.first().attr("src");
                        if (isPdf)
                            src = src.replace(".jpg", ".pdf");
                        getAndSaveFile(src, images.first().data("filedescription"));
                    } else {
                        var image = $(".flexslider .slides li").first().find("img").first();
                        src = image.attr("src");
                        if (isPdf)
                            src = src.replace(".jpg", ".pdf");
                        getAndSaveFile(src, image.data("filedescription"));
                    } 
                });
            }

            $('#btnCloseSlider').button({ icons: { primary: "ui-icon-close" }, text: false }).unbind().click(function () {
                $(".flexslider").remove();
                $("#digUp").unmask();
            });

            var fileNameData = this.id.split("_")
                , startIndex = parseInt(fileNameData[fileNameData.length - 1]) - 1;

            $(".flexslider").flexslider({
                animation: "slide",
                startAt: startIndex,
                slideshow: false
            });
        });
    });
}

function setExerciseImages(exercise) {
    function setImages() {
        fontColoration(null, $("#material_options_picture"));
        menuButtonColoration("#btnExerciseImage");
        $("#exercise_content").html("<div style='margin-bottom:20px;'><span>Klicken Sie ein Bild an, um es zu vergrößern.<br/><span/></div><div id='imagesContainer'></div>");

        appendImages(exercise.Lesson, exercise.Materials.Image);

        if(digUPSettings.enableImageDownload)
        {
            $("#imagesContainer").append("<a style='display:block; width: 175px;' id='btnSaveAllImages'>alle Bilder speichern</a>");
            $("#btnSaveAllImages").unbind().click(function () {
                var files = new Array();
                $("#exercise_content img").each(function () {
                    files.push({ fileName: $(this).attr("src"), fileDescription: $(this).data("filedescription") });
                });
                getAndSaveFiles(files);
            });
        }
        setExerciseContentHeader("Bilder");
    }
    
    if (exercise.Materials.Image.length > 0) {
        $("#material_options_picture").removeClass("unselectable").unbind().click(setImages);
        $("#btnExerciseImage").removeClass("disabled").unbind().click(setImages);
    } else {
        $("#material_options_picture").unbind().addClass("unselectable");
        $("#btnExerciseImage").unbind().parent().addClass("disabled");
    }

    if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Bilder") {
        if (exercise.Materials.Image.length > 0) {
            setImages();
        } else {
            setHtmlText("<p id='no_exercise_content_available'>Für diese Übung stehen keine Bilder zur Verfügung.</p>");
        }
    }
}

function setExerciseText(exercise) {
    function setText(text) {
        $("#exercise_content").html("");

        $("#exercise_content").append("<div id='exerciseText' style='width: 100%; height: 100%; text-align:left;'></div>");
        $("#exercise_content").append('<br/><a id="edit_text_btn"><span class="symbol">p</span>Bearbeiten...</a>');
        $("#edit_text_btn").unbind().button().click(function () {
            $("#editor")
                .data("name", "Lektion" + exercise.Lesson + "-Aufgabe" + parseInt(exercise.Number) + "-Text")
                .data("saveas", true)
                .html($("#exerciseText").html());
            toggleEditor();
        });

        $("#exerciseText").html(text);

        setExerciseContentHeader("Text");
        fontColoration(null, $("#material_options_text"));
        menuButtonColoration("#btnExerciseText");
    }

    function getText() {
        //$(exercise.Materials.Text).each(function () {
        var path = "../Media/Lessons/L_" + exercise.Lesson + "/Resources/Text/" + exercise.Materials.Text[0].FileName;
            loadText(path, setText);
            //});
        
    }

    if (exercise.Materials.Text.length > 0) {
        $("#material_options_text").removeClass("unselectable").unbind().click(function () {
            getText();
        });
        $("#btnExerciseText").removeClass("disabled").unbind().click(function () {
            getText();
        });
    } else {
        $("#material_options_text").unbind().addClass("unselectable");
        $("#btnExerciseText").unbind().parent().addClass("disabled");
    }

    if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Text") {
        if (exercise.Materials.Text.length > 0) {
            getText();
        } else {
            setHtmlText("<p id='no_exercise_content_available'>Für diese Übung stehen keine Texte zur Verfügung.</p>");
        }
    }
}

function setHtmlText(text) {
    $("#exercise_content").css("text-align", "left");
    $("#exercise_content").html(text);
    
}

function setSolution(exercise) {
    
    function setSolutionText(exerciseWithSolutionText) {
        fontColoration(null, $("#material_options_solution"));
        menuButtonColoration("#btnExerciseSolution");
        var path = "../Media/Lessons/L_" + exerciseWithSolutionText.Lesson + "/Resources/Text/" + exerciseWithSolutionText.TeacherMaterials.Solution.FileName;
        loadText(path, setHtmlText);
        setExerciseContentHeader("Lösung");
    }

    function setSolutionImage(exerciseWithSolutionImage) {
        fontColoration(null, $("#material_options_solution"));
        menuButtonColoration("#btnExerciseSolution");
        $("#exercise_content").html("<img src='" + exerciseWithSolutionImage.TeacherMaterials.SolutionImage.FileName + "'></img>");
        setExerciseContentHeader("Lösung");
    }
    
    if ((exercise.TeacherMaterials.SolutionImage.FileName != undefined && !stringIsNullOrEmpty(exercise.TeacherMaterials.SolutionImage)) || (exercise.TeacherMaterials.Solution.FileName != undefined && !stringIsNullOrEmpty(exercise.TeacherMaterials.Solution.FileName))) {
        if (exercise.TeacherMaterials.Solution != null && exercise.TeacherMaterials.Solution != undefined && exercise.TeacherMaterials.Solution != "") {
            $("#btnExerciseSolution").removeClass("disabled").unbind().click(function(){
                setSolutionText(exercise);
            });
            $("#material_options_solution").removeClass("unselectable").unbind().click(function () {
                setSolutionText(exercise);
            });
            if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Lösung") {
                setSolutionText(exercise);
            }
        } else {
            if (exercise.TeacherMaterials.SolutionImage != null && exercise.TeacherMaterials.SolutionImage != undefined && exercise.TeacherMaterials.SolutionImage != "") {
                 $("#btnExerciseSolution").removeClass("disabled").unbind().click(function(){
                     setSolutionImage(exercise);
                });
                $("#material_options_solution").removeClass("unselectable").unbind().click(function () {
                    setSolutionImage(exercise);
                });
                if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Lösung") {
                    setSolutionImage(exercise);
                }
            }
        }

    } else {
        $("#material_options_solution").unbind().addClass("unselectable");
         $("#btnExerciseSolution").unbind().parent().addClass("disabled");
        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Lösung") {
            $("#exercise_content").html("<p id='no_exercise_content_available'>Für diese Übung stehen keine Lösungen zur Verfügung.</p>");
        }
    }
}

function setEducationalReference(exercise) {
    
    function insertEducationalReference(exerciseWithEducationalReference) {
        fontColoration(null, $("#material_options_educationalReference"));
        
        var textResults = new Array();
        var textCount = 0;

        var completeFunction = function (text, count) {
            textResults[textCount]["Text"] = text;
            textCount++;

            if (textCount == exerciseWithEducationalReference.TeacherMaterials.EducationalReference.length) {

                $("#exercise_content").html('<table class="educational_reference_table" cellpadding="0" cellspacing="0"><tr>'
                     + '<td class="educational_reference_form_column">Form</td>'
                     + '<td class="educational_reference_activity_column">Ablauf</td>'
                     + '<td class="educational_reference_material_column">Material</td>'
                     + '<td class="educational_reference_time_column">Zeit</td></tr></table>');

                $(textResults).each(function (i) {
                    var tdString = '<tr class="educational_reference_innerContent"><td class="firstColumn">';
                    $(textResults[i]["Form"]).each(function (formIndex) {
                        tdString += textResults[i]["Form"][formIndex];
                        if (formIndex + 1 != textResults[i]["Form"].length) {
                            tdString += ", ";
                        }
                    });

                    tdString += '</td><td class="educational_reference_activity_innerColumn">' + textResults[i]["Text"]
                                                    + '</td><td>' + textResults[i]["Material"]
                                                        + '</td><td>' + textResults[i]["Time"]
                                                            + '</td></tr>';


                    $("#exercise_content .educational_reference_table").append(tdString);
                });

                $("#exercise_content .educational_reference_table tr").unbind().click(function () {

                    if ($(this).hasClass("selected_row")) {

                        $("#editor")
                                        .data("name", "Lektion" + exerciseWithEducationalReference.Lesson + "_Aufgabe" + exerciseWithEducationalReference.Number + "-Methodisch-didaktische-Hinweise")
                                        .data("saveas", true)
                                        .html($(this).find(".educational_reference_activity_innerColumn").html());

                        toggleEditor();

                    } else {
                        $(".educational_reference_table tr").removeClass("selected_row");
                        $(this).addClass("selected_row");
                    }

                });
            }
            count++;
            addEducationalReference(count);
        };

            var addEducationalReference = function (count) {
                
                var element = exerciseWithEducationalReference.TeacherMaterials.EducationalReference[count];
                if (stringIsNullOrEmpty(element))
                    return 0;
                
                var path = "../Media/Lessons/L_" + exerciseWithEducationalReference.Lesson + "/Resources/Text/" + element.FileName;
                textResults[count] = new Array();

                textResults[count]["Form"] = new Array();
                $(element.Form).each(function (formIndex, formElement) {
                    textResults[count]["Form"][formIndex] = formElement;
                });

                textResults[count]["Material"] = element.Material;
                textResults[count]["Time"] = element.Time;

                loadTextAndLoadNext(path, completeFunction, count);
            };

        addEducationalReference(0);

        setExerciseContentHeader("Methodisch-Didaktische Hinweise");
    }

    if (!stringIsNullOrEmpty(exercise.TeacherMaterials.EducationalReference) && exercise.TeacherMaterials.EducationalReference.length > 0) {
        $("#material_options_educationalReference").removeClass("unselectable").unbind().click(function () {
            insertEducationalReference(exercise);
        });
        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Methodisch-Didaktische Hinweise") {
            insertEducationalReference(exercise);
        }
    } else {
        $("#material_options_educationalReference").unbind().addClass("unselectable");
        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Methodisch-Didaktische Hinweise") {
            $("#exercise_content").html("<p id='no_exercise_content_available'>Für diese Übung stehen keine methodisch-didaktischen Hinweise zur Verfügung.</p>");
        }
    }
}

function setExerciseVocabulary(exercise) {

    function insertVocabulary(exerciseVocabulary) {
        fontColoration(null, $("#material_options_vocabulary"));
        $("#exercise_content").html("<table cellpadding='0' cellspacing='0' border='0' class='display' id='vocabulary'></table>");
        $("#exercise_content").append('<div style="margin-top: 50px;"><a id="edit_text_btn"><span class="symbol">p</span>Bearbeiten...</a></div>');
        $("#edit_text_btn").unbind().button().click(function () {
            var text = "";
            $(exerciseVocabulary).each(function () {
                if (this != undefined && this.Value != undefined)
                    text += text != "" ? "</br>" + this.Value : this.Value;
            });
            $("#editor")
                        .data("name", "Lektion" + exercise.Lesson + "-Aufgabe" + parseInt(exercise.Number) + "-Text")
                        .data("saveas", true)
                        .html(text);
            toggleEditor();
        });

        $('#vocabulary').dataTable({
            "bPaginate": false,
            "bLengthChange": false,
            "bFilter": false,
            "aaData": exerciseVocabulary,
            aoColumns: [
                        { sTitle: "Sort", mDataProp: "Sort" },
                        { sTitle: "DEUTSCH", mDataProp: "Value" }
                    ],
            oLanguage: { sUrl: '../Scripts/External/datatables-de_DE.txt' },
            //bJQueryUI: true,
            //                sPaginationType: 'full_numbers',
            aaSorting: [[0, 'asc']],
            aoColumnDefs: [{ "bVisible": false, "aTargets": [0] }]
        });
        setExerciseContentHeader("Neuer Wortschatz");
        setSortFunction();

    }

    function setVocabulary(exerciseVocabulary) {
       if (exerciseVocabulary != undefined && exerciseVocabulary.length > 0) {
           $("#material_options_vocabulary").unbind().removeClass("unselectable").click(function () {
               insertVocabulary(exerciseVocabulary);
           });
           
           if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Neuer Wortschatz") {
               insertVocabulary(exerciseVocabulary);
           }

        } else {
            $("#material_options_vocabulary").unbind().addClass("unselectable");
            if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Neuer Wortschatz") {
                $("#exercise_content").html("<p id='no_exercise_content_available'>Für diese Übung steht kein neuer Wortschatz zur Verfügung.</p>");
            }
        }
    }

    loadVocabulary(exercise, setVocabulary, false);


}

function setMasterCopies(exercise) {

    function insertMasterCopies(exerciseWithMasterCopies) {
        $("#exercise_content").html("");
        fontColoration(null, $("#material_options_masterCopies"));

        $("#exercise_content").html("<div style='margin-bottom:20px;'><span>Klicken Sie eine Kopiervorlage an, um sie zu vergrößern.<br/><span/></div><div id='imagesContainer'></div>");

        var imagesThubnails = exercise.TeacherMaterials.MasterCopies;
        $(imagesThubnails).each(function () {

            this.FileName = this.FileName.replace('.pdf', '.jpg');
        });

        appendImages(exerciseWithMasterCopies.Lesson, exercise.TeacherMaterials.MasterCopies, true);

        $("#imagesContainer").append("<a style='display:block; width: 175px;' id='btnSaveAllImages'>als PDF speichern</a>");
        $("#btnSaveAllImages").unbind().click(function () {
            var files = new Array();
            $("#exercise_content img").each(function () {

                files.push({ fileName: $(this).attr("src").replace('.jpg', '.pdf'), fileDescription: $(this).data("filedescription") });
            });
            if (files.length > 1)
                getAndSaveFiles(files);
            else {
                getAndSaveFile(files[0].fileName, files[0].fileDescription);
            }
        });
       
//        $(exerciseWithMasterCopies.TeacherMaterials.MasterCopies).each(function () {
//            var fileId = this.FileName.substring(0, this.FileName.indexOf("."));
//            var thumbnailName = this.FileName.replace('.pdf', '.png');
//            $("#exercise_content").append("<img style='float:left;' class='resourceImg'  src='../Media/Lessons/L_" + exerciseWithMasterCopies.Lesson + "/Resources/Text/" + thumbnailName + "' data-filepath='../Media/Lessons/L_" + exerciseWithMasterCopies.Lesson + "/Resources/Text/" + this.FileName + "' id='" + fileId + "'/><br/>");
//            $("#" + fileId).button().unbind().click(function () {
//                getAndSaveFile($(this).data("filepath"), this.id);
//            });
//        });
        setExerciseContentHeader("Kopiervorlagen");
    }

    if (exercise.TeacherMaterials.MasterCopies.length > 0) {
        $("#material_options_masterCopies").removeClass("unselectable").unbind().click(function () {
            insertMasterCopies(exercise);
        });

        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Kopiervorlagen") {
            insertMasterCopies(exercise);
        }

    } else {
        $("#material_options_masterCopies").unbind().addClass("unselectable");
        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Kopiervorlagen") {
            $("#exercise_content").html("<p id='no_exercise_content_available'>Für diese Übung stehen keine Kopiervorlagen zur Verfügung.</p>");
        }
    }
}


function setBlackBoard(exercise) {

    function insertBlackboardViews(exerciseWithBlackboards) {
        $("#exercise_content").html("");
        fontColoration(null, $("#material_options_blackboardView"));

        $("#exercise_content").html("<div style='margin-bottom:20px;'><span>Klicken Sie den Modultest an, um ihn zu vergrößern.<br/><span/></div><div id='imagesContainer'></div>");

        exercise.TeacherMaterials.BlackBoardView.FileName = exercise.TeacherMaterials.BlackBoardView.FileName.replace('.pdf', '.jpg');
        
        appendImages(exerciseWithBlackboards.Lesson, exercise.TeacherMaterials.BlackBoardView, true);

        $("#imagesContainer").append("<a style='display:block; width: 175px;' id='btnSaveAllImages'>als PDF speichern</a>");
        $("#btnSaveAllImages").unbind().click(function () {
            var files = new Array();
            $("#exercise_content img").each(function () {
                files.push({ fileName: $(this).attr("src").replace('.jpg', '.pdf'), fileDescription: $(this).data("filedescription") });
            });
            if (files.length > 1)
                getAndSaveFiles(files);
            else {
                getAndSaveFile(files[0].fileName, files[0].fileDescription);    
            }
            
        });

        setExerciseContentHeader("Modultest");
    }

    if (!stringIsNullOrEmpty(exercise.TeacherMaterials.BlackBoardView.FileName)) {
        $("#material_options_blackboardView").removeClass("unselectable").unbind().click(function () {
            insertBlackboardViews(exercise);
        });

        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Modultest") {
            insertBlackboardViews(exercise);
        }

    } else {
        $("#material_options_blackboardView").unbind().addClass("unselectable");
        if ($("#exerciseSplitter").is(":visible") && $("#exerciseContentHeader").text() == "Modultest") {
            $("#exercise_content").html("<p id='no_exercise_content_available'>Für diese Übung steht kein Modultest zur Verfügung.</p>");
        }
    }
}

function showPopUpMenu(elem, content) {
    $(content).remove('br');
    $(elem).parent().parent().find('ul.second_menu').html(content);
    toggleSecondToolMenu(elem);
}

function hidePopUpMenus() {
    $(".second_menu").hide("fade");
}
