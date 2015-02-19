function loadAndShowTextElementsBox(saveInElement) {

    var successFunction = function (data) {
        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

        $(dialogButtonArea).html("");
        $(dialogTextArea).html(data);

        var ulElement = $("#textElements_list_container");
        $(ulElement).find(".element_link").unbind().html("");

        $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>").unbind()
                    .click(function () {
                        $(dialog).dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn' ><div class='icon_container'><span class='icon'>c</span></div><span class='text'>OK</span></div>").unbind()
                    .data("saveInElement", saveInElement)
                    .click(function () {
                        var loadSpecificTextElement = function (elementData) {
                            $(saveInElement).append(elementData.html);
                            $(dialog).dialog("close");
                        };

                        localDB.indexedDB.getTableElementByTag(textSnippet, $(ulElement).find(".active").first().data("primarykey"), "primaryKey", loadSpecificTextElement);

                    })
                    .appendTo($(dialogButtonArea));


        var innerSuccessFunction = function (result) {
            var liElement = $("<li data-primarykey=" + result.value.primaryKey + "  data-date=" + result.value.date + ">"
                + "<a data-primarykey=" + result.value.primaryKey + "  data-date=" + result.value.date + " class='element_link'>" + result.value.name + "</a>"
                + "</li>").click(function () {
                    $(ulElement).find(".element_link").each(function () {
                        $(this).removeClass("active");
                    });
                    $(this).find(".element_link").addClass("active");
                });
            $(ulElement).append(liElement);
        };

        localDB.indexedDB.getAllTableElements(textSnippet, innerSuccessFunction);


        $(dialog).dialog({ height: 430, width: 520 });
        if (isOSX())
            $(".icon_container .icon").css("top", 0);
        $(dialog).dialog("open");
    };

    loadSpecificHtml(digUPSettings.viewURIs["TextElements"], successFunction);
}

//TextElementsList

function initTextElementFunctions() {
    loadTextElementView();

}

function loadTextElementView() {
    var successFunction = function (data) {
        $("#exercise").html(data);
        $("#exerciseSplitter").hide();
        $("#exercise_content").html("");

        addTextElementButtonFunctionalities();
        loadCustomTextElements();
        if (isOSX()) {
            $("#exercise .textIcon a").css("margin-top", 1);
        }
    };

    loadSpecificHtml(digUPSettings.viewURIs["TextElementsList"], successFunction);
}


function createTextEditor(data, viewData) {
    var editorPrimaryKey = (viewData.primarykey);
    
    $("#editor")
        .data("primarykey", editorPrimaryKey)
        .data("name", viewData.name)
        .data("refresh", true)
        .html(data);
    toggleEditor();
}

function loadCustomTextElements() {
    var successFunction = function (result) {

        //if (result.length > 0) {
        $("#textElement_desciption").html("Öffnen Sie hier ein bestehendes Textelement, erstellen Sie ein neues,<br/> oder bearbeiten Sie die Textelement-Liste.");
        $(".tools_panel_content_entry").removeClass("disabled");
        $("#configure_textElement_btn").unbind().click(editTextElementList);
        //}

        var tableBox = $("#ownTextElements");
        $(result).each(function () {
            $(tableBox).append("<div class='ownTextElement' data-name='" + this.value.name + "' data-date='" + this.value.date + "' data-primarykey='" + this.value.primaryKey + "'><a>" + this.value.name + "</a></div>");
        });

        $(tableBox).find(".ownTextElement").unbind().click(function () {
            var viewData = $(this).data();
            var loadSpecificTimeTable = function (data) {

                createTextEditor(data.html, viewData);
               
            };

            localDB.indexedDB.getTableElementByTag(textSnippet, parseInt($(this).data("primarykey")), "primaryKey", loadSpecificTimeTable);
        });
    };

    disableMenuEntries();

    localDB.indexedDB.getAllTableElements(textSnippet, successFunction);
}

function disableMenuEntries() {
    $("#textElement_desciption").html("Erstellen Sie ein neues Arbeitsblatt.");
    $("#configure_textElement_btn").parent().addClass("disabled");
    $("#configure_textElement_btn").unbind();
    $("#ownTextElements_headline").parent().addClass("disabled");
}

function editTextElementList() {
    $("#ownTextElement_headline").after("<p id='ownTextElement_desc'>Löschen Sie einen Unterrichtsplaner mit -, duplizieren Sie einen bestehenden<br/>"
         + "mit +, oder bearbeiten den Namen eines Unterrichtsplaners.</p>");
    $("#ownTextElements .ownTextElement").each(function () {
        $(this).unbind();
        var linkContainerElement = $(this);
        var aElement = $(linkContainerElement).find("a");

        addTextElementDeleteElementToCustomTableList(linkContainerElement, aElement);
        addTextElementEditElementToCustomTableList(linkContainerElement, aElement);
        addTextElementDuplicateElementToCustomTableList(linkContainerElement, aElement);
    });
    $(this).hide();
    $("#end_configure_textElement_btn").show();
    $("#create_own_textElement_btn").parent().mask();
}

function addTextElementButtonFunctionalities() {
    $("#create_own_textElement_btn").unbind().click(function () {
        createTextEditor( null ,{ name: "", primarykey: -1 });
    });

    //$("#configure_textElement_btn").unbind().click(editTextElementList);

    $("#end_configure_textElement_btn").unbind().click(function () {

        $("#ownTextElement_desc").remove();

        $("#ownTextElements .ownTextElement").each(function () {
            $(this).find("div").unbind().remove();
        });

        $(this).hide();
        $("#configure_textElement_btn").show();
        $("#create_own_textElement_btn").parent().unmask();
        loadTextElementView();
    });
}

function addTextElementDeleteElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var deleteElement = $('<div class="textElement_icon textElement_delete_icon"></div>')
        .click(function (e) {
            e.stopPropagation();
            if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                textSnippetService.deleteTextSnippet($(linkContainerElement).data("primarykey")).done(function () {
                    deleteTextElement();
                });
            } else {
                deleteTextElement();
            }
            function deleteTextElement() {
                localDB.indexedDB.deleteElement($(linkContainerElement).data("primarykey"), textSnippet);

                $(linkContainerElement).find("a").unbind();
                $(linkContainerElement).find(".textElement_icon").unbind();
                $(linkContainerElement).remove();
            }
        });

    $(insertBeforeElement).before(deleteElement);

}


function addTextElementEditElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var editElement = $('<div class="textElement_icon textElement_edit_icon"></div>')
        .click(function (e) {
            e.stopPropagation();

            var dialog = $("#custom_modal_dialog");
            var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
            var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

            $(dialogButtonArea).html("");

            $(dialogTextArea).html("<p>Neuer Titel:<br/><input type='text' id='textElement_save_name' value='" + $(linkContainerElement).data("name") + "'/></p>");

            $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

            $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Umbenennen</span></div>")
            .click(function () {
                var nameVal = $("#textElement_save_name").val();

                if (!stringIsNullOrEmpty(nameVal)) {

                    var loadSpecificTextElement = function (data) {
                        data.name = nameVal;
                        data.primaryKey = parseInt($(linkContainerElement).data("primarykey"));
                        data.date = parseInt(parseInt(new Date().getTime()) / 1000);

                        var updateSuccessFunction = function (upadtedData) {
                            $(insertBeforeElement).text(nameVal);
                            $(dialog).dialog("close");
                        };

                        if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                            textSnippetService.saveTextSnippet(data).done(function () {
                                localDB.indexedDB.updateElement(data, textSnippet, updateSuccessFunction);
                            });
                        }else {
                            localDB.indexedDB.updateElement(data, textSnippet, updateSuccessFunction);
                        }
                    };

                    localDB.indexedDB.getTableElementByTag(textSnippet, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificTextElement);

                    $(dialog).dialog({ height: 145, width: 'auto' });
                    $(dialog).find(".errorText").remove();
                    $(dialog).dialog("close");
                } else {
                    $("#textElement_save_name").after("<br/><span class='errorText'>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span>");
                    $(dialog).dialog({ height: 165, width: 'auto' });
                }


            })
            .appendTo($(dialogButtonArea));

            $(dialog).dialog({ height: 115, width: 'auto' });
            $(dialog).dialog("open");

        });

    $(insertBeforeElement).before(editElement);
}

function addTextElementDuplicateElementToCustomTableList(linkContainerElement, insertBeforeElement) {
    var duplicateElement = $('<div class="textElement_icon textElement_plus_icon"></div>')
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
                    var tableBox = $("#ownTextElements");

                    var newElement = $("<div class='ownTextElement' data-name='" + insertedData.name + "' data-date='" + insertedData.date + "' data-primarykey='" + insertedData.primaryKey + "'><a>" + insertedData.name + "</a></div>");
                    $(newElement).click(function () {
                        var viewData = $(this).data();
                        var loadThisSpecificTextElement = function (data2) {

                            createTextEditor(data2.html, viewData);
                            //TODO: OPEN WORKBOOK ONCLICK
                        };

                        localDB.indexedDB.getTableElementByTag(textSnippet, viewData.primarykey, "primaryKey", loadThisSpecificTextElement);
                    });

                    var innerNewAElement = newElement.find("a");

                    addTextElementDeleteElementToCustomTableList(newElement, innerNewAElement);
                    addTextElementEditElementToCustomTableList(newElement, innerNewAElement);
                    addTextElementDuplicateElementToCustomTableList(newElement, innerNewAElement);

                    $(tableBox).append(newElement);

                };

                if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                    newData.primaryKey = 0;
                    textSnippetService.copyTextSnippet(newData).done(function (response) {
                        newData.primaryKey = response.primaryKey;
                        localDB.indexedDB.addElement(newData, textSnippet, innerSuccessFunction);
                    });
                } else {
                    localDB.indexedDB.addElement(newData, textSnippet, innerSuccessFunction);
                }
            };

            localDB.indexedDB.getTableElementByTag(textSnippet, parseInt($(linkContainerElement).data("primarykey")), "primaryKey", loadSpecificTimeTable);

        });

    $(insertBeforeElement).before(duplicateElement);
}
