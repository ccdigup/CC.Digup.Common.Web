function initCrosswordFunctions() {
    loadCrosswordView();

}

function loadCrosswordView() {
    var successFunction = function (data) {
        $("#exercise").html(data);
        $("#exerciseSplitter").hide();
        $("#exercise_content").html("");

        addCrosswordButtonFunctionalities();
        loadCustomCrosswords();
        if (isOSX()) {
            /* Changed by AR: added line-height */
            $("#exercise .textIcon a").css({"margin-top": 1, "line-height": "26px"});
        }
    };
    
    loadSpecificHtml(digUPSettings.viewURIs["Crosswords"], successFunction);
}




function loadCustomCrosswords() {
    var successFunction = function (result) {

        //if (result.length > 0) {
        $("#crossword_desciption").html("Öffnen Sie hier ein bestehendes Kreuzworträtsel, erstellen Sie ein neues,<br/> oder bearbeiten Sie die Kreuzworträtsel-Liste.");
        $(".tools_panel_content_entry").removeClass("disabled");
        $("#configure_crossword_btn").unbind().click(editCrosswordList);
        //}

        var tableBox = $("#ownCrosswords");
        $(result).each(function () {
            $(tableBox).append("<div class='ownCrossword' data-name='" + this.value.name + "' data-date='" + this.value.date + "' data-primarykey='" + result.primaryKey + "'><a>" + this.value.name + "</a></div>");
        });

        $(tableBox).find(".ownCrossword").unbind().click(function () {
            var viewData = $(this).data();
            var loadSpecificCrossword = function (data) {
                createCrosswordGenerator(data, viewData);
                toggleCrosswordEditor();
            };

            localDB.indexedDB.getTableElementByTag(crossword, parseInt($(this).data("primarykey")), "primaryKey", loadSpecificCrossword);
        });
    };

    disableMenuEntries();


    localDB.indexedDB.getAllTableElements(crossword, successFunction);
}

function disableMenuEntries() {
    $("#crossword_desciption").html("Erstellen Sie ein neues Kreuzworträtsel.");
    $("#configure_crossword_btn").parent().addClass("disabled");
    $("#configure_crossword_btn").unbind();
    $("#ownCrosswords_headline").parent().addClass("disabled");
}

function editCrosswordList() {
    $("#ownCrossword_headline").after("<p id='ownCrossword_desc'>Löschen Sie einen Kreuzworträtsel mit -, duplizieren Sie einen bestehenden<br/>"
         + "mit +, oder bearbeiten den Namen eines Kreuzsworträtsel.</p>");
    $("#ownCrosswords .ownCrossword").each(function () {
        $(this).unbind();
        var linkContainerElement = $(this);
        var aElement = $(linkContainerElement).find("a");

        addCrosswordDeleteElementToCustomTableList(linkContainerElement, aElement);
        addCrosswordEditElementToCustomTableList(linkContainerElement, aElement);
        addCrosswordDuplicateElementToCustomTableList(linkContainerElement, aElement);
    });
    $(this).hide();
    $("#end_configure_crossword_btn").show();
    $("#create_own_crossword_btn").parent().mask();
}

function addCrosswordButtonFunctionalities() {
    $("#create_own_crossword_btn").unbind().click(function () {
        createCrosswordGenerator();
        toggleCrosswordEditor();
    });
    
    $("#end_configure_crossword_btn").unbind().click(function () {

        $("#ownCrossword_desc").remove();

        $("#ownCrosswords .ownCrossword").each(function () {
            $(this).find("div").unbind().remove();
        });

        $(this).hide();
        $("#configure_crossword_btn").show();
        $("#create_own_crossword_btn").parent().unmask();
        loadCrosswordView();
    });
}

function addCrosswordDeleteElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var deleteElement = $('<div class="crossword_icon crossword_delete_icon"></div>')
        .click(function (e) {
            e.stopPropagation();

            localDB.indexedDB.deleteElement($(linkContainerElement).data("primarykey"), crossword);

            $(linkContainerElement).find("a").unbind();
            $(linkContainerElement).find(".crossword_icon").unbind();
            $(linkContainerElement).remove();
        });

    $(insertBeforeElement).before(deleteElement);

}


function addCrosswordEditElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var editElement = $('<div class="crossword_icon crossword_edit_icon"></div>')
        .click(function (e) {
            e.stopPropagation();

            var dialog = $("#custom_modal_dialog");
            var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
            var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

            $(dialogButtonArea).html("");

            $(dialogTextArea).html("<p>Neuer Titel:<br/><input type='text' id='crossword_save_name' value='" + $(linkContainerElement).data("name") + "'/></p>");

            $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

            $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Umbenennen</span></div>")
            .click(function () {
                var nameVal = $("#crossword_save_name").val();

                if (!stringIsNullOrEmpty(nameVal)) {

                    var loadSpecificCrossword = function (data) {
                        data.name = nameVal;
                        data.primaryKey = parseInt($(linkContainerElement).data("primarykey"));
                        data.date = parseInt(parseInt(new Date().getTime()) / 1000);

                        var updateSuccessFunction = function (upadtedData) {
                            $(insertBeforeElement).text(nameVal);
                            $(dialog).dialog("close");
                        };

                        localDB.indexedDB.updateElement(data, crossword, updateSuccessFunction);

                    };

                    localDB.indexedDB.getTableElementByTag(crossword, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificCrossword);

                    $(dialog).dialog({ height: 145, width: 'auto' });
                    $(dialog).find(".errorText").remove();
                    $(dialog).dialog("close");
                } else {
                    $("#crossword_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                    $(dialog).dialog({ height: 165, width: 'auto' });
                }


            })
            .appendTo($(dialogButtonArea));

            $(dialog).dialog({ height: 115, width: 'auto' });
            if (isOSX()) {
                $(".icon_container .icon").css("top", 0);
            }
            $(dialog).dialog("open");

        });

    $(insertBeforeElement).before(editElement);
}

function addCrosswordDuplicateElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var duplicateElement = $('<div class="crossword_icon crossword_plus_icon"></div>')
        .click(function (e) {
            e.stopPropagation();
            var dateKey = parseInt(new Date().getTime());

            var loadSpecificCrossword = function (data) {
                var newData = {
                    "primaryKey": dateKey,
                    "name": data.name + " kopie",
                    "date": parseInt(dateKey / 1000),
                    "html": data.html,
                    "horizontalWords": data.horizontalWords,
                    "verticalWords": data.verticalWords,
                    "solutionHtml": data.solutionHtml
                };

                var innerSuccessFunction = function (insertedData) {
                    var tableBox = $("#ownCrosswords");

                    var newElement = $("<div class='ownCrossword' data-name='" + insertedData.name + "' data-date='" + insertedData.date + "' data-primarykey='" + insertedData.primaryKey + "'><a>" + insertedData.name + "</a></div>");
                    $(newElement).click(function () {
                        var viewData = $(this).data();
                        var loadThisSpecificCrossword = function (crosswordData) {

                            createCrosswordGenerator(crosswordData, viewData);
                            toggleCrosswordEditor();
                        };

                        localDB.indexedDB.getTableElementByTag(crossword, parseInt($(this).data("primarykey")), "primaryKey", loadThisSpecificCrossword);
                    });

                    var innerNewAElement = newElement.find("a");

                    addCrosswordDeleteElementToCustomTableList(newElement, innerNewAElement);
                    addCrosswordEditElementToCustomTableList(newElement, innerNewAElement);
                    addCrosswordDuplicateElementToCustomTableList(newElement, innerNewAElement);

                    $(tableBox).append(newElement);

                };

                localDB.indexedDB.addElement(newData, crossword, innerSuccessFunction);
            };

            localDB.indexedDB.getTableElementByTag(crossword, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificCrossword);

        });

    $(insertBeforeElement).before(duplicateElement);
}

