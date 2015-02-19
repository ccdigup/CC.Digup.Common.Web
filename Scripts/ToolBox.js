//set MediaLibrary
function setMediaLibrary(mediaLibrary) {
    $("#exerciseSplitter").hide();
    $("#exercise_content").html("");
    $("#exercise").html('<div id="mediaLibrary_panel" class="tools_panel"><br/>'
        + '<h1>Medienbibliothek</h1><br/><h4 id="mediaLibrary_desciption">In der Medienbibliothek finden Sie sämtliche Audios, Videos, Bilder, Kopiervorlagen und Modultests nach Lektionen geordnet.'
        + '<br/><br/>Die Medienbibliothek finden Sie innerhalb des Ordners für die eigenen Dateien aller Benutzer im Ordner ›Hueber‹.'
        + '<br/><br/>Sie können die Medienbibliothek mithilfe des auf der DigUP-DVD enthaltenen Installationsprogramms jederzeit erneut installieren.</h4><hr/></div>');
}

function loadImagesForLessonAndExercise(lessonNumber, exerciseNumber, onComplete) {
    var mediaData = new Array();
    $.getJSON('../Data/Exercises.json?nocache=' + NOCACHEPARAMETER, function (data) {
        //Set exerciseByNumber

        mediaData = {};
        mediaData.Lesson = lessonNumber;
        mediaData.Exercise = exerciseNumber;
        mediaData.Images = new Array();

        $(data.Exercises).each(function (index, value) {
            //find images
            if (this.Lesson == mediaData.Lesson && (this.Number == mediaData.Exercise || exerciseNumber < 0)) {
              
                $(this.Materials.Image).each(function () {
                    mediaData.Images.push(this.FileName);
                });
                $(this.TeacherMaterials.SolutionImage).each(function () {
                    if (this.FileName != undefined) {
                        mediaData.Images.push(this.FileName);
                    }
                });
            }
        });
    }).error(function () {
        //console.log("Error: failed to load exercise-json");
    }).complete(function (data) {
        //Callback the given function with the exercise (open exercise dialog for example)
        onComplete(mediaData);
    });
}

function loadMediaLibrary(onComplete) {
    var mediaData = new Array();
    $.getJSON('../Data/Exercises.json?nocache=' + NOCACHEPARAMETER, function (data) {
        //Set exerciseByNumber
        var currentLesson;
        $(data.Exercises).each(function (index, value) {
            //currentLesson = parseFloat(this.Lesson);
            currentLesson = this.Lesson;
            if (mediaData[currentLesson] == undefined || mediaData[currentLesson] == null) {
                //init new Lesson

                mediaData[currentLesson] = {};
                mediaData[currentLesson].Lesson = this.Lesson;
                mediaData[currentLesson].Images = new Array();
                mediaData[currentLesson].Audios = new Array();
                mediaData[currentLesson].Videos = new Array();
                mediaData[currentLesson].Texts = new Array();
                mediaData[currentLesson].MasterCopies = new Array();
            }
            else if (mediaData[currentLesson].Lesson != this.Lesson) {
                currentLesson = parseFloat(currentLesson + 0.1);
                mediaData[currentLesson] = {};
                mediaData[currentLesson].Lesson = this.Lesson;
                mediaData[currentLesson].Images = new Array();
                mediaData[currentLesson].Audios = new Array();
                mediaData[currentLesson].Videos = new Array();
                mediaData[currentLesson].Texts = new Array();
                mediaData[currentLesson].MasterCopies = new Array();
            }
            //find images
            $(this.Materials.Image).each(function () {
                mediaData[currentLesson].Images.push(this.FileName);
            });
            $(this.TeacherMaterials.SolutionImage).each(function () {
                if (this.FileName != undefined) {
                    mediaData[currentLesson].Images.push(this.FileName);
                }
            });
            //find Audio
            $(this.Materials.Audio).each(function () {
                mediaData[currentLesson].Audios.push(this.FileName);
            });
            //find Video
            $(this.Materials.Video).each(function () {
                mediaData[currentLesson].Videos.push(this.FileName);
            });
            //find Text
            $(this.Materials.Text).each(function () {
                mediaData[currentLesson].Texts.push(this.FileName);
            });
            $(this.TeacherMaterials.EducationalReference).each(function () {
                if (this.FileName != undefined) {
                    mediaData[currentLesson].Texts.push(this.FileName);
                }
            });
            $(this.TeacherMaterials.Solution).each(function () {
                if (this.FileName != undefined) {
                    mediaData[currentLesson].Texts.push(this.FileName);
                }
            });
            //find PDFs
            $(this.TeacherMaterials.Text).each(function () {
                mediaData[currentLesson].MasterCopies.push(this.FileName);
            });
        });
    }).error(function () {
        //console.log("Error: failed to load exercise-json");
    }).complete(function (data) {
        //Callback the given function with the exercise (open exercise dialog for example)
        onComplete(mediaData);
    });
}

