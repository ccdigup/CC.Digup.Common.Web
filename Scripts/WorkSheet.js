function initWorkSheetFunctions() {
  loadWorkSheetView();

}

function loadWorkSheetView() {
    var successFunction = function (data) {
        $("#exercise").html(data);
        $("#exerciseSplitter").hide();
        $("#exercise_content").html("");

        addWorkSheetButtonFunctionalities();
        loadCustomWorkSheets();
        if (isOSX()) {
        /* Changed by AR: added line-height */
            $("#exercise .textIcon a").css({"margin-top": 1, "line-height": "26px"});
        }
    };

    loadSpecificHtml(digUPSettings.viewURIs["WorkSheet"], successFunction);
}


function loadCustomWorkSheets() {
    var successFunction = function (result) {
        
        //if (result.length > 0) {
        $("#workSheet_desciption").html("Öffnen Sie hier ein bestehendes Arbeitsblatt, erstellen Sie ein neues,<br/>oder bearbeiten Sie die Arbeitsblatt-Liste.");
        $(".tools_panel_content_entry").removeClass("disabled");
        $("#configure_workSheet_btn").unbind().click(editWorkSheetList);
        //}

        var tableBox = $("#ownWorkSheets");
        $(result).each(function () {
            $(tableBox).append("<div class='ownWorkSheet' data-name='" + this.value.name + "' data-date='" + this.value.date + "' data-primarykey='" + this.value.primaryKey + "'><a>" + this.value.name + "</a></div>");
        });

        $(tableBox).find(".ownWorkSheet").unbind().click(function () {
            var viewData = $(this).data();
            var loadSpecificTimeTable = function (data) {

                createWorkSheetGenerator(data, viewData);
                toggleWorkSheetEditor();
            };

            localDB.indexedDB.getTableElementByTag(workSheet, parseInt($(this).data("primarykey")), "primaryKey", loadSpecificTimeTable);
        });
    };

    disableMenuEntries();
    

    localDB.indexedDB.getAllTableElements(workSheet, successFunction);
}

function disableMenuEntries() {
    $("#workSheet_desciption").html("Erstellen Sie ein neues Arbeitsblatt.");
    $("#configure_workSheet_btn").parent().addClass("disabled");
    $("#configure_workSheet_btn").unbind();
    $("#ownWorkSheets_headline").parent().addClass("disabled");
}

function editWorkSheetList() {
    $("#ownWorkSheet_headline").after("<p id='ownWorkSheet_desc'>Löschen Sie einen Unterrichtsplaner mit -, duplizieren Sie einen bestehenden<br/>"
         + "mit +, oder bearbeiten den Namen eines Unterrichtsplaners.</p>");
    $("#ownWorkSheets .ownWorkSheet").each(function () {
        $(this).unbind();
        var linkContainerElement = $(this);
        var aElement = $(linkContainerElement).find("a");

        addWorkSheetDeleteElementToCustomTableList(linkContainerElement, aElement);
        addWorkSheetEditElementToCustomTableList(linkContainerElement, aElement);
        addWorkSheetDuplicateElementToCustomTableList(linkContainerElement, aElement);
    });
    $(this).hide();
    $("#end_configure_workSheet_btn").show();
    $("#create_own_workSheet_btn").parent().mask();
}

function addWorkSheetButtonFunctionalities() {
    $("#create_own_workSheet_btn").unbind().click(function () {
        createWorkSheetGenerator();
        toggleWorkSheetEditor();
    });

    //$("#configure_workSheet_btn").unbind().click(editWorkSheetList);

    $("#end_configure_workSheet_btn").unbind().click(function () {

        $("#ownWorkSheet_desc").remove();

        $("#ownWorkSheets .ownWorkSheet").each(function () {
            $(this).find("div").unbind().remove();
        });

        $(this).hide();
        $("#configure_workSheet_btn").show();
        $("#create_own_workSheet_btn").parent().unmask();
        loadWorkSheetView();
    });
}

function addWorkSheetDeleteElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var deleteElement = $('<div class="workSheet_icon workSheet_delete_icon"></div>')
        .click(function (e) {
            e.stopPropagation();
            var primarykey = $(linkContainerElement).data("primarykey");

            if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                worksheetService.deleteWorksheet(primarykey).done(function () {
                    deleteWorksheet(primarykey);
                });
            } else {
                deleteWorksheet(primarykey);
            }
            function deleteWorksheet(id) {
                localDB.indexedDB.deleteElement(id, workSheet);
                $(linkContainerElement).find("a").unbind();
                $(linkContainerElement).find(".workSheet_icon").unbind();
                $(linkContainerElement).remove();
            }
        });

        $(insertBeforeElement).before(deleteElement);
      
}


function addWorkSheetEditElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var editElement = $('<div class="workSheet_icon workSheet_edit_icon"></div>')
        .click(function (e) {
            e.stopPropagation();

            var dialog = $("#custom_modal_dialog");
            var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
            var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

            $(dialogButtonArea).html("");

            $(dialogTextArea).html("<p>Neuer Titel:<br/><input type='text' id='workSheet_save_name' value='" + $(linkContainerElement).data("name") + "'/></p>");

            $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

            $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Umbenennen</span></div>")
            .click(function () {
                var nameVal = $("#workSheet_save_name").val();

                if (!stringIsNullOrEmpty(nameVal)) {

                    var loadSpecificWorkSheet = function (data) {
                        data.name = nameVal;
                        data.primaryKey = parseInt($(linkContainerElement).data("primarykey"));
                        data.date = parseInt(parseInt(new Date().getTime()) / 1000);

                        var updateSuccessFunction = function (upadtedData) {
                            $(insertBeforeElement).text(nameVal);
                            $(dialog).dialog("close");
                        };
                        if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                            worksheetService.saveWorksheet(data).done(function () {
                                localDB.indexedDB.updateElement(data, workSheet, updateSuccessFunction);
                            });
                        }else {
                            localDB.indexedDB.updateElement(data, workSheet, updateSuccessFunction);
                        }
                    };

                    localDB.indexedDB.getTableElementByTag(workSheet, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificWorkSheet);

                    $(dialog).dialog({ height: 145, width: 'auto' });
                    $(dialog).find(".errorText").remove();
                    $(dialog).dialog("close");
                } else {
                    $("#workSheet_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                    $(dialog).dialog({ height: 165, width: 'auto' });
                }


            })
            .appendTo($(dialogButtonArea));

            $(dialog).dialog({ height: 115, width: 'auto' });
            $(dialog).dialog("open");

        });

    $(insertBeforeElement).before(editElement);
}

function addWorkSheetDuplicateElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var duplicateElement = $('<div class="workSheet_icon workSheet_plus_icon"></div>')
        .click(function (e) {
            e.stopPropagation();
            var dateKey = parseInt(new Date().getTime());

            var loadSpecificTimeTable = function (data) {
                var newData = {
                    "primaryKey": dateKey,
                    "name": data.name + " kopie",
                    "date": parseInt(dateKey / 1000),
                    "html": data.html,
                    "crosswordsData": data.workSheetCrosswordsData
                };

                var innerSuccessFunction = function (insertedData) {
                    var tableBox = $("#ownWorkSheets");

                    var newElement = $("<div class='ownWorkSheet' data-name='" + insertedData.name + "' data-date='" + insertedData.date + "' data-primarykey='" + insertedData.primaryKey + "'><a>" + insertedData.name + "</a></div>");
                    $(newElement).click(function () {
                        var loadThisSpecificWorkSheet = function (htmlData) {
                            createWorkSheetGenerator(htmlData);
                            toggleWorkSheetEditor();
                            //TODO: OPEN WORKBOOK ONCLICK
                        };

                        localDB.indexedDB.getTableElementByTag(workSheet, parseInt($(this).data("primarykey")), "primaryKey", loadThisSpecificWorkSheet);
                    });

                    var innerNewAElement = newElement.find("a");

                    addWorkSheetDeleteElementToCustomTableList(newElement, innerNewAElement);
                    addWorkSheetEditElementToCustomTableList(newElement, innerNewAElement);
                    addWorkSheetDuplicateElementToCustomTableList(newElement, innerNewAElement);

                    $(tableBox).append(newElement);

                };

                if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                    newData.primaryKey = 0;
                    worksheetService.copyWorksheet(newData).done(function (response) {
                        newData.primaryKey = response.primaryKey;
                        localDB.indexedDB.addElement(newData, workSheet, innerSuccessFunction);
                    });
                } else {
                    localDB.indexedDB.addElement(newData, workSheet, innerSuccessFunction);
                }
            };

            localDB.indexedDB.getTableElementByTag(workSheet, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificTimeTable);

        });

    $(insertBeforeElement).before(duplicateElement);
}