function createCrosswordGenerator(data, viewData) {
    $("#crosswordEditorView").dialog({
        dialogClass: "crosswordEditorViewPopup",
        draggable: false,
        resizable: false,
        modal: false,
        zIndex: 50,
        closeText: "x",
        create: function () {
            if (isOSX()) {
                $(".ui-icon-closethick").css("top", -1);

            }
        },
        autoOpen: false,
        beforeClose: function () {
            if ($("#crosswordEditor").data("modified") == true) {
                var dialog = $("#custom_modal_dialog");
                var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
                var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

                $(dialogButtonArea).html("");

                $(dialogTextArea).html("<p class='bold'>Änderungen vor dem Schließen speichern?</p>");

                $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>7</span></div><span class='text'>Änderungen verwerfen</span></div>")
                    .click(function () {
                        $("#crosswordEditor").data("modified", false);
                        $(dialog).dialog("close");
                        $("#crosswordEditorView").dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

                $("<div id='cancel_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                    .click(function () {
                        $(dialog).dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

                $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
                    .click(function () {
                        if (viewData != undefined && viewData.isworksheet != undefined && viewData.isworksheet == true) {
                            saveChanges();
                            $("#crosswordEditor").data("modified", false);
                            $(dialog).dialog("close");
                            $("#crosswordEditorView").dialog("close");
                        }
                        else if (!stringIsNullOrEmpty($("#crosswordEditor").data("name")) && !stringIsNullOrEmpty($("#crosswordEditor").data("primarykey"))) {
                            $("#btnCrossword_Save").click();
                            $("#crosswordEditor").data("modified", false);
                            $(dialog).dialog("close");
                            $("#crosswordEditorView").dialog("close");
                        } else {
                            $("#btnCrossword_SaveAs").click();
                        }

                    })
                    .appendTo($(dialogButtonArea));
                    if (isOSX())
                        $(".icon_container .icon").css("top", 0);
                $(dialog).dialog({ width: 465, height: 100 });
                $(dialog).dialog("open");

                return false;
            }
        },
        close: function () {
            $("#crosswordEditorMenu").dialog('close');
            $("#crosswordEditor").removeData();
            $(".ui-widget-overlay").css("z-index", 4);
            loadCrosswordView();
        },
        open: function () {
                /* Changed by AR: added line-height */
            if (isOSX())
                $("#crosswordEditorMenu .textIcon a").css({"margin-top": 1, "line-height": "26px"});

            $("#crosswordEditor").html('<table id="crosswordTable" class="crosswordTable"></table>');
            $("#crossword_panel .crosswordHints .crosswordHintsBoxHorizontal .crosswordHintsHorizontal").html("");
            $("#crossword_panel .crosswordHints .crosswordHintsBoxVertical .crosswordHintsVertical").html("");
            $("#crosswordEditor .crosswordTable").html("");
            $("#crosswordOwnVocabularyTable").html("");
            $("#crosswordEditor").data("crossworddata", data);
            $("#crosswordEditor").data("crosswordviewdata", viewData);
            $(".ui-widget-overlay").css("z-index", 20);


            if (!stringIsNullOrEmpty(data)) {
                $("#crosswordEditor").html(data.html);
                $(data.horizontalWords).each(function () {
                    appendVocabulary(this.word);
                });
                $(data.verticalWords).each(function () {
                    appendVocabulary(this.word);
                });
                $("#crossword_panel .crosswordHints").replaceWith(data.solutionHtml);
                $(".crosswordHint").click(function () {
                    $("#crosswordEditor").data("modified", true);
                    $(this).unbind();
                    $(this).removeClass("crosswordHint");
                    $("<div contenteditable='true' class='crosswordHintText' />").insertAfter(this).focus();
                });
            }
            setCrosswordMenuFunctionality();
            setCrossWordFunctionality();
            loadVocabularyFilteredByLesson("-1", setVocabularyBox);
            if (viewData != undefined) {
                if (!stringIsNullOrEmpty(viewData.name)) {
                    $("#crosswordEditor").data("name", viewData.name);
                    $("#crossword_name").html(viewData.name);
                }
                if (!stringIsNullOrEmpty(viewData.primarykey)) {
                    $("#crosswordEditor").data("primarykey", viewData.primarykey);
                    $("#btnCrossword_Save").removeClass("disabled");
                }
                else {
                    $("#btnCrossword_Save").unbind();
                    $("#btnCrossword_Save").addClass("disabled");
                    $("#btnCrossword_SaveAs").removeClass("disabled");
                }

                if (viewData.isworksheet != undefined && viewData.isworksheet == true) {
                    $("#btnCrossword_SaveChanges").show();
                    $("#crossword_name").html("Kreuzworträtsel bearbeiten");

                } else {
                    $("#btnCrossword_SaveChanges").hide();
                }

            } else {
                $("#btnCrossword_Save").unbind();
                $("#btnCrossword_Save").addClass("disabled");
                $("#btnCrossword_SaveAs").addClass("disabled");
                $("#btnCrossword_SaveChanges").hide();
                $("#crossword_name").html("Neues Kreuzworträtsel");
            }
        }
    });

    $("#crosswordEditorMenu").dialog({
        dialogClass: "crosswordEditorMenuPopup",
        draggable: false,
        resizable: false,
        zIndex: 50,
        closeText: null,
        create: function (event, ui) {
            $(ui).find(".ui-dialog-titlebar").remove();
            if (isOSX()) {
                $(".ui-icon-closethick").css("top", -1);
            }
                
                
        },
        close: function (event, ui) {
            
        },
        autoOpen: false
    });

}

function toggleCrosswordEditor() {
    if ($("#crosswordEditorMenu").dialog("isOpen")) {
        $("#crosswordEditorMenu").dialog('close');
        $("#crosswordEditorView").dialog('close');
    } else {
        $("#crosswordEditorMenu").dialog('open');
        $("#crosswordEditorView").dialog('open');
    }
}

function loadAndShowCrosswordsBox(saveInElement) {

    var dialog = $("#custom_modal_dialog");
    var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
    var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");
    $(dialogButtonArea).html("");
    $(dialogTextArea).html('<div id="crosswords_box" class="selection_box"> <h3 style="margin: 10px 19px; text-align: left;">Bitte Kreuzworträtsel auswählen</h3><div id="crosswords_content" class="selection_box_content"><ul id="crosswords_list_container" class="selection_box_list_container"></ul></div></div>');

    var ulElement = $("#crosswords_list_container");
    $(ulElement).find(".element_link").unbind().html("");

    $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>").unbind()
        .click(function() {
            $(dialog).dialog("close");
        })
        .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn' ><div class='icon_container'><span class='icon'>c</span></div><span class='text'>OK</span></div>").unbind()
        .data("saveInElement", saveInElement)
        .click(function () {
            var loadSpecificElement = function (elementData) {
                var crosswordToBeAdded = "crossword_" + elementData.name;
                var crosswordToBeAddedLegend = "crosswordLegend_" + elementData.name;

                $(saveInElement).append(elementData.html);
                $(saveInElement).append(elementData.solutionHtml);
                $("#workSheetEditor .crosswordTable").attr("id", crosswordToBeAdded);
                $("#workSheetEditor .crosswordHints").attr("id", crosswordToBeAddedLegend);
                $("#workSheetEditor .crosswordTable").data("crossworddata", elementData);
                 var viewData = { isworksheet: true, name: elementData.name };
                $("#workSheetEditor .crosswordTable").data("crosswordviewdata", viewData);
                

                $("#" + crosswordToBeAdded).css("width", 400);
                $("#" + crosswordToBeAdded).css("height", 400);
                
                $(saveInElement).data(crosswordToBeAdded, elementData);

                $("#workSheetEditor .crosswordTable, #workSheetEditor .crosswordHints").unbind().click(setActiveElement).click();

                $("#workSheetEditor .crosswordTable").unbind("dblclick").dblclick(function () {
                    createCrosswordGenerator($(this).data("crossworddata"),$(this).data("crosswordviewdata"));
                    toggleCrosswordEditor();
                });
                $("#workSheetEditor .crosswordHints").unbind("dblclick").dblclick(function () {
                    var id = "#crossword_" + this.id.split("_")[1];
                    createCrosswordGenerator($(id).data("crossworddata"), $(id).data("crosswordviewdata"));
                    toggleCrosswordEditor();

                });
                
                $(dialog).dialog("close");
            };

            localDB.indexedDB.getTableElementByTag(crossword, $(ulElement).find(".active").first().data("primarykey"), "primaryKey", loadSpecificElement);

        })
        .appendTo($(dialogButtonArea));


    var innerSuccessFunction = function(result) {
        var liElement = $("<li data-primarykey=" + result.value.primaryKey + "  data-date=" + result.value.date + ">"
            + "<a data-primarykey=" + result.value.primaryKey + "  data-date=" + result.value.date + " class='element_link'>" + result.value.name + "</a>"
            + "</li>").click(function() {
                $(ulElement).find(".element_link").each(function () {
                    $(this).removeClass("active");
                });
                $(this).find(".element_link").addClass("active");
            });
        $(ulElement).append(liElement);
    };

    localDB.indexedDB.getAllTableElements(crossword, innerSuccessFunction);


    $(dialog).dialog({ height: 430, width: 520 });
    if (isOSX())
        $(".icon_container .icon").css("top", 0);
    $(dialog).dialog("open");
}

function saveChanges() {
    
    var dateKey = parseInt(new Date().getTime());
    var crosswordname = $("#crosswordEditor").data("crosswordviewdata").name;
    if(stringIsNullOrEmpty(crosswordname)) {
        crosswordname = dateKey;
    }
    var crosswordidentifier = "#crossword_" + crosswordname  ;
    
    
    var currentCrosswordData = $("#crosswordEditor").data("crossworddata");
    if(stringIsNullOrEmpty(currentCrosswordData)) {
        currentCrosswordData = { };
    }
    currentCrosswordData.primaryKey = null;
    currentCrosswordData.name = crosswordname;
    currentCrosswordData.date = parseInt(dateKey/ 1000);
    currentCrosswordData.html = $("#crosswordEditor").html();
    currentCrosswordData.horizontalWords = stringIsNullOrEmpty(tableSpaceToBeSaved) ? currentCrosswordData.horizontalWords : tableSpaceToBeSaved.horizontalWords;
    currentCrosswordData.verticalWords = stringIsNullOrEmpty(tableSpaceToBeSaved) ?  currentCrosswordData.verticalWords : tableSpaceToBeSaved.verticalWords;
    currentCrosswordData.solutionHtml = $("#crossword_panel .crosswordHints")[0].outerHTML;


  
    $(crosswordidentifier).remove();
    $("#crosswordLegend_" + crosswordname).remove();


    $("#crosswordEditor .crosswordTable").attr("id", "crossword_" + crosswordname);
    $("#crossword_panel .crosswordHints").attr("id", "crosswordLegend_" + crosswordname);




    $("#workSheetEditor").append($("#crosswordEditor .crosswordTable").clone());
    $("#workSheetEditor").append($("#crossword_panel .crosswordHints").clone());

    $(crosswordidentifier).css("width", 400);
    $(crosswordidentifier).css("height", 400);


    $(crosswordidentifier).data("crossworddata", currentCrosswordData);
    $("#crosswordEditor").data("crossworddata", currentCrosswordData);
    
    var viewData = { isworksheet: true, name: crosswordname };
    $(crosswordidentifier).data("crosswordviewdata", viewData );
    $("#crosswordEditor").data("crosswordviewdata", viewData);
    
    $("#workSheetEditor .crosswordTable, #workSheetEditor .crosswordHints").unbind().click(setActiveElement).click();
    $("#workSheetEditor .crosswordTable").unbind("dblclick").dblclick(function() {
        createCrosswordGenerator($(crosswordidentifier).data("crossworddata"), $(crosswordidentifier).data("crosswordviewdata"));
        toggleCrosswordEditor();

    });
    $("#workSheetEditor .crosswordHints").unbind("dblclick").dblclick(function () {
        var id = "#crossword_" + this.id.split("_")[1];
        createCrosswordGenerator($(id).data("crossworddata"), $(id).data("crosswordviewdata"));
        toggleCrosswordEditor();

    });
}

function saveCrossword() {
    $(".ui-resizable-handle").remove();
    $(".ui-wrapper").remove();
    $(".crosswordActiveElement").removeClass("crosswordActiveElement");
    $(".crosswordHandler").unbind().remove();

    var primaryKey = $("#crosswordEditor").data("primarykey");
    var name = $("#crosswordEditor").data("name");
    var dateKey = parseInt(new Date().getTime());


    var loadSpecificCrossword = function (data) {
        data.primaryKey = primaryKey;
        data.name = name;
        data.date = parseInt(dateKey / 1000);
        data.html = $("#crosswordEditor").html();
        data.horizontalWords = stringIsNullOrEmpty(tableSpaceToBeSaved) ? $("#crosswordEditor").data("crossworddata").horizontalWords : tableSpaceToBeSaved.horizontalWords;
        data.verticalWords = stringIsNullOrEmpty(tableSpaceToBeSaved) ? $("#crosswordEditor").data("crossworddata").verticalWords : tableSpaceToBeSaved.verticalWords;
        data.solutionHtml = $("#crossword_panel .crosswordHints")[0].outerHTML;
        //data.crosswordData = JSON.stringify(tableSpaceToBeSaved);

        var updateSuccessFunction = function (upadtedData) {
            showExerciseViewNotification("Speichern erfolgreich", "success");
        };

        localDB.indexedDB.updateElement(data, crossword, updateSuccessFunction);

    };

    localDB.indexedDB.getTableElementByTag(crossword, primaryKey, "primaryKey", loadSpecificCrossword);

    $("#crosswordEditor").data("modified", false);
}

function setCrosswordMenuFunctionality() {
    $("#btnCrossword_Export").unbind().click(function () {
        transformCrosswordInHtml(); 
    });

    $("#btnCrossword_Print").unbind().click(function () {
        var printCrosswordContent = '<div id="crosswordTable_print_container">' + $("#crosswordEditor").html() + $("#crosswordHints").html() + '</div>';
        ShowPrintContentView(printCrosswordContent);
    });

    $("#btnCrossword_SaveChanges").unbind().click(saveChanges);

    $("#btnCrossword_Save").unbind().click(saveCrossword);

    $("#btnCrossword_SaveAs").unbind().click(function () {
        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

        $(dialogButtonArea).html("");

        $(dialogTextArea).html("<p class='bold'>Kreuzworträtsel speichern unter:<br/><input type='text' id='crossword_save_name'/></p>");

        $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .unbind().click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
            .unbind().click(function () {
                var nameVal = $("#crossword_save_name").val();



                if (!stringIsNullOrEmpty(nameVal)) {

                    $("#crosswordEditor").data("modified", false);

                    $(".ui-resizable-handle").remove();
                    $(".ui-wrapper").remove();
                    $(".crosswordActiveElement").removeClass("crosswordActiveElement");
                    $(".crosswordHandler").unbind().remove();


                    var dateKey = parseInt(new Date().getTime());
                    var data = {
                        "primaryKey": dateKey,
                        "name": nameVal,
                        "date": parseInt(dateKey / 1000),
                        "html": $("#crosswordEditor").html(),
                        "horizontalWords": tableSpaceToBeSaved.horizontalWords,
                        "verticalWords": tableSpaceToBeSaved.verticalWords,
                        "solutionHtml": $("#crossword_panel .crosswordHints")[0].outerHTML
                    };
                    $("#crosswordEditor").data("primarykey", dateKey);
                    $("#crosswordEditor").data("name", nameVal);
                    $("#btnCrossword_Save").removeClass("disabled");
                    $("#btnCrossword_Save").unbind().click(saveCrossword);



                    var errorFunction = function () {
                        showExerciseViewNotification("Speichern fehlgeschlagen. Der Name ist bereits vergeben", "error");
                        $(dialog).dialog("close");
                    };

                    var succesFunction = function () {
                        $(dialog).find(".errorText").remove();

                        $(dialog).dialog("close");
                        showExerciseViewNotification("Speichern erfolgreich", "success");
                        $("#crossword_name").html(nameVal);
                        $("#crosswordEditor").data("modified", false);
                    };

                    localDB.indexedDB.addElement(data, crossword, succesFunction, errorFunction);



                    


                } else {
                    $(dialog).find(".errorText").remove();
                    $("#crossword_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                    $(dialog).dialog({ height: 165, width: 'auto' });
                }
            })
            .appendTo($(dialogButtonArea));

        $(dialog).dialog({ height: 125, width: 'auto' });
        if (isOSX()) {
            $(".icon_container .icon").css("top", 0);
        }
        $(dialog).dialog("open");
    });
}

//crossword

var abc = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
var sortABC = ["a", "ä", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "ö", "p", "q", "r", "s", "t", "u", "ü", "v", "w", "x", "y", "z"];

function setVocabularyBox(data) {
    $("#crosswordVocabularyTable").html("");
    data = sortWordsAlphabetical(data);
    for (var i = 0; i < data.length; i++) {
        $("<tr><td>"+data[i]+"</td></tr>").click(function () {
            $(this).unbind().click(function () {
                $(this).toggleClass("selected");
            }).appendTo("#crosswordOwnVocabularyTable");
        }).appendTo($("#crosswordVocabularyTable"));
    }
}

function sortWordsAlphabeticalWithReplace(x, y) {
    x = findAndReplaceUmlaute(x.toLowerCase());
    y = findAndReplaceUmlaute(y.toLowerCase());

    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
};

function sortWordsAlphabetical(words) {
    return words.sort(sortWordsAlphabeticalWithReplace);
    
}

function sortTableSpaceByWordsRemaining(tableSpacesArrays) {
    return tableSpacesArrays.sort(function(a, b) {
        return (a.wordsRemaining - b.wordsRemaining);
    });
}

function sortWords(words) {
    return words.sort(function(a, b) {
        return -(a.length - b.length);
    });
}

function randomizeWords(words) {
    var i = words.length, j, temp;
    if (i === 0) return false;
    while (--i) {
        j = Math.floor(Math.random() * (i + 1));
        temp = words[i];
        words[i] = words[j];
        words[j] = temp;
    }
    
    return words;
}

var tableSpaceToBeSaved;
var tableSpaceArray = new Array();
var horizontalWords = new Array();
var verticalWords = new Array();
var xDimension = 15;
var yDimension = 15;
var retried = false;

function createTableSpace(words) {
    tableSpaceArray = new Array();
    horizontalWords = new Array();
    verticalWords = new Array();


    $("#crossword_panel .crosswordHintsHorizontal").html("");
    $("#crossword_panel .crosswordHintsVertical").html("");

    //define space and sort words bei length
    tableSpaceArray = new Array();
    $("#crosswordEditor .crosswordTable").html("");
    var tableHead = "<thead ><tr id='tableHead' class='tableHead' ><th></th></tr></thead>";
    $("#crosswordEditor .crosswordTable").append(tableHead);

    for (var i = 0; i <= yDimension; i++) {
        if (i != 0) //in first step only set header td & text else add row
            $("#crosswordEditor .crosswordTable").append("<tr id='crosswordTableRow_" + i + "' class='crosswordTableRow_" + i + "'><td class='crosswordRowIndex'>" + i + "</td></tr>");

        for (var j = 0; j < xDimension; j++) {

            if (i == 0) { //fill head

                $("#crosswordEditor .tableHead").append("<th>" + abc[j] + "</th>");
            } else { //fill body


                $("#crosswordEditor .crosswordTableRow_" + i).append("<td></td>");
            }
        }

    }
    //creates two dimensional array of crossword space used to fill 
    $("#crosswordEditor .crosswordTable tr").each(function() {
        var tds = new Array();
        $(this).find("td:not(.crosswordRowIndex)").each(function() {
            tds.push(this);
        });

        if (tds.length > 0)
            tableSpaceArray.push(tds);
    });
}

function createCrossWord(xDim, yDim, words) {
    //reset
    
    tableSpaceToBeSaved = {};
    horizontalWords = new Array();
    verticalWords = new Array();
    var sortedWords = sortWords(words);
    xDimension = sortedWords[0].length + 2;
    xDimension = Math.min(xDimension, 26);
    yDimension = sortedWords[0].length + 2;
    yDimension = Math.min(yDimension, 26);
    
    
    

    //creates two dimensional array of crossword space used to fill 
    createTableSpace(words);

    var tableSpaces = [];
    var orientation = "vertical";
    var initialWords = words;
    //try to set all words
   
    for (var k = 0; k < 200; k++) {
        if (k % 20 == 0) {
            yDimension++;
            xDimension++;
            xDimension = Math.min(xDimension, 26);
        }
        if (k >= 1) {

            words = randomizeWords(initialWords);
            createTableSpace(words);
        }
       
        for (var m = 0; m < 50; m++) {
            orientation = orientation == "vertical" ? "horizontal" : "vertical";
            words = setAllWords(words, orientation);

        }
        tableSpaces.push({ tableSpace: tableSpaceArray, wordsRemaining: words.length, horizontalWords: horizontalWords, verticalWords: verticalWords });
    }
    tableSpaces = sortTableSpaceByWordsRemaining(tableSpaces);
    tableSpaceToBeSaved = tableSpaces[0];
   
    drawTableSpace(tableSpaceToBeSaved.tableSpace);

    //alert if some words are missing
    if (tableSpaceToBeSaved.wordsRemaining > 0) {
        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

        $(dialogButtonArea).html("");

        $(dialogTextArea).html("<p>Es konnten nicht alle ausgewählten Wörter ins Kreuzworträtsel übernommen werden. Bitte ergänzen Sie weitere Wörter und versuchen Sie es noch einmal.</p>");

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Ok</span></div>")
                    .click(function () {
                            $(dialog).dialog("close");
                    })
                    .appendTo($(dialogButtonArea));
        if (isOSX())
            $(".icon_container .icon").css("top", 0);
        
        $(dialog).dialog({ width: 540, height: 104 });
        $(dialog).dialog("open");
    }
}

function drawTableSpace(tableSpaceToBeDrawn, isWorkSheet) {

    //set crossword head
    if (!isWorkSheet) {
        $("#crossword_panel .crosswordHints .crosswordHintsBoxVertical .crosswordHintsVertical").html("");
        $("#crossword_panel .crosswordHints .crosswordHintsBoxHorizontal .crosswordHintsHorizontal").html("");
        $("#crosswordEditor .crosswordTable").html("");
    } else {
        $("#workSheetEditor .crosswordHints .crosswordHintsBoxVertical .crosswordHintsVertical").html("");
        $("#workSheetEditor .crosswordHints .crosswordHintsBoxHorizontal .crosswordHintsHorizontal").html("");
        $("#workSheetEditor .crosswordTable").html("");
    }


    var crosswordContainerIdentifier = "#crosswordEditor";
    var crosswordHintsContainerIdentifier = "#crossword_panel .crosswordHints";
    if (isWorkSheet) {
        crosswordContainerIdentifier = "#workSheetEditor";
        crosswordHintsContainerIdentifier = "#workSheetEditor .crosswordHints";
    }
        
    
    var tableHead = "<thead ><tr id='tableHead' class='tableHead' ><th></th></tr></thead>";
    $(crosswordContainerIdentifier+ " .crosswordTable").append(tableHead);

    //draw crossword space
    for (var i = 0; i < tableSpaceToBeDrawn.length; i++) {
        if (i != 0) //in first step only set header td & text else add row
            $(crosswordContainerIdentifier +" .crosswordTable").append("<tr id='crosswordTableRow_" + i + "' class='crosswordTableRow_" + i + "'><td class='crosswordRowIndex'>" + i + "</td></tr>");

        for (var j = 0; j < tableSpaceToBeDrawn[i].length; j++) {
            if (i == 0) { //fill head
                $(crosswordContainerIdentifier +" .tableHead").append("<th>" + abc[j] + "</th>");
            } else { //fill body
                $(crosswordContainerIdentifier+ " .crosswordTableRow_" + i).append(tableSpaceToBeDrawn[i][j]);
                if (!stringIsNullOrEmpty($(tableSpaceToBeDrawn[i][j]).attr("startingpoint"))) {
                    var solutionBox = $(tableSpaceToBeDrawn[i][j]).attr("orientation") == "vertical" ? crosswordHintsContainerIdentifier + " .crosswordHintsBoxVertical .crosswordHintsVertical" : crosswordHintsContainerIdentifier + " .crosswordHintsBoxHorizontal .crosswordHintsHorizontal";
                    var otherSolutionBox = null;
                    if (!stringIsNullOrEmpty($(tableSpaceToBeDrawn[i][j]).attr("otherorientation")))
                        otherSolutionBox = $(tableSpaceToBeDrawn[i][j]).attr("otherorientation") == "vertical" ? crosswordHintsContainerIdentifier + " .crosswordHintsBoxVertical .crosswordHintsVertical" : crosswordHintsContainerIdentifier + " .crosswordHintsBoxHorizontal .crosswordHintsHorizontal";

                    var hint = $("<div class='crosswordHint'>" + $(tableSpaceToBeDrawn[i][j]).attr("startingpoint") + "</div>").click(function () {
                        $("#crosswordEditor").data("modified", true);
                        $(this).unbind();
                        $(this).removeClass("crosswordHint");
                        $("<div contenteditable='true' class='crosswordHintText' />").insertAfter(this).focus();
                    });
                    $(solutionBox).append(hint);
                    $(otherSolutionBox).append(hint.clone(true));

                }
            }
        }

    }
    removeLoadingOverlay();
    $("#crosswordEditor").data("modified", true);

}

function setAllWords(words, orientation) {
     var wordsToBeSetAgain = new Array();
    
    for (var k = 0; k < words.length; k++) {
        orientation = orientation == "vertical" ? "horizontal" : "vertical";
        var wordToRetry = findCollision(words[k], orientation);
        if (!stringIsNullOrEmpty(wordToRetry))
            wordsToBeSetAgain.push(wordToRetry);
    }
    return wordsToBeSetAgain;
    
}



function findCollision(word, direction) {
    var wordsToCollide = direction == "vertical" ? horizontalWords : verticalWords;
   
    var collisions = new Array();
    
    //place word with most length somewehere near the center
    if (horizontalWords.length == 0 && verticalWords.length == 0) {
        if ((direction == "vertical" && canBePlaced(word, Math.floor(xDimension / 2), Math.floor(yDimension / 2) - Math.floor(word.length / 2), direction))) {
            placeWord(word, Math.floor(xDimension / 2), Math.floor(yDimension / 2) - Math.floor(word.length / 2), direction);
            return null;
        }  
        else if(direction == "horizontal" && canBePlaced(word, Math.floor(xDimension / 2) - Math.floor(word.length / 2), Math.floor(yDimension / 2), direction)) {
            placeWord(word, Math.floor(xDimension / 2) - Math.floor(word.length / 2), Math.floor(yDimension / 2), direction);  
            return null;
        }
    }

    //check all words in desired orientation
    for (var i = 0; i < wordsToCollide.length; i++) {
        var wordToCheck = wordsToCollide[i];
      
        //check if word contains a letter in common
        for (var j = 0; j < wordToCheck.word.length; j++) {

            if (word.toLowerCase().indexOf(wordToCheck.word.toLowerCase()[j]) != -1) { //letter found
                var collisionOffSet = word.toLowerCase().indexOf(wordToCheck.word.toLowerCase()[j]);
                if (direction == "vertical") {
                    collisions.push({ wordObj: wordToCheck, collisionX: wordToCheck.posX + j, collisionY: wordToCheck.posY, posX: wordToCheck.posX + j, posY: wordToCheck.posY - collisionOffSet });
                } else {
                    collisions.push({ wordObj: wordToCheck, collisionX: wordToCheck.posX, collisionY: wordToCheck.posY + j, posX: wordToCheck.posX - collisionOffSet, posY: wordToCheck.posY + j });
                }
                continue;
            }
        }

    }
    
    for (var k = 0; k < collisions.length; k++) {
        if (canBePlaced(word, collisions[k].posX, collisions[k].posY, direction)) {
            placeWord(word, collisions[k].posX, collisions[k].posY, direction);
            return null;
        }
    }
    return word;
}

function canBePlaced(word, posX, posY, direction) {
    
    for (var i = 0; i < word.length; i++) {
        //if collision would be outside the tablespace
        if (posX >= xDimension || posX <= 0 || posY >= yDimension || posY <= 0) 
            return false;
        
        //if word  is to long to be placed at this collision
        if ((direction == "vertical" && (posX + word.length) > xDimension) || (direction == "horizontal" && (posY + word.length) > yDimension))
            return false;
        
        //check field before and after word
        if ((i == 0 && direction == "vertical" && tableSpaceArray[posY - 1][posX] != undefined && $(tableSpaceArray[posY - 1][posX]).hasClass("filled"))
            || (i == (word.length -1) && direction == "vertical" && tableSpaceArray[posY + 1] != undefined && tableSpaceArray[posY + 1][posX] != undefined && $(tableSpaceArray[posY + 1][posX]).hasClass("filled"))) {
            return false;
        }
        if ((i == 0 && direction == "horizontal" && tableSpaceArray[posY][posX - 1] != undefined && $(tableSpaceArray[posY][posX - 1]).hasClass("filled"))
            || (i == (word.length - 1) && direction == "horizontal" && tableSpaceArray[posY][posX + 1] != undefined && $(tableSpaceArray[posY][posX +  1]).hasClass("filled"))) {
            return false;
        }
        //if position is already filled
        if (tableSpaceArray[posY] != undefined && $(tableSpaceArray[posY][posX]).hasClass("filled") && word[i] != $(tableSpaceArray[posY][posX]).html())
            return false;
        //if field next to position is already filled
        if (direction == "vertical" && tableSpaceArray[posY] != undefined && tableSpaceArray[posY][posX - 1] != undefined && tableSpaceArray[posY][posX + 1] != undefined && ($(tableSpaceArray[posY][posX + 1]).hasClass("filled") || $(tableSpaceArray[posY][posX - 1]).hasClass("filled")) && word.toLowerCase()[i] != $(tableSpaceArray[posY][posX]).html().toLowerCase())
            return false;
        if (direction == "horizontal" && tableSpaceArray[posY + 1] != undefined && tableSpaceArray[posY - 1] != undefined && ($(tableSpaceArray[posY + 1][posX]).hasClass("filled") || $(tableSpaceArray[posY - 1][posX]).hasClass("filled")) && word.toLowerCase()[i] != $(tableSpaceArray[posY][posX]).html().toLowerCase())
            return false;
        
        //check next position
        if (direction == "vertical") {
            posY++;
        } else {
            posX++;
        }
    }
    return true;
}

function placeWord(word, posX, posY, direction) {
    var wordToAdd = { word: word, posX: posX, posY: posY };
    direction == "vertical" ? verticalWords.push(wordToAdd) : horizontalWords.push(wordToAdd);
    for (var i = 0; i < word.length; i++) {
        if (tableSpaceArray[posY] == undefined || tableSpaceArray[posY][posX] == undefined) {
 
            return false;
        }
        $(tableSpaceArray[posY][posX]).html(word[i]).attr("solution", word[i]).addClass("filled");
        if (i == 0) {
            $(tableSpaceArray[posY][posX]).attr("startingpoint", abc[posX].toUpperCase() + posY);
            if (stringIsNullOrEmpty($(tableSpaceArray[posY][posX]).attr("orientation"))) {
                $(tableSpaceArray[posY][posX]).attr("orientation", direction);
            } else {
                $(tableSpaceArray[posY][posX]).attr("otherorientation", direction);
            }
        }
        direction == "vertical" ? posY++ : posX++;
    }
}

function appendVocabulary(vocabularyToAdd) {
    if (!stringIsNullOrEmpty(vocabularyToAdd)) {
        $("<tr><td>" + vocabularyToAdd + "</td></tr>").click(function () {
            $(this).toggleClass("selected");
        }).appendTo($("#crosswordOwnVocabularyTable"));
        $("#inputOwnCrosswordVocabulary").val("");
    }
}

function setCrossWordFunctionality() {
    $("#selectCrosswordVocabularyLesson")[0].options.length = 0;
    $("#selectCrosswordVocabularyLesson").html('<option value="-1" >Alle Vokabeln</option>');
    for (var i = 0; i < lessonIndex.length; i++) {
        var lessonText = "";
        var currentLesson = lessonIndex[i];
        if (currentLesson.indexOf("_") != -1) {
            lessonText = parseFloat(currentLesson.substring(0, currentLesson.indexOf("_")));
            var lessonPlusCount = lessonText == 0 ? 0 : parseFloat(currentLesson.substring(currentLesson.indexOf("_") + 1));
            if (lessonPlusCount > 0) {
                if (lessonPlusCount > 1)
                    continue;
                
                lessonText = "MP" + parseFloat(currentLesson.substring(0, currentLesson.indexOf("_")));
            }
            } else {
            lessonText = parseFloat(currentLesson.replace("_", "."));
        }
        if (lessonText != "0") 
            $("#selectCrosswordVocabularyLesson").append("<option value='" + currentLesson + "'>" + lessonText + "</option>");
    }

    $("#selectCrosswordVocabularyLesson").unbind().change(function () {

        loadVocabularyFilteredByLesson($(this).val(), setVocabularyBox);
    });



    $("#btnCrosswordVocabulary_Add").unbind().click(function () {
        var vocabularyToAdd = $("#inputOwnCrosswordVocabulary").val();
        appendVocabulary(vocabularyToAdd);

    });

    

    $("#btnCrosswordVocabulary_Remove").unbind().click(function () {
        $("#crosswordOwnVocabularyTable tr.selected").each(function () {
            $(this).toggleClass("selected");
            $(this).unbind().click(function() {
                $(this).unbind().click(function() {
                    $(this).toggleClass("selected");
                }).appendTo("#crosswordOwnVocabularyTable");
            }).appendTo($("#crosswordVocabularyTable"));
        });
    });
    $("#btnCrosswordVocabulary_RemoveAll").unbind().click(function () {
        $("#crosswordOwnVocabularyTable tr").each(function () {
            $(this).removeClass("selected");
            $(this).unbind().click(function () {
                $(this).unbind().click(function () {
                    $(this).toggleClass("selected");
                }).appendTo("#crosswordOwnVocabularyTable");
            }).appendTo($("#crosswordVocabularyTable"));
        });
    });

    $("#btnCrosswordVocabulary_Create").unbind().click(function () {

        var words = new Array();
        $("#crosswordOwnVocabularyTable td").each(function () {
            words.push($(this).text());
        });
        $("#content").append("<div class='overlay'><span>Bitte warten...</span><img src='/css/images/ajax-loader.gif'/></div>");
        setTimeout(function () {
            $("#btnCrossword_SaveAs").removeClass("disabled");
            createCrossWord(15, 15, words);
        }, 2000);


    });

    $("#checkboxCrosswordToggleHide").unbind().change(function () {
        if (!$('#checkboxCrosswordToggleHide').prop('checked')) {
            $("#crosswordEditor .crosswordTable td.filled").html("");
            $('#checkboxCrosswordToggleHide').prop('checked', false);
        }
        else {
            $("#crosswordEditor .crosswordTable td.filled").each(function () {
                if (!stringIsNullOrEmpty($(this).attr("solution"))) {
                    $(this).html($(this).attr("solution"));
                }
            });
            $('#checkboxCrosswordToggleHide').prop('checked', true);
        }
    });

}

function transformCrosswordInHtml() {
    var suggestedFileName = "Kreuzworträtsel.html";
    if (!stringIsNullOrEmpty($("#crosswordEditor").data("name")))
        suggestedFileName = $("#crosswordEditor").data("name") + ".html";

    var crosswordEditor = $("#crosswordEditor").clone();
    $(crosswordEditor).find("#crosswordTable").addClass("print");
    var crossWordHints = $("#crosswordHints").clone();
    $(crossWordHints).addClass("print");
    
    var successFunction = function (data) {
        var html = data + '<div id="workSheetEditor_printLayout" style="top: 0px !important">' + crosswordEditor[0].outerHTML + crossWordHints[0].outerHTML + '</div>';

        savePrintContent(html, suggestedFileName);   
    };
    loadSpecificHtml(digUPSettings.viewURIs["Print"], successFunction);
}

