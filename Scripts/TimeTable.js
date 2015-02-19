
function loadTimeTableView() {
    var successFunction = function (data) {
        $("#exercise").html("");
        $("#exercise_content").html("");
        $("#exercise").html(data);
        $("#exerciseSplitter").hide();
        $("#exercise_content").html("");

        addSelectBoxFunctionalities();
        loadCustomTimeTables();

        toggleRefreshButton("hide");
        $("#exerciseView").unbind("dialogbeforeclose");
        $("#exerciseMenu").unbind("dialogbeforeclose");

        if (isOSX()) {
            $("#exercise .textIcon a").css("margin-top", 1);
        }
    };

    loadSpecificHtml(digUPSettings.viewURIs["TimeTable"], successFunction);


    hideExerciseMenuEntries();
    showToolsMenuEntries();
    //hideToolsMenuEntries();
    toggleFileHandleOptionBox("hide");
}


function exerciseIsInSearchRange(exercise, startLesson, endLesson, startExercise, endExercise, checkBoxStatus) {
    var currentLesson = parseFloat(exercise.Lesson.replace("_", "."));
    if (currentLesson >= startLesson && currentLesson <= endLesson
        && !stringIsNullOrEmpty(exercise.TeacherMaterials.EducationalReference)
            && exercise.TeacherMaterials.EducationalReference.length > 0) {
        //checkBox until is checked
        if (checkBoxStatus) {

            if (currentLesson == startLesson && endLesson != startLesson && exercise.Number >= startExercise) {
                return true;
            }
            if (currentLesson == endLesson && endLesson != startLesson && (exercise.Number <= endExercise || endExercise == -1)) {
                return true;
            }
            if (currentLesson > startLesson && currentLesson < endLesson) {
                return true;
            }
            if (currentLesson == startLesson && currentLesson == endLesson && exercise.Number >= startExercise && (exercise.Number <= endExercise || endExercise == -1)) {
                return true;
            }
            //only one lesson
            
        } else {
            if ((currentLesson == startLesson && exercise.Number == startExercise) || (currentLesson == startLesson && startExercise == -1)) {
                return true;
            }
        }
    }
    return false;
}

function loadEducationalReferences(startLesson, endLesson, startExercise, endExercise) {

    var successMainFunction = function (data) {
        var checkBoxStatus = $("#timeTable_select_until").is(":checked");
        var actualLesson = "";
        //$("#exercise_content").html("");
        $("#timeTable_content").html("");
        $("#timeTable_desciption").html("1. Klicken Sie in die Tabelle um die Inhalte zu bearbeiten.<br/>2. Klicken Sie auf das + oder - um Zeilen einzufügen oder zu entfernen.");
        $(data.Exercises).each(function (exerciseIndex, exercise) {
            if (exerciseIsInSearchRange(exercise, startLesson, endLesson, startExercise, endExercise, checkBoxStatus)) {

                if (actualLesson != exercise.Lesson) {
                    var displayName = this.Lesson;
                    for (var i = 0; i < lessonIndexObjects.length; i++) {
                        if (lessonIndexObjects[i].Number == this.Lesson)
                            displayName = stringIsNullOrEmpty(lessonIndexObjects[i].DisplayName) ? this.Lesson : lessonIndexObjects[i].DisplayName;
                    }
                    $("#timeTable_content").append("<h1>Lektion " + displayName + "</h1>");
                    actualLesson = exercise.Lesson;
                }

                var exerciseHeadline = !stringIsNullOrEmpty(exercise.DisplayName) ? exercise.DisplayName : "Übung "+parseInt(exercise.Number);
                $("#timeTable_content").append("<h4 class='timeTable_exercise_headline'>" + exerciseHeadline + "</h4>");
                $("#timeTable_content").append('<table id="educational_reference_table_' + exerciseIndex + '" class="educational_reference_table" cellpadding="0" cellspacing="0"><tr>'
                            + '<td class="educational_reference_form_column">Form</td>'
                            + '<td class="educational_reference_activity_column">Ablauf</td>'
                            + '<td class="educational_reference_material_column">Material</td>'
                            + '<td class="educational_reference_time_column">Zeit</td></tr></table>');

                $(exercise.TeacherMaterials.EducationalReference).each(function (referenceIndex, referenceElement) {


                    var tdString = '<tr class="educational_reference_innerContent" data-lesson="' + exercise.Lesson + '" data-exercise="' + exercise.Number + '" data-index="' + referenceIndex + '">'
                    + '<td class="firstColumn timeTable_form_column" id="' + referenceIndex + "_" + exerciseIndex + '_form">'
                    + '<div class="timeTable_icon timeTable_minus_icon"></div>';

                    tdString += formArrayToString(referenceElement);

                    tdString += '</td><td id="' + referenceIndex + "_" + exerciseIndex + '_text" class="educational_reference_activity_innerColumn timeTable_text_column">'
                                + '</td><td id="' + referenceIndex + "_" + exerciseIndex + '_material" class="timeTable_material_column">'
                                    + referenceElement.Material
                                    + '</td><td id="' + referenceIndex + "_" + exerciseIndex + '_time" class="timeTable_time_column">' + referenceElement.Time
                                        + '<div class="timeTable_icon timeTable_plus_icon"></div>'
                                        + '</td></tr>';

                    $("#educational_reference_table_" + exerciseIndex).append(tdString);

                    var path = "../Media/Lessons/L_" + exercise.Lesson + "/Resources/Text/" + referenceElement.FileName;
                    loadTimeTableText(referenceIndex, exerciseIndex, path);

                });
            }
        });

        addEditorEvents("", "");
    };

    loadExercisesJson(successMainFunction);
}