//worksheet generator
function createWorkSheetGenerator(data, viewData) {
    $("#workSheetEditorView").dialog({
        dialogClass: "workSheetEditorViewPopup",
        draggable: false,
        resizable: false,
        zIndex: 25,
        closeText: "x",
        create: function () {
            if (isOSX())
                $(".ui-icon-closethick").css("top", -1);
        },
        autoOpen: false,
        beforeClose: function () {
            if ($("#workSheetEditor").data("modified") == true) {
                var dialog = $("#custom_modal_dialog");
                var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
                var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

                $(dialogButtonArea).html("");

                $(dialogTextArea).html("<p class='bold'>Änderungen vor dem Schließen speichern?</p>");

                $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>7</span></div><span class='text'>Änderungen verwerfen</span></div>")
                    .click(function () {
                        $("#workSheetEditor").data("modified", false);
                        $(dialog).dialog("close");
                        $("#workSheetEditorView").dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

                $("<div id='cancel_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                    .click(function () {
                        $(dialog).dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

                $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
                    .click(function () {

                        if (!stringIsNullOrEmpty($("#workSheetEditor").data("name")) && !stringIsNullOrEmpty($("#workSheetEditor").data("primarykey"))) {
                            $("#btnWorkSheet_Save").click();
                            $("#workSheetEditor").data("modified", false);
                            $(dialog).dialog("close");
                            $("#workSheetEditorView").dialog("close");
                        } else {
                            $("#btnWorkSheet_SaveAs").click();
                        }

                    })
                    .appendTo($(dialogButtonArea));

                    $(dialog).dialog({ width: 465, height: 100 });
                if(isOSX())
                    $(".icon_container .icon").css("top", 0);
                $(dialog).dialog("open");

                return false;
            }
        },
        close: function () {
            $("#workSheetEditorMenu").dialog('close');
            $("#workSheetEditor").removeData();
            $(".ui-widget-overlay").css("z-index", 4);
            loadWorkSheetView();
        },
        open: function () {
            $(".ui-widget-overlay").css("z-index", 20);
            if (!stringIsNullOrEmpty(data)) {
                $("#workSheetEditor").html(data.html);
                $(data.crosswordsData).each(function () {
                    $("#crossword_" + this.crosswordData.name).data("crossworddata", this.crosswordData);
                    $("#crossword_" + this.crosswordData.name).data("crosswordviewdata", this.crosswordViewData);
                });
            }

            else {
                $("#workSheetEditorFrame").html(

                          '<div class="workSheetPaddingLineTop"></div>' +
                          '<div class="workSheetPaddingLineRight"></div>' +
                               '<div class="workSheetPaddingLineBottom"></div>' +
                                    '<div class="workSheetPaddingLineLeft"></div>' +
                                        '<div contenteditable="false" id="workSheetEditor"  style="font-size: 1.0em;"/>'
               );
            }
            setWorkSheetFunctionality();


            if (viewData != undefined && !stringIsNullOrEmpty(viewData.name) && !stringIsNullOrEmpty(viewData.primarykey)) {
                $("#workSheetEditor").data("name", viewData.name);
                $("#workSheetEditor").data("primarykey", viewData.primarykey);
                $("#worksheet_name").html(viewData.name);
                //$("#btnWorkSheet_SaveAs").unbind();
                //$("#btnWorkSheet_SaveAs").addClass("disabled");
                $("#btnWorkSheet_Save").removeClass("disabled");
            } else {
                $("#btnWorkSheet_Save").unbind();
                $("#btnWorkSheet_Save").addClass("disabled");
                $("#btnWorkSheet_SaveAs").removeClass("disabled");
                $("#worksheet_name").html("Neues Arbeitsblatt");
            }


        }
    });

    $("#workSheetEditorMenu").dialog({
        dialogClass: "workSheetEditorMenuPopup",
        draggable: false,
        resizable: false,
        zIndex: 25,
        closeText: null,
        create: function (event, ui) {
            $(ui).find(".ui-dialog-titlebar").remove();
        },
        close: function (event, ui) {

        },
        autoOpen: false
    });

}

function toggleWorkSheetEditor() {
    if ($("#workSheetEditorMenu").dialog("isOpen")) {
        $("#workSheetEditorMenu").dialog('close');
        $("#workSheetEditorView").dialog('close');
    } else {
        $("#workSheetEditorMenu").dialog('open');
        $("#workSheetEditorView").dialog('open');
    }
}

function setActiveElement(e) {
    var setIndex = 0;
    $(".workSheetElement, .workSheetTextField,#workSheetEditor .crosswordHints,#workSheetEditor .crosswordTable").each(function () {
            setIndex = parseInt($(this).css("z-index")) > setIndex ? parseInt($(this).css("z-index")) : setIndex;
        });


    $(".workSheetActiveElement").removeClass("workSheetActiveElement");
    $(".workSheetHandler").unbind().remove();
    $(this).addClass("workSheetActiveElement");


    if (stringIsNullOrEmpty(setIndex) || setIndex == "auto")
        setIndex = 10;
    else {
        setIndex = parseInt(setIndex)+ 2;
    }
            
    $(this).css("z-index", setIndex);

    appendWorkSheetElementHandler(this.id, this);
    e.stopPropagation();

}

function openTextEditor() {
    var editorSaveInId = (this.id + "_editor");
    $("#editor")
        .data("savein", editorSaveInId)
        .html($(this).find(".workSheetTextField_editor").html());
    toggleEditor();
}

function appendWorkSheetElementHandler(elementId, element) {
    var handler = "<div  class='workSheetHandler workSheetHandler_delete'><span>x</span></div> <div  class='workSheetHandler workSheetHandler_resize'> <span>€</span></div>";
    if ($(element).hasClass("workSheetTextField")) {
        handler = "<div  class='workSheetHandler workSheetHandler_text workSheetHandler_delete'><span>x</span></div><div  class='workSheetHandler workSheetHandler_text workSheetHandler_resize workSheetHandler_text_resize'> <span>></span></div>  <div class='workSheetHandler workSheetHandler_text_edit'><span>Ö</span></div>";
    } else if($(element).hasClass("crosswordTable")) {
        handler = "<div  class='workSheetHandler workSheetHandler_text workSheetHandler_delete'><span>x</span></div><div  class='workSheetHandler workSheetHandler_resize'> <span>€</span></div> <div class='workSheetHandler workSheetHandler_text_edit'><span>Ö</span></div>";
    } else if ($(element).hasClass("crosswordHints")) {
       handler = "<div  class='workSheetHandler workSheetHandler_text workSheetHandler_delete'><span>x</span></div>";
    }
    $("#" + elementId).append(handler);

    if (isOSX())
        $(".workSheetHandler span").css("line-height", 1.35);

    addHandlerFunctionality(elementId);
}

function addHandlerFunctionality(elementId) {
    $("#workSheetEditor .crosswordTable, #workSheetEditor .crosswordHints").draggable({ containment: "#workSheetEditor", scroll: false, start: function (event, ui) { $("#workSheetEditor").data("modified", true); } });
    $("#workSheetEditor .crosswordTable").resizable({ start: function (event, ui) { $("#workSheetEditor").data("modified", true); } });
    
    $(".draggableContainer").draggable({ containment: "#workSheetEditor", scroll: false, start: function (event, ui) { $("#workSheetEditor").data("modified", true); } });
    $(".workSheetImage").resizable({  containment: "#workSheetEditor", aspectRatio: true, start: function (event, ui) { $("#workSheetEditor").data("modified", true); } });
    $(".workSheetTextField").draggable({ handle: ".workSheetHandler_draggable", containment: "#workSheetEditor", scroll: false, start: function (event, ui) { $("#workSheetEditor").data("modified", true); } });
    $(".workSheetTextField").resizable({ handles: 'e', containment: "#workSheetEditor", start: function (event, ui) { $("#workSheetEditor").data("modified", true); } });

    $(".workSheetHandler_text_edit").unbind().click(function () {
        $(this).parent().dblclick();
    });

    $(".workSheetHandler_delete").unbind().click(function () {
        $(this).parent().remove();
    });
    
}

function collectCrosswordData() {
    var workSheetCrosswordsData = new Array();
    var workSheetCrosswords = $("#workSheetEditor .crosswordTable");
    $(workSheetCrosswords).each(function () {
        workSheetCrosswordsData.push({ crosswordData: $(this).data("crossworddata"), crosswordViewData: $(this).data("crosswordviewdata") });
    });
    return workSheetCrosswordsData;
}

function saveWorkSheet() {
    $(".ui-resizable-handle").remove();
    $(".ui-wrapper").remove();
    $(".workSheetActiveElement").removeClass("workSheetActiveElement");
    $(".workSheetHandler").unbind().remove();

    var primaryKey = $("#workSheetEditor").data("primarykey");
    var name = $("#workSheetEditor").data("name");
    var dateKey = parseInt(new Date().getTime());

    var loadSpecificWorkSheet = function (data) {
        var workSheetCrosswordsData = collectCrosswordData();

        data.primaryKey = primaryKey,
        data.name = name,
        data.date = parseInt(dateKey / 1000),
        data.html = $("#workSheetEditor").html(),
        data.crosswordsData = workSheetCrosswordsData;


        var updateSuccessFunction = function (upadtedData) {
            showExerciseViewNotification("Speichern erfolgreich", "success");
        };

        if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
            worksheetService.saveWorksheet(data).done(function () {
                localDB.indexedDB.updateElement(data, workSheet, updateSuccessFunction);
            });
        }else {
            localDB.indexedDB.updateElement(data, workSheet, updateSuccessFunction);
        }
    };

    localDB.indexedDB.getTableElementByTag(workSheet, primaryKey, "primaryKey", loadSpecificWorkSheet);

    $("#workSheetEditor").data("modified", false);
}

function getWorkSheetContent() {
    var workSheetEditor = $("#workSheetEditor");

    //set default height for printWindow if element hasn't moved
    $(workSheetEditor).find(".crosswordTable, .crosswordHints, .workSheetTextField").each(function (index, elem) {
        if (stringIsNullOrEmpty($(elem).attr('style')) || $(this).attr('style').indexOf('top') === -1) {
            $(elem).css("top", 164);
            if ($(this).attr('style').indexOf('left') === -1) {
                $(elem).css("left", 51);
            }
        }
    });

    var printContent = $(workSheetEditor).clone();

    $(printContent).find(".workSheetActiveElement").removeClass("workSheetActiveElement");
    $(printContent).find(".workSheetHandler").remove();
    $(printContent).find(".ui-resizable-handle").remove();

    return printContent;
}

function setWorkSheetFunctionality() {
    $("#btnWorkSheet_Export").unbind().click(function () {
        var suggestedFileName = "Arbeitsblatt.html";
        if (!stringIsNullOrEmpty($("#workSheetEditor").data("name")))
            suggestedFileName = $("#workSheetEditor").data("name") + ".html";

        transformWorkSheetInHtml(getWorkSheetContent(), suggestedFileName);
    });


    $("#btnWorkSheet_Print").unbind().click(function () {
        ShowPrintContentView('<div id="workSheetEditor_printLayout" style="height: ' + ($("#workSheetEditor").height() + 80) + 'px; max-width: 471px;">' + $(getWorkSheetContent()).html() + '</div>');
    });


    $("#btnWorkSheet_Save").unbind().click(saveWorkSheet);

    $("#btnWorkSheet_SaveAs").unbind().click(function () {
        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

        $(dialogButtonArea).html("");

        $(dialogTextArea).html("<p class='bold'>Arbeitsblatt speichern unter:<br/><input type='text' id='workSheet_save_name'/></p>");

        $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                    .unbind().click(function () {
                        $(dialog).dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
                    .unbind().click(function () {
                        var nameVal = $("#workSheet_save_name").val();

                        if (!stringIsNullOrEmpty(nameVal)) {

                            $("#workSheetEditor").data("modified", false);

                            $(".ui-resizable-handle").remove();
                            $(".ui-wrapper").remove();
                            $(".workSheetActiveElement").removeClass("workSheetActiveElement");
                            $(".workSheetHandler").unbind().remove();


                            var dateKey = parseInt(new Date().getTime());
                            var workSheetCrosswordsData = collectCrosswordData();
                            var data = {
                                "primaryKey": dateKey,
                                "name": nameVal,
                                "date": parseInt(dateKey / 1000),
                                "html": $("#workSheetEditor").html(),
                                "crosswordsData": workSheetCrosswordsData
                            };
                            $("#workSheetEditor").data("name", nameVal);
                            $("#btnWorkSheet_Save").removeClass("disabled");
                            $("#btnWorkSheet_Save").unbind().click(saveWorkSheet);

                            var errorFunction = function () {
                                showExerciseViewNotification("Speichern fehlgeschlagen. Der Name ist bereits vergeben", "error");
                                $(dialog).dialog("close");
                            };

                            var succesFunction = function () {
                                $(dialog).find(".errorText").remove();

                                $(dialog).dialog("close");
                                showExerciseViewNotification("Speichern erfolgreich", "success");
                                $("#worksheet_name").html(nameVal);
                                $("#workSheetEditor").data("modified", false);
                            };

                            if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                                data.primaryKey = 0;
                                worksheetService.saveWorksheet(data).done(function (response) {
                                    data.primaryKey = response.primaryKey;
                                    $("#workSheetEditor").data("primarykey", data.primaryKey);
                                    localDB.indexedDB.addElement(data, workSheet, succesFunction, errorFunction);
                                });
                            } else {
                                $("#workSheetEditor").data("primarykey", data.primaryKey);
                                localDB.indexedDB.addElement(data, workSheet, succesFunction, errorFunction);
                            }

                        } else {
                            $(dialog).find(".errorText").remove();
                            $("#workSheet_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                            $(dialog).dialog({ height: 165, width: 'auto' });
                        }
                    })
                    .appendTo($(dialogButtonArea));

        $(dialog).dialog({ height: 125, width: 'auto' });
        if (isOSX())
            $(".icon_container .icon").css("top", 0);
        $(dialog).dialog("open");
    });

    $("#workSheetEditor").click(function () {
        $(".workSheetHandler").unbind().remove();
        $(".workSheetActiveElement").removeClass("workSheetActiveElement");

    });


    $(".workSheetTextField, .draggableContainer, #workSheetEditor .crosswordTable, #workSheetEditor .crosswordHints").click(setActiveElement);

    $("#workSheetEditor .crosswordTable").unbind("dblclick").dblclick(function () {
        createCrosswordGenerator($(this).data("crossworddata"), $(this).data("crosswordviewdata"));
        toggleCrosswordEditor();

    });
    $("#workSheetEditor .crosswordHints").unbind("dblclick").dblclick(function () {
        var id = "#crossword_" + this.id.split("_")[1];
        createCrosswordGenerator($(id).data("crossworddata"), $(id).data("crosswordviewdata"));
        toggleCrosswordEditor();

    });

    $(".workSheetTextField").dblclick(openTextEditor);

    $(".workSheetEditor_menu_group").unbind().click(function () {
        $(this).find("span").toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-e");
        $("#" + this.id + "_options").toggle("blind");
    });

    $("#btnWorkSheet_AddCrossword").unbind().click(function () {
        createCrosswordGenerator(null, {isworksheet:true});
        toggleCrosswordEditor();
    });

    $("#btnWorkSheet_AddExistingCrossword").unbind().click(function () {
        loadAndShowCrosswordsBox($("#workSheetEditor"));
    });

    $("#btnWorkSheet_AddText").unbind().click(function () {
        var id = "workSheetTextField_" + ($("#workSheetEditor").children().length + 1);
        var editorFieldId = id + "_editor";
        var textField = "<div id='" + id + "' class='workSheetTextField'><div id='" + editorFieldId + "' class='workSheetTextField_editor' contenteditable='false'/> </div>";
        $("#workSheetEditor").append(textField);
        appendWorkSheetElementHandler(id, false);
        $("#workSheetEditor").data("modified", true);
        $("#" + id).click(setActiveElement).click();
        $("#" + id).dblclick(openTextEditor);
        
    });
    $("#btnWorkSheet_ImportText").unbind().click(function () {
        var id = "workSheetTextField_" + ($("#workSheetEditor").children().length + 1);
        var editorFieldId = id + "_editor";
        var textField = "<div id='" + id + "' class='workSheetTextField workSheetElement'><div id='" + editorFieldId + "' class='workSheetTextField_editor' contenteditable='false'/> </div>";
        $("#workSheetEditor").append(textField);
        appendWorkSheetElementHandler(id, false);
        loadAndShowTextElementsBox("#" + editorFieldId);
        $("#workSheetEditor").data("modified", true);
        $("#" + id).click(setActiveElement).click();
        $("#" + id).dblclick(openTextEditor);
        
       
    });

    if (digUPSettings.enableImageDownload) {
        $("#btnWorkSheet_AddImage").unbind().click(function() {

            var dialog = $("#custom_modal_dialog");
            var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
            var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");


            $(dialogButtonArea).html("");

            $(dialogTextArea).html("<p>Bild einfügen</p>");

            var successFunctionLessonFilterImage = function(data) {

                $(dialogTextArea).append(data);
                $("#show_selected_timeTable_material").parent().text("");
                $("#show_selected_timeTable_material").remove();

                var setImageDropDpwnHandler = function() {
                    console.log("add handler");
                    $("#image_select_firstlesson").unbind().change(function() {
                        $("#submit_custom_modal_dialog_btn").addClass("disabled");
                        setWorkSheetImageDropDownFilter();
                    });
                    $("#image_select_firstexercise").unbind().change(function() {
                        $("#submit_custom_modal_dialog_btn").addClass("disabled");
                        loadImagesForLessonAndExercise($("#image_select_firstlesson").val(), $("#image_select_firstexercise").val(), updateImages);
                    });


                    //trigger function
                    loadImagesForLessonAndExercise("01", "-1", updateImages);
                };

                setWorkSheetImageDropDownFilter(setImageDropDpwnHandler);
            };
            loadSpecificHtml(digUPSettings.viewURIs["LessonFilterImages"], successFunctionLessonFilterImage);

            $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                .unbind().click(function() {
                    $(dialog).dialog("close");
                })
                .appendTo($(dialogButtonArea));

            $("<div id='submit_custom_modal_dialog_btn' class='disabled'><div class='icon_container disabled'><span class='icon'>c</span></div><span class='text'>Ok</span></div>")
                .unbind().appendTo($(dialogButtonArea));

            $(dialog).css("overflow", "hidden");
            $(dialog).dialog({ width: 600, height: 340 });

            if (isOSX())
                $(".icon_container .icon").css("top", 0);
            $(dialog).dialog("open");
        });
    } else {
        $("#workSheetEditor_image").parent().parent().css("display", "none");
        $("#workSheet_header").text("Fügen Sie bestehende Texte oder Kreuzworträtsel ein oder erstellen Sie neue Texte und Kreuzworträtsel.");
        console.log($("#workSheet_header").text());
        console.log("changedText!");
    }
}

function setWorkSheetImageDropDownFilter(onSuccess) {

    var successMainFunction = function (data) {
        var lessons = new Array();
        var currentLesson = {};
        var currentExercise = {};
        var appendLessonsToFilter = $("#image_select_firstlesson").children("option").length < 1;
        $(data.Exercises).each(function() {
            if (currentExercise.Number != this.Number) {
                if (currentLesson != this.Lesson) {
                    currentLesson = this.Lesson;
                }
                if (this.Materials.Image.length > 0) {
                    console.log("images found");
                    if (lessons.indexOf(this.Lesson) == -1) {
                        var displayName = this.Lesson;
                        for (var i = 0; i < lessonIndexObjects.length; i++) {
                            if (lessonIndexObjects[i].Number == this.Lesson)
                                displayName = stringIsNullOrEmpty(lessonIndexObjects[i].DisplayName) ? this.Lesson : lessonIndexObjects[i].DisplayName;
                        }
                        if(appendLessonsToFilter){
                            $("#image_select_firstlesson").append("<option value='" + this.Lesson + "'>" + displayName + "</option>");
                        }
                        lessons.push(this.Lesson);
                    }
                }
            }
        });
        
        var selectedFirstLesson = $("#image_select_firstlesson option:selected").first().val();
       
        $("#image_select_firstexercise").html("");
        $("#image_select_firstexercise").append($("<option/>", {
            value: -1,
            text: "-alle-"
        }));
       
        $(data.Exercises).each(function (index, exerciseElement) {
            var displayName = stringIsNullOrEmpty(exerciseElement.DisplayName) ? parseInt(exerciseElement.Number) : exerciseElement.DisplayName;
            if (exerciseElement.Lesson == selectedFirstLesson && parseInt(exerciseElement.Lesson) > 0) {
                if ($("#image_select_firstexercise option:last-child").val() != exerciseElement.Number) {
                    if (exerciseElement.Materials.Image.length > 0) {
                        $("#image_select_firstexercise").append($("<option/>", {
                            value: exerciseElement.Number,
                            text: displayName
                        }));    
                    }
                    
                }
            }
          
        });
        if (onSuccess != undefined)
            onSuccess();
        else {
            loadImagesForLessonAndExercise(selectedFirstLesson, "-1", updateImages);
        }


    };
    loadExercisesJson(successMainFunction);
}

function addImageSubmitHandler() {
    addImage($(".workSheetSelectedImage").attr("src"));
    $("#custom_modal_dialog").dialog("close");
}

function addImage(source) {
    //src to get by selectView
    var id = "workSheetImage_" + ($("#workSheetEditor").children().length + 1);
    var containerId = "container_workSheetImage_" + ($("#workSheetEditor").children().length + 1);
    //"<div>"
    var img = "<div class='draggableContainer workSheetElement' style='display:inline !important; top:164px; left:51px; position:absolute; width:auto; height:auto;' id='" + containerId + "' ><img id='" + id + "' class='workSheetImage workSheetElement' style='width:200px; height:auto;' src='" + source + "'/><div>";

    $("#workSheetEditor").append(img);

    $(img).find("img").first().attr("src", source).one('load', function () {
        $("#" + containerId).click(setActiveElement).click();
    }).each(function () {
        if (this.complete) $(this).load();
    }); 

    $("#workSheetEditor").data("modified", true);
    
}


function updateImages(data) {
    $("#imageElements_content_table_row").html("");

    $(data.Images).each(function () {
        $("<div ><img src='/Media/Lessons/L_" + data.Lesson + "/Resources/Image/" + this + "'/></div>").unbind().click(function () {
            $(".workSheetSelectedImage ").removeClass("workSheetSelectedImage");
            $(this).find('img').first().addClass("workSheetSelectedImage");
            $("#submit_custom_modal_dialog_btn").removeClass("disabled").unbind().click(addImageSubmitHandler);
        }).appendTo($("#imageElements_content_table_row"));
    });
}

function transformWorkSheetInHtml(file, suggestedFileName) {
    var imageCount = $(file).find("img").length;
    var clonedFile = $(file).clone();
    if (imageCount > 0) {
        $(clonedFile).find("img").each(function (imageIndex, imageElement) {
            var elementSrc = $(imageElement).attr("src");

            $.ajax({
                type: "GET",
                url: elementSrc,
                async: true,
                mimeType: "text/plain; charset=x-user-defined",
                success: function (data) {
                    var dataType = elementSrc.split(".")[elementSrc.split(".").length - 1];
                    $(imageElement).attr("data-imagenr", imageIndex).attr("src", "data:image/" + dataType + ";base64," + base64Encode(data));
                    imageCount--;
                },
                error: function () {
                    //console.log("error requesting file");
                },
                complete: function () {
                    if (imageCount == 0) {
                        var successFunction = function (data) {
                            var html = data + '<div id="workSheetEditor_printLayout" style="height: ' + ($(clonedFile).height() + 80) + 'px; position: relative; top: -130px; max-width: 500px;">' + $(clonedFile).html() + '</div>';

                            savePrintContent(html, suggestedFileName);
                        };


                        loadSpecificHtml(digUPSettings.viewURIs["Print"], successFunction);

                        
                    }
                }
            });
        });
    } else {
        var successFunction = function (data) {
            var html = data + '<div id="workSheetEditor_printLayout" style="height: ' + ($(clonedFile).height() + 80) + 'px; position: relative; top: -130px; max-width: 500px;">' + $(clonedFile).html() + '</div>';

            savePrintContent(html, suggestedFileName);
        };


        loadSpecificHtml(digUPSettings.viewURIs["Print"], successFunction);

    }
}
 