function downloadFilesFromMediaLibrary() {
    var identifier = this.id.split("_")[0];
    var lessonNumber = this.id.split("_")[1];
    var lessonFiles = $("#lesson_" + lessonNumber).data("files");
    setLoadingOverlay($("#exercise"));
    getAndSaveFilesFromMediaLibrary(lessonFiles, lessonNumber, identifier);
}

function addLessonToMediaLibrary(currentLesson) {

    var lessonText = "";
    if (currentLesson.Lesson.indexOf("_") != -1) {
        lessonText = parseFloat(currentLesson.Lesson.substring(0, currentLesson.Lesson.indexOf("_")));
        var lessonPlusCount = lessonText == 0 ? 0 : parseFloat(currentLesson.Lesson.substring(currentLesson.Lesson.indexOf("_")+1));
        for(var i = 0; i < lessonPlusCount; i++) {
            lessonText += "+";
        }
    } else {
        lessonText = parseFloat(currentLesson.Lesson.replace("_", "."));    
    }

    $("#mediaLibrary").append("<tr  id='lesson_" + currentLesson.Lesson + "'><td class='mediaLibraryLessonText'>" + lessonText + "</td></tr>");
    $("#lesson_" + currentLesson.Lesson).data("files", currentLesson);

    if (currentLesson.Images != undefined && currentLesson.Images.length > 0 || currentLesson.Audios != undefined && currentLesson.Audios.length > 0 ||
                currentLesson.Videos != undefined && currentLesson.Videos.length > 0 || currentLesson.MasterCopies != undefined && currentLesson.MasterCopies.length > 0) {
        $("#lesson_" + currentLesson.Lesson).append("<td class='downloadFolder' id='all_" + currentLesson.Lesson + "'>.</td>");

        $("#all_" + currentLesson.Lesson).click(downloadFilesFromMediaLibrary);
    } else {
        $("#lesson_" + currentLesson.Lesson).append("<td class='downloadFolder'>o</td>");
    }
    for (var k in currentLesson) {
        if (currentLesson.hasOwnProperty(k)) {
            if (k != "Lesson") {
                var fileList = currentLesson[k];
                if (fileList != undefined && fileList.length > 0) {
                    $("#lesson_" + currentLesson.Lesson).append("<td class='downloadFolder' id='" + k + "_" + currentLesson.Lesson + "'>.</td>");
                    $("#" + k + "_" + currentLesson.Lesson).click(downloadFilesFromMediaLibrary);
                } else {
                    $("#lesson_" + currentLesson.Lesson).append("<td class='downloadFolder'>o</td>");
                }
            }
        }
    }

}

function setLoadingOverlay() {
    $("#content").append("<div class='overlay'><span>Bitte warten...</span><img src='/css/images/ajax-loader.gif'/></div>");
} 

function removeLoadingOverlay() {
    $(".overlay").remove();
}

//Set Vocabulary

function setVocabulary(exerciseVocabulary) {
    $("#exerciseSplitter").hide();
    $("#exercise_content").html("");
    if (exerciseVocabulary != undefined && exerciseVocabulary.length > 0) {        
        $("#exercise").html('<div id="vocabulary_panel" class="tools_panel"><br/><h1>Wortliste</h1><br/><h4 id="vocabulary_desciption">Benutzen Sie die Suche oder schränken Sie die Anzeige über den Lektions-Filter und den alphabetischen Filter ein.</h4></div>');
        
        addSeachFilter();
        setLessonFilter();
        setAlphabeticFilter();
        setFilterToggle();
        addVocabularyTable(exerciseVocabulary);
        $("#vocabulary_panel").append('<div style="margin-top: 50px;"><a id="edit_textVocabulary_btn"><span class="symbol">p</span>Bearbeiten...</a></div>');
        $("#edit_textVocabulary_btn").unbind().button().click(saveVocabularyAsText);

    } else {
        $("#material_options_vocabulary").unbind().addClass("unselectable");
    }
}