function deleteTimeTableRow(parentTrElement, tableElement) {
    $("#timeTable_content").data("modified", true);
    
    $(parentTrElement).find(".timeTable_form_column .timeTable_minus_icon, .timeTable_time_column .timeTable_plus_icon").unbind();
    $(parentTrElement).remove();

    if ($(tableElement).find("tr").length <= 1) {

        if ($(tableElement).prev()[0].tagName == "H4") {
            if ($(tableElement).prev() != undefined &&
                $(tableElement).prev().prev()[0] != undefined &&
                    $(tableElement).prev().prev()[0].tagName != undefined &&
                        $(tableElement).prev().prev()[0].tagName == "H1") {
                $(tableElement).prev().prev().remove();
            }
            $(tableElement).prev().remove();
        }

        $(tableElement).remove();

        if ($("#timeTable_content").html().trim() == "") {
            loadTimeTableView();
        }


    }
    toggleRefreshButton();
}
function addTimeTableRow(parentTrElement) {
    $("#timeTable_content").data("modified", true);
    
    var newDate = new Date();
    var uniqId = newDate.getTime();


    var trElement = $('<tr class="educational_reference_innerContent" data-lesson="' + uniqId + '" data-exercise="' + uniqId + '" data-index="' + uniqId + '">'
                    + '<td class="firstColumn timeTable_form_column" id="' + uniqId + "_" + uniqId + '_form">'
                    + '<div class="timeTable_icon timeTable_minus_icon"></div>'
                    + '</td><td id="' + uniqId + "_" + uniqId + '_text" class="educational_reference_activity_innerColumn timeTable_text_column">'
                                + '</td><td id="' + uniqId + "_" + uniqId + '_material" class="timeTable_material_column">'
                                    + '</td><td id="' + uniqId + "_" + uniqId + '_time" class="timeTable_time_column">'
                                        + '<div class="timeTable_icon timeTable_plus_icon"></div>'
                                        + '</td></tr>');



    addTableRowClickEvent(trElement);
    $(parentTrElement).after(trElement);

    adjustButtons(trElement);
}

function adjustIconMargin(iconElement) {
    $(iconElement).css("margin-top", (parseInt($(iconElement).parent().parent().height() / 2) - 17));
}

function toggleFileHandleOptionBox(visibility) {
    if (visibility == "show") {
        $("#file_handle").html('<span class="ui-icon ui-icon-triangle-1-s">Datei</span>Unterrichtsplaner');
        $("#file_handle_options_box").show();
        $("#file_handle_options").show();
        $("#file_handle").show();    
        if(!stringIsNullOrEmpty($("#timeTable_content").data("saveString"))) {
            //$("#file_saveAs").show();
            $("#file_save").removeClass("disabled");
            $("#file_save").unbind().click(onSaveTimeTable);
            $("#file_saveAs").removeClass("disabled");
            $("#file_saveAs").unbind().click(function () {
                saveAs(false);
            });
        } else {
            //$("#file_saveAs").hide();
            $("#file_save").addClass("disabled");
            $("#file_save").unbind();
            //$("#file_saveAs").addClass("disabled");
        }
    }
    if(visibility == "hide") {
        $("#file_handle_options_box").hide();
        $("#file_handle_options_box").css("display", "none !important");
        $("#file_handle_options").hide();
        $("#file_handle").hide();
        $("#file_handle").html('<span class="ui-icon ui-icon-triangle-1-e">Datei</span>Datei');
    }
    
}

function adjustButtons(elem) {
    //Fill blank td-tags for IE-compatibility
    var textColumn = $(elem).hasClass("timeTable_text_column") ? $(elem).parent() : $(elem).find(".timeTable_text_column").first().parent();
    if (!stringIsNullOrEmpty(textColumn)) {
        $(textColumn).find("td").each(function (tdIndex, tdElem) {
            if (stringIsNullOrEmpty($(tdElem).text().trim())) {
                $(tdElem).find("p").remove();
                $(tdElem).append($("<p style='width:" + $(tdElem).width() + "px;'>&nbsp;</p>"));
            } else {
                $(tdElem).find("p").first().width($(tdElem).width());
            }
        });
    }


    $(textColumn).find(".timeTable_minus_icon, .timeTable_plus_icon").each(function (iconIndex, iconElement) {

        adjustIconMargin(iconElement);

        $(iconElement).unbind().click(function (e) {

            var parentTrElement = $(iconElement).parent().parent();
            var tableElement = $(parentTrElement).parent().parent();

            if ($(this).hasClass("timeTable_minus_icon")) {
                e.stopPropagation();

                var dialog = $("#custom_modal_dialog");
                var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
                var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

                $(dialogButtonArea).html("");

                $(dialogTextArea).html("<p>Zeile löschen?</p>");

                $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                .click(function () {
                    $(dialog).dialog("close");
                })
                .appendTo($(dialogButtonArea));

                $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Löschen</span></div>")
                .click(function () {
                    deleteTimeTableRow(parentTrElement, tableElement);
                    $(dialog).dialog("close");
                })
                .appendTo($(dialogButtonArea));

                $(dialog).dialog({ height: 95, width: 'auto' });
                $(dialog).dialog("open");

            } else {
                if ($(this).hasClass("timeTable_plus_icon")) {
                    e.stopPropagation();
                    addTimeTableRow(parentTrElement);
                }
            }
        });
    });
}


function uniqId() {
    var newDate = new Date();
    
    return newDate.getTime();
}


function loadTimeTableText(referenceIndex, exerciseIndex, path) {
    var completeFunction = function (text) {
        var elem = $("#" + referenceIndex + "_" + exerciseIndex + "_text");
        $(elem).html(text);

        adjustButtons($(elem));
    };

    loadText(path, completeFunction);
}

function toggleRefreshButton(param) {
    var button = $("#restore_timeTableData #restore_timeTableData_btn");

    switch (param) {
        case "active":
            $("#restore_timeTableData").show().unmask();
            $(button).removeClass("inactive").addClass("active");
            break;
            
        case "inactive":
            $("#restore_timeTableData").show().mask();
            $(button).removeClass("active").addClass("inactive");
            break;
            
        case "show":
            $("#restore_timeTableData").show().mask();
            $(button).removeClass("active").addClass("inactive");
            break;
            
        case "hide":
            $("#restore_timeTableData").hide().mask();
            $(button).removeClass("active").addClass("inactive");
            break;

        default:
            var contentHasChanged = false;
            $("#timeTable_content table tr").each(function () {
                if (!stringIsNullOrEmpty($(this).data("changed")) && $(this).data("changed")) {
                    contentHasChanged = true;
                    return false;
                }
            });
            if(contentHasChanged) {
                $("#restore_timeTableData").show().unmask();
                $(button).removeClass("inactive").addClass("active");
            }else {
                $("#restore_timeTableData").show().mask();
                $(button).removeClass("active").addClass("inactive");
            }
            
            break;
        }
}

function addDeleteElementToCusomTableList(linkContainerElement, insertBeforeElement) {
    var deleteElement = $('<div class="timeTable_icon timeTable_delete_icon"></div>')
        .click(function (e) {
            e.stopPropagation();
            var id = $(linkContainerElement).data("primarykey");

            if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                timeTableService.deleteTimeTable(id).done(function () {
                    localDB.indexedDB.deleteElement(id, timeTable);
                });
            }else {
                localDB.indexedDB.deleteElement(id, timeTable);
            }

            $(linkContainerElement).find("a").unbind();
            $(linkContainerElement).find(".timeTable_icon").unbind();
            $(linkContainerElement).remove();
        });

        $(insertBeforeElement).before(deleteElement);
}


function addEditElementToCusomTableList(linkContainerElement, insertBeforeElement) {
    var editElement = $('<div class="timeTable_icon timeTable_edit_icon"></div>')
        .click(function (e) {
            e.stopPropagation();

            var dialog = $("#custom_modal_dialog");
            var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
            var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

            $(dialogButtonArea).html("");

            $(dialogTextArea).html("<p>Neuer Titel:<br/><input type='text' id='timeTable_save_name' value='" + $(linkContainerElement).data("name") + "'/></p>");

            $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

            $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Umbenennen</span></div>")
            .click(function () {
                var nameVal = $("#timeTable_save_name").val();

                if (!stringIsNullOrEmpty(nameVal)) {

                    var loadSpecificTimeTable = function (data) {
                        data.name = nameVal;
                        data.primaryKey = parseInt($(linkContainerElement).data("primarykey"));
                        data.date = parseInt(parseInt(new Date().getTime()) / 1000);

                        var updateSuccessFunction = function (upadtedData) {
                            $(insertBeforeElement).text(nameVal);
                            $(dialog).dialog("close");
                        };

                        if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                            timeTableService.saveTimeTable(data).done(function () {
                                localDB.indexedDB.updateElement(data, timeTable, updateSuccessFunction);
                            });
                        }else {
                            localDB.indexedDB.updateElement(data, timeTable, updateSuccessFunction);
                        }

                    };

                    localDB.indexedDB.getTableElementByTag(timeTable, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificTimeTable);

                    $(dialog).dialog({ height: 145, width: 'auto' });
                    $(dialog).find(".errorText").remove();
                    $(dialog).dialog("close");
                } else {
                    $("#timeTable_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                    $(dialog).dialog({ height: 165, width: 'auto' });
                }


            })
            .appendTo($(dialogButtonArea));

            $(dialog).dialog({ height: 115, width: 'auto' });
            $(dialog).dialog("open");

        });

        $(insertBeforeElement).before(editElement);
}