function saveVocabularyAsText() {
    var text = "";
    
    var myFilteredRows = $('#vocabulary').dataTable()._('tr', { "filter": "applied" });
    
    $(myFilteredRows).each(function () {
        if (this != undefined && this.Value != undefined)
            text += text != "" ? "</br>" + this.Value : this.Value;
    });
    $("#editor")
        .data("name", "Vokabeln")
        .data("saveas", true)
        .html(text);
    toggleEditor();

}

function addSeachFilter() {
    $("#vocabulary_panel").append("<hr/>");
    $("#vocabulary_panel").append("<div style='text-align:left;'><span >SUCHEN</span><input style='margin-left:140px;'id='vocabulary_search'></input> </div>");
    
}


function setVocabularyDropDownFilter(onSuccess, fillLessons) {

    var successMainFunction = function(data) {
        var lessons = new Array();
        var currentLesson = {};
        var lessonText = "";
        if (fillLessons) {
            $(data.Vocabulary).each(function() {
                if (currentLesson.Value != this.Lesson.Value) {
                    currentLesson = this.Lesson;
                    lessons.push(this.Lesson);
                    
                    lessonText = stringIsNullOrEmpty(currentLesson.DisplayName) ? parseInt(currentLesson.Value) : currentLesson.DisplayName;
                    if (lessonText != "0")
                        $("#timeTable_select_firstlesson, #timeTable_select_lastlesson").append("<option value='" + currentLesson.Value + "'>" + lessonText + "</option>");
                }
            });
        }

        var selectedFirstLesson = $("#timeTable_select_firstlesson option:selected").first().val();
        var selectedLastLesson = $("#timeTable_select_lastlesson option:selected").first().val();

        $("#timeTable_select_firstexercise").html("");
        $("#timeTable_select_firstexercise").append($("<option/>", {
            value: -1,
            text: "-alle-"
        }));
        $("#timeTable_select_lastexercise").html("");
        $("#timeTable_select_lastexercise").append($("<option/>", {
            value: -1,
            text: "-alle-"
        }));

        $(data.Vocabulary).each(function(index, vocabularyElement) {
            var displayName = stringIsNullOrEmpty(vocabularyElement.Exercise.DisplayName) ? parseInt(vocabularyElement.Exercise.Value) : vocabularyElement.Exercise.DisplayName;
            if (vocabularyElement.Lesson.Value == selectedFirstLesson && parseInt(vocabularyElement.Lesson.Value) > 0) {
                if ($("#timeTable_select_firstexercise option:last-child").val() != vocabularyElement.Exercise.Value) {
                    $("#timeTable_select_firstexercise").append($("<option/>", {
                        value: vocabularyElement.Exercise.Value,
                        text: displayName
                    }));    
                }
            }
            if (vocabularyElement.Lesson.Value == selectedLastLesson && parseInt(vocabularyElement.Lesson.Value) > 0) {
                if ($("#timeTable_select_lastexercise option:last-child").val() != vocabularyElement.Exercise.Value) {
                    $("#timeTable_select_lastexercise").append($("<option/>", {
                        value: vocabularyElement.Exercise.Value,
                        text: displayName
                    }));
                }
            }
        });
       
        //selectBoxElements("#timeTable_select_until");
        if (typeof (onSuccess) == "function") {
            onSuccess();
        }
    };
    loadVocabularyJson(successMainFunction);
}