function addDuplicateElementToCusomTableList(linkContainerElement, insertBeforeElement) {
    var duplicateElement = $('<div class="timeTable_icon timeTable_plus_icon"></div>')
        .click(function (e) {
            e.stopPropagation();
            var dateKey = parseInt(new Date().getTime());

            var loadSpecificTimeTable = function (data) {
                var newData = {
                    "primaryKey": dateKey,
                    "name": data.name + " kopie",
                    "date": parseInt(dateKey / 1000),
                    "html": data.html
                };

                var innerSuccessFunction = function (insertedData) {
                    var tableBox = $("#ownTimeTables");

                    var newElement = $("<div class='ownTimeTables' data-name='" + insertedData.name + "' data-date='" + insertedData.date + "' data-primarykey='" + insertedData.primaryKey + "'><a>" + insertedData.name + "</a></div>");
                    $(newElement).click(function () {
                        var loadThisSpecificTimeTable = function (htmlData) {
                            $("#timeTable_content").html(htmlData.html);
                            $("#file_handle_options_box p").unmask();

                            $("#timeTable_content .educational_reference_table tr").each(function () {
                                adjustButtons(this);
                            });

                            addEditorEvents(htmlData.primaryKey, htmlData.name);
                        };

                        localDB.indexedDB.getTableElementByTag(timeTable, parseInt($(this).data("primarykey")), "primaryKey", loadThisSpecificTimeTable);
                    });

                    var innerNewAElement = newElement.find("a");

                    addDeleteElementToCusomTableList(newElement, innerNewAElement);
                    addEditElementToCusomTableList(newElement, innerNewAElement);
                    addDuplicateElementToCusomTableList(newElement, innerNewAElement);

                    $(tableBox).append(newElement);

                };

                if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                    newData.primaryKey = 0;
                    timeTableService.copyTimeTable(newData).done(function (response) {
                        newData.primaryKey = response.primaryKey;
                        localDB.indexedDB.addElement(newData, timeTable, innerSuccessFunction);
                    });
                } else {
                    localDB.indexedDB.addElement(newData, timeTable, innerSuccessFunction);
                }
            };

            localDB.indexedDB.getTableElementByTag(timeTable, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificTimeTable);

        });

        $(insertBeforeElement).before(duplicateElement);
}


function setFilterSelectBoxFunctionality() {
    $("#timeTable_select_firstlesson").unbind().change(function () {

        loadTimeTableExerciseSelections();

        var selectedFirstLesson = $("#timeTable_select_firstlesson option:selected").first().val();
        var selectedLastLesson = $("#timeTable_select_lastlesson option:selected").first().val();

        var selectedFirstExercise = $("#timeTable_select_firstexercise option:selected").first().val();
        var selectedLastExercise = $("#timeTable_select_lastexercise option:selected").first().val();

        if (parseInt(selectedFirstLesson) > parseInt(selectedLastLesson)) {
            $("#timeTable_select_lastlesson").val(selectedFirstLesson).prop('selected', true);
        }
        if (parseInt(selectedFirstLesson) == parseInt(selectedLastLesson) && parseInt(selectedFirstExercise) > parseInt(selectedLastExercise)) {
            $("#timeTable_select_firstexercise").val(selectedLastExercise).prop('selected', true);
        }
    });
    $("#timeTable_select_lastlesson").unbind().change(function () {
        loadTimeTableExerciseSelections();

        var selectedFirstLesson = $("#timeTable_select_firstlesson option:selected").first().val();
        var selectedLastLesson = $("#timeTable_select_lastlesson option:selected").first().val();

        var selectedFirstExercise = $("#timeTable_select_firstexercise option:selected").first().val();
        var selectedLastExercise = $("#timeTable_select_lastexercise option:selected").first().val();

        if (parseInt(selectedFirstLesson) > parseInt(selectedLastLesson)) {
            $("#timeTable_select_firstlesson").val(selectedLastLesson).prop('selected', true);
        }
        if (parseInt(selectedFirstLesson) == parseInt(selectedLastLesson) && parseInt(selectedFirstExercise) > parseInt(selectedLastExercise)) {
            $("#timeTable_select_firstexercise").val(selectedLastExercise).prop('selected', true);
        }
    });
    $("#timeTable_select_firstexercise").unbind().change(function () {
        var selectedFirstLesson = $("#timeTable_select_firstlesson option:selected").first().val();
        var selectedLastLesson = $("#timeTable_select_lastlesson option:selected").first().val();

        var selectedFirstExercise = $("#timeTable_select_firstexercise option:selected").first().val();
        var selectedLastExercise = $("#timeTable_select_lastexercise option:selected").first().val();

        if (parseInt(selectedFirstLesson) == parseInt(selectedLastLesson) && parseInt(selectedFirstExercise) > parseInt(selectedLastExercise)) {
            $("#timeTable_select_lastexercise").val(selectedFirstExercise).prop('selected', true);
        }
    });
    $("#timeTable_select_lastexercise").unbind().change(function () {
        var selectedFirstLesson = $("#timeTable_select_firstlesson option:selected").first().val();
        var selectedLastLesson = $("#timeTable_select_lastlesson option:selected").first().val();

        var selectedFirstExercise = $("#timeTable_select_firstexercise option:selected").first().val();
        var selectedLastExercise = $("#timeTable_select_lastexercise option:selected").first().val();

        if (parseInt(selectedFirstLesson) == parseInt(selectedLastLesson) && parseInt(selectedFirstExercise) > parseInt(selectedLastExercise)) {
            $("#timeTable_select_firstexercise").val(selectedLastExercise).prop('selected', true);
        }
    });

    $("#timeTable_select_until").unbind().change(function () {
        selectBoxElements(this);
    });
}

function editTimeTableList() {
    $("#ownTimeTables_headline").after("<p id='ownTimeTables_desc'>Löschen Sie einen Unterrichtsplaner mit -, duplizieren Sie einen bestehenden<br/>"
         + "mit +, oder bearbeiten den Namen eines Unterrichtsplaners.</p>");
    $("#ownTimeTables .ownTimeTables").each(function () {
        $(this).unbind();
        var linkContainerElement = $(this);
        var aElement = $(linkContainerElement).find("a");

        addDeleteElementToCusomTableList(linkContainerElement, aElement);
        addEditElementToCusomTableList(linkContainerElement, aElement);
        addDuplicateElementToCusomTableList(linkContainerElement, aElement);
    });
    $(this).hide();
    $("#end_configure_timaTable_btn").show();
    $("#create_own_timeTable_btn").parent().mask();
}

function onSaveTimeTable(event, closeAfterSave) {
    var saveAsString = $("#timeTable_content").data("saveString");
    //Clear all selected rows!
    $(".educational_reference_table tr").removeClass("selected_row");

    if (!stringIsNullOrEmpty(saveAsString)) {

        var loadSpecificTimeTable = function (data) {
            data.primaryKey = parseInt(saveAsString);
            data.date = parseInt(parseInt(new Date().getTime()) / 1000);
            data.html = $("#timeTable_content").html();

            var updateSuccessFunction = function (upadtedData) {
                $("#timeTable_content").data("modified", false);
                showExerciseViewNotification("Speichern erfolgreich", "success");
                if (closeAfterSave) {
                    loadTimeTableView();
                }
            };

            if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                timeTableService.saveTimeTable(data).done(function () {
                    localDB.indexedDB.updateElement(data, timeTable, updateSuccessFunction);
                });
            }else {
                localDB.indexedDB.updateElement(data, timeTable, updateSuccessFunction);
            }

        };

        localDB.indexedDB.getTableElementByTag(timeTable, saveAsString, "primaryKey", loadSpecificTimeTable);

    } else {
        saveAs(closeAfterSave);
    }

}

function saveAs(closeAfterSave) {
    var dialog = $("#custom_modal_dialog");
    var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
    var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

    $(dialogButtonArea).html("");

    $(dialogTextArea).html("<p class='bold'>Unterrichtsplaner speichern unter:<br/><input type='text' id='timeTable_save_name'/></p>");

    $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
        .click(function() {
            $(dialog).dialog("close");
        })
        .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
        .click(function () {
            var nameVal = $("#timeTable_save_name").val();

            if (!stringIsNullOrEmpty(nameVal)) {

                var primarykey = parseInt(new Date().getTime());

                var data = {
                    "primaryKey": primarykey,
                    "name": nameVal,
                    "date": parseInt(primarykey / 1000),
                    "html": $("#timeTable_content").html()
                };

                if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                    data.primaryKey = 0;
                    timeTableService.saveTimeTable(data).done(function (response) {
                        data.primaryKey = response.primaryKey;
                        saveTimeTable();
                    });
                } else {
                    saveTimeTable();
                }

                function saveTimeTable() {
                    localDB.indexedDB.addElement(data, timeTable, function () {
                        $("#timeTable_content").data("modified", false);

                        $("#timeTable_content").data("name", nameVal);
                        $("#timeTable_content").data("saveString", data.primaryKey);
                        //$("#file_saveAs").show();
                        $("#file_save").removeClass("disabled");
                        $("#file_save").unbind().click(onSaveTimeTable);
                        //$("#timeTable_save_name").after("<br/><span class='correctText'>Speichern erfolgreich.</span>");
                        //$(dialog).dialog({ height: 145 });

                        $(dialog).find(".errorText").remove();

                        //setTimeout(function () {
                        $(dialog).dialog("close");
                        //}, 800);
                        showExerciseViewNotification("Speichern erfolgreich", "success");
                        if (closeAfterSave) {
                            loadTimeTableView();
                        }
                    }, function () {
                        showExerciseViewNotification("Speichern fehlgeschlagen. Der Name ist bereits vergeben", "error");
                        $(dialog).dialog("close");
                    });
                }
            } else {
                $("#timeTable_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                $(dialog).dialog({ height: 165, width: 'auto' });
            }
        })
        .appendTo($(dialogButtonArea));

        $(dialog).dialog({ height: 125, width: 'auto' });
        if (isOSX())
            $(".icon_container .icon").css("top", 0);
    $(dialog).dialog("open");
}