function setLessonFilter() {
    $("#vocabulary_panel").append("<hr class='toolBox_splitter'/>");
    $("#vocabulary_panel").append("<div class='filterMenu' ><h3><a id='filter_lesson' class='filter'><span class='ui-icon ui-icon-triangle-1-e'></span>FILTERN NACH LEKTION</a></h3></div><div style='display:none' id='filter_lesson_content'/>");
    var successFunction = function (data) {
        $("#filter_lesson_content").append(data);
        $("#show_selected_timeTable_material").parent().text("");
        $("#show_selected_timeTable_material").remove();

        setVocabularyDropDownFilter(null, true);

        $("#timeTable_select_firstexercise").find('option[value="-1"]').remove();

        $("#timeTable_select_firstlesson").css("margin-left", "5px");
        $("#timeTable_select_lastlesson").css("margin-left", "5px");
        $("#timeTable_until_text").css("float", "right");

        $("#timeTable_select_until").change(filterVocabulary);
        $("#timeTable_select_firstlesson").change(function () {
            if (parseInt($("#timeTable_select_firstlesson").val()) > parseInt($("#timeTable_select_lastlesson").val()))
                $("#timeTable_select_lastlesson").val($("#timeTable_select_firstlesson").val()).prop('selected', true);
            setVocabularyDropDownFilter(filterVocabulary);
        });
        $("#timeTable_select_firstexercise").change(filterVocabulary);
        $("#timeTable_select_lastlesson").change(function () {
            if (parseInt($("#timeTable_select_firstlesson").val()) > parseInt($("#timeTable_select_lastlesson").val()))
                $("#timeTable_select_firstlesson").val($("#timeTable_select_lastlesson").val()).prop('selected', true);
            setVocabularyDropDownFilter(filterVocabulary);
        });
        $("#timeTable_select_lastexercise").change(filterVocabulary);

        $("#timeTable_select_firstlesson").prop("disabled", true);
        $("#timeTable_select_firstexercise").prop("disabled", true);
        $("#timeTable_select_lastlesson").prop("disabled", true);
        $("#timeTable_select_firstlesson").prop("disabled", true);
        $("#timeTable_select_lastexercise").prop("disabled", true);
        $("#timeTable_select_until").prop("disabled", true);

        $(".timeTable_radio_filter").change(function () {
            switch ($(this).val()) {
                case "filtered":
                    $("#timeTable_select_firstlesson").prop("disabled", false);
                    $("#timeTable_select_firstexercise").prop("disabled", false);
                    $("#timeTable_select_lastlesson").prop("disabled", false);
                    $("#timeTable_select_firstlesson").prop("disabled", false);
                    $("#timeTable_select_lastexercise").prop("disabled", false);
                    $("#timeTable_select_until").prop("disabled", false);
                    break;
                case "all":
                    $("#timeTable_select_firstlesson").prop("disabled", true);
                    $("#timeTable_select_firstexercise").prop("disabled", true);
                    $("#timeTable_select_lastlesson").prop("disabled", true);
                    $("#timeTable_select_firstlesson").prop("disabled", true);
                    $("#timeTable_select_lastexercise").prop("disabled", true);
                    $("#timeTable_select_until").prop("disabled", true);
                    break;
                default:
                    break;
            }
            filterVocabulary();
        });
       
        //$(".timeTable_radio_filter").change();

    };
    loadSpecificHtml(digUPSettings.viewURIs["LessonFilter"], successFunction);
}


function setAlphabeticFilter() {
    $("#vocabulary_panel").append("<hr class='toolBox_splitter'/>");
    $("#vocabulary_panel").append("<div class='filterMenu'><h3><a id='filter_alphabetic' class='filter'><span class='ui-icon ui-icon-triangle-1-e'></span>FILTERN NACH ALPHABET</a></h3></div><div class='filterMenuContent' style='display:none; margin-left:26px;' id='filter_alphabetic_content'/>");
    $("#filter_alphabetic_content").append("<div><input type='radio' class='radioAlphabetic' id='radioAlphabetic_all' checked name='radioAlphabetic' value='all'/><span> ganzes Alphabet</span></div>");
    $("#filter_alphabetic_content").append("<div style='margin-top:10px;'><input type='radio' class='radioAlphabetic' id='radioAlphabetic_filter' name='radioAlphabetic' value='filtered'/><span> einschränken auf: </span><div style='display:inline; margin-left: 75px;'><select disabled id='selectFromAlphabetic'/> <input style='margin-left:16px' id='checkBoxUntil' checked disabled type='checkbox'/><span> bis: </span> <select style='margin-left:7px' disabled id='selectUntilAlphabetic'/></div><br/><br/>");

    
    $("#checkBoxUntil").change(function () {
        if ($(this).is(":checked")) {
            $("#selectUntilAlphabetic").prop("disabled", false);
        } else {
            $("#selectUntilAlphabetic").prop("disabled", true);
        }
        filterVocabulary();
    });
    
    $(".radioAlphabetic").change(function () {
        switch ($(this).val()) {
            case "filtered":
                $("#selectFromAlphabetic").prop("disabled", false);
                $("#selectUntilAlphabetic").prop("disabled", false);
                $("#checkBoxUntil").prop("disabled", false);

                break;
            case "all":
                $("#selectFromAlphabetic").prop("disabled", true);
                $("#selectUntilAlphabetic").prop("disabled", true);
                $("#checkBoxUntil").prop("disabled", true);
                break;
            default:
                break;
        }
        filterVocabulary();
    });
    fillSelectWithAlphabetical($("#selectFromAlphabetic"), 0);
    fillSelectWithAlphabetical($("#selectUntilAlphabetic"), 25);

    $("#selectFromAlphabetic").change(function (val) {
        var fromValue = $("#selectFromAlphabetic option:selected").first().val();
        var untilValue = $('#selectUntilAlphabetic option:selected').first().val();

        if (parseInt(untilValue) < parseInt(fromValue)) {
            $("#selectFromAlphabetic").val(untilValue).prop('selected', true);
        }
        filterVocabulary();
    });
    $("#selectUntilAlphabetic").change(function (val) {
        var fromValue = $("#selectFromAlphabetic option:selected").first().val();
        var untilValue = $('#selectUntilAlphabetic option:selected').first().val();

        if (parseInt(untilValue) < parseInt(fromValue)) {
            $("#selectUntilAlphabetic").val(fromValue).prop('selected', true);
        }
        filterVocabulary();
    });

}