function addSelectBoxFunctionalities() {
    $("#file_handle_options_box").find("p").mask();
    //$("#file_handle_options_box").show();
    setTimeTableSelections();

    $("#file_print").unbind().click(function () {
        var printContent = $("#exercise").parent().clone();
        $(printContent).find("#restore_timeTableData").remove();
        $(printContent).find("#timeTable_desciption").remove();

        ShowPrintContentView($(printContent).html());
    });

    $("#restore_original_text_btn").unbind().click(function () {
        var saveInElement = $("#" + $("#editor").data("savein"));
        var saveInParentTr = $(saveInElement).parent();
        $("#editor").data("remind_save", true);

        var successFunction = function (exercise) {
            var educationalContentObject = exercise.TeacherMaterials.EducationalReference[$(saveInParentTr).data("index")];


            if ($(saveInElement).hasClass("timeTable_form_column")) {
                $("#editor").html(formArrayToString(educationalContentObject));
            }
            if ($(saveInElement).hasClass("educational_reference_activity_innerColumn timeTable_text_column")) {
                var completeFunction = function (text) {
                    $("#editor").html(text);
                };

                var path = "../Media/Lessons/L_" + exercise.Lesson + "/Resources/Text/" + educationalContentObject.FileName;
                loadText(path, completeFunction);
            }
            if ($(saveInElement).hasClass("timeTable_material_column")) {
                $("#editor").html(educationalContentObject.Material);
            }
            if ($(saveInElement).hasClass("timeTable_time_column")) {
                $("#editor").html(educationalContentObject.Time);
            }

            $("#restore_original_text_container").hide();
        };

        getSpecificEducationalReferenceFromTrData(saveInParentTr, successFunction);
    });

    $("#show_time_table_headline").unbind().click(function () {
        $(this).find("span").toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-e");
        $("#" + this.id + "_options").toggle("blind");
    });

    $("#create_own_timeTable_btn").unbind().click(function () {
        $("#timeTable_desciption").html("1. Klicken Sie in die Tabelle um die Inhalte zu bearbeiten.<br/>2. Klicken Sie auf das + oder - um Zeilen einzufügen oder zu entfernen.");
        var headlineString = '<h1>Eigener Unterrichtsplaner</h1><h4 class="timeTable_exercise_headline"><span>&nbsp;</span></h4>';
        var blankTableString =
            '<table id="educational_reference_table_0" class="educational_reference_table" cellpadding="0" cellspacing="0">'
                + '<tbody>'
                    + '<tr>'
                        + '<td class="educational_reference_form_column">Form</td>'
                        + '<td class="educational_reference_activity_column">Ablauf</td>'
                        + '<td class="educational_reference_material_column">Material</td>'
                        + '<td class="educational_reference_time_column">Zeit</td>'
                    + '</tr>'
                        + '<tr class="educational_reference_innerContent" data-lesson="1355762746661" data-exercise="1355762746661" data-index="1355762746661">'
                        + '<td class="firstColumn timeTable_form_column" id="1355762746661_1355762746661_form"><div class="timeTable_icon timeTable_minus_icon" style="margin-top: -1px;"></div></td>'
                        + '<td id="1355762746661_1355762746661_text" class="educational_reference_activity_innerColumn timeTable_text_column"><p>&nbsp;</p></td>'
                        + '<td id="1355762746661_1355762746661_material" class="timeTable_material_column"></td>'
                        + '<td id="1355762746661_1355762746661_time" class="timeTable_time_column"><div class="timeTable_icon timeTable_plus_icon" style="margin-top: -1px;"></div></td>'
                    + '</tr>'
                + '</tbody>'
            + '</table>';

        $("#timeTable_content").html(headlineString).append(blankTableString);

        $("#timeTable_content .educational_reference_table tr").each(function () {
            adjustButtons(this);
        });

        $("#file_handle_options_box p").unmask();
        addEditorEvents("", "");
    });

    //$("#configure_timaTable_btn").unbind().click(editTimeTableList);

    $("#end_configure_timaTable_btn").unbind().click(function () {

        $("#ownTimeTables_desc").remove();

        $("#ownTimeTables .ownTimeTables").each(function () {
            $(this).find("div").unbind().remove();
        });

        $(this).hide();
        $("#configure_timaTable_btn").show();
        $("#create_own_timeTable_btn").parent().unmask();
        loadTimeTableView();
    });

    $("#show_selected_timeTable_material").unbind().click(function () {
        loadEducationalReferences(parseFloat($("#timeTable_select_firstlesson option:selected").first().val().replace("_", ".")),
            parseFloat($("#timeTable_select_lastlesson option:selected").first().val().replace("_", ".")),
            $("#timeTable_select_firstexercise option:selected").first().val(),
            $("#timeTable_select_lastexercise option:selected").first().val());

        toggleRefreshButton("inactive");

        $("#file_handle_options_box p").unmask();
    });

    setFilterSelectBoxFunctionality();

    $("#restore_timeTableData_btn").unbind().click(function () {
        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

        $(dialogButtonArea).html("");

        $(dialogTextArea).html("<p>Alle Änderungen der aktuellen<br/>Auswahl zurücksetzen?</p>");

        $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Zurücksetzen</span></div>")
            .click(function () {
                $("#timeTable_content").data("modified", true);
                restoreEducationalReferenceContent();
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

        $(dialog).dialog({ height: 115, width: 'auto' });
        $(dialog).dialog("open");

    });



    $("#file_save").unbind().click(onSaveTimeTable);
    $("#file_saveAs").unbind().click(function () {
        saveAs(false);  
    });

    $("#file_export").unbind().click(function () {
        var fileName = "Unterrichtsplaner.html";
        if (!stringIsNullOrEmpty($("#timeTable_content").data("name"))) {
            fileName = $("#timeTable_content").data("name") + ".html";
        }
        transformImagesInHtml($("#timeTable_content_bag"), fileName);
        //saveFile($("#timeTable_content_bag").html(), "Unterrichtsplaner.html");
    });
}

function getSpecificEducationalReferenceFromTrData(trElement, ownFunction) {
    var successFunction = function (data) {
        var currentExercise;

        $(data.Exercises).each(function (exerciseIndex, exerciseElement) {
            if (exerciseElement.Lesson == $(trElement).data("lesson")
                        && exerciseElement.Number == $(trElement).data("exercise")) {
                

                currentExercise = exerciseElement;
                return false;
            }
        });

        ownFunction(currentExercise);
    };

    loadExercisesJson(successFunction);
}

function loadCustomTimeTables() {
    var successFunction = function (result) {

        $(".tools_panel_content_entry").removeClass("disabled");
        $("#configure_timaTable_btn").unbind().click(editTimeTableList);

        var tableBox = $("#ownTimeTables");
        $(result).each(function () {
            $(tableBox).append("<div class='ownTimeTables' data-name='" + this.value.name + "' data-date='" + this.value.date + "' data-primarykey='" + this.value.primaryKey + "'><a>" + this.value.name + "</a></div>");
        });

        $(tableBox).find(".ownTimeTables").unbind().click(function () {
            var loadSpecificTimeTable = function (data) {
                $("#timeTable_desciption").html("1. Klicken Sie in die Tabelle um die Inhalte zu bearbeiten.<br/>2. Klicken Sie auf das + oder - um Zeilen einzufügen oder zu entfernen.");
                $("#timeTable_content").html(data.html);
                $("#file_handle_options_box p").unmask();

                $("#timeTable_content .educational_reference_table tr").each(function () {
                    adjustButtons(this);
                });

                addEditorEvents(data.primaryKey, data.name);
                toggleFileHandleOptionBox("show");

            };

            localDB.indexedDB.getTableElementByTag(timeTable, parseInt($(this).data("primarykey")), "primaryKey", loadSpecificTimeTable);
        });
    };
    disableTimeTableMenuEntries();

    localDB.indexedDB.getAllTableElements(timeTable, successFunction);
}

function disableTimeTableMenuEntries() {
    //$("#workSheet_desciption").html("Erstellen Sie ein neues Arbeitsblatt.");
    $("#configure_timaTable_btn").parent().addClass("disabled");
    $("#configure_timaTable_btn").unbind();
    $("#ownTimeTables_headline").parent().addClass("disabled");
}

function setRestoreButtonVisibility() {
    var hasCustomTags = false;
    var hasOriginalTags = false;
    $("#timeTable_content .educational_reference_innerContent").each(function () {
        if ($(this).data("lesson") > 99999) {
            hasCustomTags = true;
        } else {
            hasOriginalTags = true;
        }
    });

    if (hasCustomTags && !hasOriginalTags) {
        $("#restore_timeTableData").hide();
    }
}



function saveTimeTable(name) {
    
    var dateKey = parseInt(new Date().getTime());
    
    var data = {
        "primaryKey": dateKey,
        "name": name,
        "date": parseInt(dateKey / 1000),
        "html": $("#timeTable_content").html()
    };

    if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
        timeTableService.saveTimeTable(data).done(function (response) {
            data.primaryKey = response.primaryKey;
            localDB.indexedDB.addElement(data, timeTable);
        });
    }else {
        localDB.indexedDB.addElement(data, timeTable);
    }

    $("#timeTable_content").data("modified", false);
    return dateKey;
}

function restoreEducationalReferenceContent() {
    $("#timeTable_panel .educational_reference_innerContent").each(function (index, trElement) {
        var successMainFunction = function (data) {
            $(data.Exercises).each(function (exerciseIndex, exercise) {
                if (!stringIsNullOrEmpty(exercise.TeacherMaterials.EducationalReference)
                            && exercise.TeacherMaterials.EducationalReference.length > 0) {

                    $(exercise.TeacherMaterials.EducationalReference).each(function (referenceIndex, referenceElement) {
                        if ($(trElement).data("lesson") == exercise.Lesson
                                && $(trElement).data("exercise") == exercise.Number
                                && $(trElement).data("index") == referenceIndex) {

                            var formstring = '<div class="timeTable_icon timeTable_minus_icon"></div>'
                                                + formArrayToString(referenceElement);
                            $("#" + referenceIndex + "_" + exerciseIndex + "_form").html(formstring);

                            var path = "../Media/Lessons/L_" + exercise.Lesson + "/Resources/Text/" + referenceElement.FileName;
                            loadTimeTableText(referenceIndex, exerciseIndex, path);

                            var materialString = referenceElement.Material;
                            $("#" + referenceIndex + "_" + exerciseIndex + "_material").html(materialString);

                            var timeString = '<div class="timeTable_icon timeTable_plus_icon"></div>'
                                                        + referenceElement.Time;
                            $("#" + referenceIndex + "_" + exerciseIndex + "_time").html(timeString);

                            $(trElement).removeAttr("data-changed").removeData("changed")
                                .find("td").removeAttr("data-changed").removeData("changed");
                        }
                    });

                }
            });

            $(trElement).find(".timeTable_minus_icon, .timeTable_plus_icon").each(function (iconIndex, iconElement) {
                adjustIconMargin(iconElement);
            });
            adjustButtons($(trElement));
        };

        loadExercisesJson(successMainFunction);
    });
    toggleRefreshButton("inactive");
}

function formArrayToString(referenceElement) {
    var tdString = "";
    $(referenceElement.Form).each(function (formIndex, formElement) {
        tdString += formElement;
        if (formIndex + 1 != referenceElement.Form.length) {
            tdString += ", ";
        }
    });
    return tdString;
}

function addEditorEvents(saveString, name) {
    $("#timeTable_content .educational_reference_table .educational_reference_innerContent td").unbind();
    $("#timeTable_content .educational_reference_table .educational_reference_innerContent").unbind().each(function (tableRowIndex, tableRowElement) {
        addTableRowClickEvent(tableRowElement);
    });

    toggleRefreshButton();
    setRestoreButtonVisibility();
    
    if (!stringIsNullOrEmpty(saveString)) {
        $("#timeTable_content").data("saveString", saveString);
        $("#timeTable_content").data("name", name);
    }else {
        $("#timeTable_content").removeData();
    }
    $("#timeTable_content").data("modified", false);
    hideToolsMenuEntries();
    toggleFileHandleOptionBox("show");
    setOnTimeTableClose();
}

function loadTableTowContentInEditor(elem) {
    $("#timeTable_content").data("modified", true);
    
    $("#editor")
                .data("name", "Lektion" + $(elem).data("lesson") + "_Aufgabe" + $(elem).data("exercise") + "-Methodisch-didaktische-Hinweise_" + (parseInt($(elem).data("index")) + 1))
                .data("savein", $(elem).attr("id"))
                .html($(elem).html());


    if (!stringIsNullOrEmpty($(elem).parent().data("changed")) && $(elem).parent().data("changed")) {
        $("#restore_original_text_container").show();
    } else {
        $("#restore_original_text_container").hide();
    }

    $("#editor").unbind().focusout(function () {
        var saveInElement = $("#" + $("#editor").data("savein"));

        if ($("#editor").html() != $(saveInElement).html()) {
            $("#restore_original_text_container").show();
        } else {
            $("#restore_original_text_container").hide();
        }
    });

    toggleEditor();
}

function addTableRowClickEvent(tableRowElement) {
    $(tableRowElement).find("td").click(function () {
        if ($(this).parent().hasClass("selected_row")) {
            loadTableTowContentInEditor($(this));
        } else {
            $(".educational_reference_table tr").removeClass("selected_row");
            $(this).parent().addClass("selected_row");
        }
    });
}

function selectBoxElements(element) {
    console.log("toggle until lesson");
    if ($(element).is(":checked")) {
        $("#timeTable_select_lastexercise, #timeTable_select_lastlesson").removeAttr('disabled');
    } else {
        $("#timeTable_select_lastexercise, #timeTable_select_lastlesson").attr('disabled', 'disabled');
    }
}

function loadTimeTableExerciseSelections(successFunction) {
    var successMainFunction = function (data) {
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
        $(data.Exercises).each(function (index, exerciseElement) {
            var exerciseTextNumber = stringIsNullOrEmpty(exerciseElement.DisplayName) ? parseInt(exerciseElement.Number) : exerciseElement.DisplayName;
            if (exerciseElement.Lesson == selectedFirstLesson && parseInt(exerciseElement.Number) >= 0) {
        
                $("#timeTable_select_firstexercise").append($("<option/>", {
                    value: exerciseElement.Number,
                    text: exerciseTextNumber
                }));
            }

            if (exerciseElement.Lesson == selectedLastLesson && parseInt(exerciseElement.Number) >= 0) {
                $("#timeTable_select_lastexercise").append($("<option/>", {
                    value: exerciseElement.Number,
                    text: exerciseTextNumber
                }));
            }
        });
        selectBoxElements("#timeTable_select_until");
        if (successFunction) {
            successFunction();
        }
    };

    loadExercisesJson(successMainFunction);
}




function setTimeTableSelections() {
    for (var i = 0; i < lessonIndexObjects.length; i++) {
        var lessonText = "";
        var currentLesson = lessonIndexObjects[i];
        lessonText = stringIsNullOrEmpty(currentLesson.DisplayName) ? parseInt(currentLesson.Number) : currentLesson.DisplayName;
        if (lessonText != "0")
            $("#timeTable_select_firstlesson, #timeTable_select_lastlesson").append("<option value='" + currentLesson.Number + "'>" + lessonText + "</option>");
    }
    
    loadTimeTableExerciseSelections();
}


function setOnTimeTableClose() {
    $("#exerciseView").unbind("dialogbeforeclose");
    $("#exerciseMenu").unbind("dialogbeforeclose");
    $("#exerciseMenu").on("dialogbeforeclose", function () {
        $("#exerciseMenu").unbind("dialogbeforeclose");
        $("#utilities").parent().addClass("activeMenuEntry");
        return false;
    });
   
    
    $("#exerciseView").on("dialogbeforeclose", function () {
        $("#exerciseView").unbind("dialogbeforeclose");
        //toggleFileHandleOptionBox("hide");
        //loadTimeTableView();

        if ($("#timeTable_content").data("modified") == false) {
            $("#exerciseMenu").unbind("dialogbeforeclose");
            loadTimeTableView();
            return false;
        }

        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

        $(dialogButtonArea).html("");

        $(dialogTextArea).html("<p class='bold'>Änderungen vor dem Schließen speichern?</p>");

        $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>7</span></div><span class='text'>Änderungen verwerfen</span></div>")
                    .click(function () {
                        $("#exerciseMenu").unbind("dialogbeforeclose");
                        $(dialog).dialog("close");
                        loadTimeTableView();
                    })
                    .appendTo($(dialogButtonArea));

        $("<div id='cancel_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                    .click(function () {
                        $(dialog).dialog("close");
                        setOnTimeTableClose();
                    })
                    .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
                    .click(function () {
                        $("#exerciseMenu").unbind("dialogbeforeclose");
                        $(dialog).dialog("close");
                        onSaveTimeTable(null, true);
                    })
                    .appendTo($(dialogButtonArea));

                    $(dialog).dialog({ width: 465, height: 100 });
                    if (isOSX())
                        $(".icon_container .icon").css("top", 0);
        $(dialog).dialog("open");

        return false;

    });
}