function fillSelectWithAlphabetical(select, selectedValue) {
    $(select).append("<option data-match='^[aä]' value='0'>a</option>");
    $(select).append("<option data-match='^[b]' value='1'>b</option>");
    $(select).append("<option data-match='^[c]' value='2'>c</option>");
    $(select).append("<option data-match='^[d]' value='3'>d</option>");
    $(select).append("<option data-match='^[e]' value='4'>e</option>");
    $(select).append("<option data-match='^[f]' value='5'>f</option>");
    $(select).append("<option data-match='^[g]' value='6'>g</option>");
    $(select).append("<option data-match='^[h]' value='7'>h</option>");
    $(select).append("<option data-match='^[i]' value='8'>i</option>");
    $(select).append("<option data-match='^[j]' value='9'>j</option>");
    $(select).append("<option data-match='^[k]' value='10'>k</option>");
    $(select).append("<option data-match='^[l]' value='11'>l</option>");
    $(select).append("<option data-match='^[m]' value='12'>m</option>");
    $(select).append("<option data-match='^[n]' value='13'>n</option>");
    $(select).append("<option data-match='^[oö]' value='14'>o</option>");
    $(select).append("<option data-match='^[p]' value='15'>p</option>");
    $(select).append("<option data-match='^[q]' value='16'>q</option>");
    $(select).append("<option data-match='^[r]' value='17'>r</option>");
    $(select).append("<option data-match='^[s]' value='18'>s</option>");
    $(select).append("<option data-match='^[t]' value='19'>t</option>");
    $(select).append("<option data-match='^[uü]' value='20'>u</option>");
    $(select).append("<option data-match='^[v]' value='21'>v</option>");
    $(select).append("<option data-match='^[w]' value='22'>w</option>");
    $(select).append("<option data-match='^[x]' value='23'>x</option>");
    $(select).append("<option data-match='^[y]' value='24'>y</option>");
    $(select).append("<option data-match='^[z]' value='25'>z</option>");

    $(select).find('option[value="' + selectedValue + '"]').first().prop('selected', true);
}


function setFilterToggle() {
    $(".filter").click(function () {
        $(this).find("span").toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-e");
        $("#" + this.id + "_content").toggle("blind");
    });
}

function addVocabularyTable(exerciseVocabulary) {
    setSortFunction();

    $("#vocabulary_panel").append("<hr class='toolBox_splitter'/>");
    $("#vocabulary_panel").append("<table cellpadding='0' cellspacing='0' border='0' class='display' id='vocabulary'></table>");
    $('#vocabulary').dataTable({
        "bPaginate": true,
        "bLengthChange": false,
        "bFilter": true,
        "aaData": exerciseVocabulary,
        aoColumns: [
                { sTitle: "Sort", mDataProp: "Sort" },
                { sTitle: "DEUTSCH", mDataProp: "Value" },
                { sTitle: "LEKTION-Sort", mDataProp: "Lesson.Value" },
                { sTitle: "LEKTION", mDataProp: "Lesson.DisplayName" },
                { sTitle: "ÜBUNG-Sort", mDataProp: "Exercise.Value" },
                { sTitle: "ÜBUNG", mDataProp: "Exercise.DisplayName"}
            ],
        oLanguage: { sUrl: '../Scripts/External/datatables-de_DE.txt' },
        //bJQueryUI: true,
        //                sPaginationType: 'full_numbers',
        aaSorting: [[0, 'asc']],
        "aoColumnDefs": [
         { "bVisible": false, "aTargets": [0,2,4] },
         { "aDataSort": [0], "aTargets": [1] },
         { "aDataSort": [2], "aTargets": [3] },
         { "aDataSort": [4], "aTargets": [5] }]
    });
    
   $("#vocabulary_search").keyup(function () {
        $('#vocabulary').dataTable().fnFilter($(this).val());
        filterVocabulary();
    });
}


function updateVocabularyTable(vocabulary) {
    $('#vocabulary').dataTable().fnClearTable();
    $('#vocabulary').dataTable().fnAddData(vocabulary);
}


function setSortFunction() {
    var regex = /(\()?(der|die|das|_)(\))?/i;

    jQuery.fn.dataTableExt.oSort['string-asc'] = function (x, y) {
        x = findAndReplaceUmlaute(x.replace(regex, "").trim().toLowerCase());
        y = findAndReplaceUmlaute(y.replace(regex, "").trim().toLowerCase());

        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    };

    jQuery.fn.dataTableExt.oSort['string-desc'] = function (x, y) {
        x = findAndReplaceUmlaute(x.replace(regex, "").trim().toLowerCase());
        y = findAndReplaceUmlaute(y.replace(regex, "").trim().toLowerCase());

        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    };

    jQuery.fn.dataTableExt.oSort['numeric-comma-asc'] = function (a, b) {
        var x = (a == "-") ? 0 : a.replace("_", ".");
        var y = (b == "-") ? 0 : b.replace("_", ".");
        x = parseFloat(x);
        y = parseFloat(y);
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    };

    jQuery.fn.dataTableExt.oSort['numeric-comma-desc'] = function (a, b) {
        var x = (a == "-") ? 0 : a.replace("_", ".");
        var y = (b == "-") ? 0 : b.replace("_", ".");
        x = parseFloat(x);
        y = parseFloat(y);
        return ((x < y) ? 1 : ((x > y) ? -1 : 0));
    };
}

function findAndReplaceUmlaute(word) {
    var regexUmlaute = /^[ÄÖÜäöü]/i;

    if (word.match(regexUmlaute)) {
        switch (word.toLowerCase().charAt(0)) {
            case "ä":
                word = word.replace("ä", "ae");
                break;
            case "ö":
                word = word.replace("ö", "oe");
                break;
            case "ü":
                word = word.replace("ü", "ue");
                break;
            default:
        }

    }

    return word;
}



//setFilter function
function filterVocabulary() {
    var isFilterAlphabetic = $("#radioAlphabetic_filter").is(':checked');
    var isRange = $("#checkBoxUntil").is(':checked');
  
    var filterAlphabetic = new Array();
    var alphabet = $("#selectFromAlphabetic option");
    if (isFilterAlphabetic) {
        var fromAlphabetic = parseInt($("#selectFromAlphabetic option:selected").val());
        var untilAlphabetic = isRange ? parseInt($("#selectUntilAlphabetic option:selected").val()) : fromAlphabetic;

        for (var i = 0; i < alphabet.length; i++) {
            if (parseInt($(alphabet[i]).val()) >= fromAlphabetic && parseInt($(alphabet[i]).val()) <= untilAlphabetic)
                filterAlphabetic.push(new RegExp($(alphabet[i]).data("match")));
        }
    } else {
        alphabet.each(function() {
            filterAlphabetic.push(new RegExp($(this).data("match")));
        });
    }

    var lessonRange = $("#timeTable_select_until").is(":checked");
    var filterLessons = $("#timeTable_radio_filter_on").is(":checked");
    loadVocabularyFilteredByLessonAndAlphabetic(
        {
            fromLesson: filterLessons ? $("#timeTable_select_firstlesson option:selected").first().val() : $("#timeTable_select_firstlesson option").first().val(),
            untilLesson: filterLessons ? (lessonRange ? $("#timeTable_select_lastlesson option:selected").first().val() : $("#timeTable_select_firstlesson option:selected").first().val()) : $("#timeTable_select_lastlesson option").last().val(),
            fromExercise: filterLessons ? $("#timeTable_select_firstexercise option:selected").first().val() : $("#timeTable_select_firstexercise option").last().val(),
            untilExercise: filterLessons ? (lessonRange ? $("#timeTable_select_lastexercise option:selected").first().val() : $("#timeTable_select_firstexercise option:selected").first().val()) : $("#timeTable_select_lastexercise option").last().val() 
        }, filterAlphabetic, updateVocabularyTable);
}

