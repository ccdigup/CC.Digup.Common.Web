function loadEditorPopup() {
    $("#editorView").dialog({
        dialogClass: "editorViewPopup",
        draggable: false,
        resizable: false,
        zIndex: 30,
        width: 700,
        closeText: "x",
        create: function () {
            setEditorButtonFunctionalities();
            if (isOSX())
                $(".ui-icon-closethick").css("top", -1);
        },
        autoOpen: false,
        beforeClose: function () {
            //Clear all Table-selections
            $(".educational_reference_table tr").removeClass("selected_row");
            if (!stringIsNullOrEmpty($("#editor").data("remind_save")) && $("#editor").data("remind_save")) {

                var dialog = $("#custom_modal_dialog");
                var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
                var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");

                $(dialogButtonArea).html("");

                $(dialogTextArea).html("<p class='bold'>Änderungen vor dem Schließen speichern?</p>");

                $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>7</span></div><span class='text'>Änderungen verwerfen</span></div>")
                    .click(function () {
                        $("#editor").data("remind_save", false);
                        $(dialog).dialog("close");
                        $("#editorView").dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

                $("<div id='cancel_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
                    .click(function () {
                        $(dialog).dialog("close");
                    })
                    .appendTo($(dialogButtonArea));

                $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
                    .click(function () {
                        if ($("#editor_save_changes").is(":visible")) {
                            $("#editor").data("remind_save", false);
                            $(dialog).dialog("close");
                            $("#editor_save_changes").click();
                        } else {
                            if ($("#editor_saveas").is(":visible")) {
                                $("#editor").data("remind_save", false);
                                $(dialog).dialog("close");
                                $("#editor_saveas").click();
                            }
                        }


                    })
                    .appendTo($(dialogButtonArea));

                $(dialog).dialog({ width: 465, height: 100 });
                if (isOSX())
                    $(".icon_container .icon").css("top", 0);
                $(dialog).dialog("open");

                return false;
            }
            if (!stringIsNullOrEmpty($("#editor").data("refresh")))
                loadTextElementView();
        },
        close: function (e) {
            $("#editorMenu").dialog('close');
            $("#editor").attr("contenteditable", false);
            $("#editor").removeData();

            //Fix Overlay Z-Indexes
            $(".ui-widget-overlay").css("z-index", 4);

            $("#restore_original_text_container").hide();
            $("#editor").unbind();



        },
        open: function () {
            $("#editor").attr("contenteditable", true);

            $("#editor").keyup(function () {
                $(this).data("remind_save", true);
            });

            if (stringIsNullOrEmpty($("#editor").data("savein")) && (stringIsNullOrEmpty($("#editor").data("primarykey")) || parseInt($("#editor").data("primarykey")) <= 0)) {
                $("#editor_save_changes").hide();
                $("#editor_save_changes_inactive").show();
            } else {
                $("#editor_save_changes_inactive").hide();
                $("#editor_save_changes").show();
            }

            if (stringIsNullOrEmpty($("#editor").data("saveas")) && stringIsNullOrEmpty($("#editor").data("primarykey"))) {
                $("#editor_saveas").hide();
                $("#editor_saveas_inactive").show();
            } else {
                $("#editor_saveas_inactive").hide();
                $("#editor_saveas").show();
            }

            //Fix Overlay Z-Indexes
            $(".ui-widget-overlay").css("z-index", 25);

        }
    });

    $("#editorMenu").dialog({
        dialogClass: "editorMenuPopup",
        draggable: false,
        resizable: false,
        zIndex: 30,
        width: 250,
        closeText: null,
        create: function (event, ui) {
            $(ui).find(".ui-dialog-titlebar").remove();
        },
        close: function (event, ui) {

        },
        autoOpen: false
    });

}


function toggleEditor() {
    if($("#editorMenu").dialog( "isOpen" )) {
        $("#editorMenu").dialog('close');
        $("#editorView").dialog('close');
    }else {
        $("#editorMenu").dialog('open');
        $("#editorView").dialog('open');
    }
}

function changeFont(value) {
    document.execCommand("fontSize", false, value);
    var fontElements = document.getElementsByTagName("font");
    for (var i = 0, len = fontElements.length; i < len; ++i) {
        if (fontElements[i].size == value) {
            switch (value) {
            case 1:
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = "1.0em";
                break;
            case 2:
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = "1.25em";
                break;
            case 3:
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = "1.5em";
                break;
            default:
                fontElements[i].removeAttribute("size");
                fontElements[i].style.fontSize = "1.0em";
            }
         
        }
    }
}



function addUndoFunctionality() {
    $("#editor").data("databeforechange", $("#editor").html());
    $("#editor_undo_btn").unbind().click(function () {
        $("#editor").html($("#editor").data("databeforechange"));
    });
}

function setEditorButtonFunctionalities() {
    $("#editor_font_options button, #editor_fontFamily_options button, #editor_execute_options button").each(function() {
        $(this).click(function(e) {
            e.preventDefault();

            var dataTag = $(this).data('tag');

            switch (dataTag) {
            case 'insertImage':
                var src = "/Media/Lessons/L_00_4/Exercises/E_001.jpg";
                if (src) {
                    document.execCommand('insertImage', false, src);
                }
                break;
            case 'heading':
                changeFont($(this).data('value'));
                    //document.execCommand('formatBlock', false, '<' + $(this).data('value') + '>');
                break;
            default:
                document.execCommand($(this).data('tag'), false, $(this).data('value'));
            }
        });
    });

    $("#editor_insert_textSnippet").unbind().click(function() {
        loadAndShowTextElementsBox("#editor");
    });

    $(".editor_menu_group").click(function() {
        $(this).find("span").toggleClass("ui-icon-triangle-1-s ui-icon-triangle-1-e");
        $("#" + this.id + "_options").toggle("blind");
    });

    $("#editor_replaceWithUnderscore_btn").click(function () {

        var editor = $("#editor");
        var selectedText = window.getSelection().toString().replace(/[\s\n\r]+/g, ' ').trim();

        if (selectedText != "") {
            addUndoFunctionality();
            document.execCommand("removeFormat", false, null);
            var replaceText = selectedText.replace(/(\w)/g, '_').replace(/[äöüÄÖÜß]/g, "_");
            replaceSelection('<span style="letter-spacing: 2px;">' + replaceText + '</span>');

            var words = selectedText.match(/\S+/g);
            $(words).each(function () {
                $("#editor").append(" *" + this);
            });

        } /*else {
            var text = $(editor).text().replace(/[\s\n\r]+/g, ' ').trim();
            text = text.replace(/(\w)/g, '_').replace(/[äöüÄÖÜ]/g, "_");
            $("#editor").html("<p style='letter-spacing: 2px;'>" + text + "</p>");
        }*/
    });


    $("#editor_mixupPhrases_btn").click(function() {
        var selectedText = window.getSelection().toString().replace(/[\s\n\r]+/g, ' ').trim();
        selectedText = selectedText.replace(/[\s\n\r]+/g, ' ').trim();
        var phrases;
        var newString = "";

        if (selectedText != "") {
            addUndoFunctionality();
            //document.execCommand("removeFormat", false, null);
            phrases = selectedText.match(/[^\.!\?]+[\.!\?]+/g);
            phrases = sortElementsInArray(phrases);

            for (var i = 0; i < phrases.length; i++) {
                newString += phrases[i].trim() + " ";
            }
            replaceSelection("<p>" + newString + "</p>");

        } /*else {
            phrases = editorText.match(/[^\.!\?]+[\.!\?]+/g);
            phrases = sortElementsInArray(phrases);

            for (var i = 0; i < phrases.length; i++) {
                newString += phrases[i].trim() + " ";
            }

            $("#editor").html("<p>" + newString + "</p>");
        }*/
    });

    function getSelectionHTML() {
        var userSelection;
        if (window.getSelection) {
            // W3C Ranges
            userSelection = window.getSelection();
            // Get the range:
            if (userSelection.getRangeAt)
                var range = userSelection.getRangeAt(0);
            else {
                var range = document.createRange();
                range.setStart(userSelection.anchorNode, userSelection.anchorOffset);
                range.setEnd(userSelection.focusNode, userSelection.focusOffset);
            }
            // And the HTML:
            var clonedSelection = range.cloneContents();
            var div = document.createElement('div');
            div.appendChild(clonedSelection);
            return div.innerHTML;
        } else if (document.selection) {
            // Explorer selection, return the HTML
            userSelection = document.selection.createRange();
            return userSelection.htmlText;
        } else {
            return '';
        }
    }

    ;

    $("#editor_mixupWords_btn").click(function () {
      
        var editor = $("#editor");
        var selectedText = window.getSelection().toString().replace(/[\s\n\r]+/g, ' ').trim();
        var newString = "";
        var replaceTextArray;

        if (selectedText != "") {
            addUndoFunctionality();
            //document.execCommand("removeFormat", false, null);
            replaceTextArray = selectedText.split(/[\s]+/);

            replaceTextArray = sortElementsInArray(replaceTextArray);

            for (var i = 0; i < replaceTextArray.length; i++) {
                newString += replaceTextArray[i].trim() + " ";
            }

            replaceSelection(newString.trim());
        } //else {
        //            replaceTextArray = $(editor).text().replace( /[\s\n\r]+/g , ' ').trim().split(" ");
        //            replaceTextArray = sortElementsInArray(replaceTextArray);

        //            for (var i = 0; i < replaceTextArray.length; i++) {
        //                newString += replaceTextArray[i].trim() + " ";
        //            }

        //            $("#editor").html("<p>" + newString + "</p>");
        //        }

    });

    $("#editor_mixupCharacters_btn").click(function() {
        var editor = $("#editor");
        var selectedText = window.getSelection().toString().replace( /[\s\n\r]+/g , ' ').trim();
        var newString = "";

        if (selectedText != "") {
            addUndoFunctionality();
            document.execCommand("removeFormat", false, null);
            var wordArray = selectedText.split( /[\s]+/ );

            for (var i = 0; i < wordArray.length; i++) {
                var charArray = wordArray[i].trim().split( /(\w)/g );
                charArray = sortElementsInArray(charArray);

                var newWord = "";

                for (var a = 0; a < charArray.length; a++) {
                    newWord += charArray[a];
                }

                wordArray[i] = newWord;
            }

            for (var i = 0; i < wordArray.length; i++) {
                newString += " " + wordArray[i].trim();
            }

            replaceSelection(newString.trim());

        } /*else {
            var wordArray = $(editor).text().replace(/[\s\n\r]+/g, ' ').trim().split(/[^a-zA-Z]+/);

            for (var i = 0; i < wordArray.length; i++) {
                var charArray = wordArray[i].trim().split(/(\w)/g);
                charArray = sortElementsInArray(charArray);

                var newWord = "";

                for (var a = 0; a < charArray.length; a++) {
                    newWord += charArray[a];
                }

                wordArray[i] = newWord;
            }

            for (var i = 0; i < wordArray.length; i++) {
                newString += " " + wordArray[i].trim();
            }

            $(editor).html("<p>" + newString.trim() + "</p>");
        }*/
    });

    $("#editor_wordChain").click(function() {
        var editor = $("#editor");
        var selectedText = window.getSelection().toString().replace( /[\s\n\r]+/g , '').trim();

        if (selectedText != "") {
            addUndoFunctionality();
            document.execCommand("removeFormat", false, null);
            replaceSelection(selectedText);
        } /* else {
            $(editor).html($("#editor").html().replace(/[\s\n\r]+/g, ""));
        }*/
    });

    $("#editor_export").click(function () {
        transformImagesInHtml($("#editorView"), "Textelement.html");
    });

    $("#editor_print").click(function () {
        ShowPrintContentView('<div id="edit-text-print-container">' + $("#editor").html() + '</div>');
    });

    $("#editor_saveas").click(function () {
        var dialog = $("#custom_modal_dialog");
        var dialogTextArea = $(dialog).find("#custom_modal_dialog_content");
        var dialogButtonArea = $(dialog).find("#custom_modal_dialog_buttons");
        $(dialogButtonArea).css("margin-bottom", "10px");
        $(dialogButtonArea).html("");

        $(dialogTextArea).html("<div style='margin:10px 19px; text-align:left;'><h3>Bitte Textelement-Namen eingeben</h3><input style='width:480px; margin-top:10px; box-shadow: inset 1px 1px 3px #666; border: 1px solid #e2e2e2;' type='text' id='textSnippet_save_name'/></div>");

        $(dialogTextArea).append('<div style="margin:10px 19px;"><h3>Bereits vorhandene Textelemente:</hr3></div>');
        $(dialogTextArea).append('<div id="textElements_content" class="selection_box_content" style="height:220px;"><ul id="textElements_list_container" class="selection_box_list_container"></ul></div>');

        var innerSuccessFunction = function (result) {
            var liElement = $("<li data-primarykey=" + result.value.primaryKey + "  data-date=" + result.value.date + ">"
                + "<a  style='cursor:default;' data-primarykey=" + result.value.primaryKey + "  data-date=" + result.value.date + " class='textItem'>" + result.value.name + "</a>"
                + "</li>");
            $("#textElements_list_container").append(liElement);
        };

        localDB.indexedDB.getAllTableElements(textSnippet, innerSuccessFunction);


        $("<div id='close_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>x</span></div><span class='text'>Abbrechen</span></div>")
            .click(function () {
                $(dialog).dialog("close");
            })
            .appendTo($(dialogButtonArea));

        $("<div id='submit_custom_modal_dialog_btn'><div class='icon_container'><span class='icon'>c</span></div><span class='text'>Speichern</span></div>")
            .click(function () {
                var nameVal = $("#textSnippet_save_name").val();

                var textElements = $(".textItem");

                for (var i = 0; i < textElements.length; i++) {
                    var textItem = textElements[i];
                    if ($(textItem).text().trim() == nameVal.trim()) {
                        $(dialog).find(".errorText").remove();
                        $("#textSnippet_save_name").after("<div class='errorText'><br/><span>Der Name ist schon vergeben<br/>Bitte geben Sie einen anderen Namen ein, um die Auswahl zu speichern.</span></div>");
                        $(dialog).dialog({ height: 'auto', width: 'auto', dialogClass: "saveAsTextDialog custom_modal_dialog" });
                        return;
                    }
                }


                if (!stringIsNullOrEmpty(nameVal)) {

                    $("#editor").data("remind_save", false);

                    var dateKey = parseInt(new Date().getTime());

                    var data = {
                        "primaryKey": dateKey,
                        "name": nameVal,
                        "date": parseInt(dateKey / 1000),
                        "html": $("#editor").html()
                    };

                    var errorFunction = function () {
                        showExerciseViewNotification("Speichern fehlgeschlagen. Der Name ist bereits vergeben", "error");
                        $(dialog).dialog("close");
                    };

                    var succesFunction = function () {
                        $(dialog).find(".errorText").remove();

                        $(dialog).dialog("close");
                        $("#editor").data("primarykey", data.primaryKey);
                        $("#editor").data("name", nameVal);
                        $("#editor_save_changes_inactive").hide();
                        $("#editor_save_changes").show();
                        showExerciseViewNotification("Speichern erfolgreich", "success");
                    };

                    if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                        data.primaryKey = 0;
                        textSnippetService.saveTextSnippet(data).done(function (response) {
                            data.primaryKey = response.primaryKey;
                            localDB.indexedDB.addElement(data, textSnippet, succesFunction, errorFunction);
                        });
                    }
                    else {
                        localDB.indexedDB.addElement(data, textSnippet, succesFunction, errorFunction);
                    }


                } else {
                    $(dialog).find(".errorText").remove();
                    $("#textSnippet_save_name").after("<div class='errorText'><br/><span>Bitte geben Sie einen Namen ein,<br/>um die Auswahl zu speichern.</span></div>");
                    $(dialog).dialog({ height: 'auto', width: 'auto', dialogClass: "saveAsTextDialog custom_modal_dialog" });
                }
            })
            .appendTo($(dialogButtonArea));

        $(dialog).dialog({ height: 'auto', width: 'auto', dialogClass: "saveAsTextDialog custom_modal_dialog" });
        if (isOSX())
            $(".icon_container .icon").css("top", 0);
        $(dialog).dialog("open");

        //transformImagesInHtml($("#editor"), $("#editor").data("name") + ".html");
    });

    $("#editor_save_changes").click(function () {
        if (!stringIsNullOrEmpty($("#editor").data("primarykey"))) {
            var primaryKey = $("#editor").data("primarykey");
            var name = $("#editor").data("name");
            $("#editor").data("remind_save", false);
            var data = {
                "primaryKey": primaryKey,
                "name": name,
                "date": parseInt(parseInt(new Date().getTime()) / 1000),
                "html": $("#editor").html()
            };

            if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
                textSnippetService.saveTextSnippet(data).done(function () {
                    localDB.indexedDB.updateElement(data, textSnippet);
                    showExerciseViewNotification("Speichern erfolgreich", "success");
                });
            }else {
                localDB.indexedDB.updateElement(data, textSnippet);
                showExerciseViewNotification("Speichern erfolgreich", "success");
            }
            return true;
        }
        if (!stringIsNullOrEmpty($("#editor").data("savein"))) {
            var saveInElement = $("#" + $("#editor").data("savein"));
            var parentTrELement = $(saveInElement).parent();
            $("#editor").data("remind_save", false);

            if ($("#editor").html().trim() != $(saveInElement).html().trim()) {
                $("#workSheetEditor").data("modified", true); //different implementation in worksheet-editor...
                $(saveInElement).html($("#editor").html());

                $(saveInElement).parent().find(".timeTable_minus_icon, .timeTable_plus_icon").each(function (index, iconElement) {
                    adjustIconMargin(iconElement);
                });
                adjustButtons($(saveInElement).parent());


                if (parseInt($(saveInElement).parent().data("lesson")) < 9999) {
                    $(parentTrELement).attr("data-changed", true);
                    $(saveInElement).attr("data-changed", true);
                    toggleRefreshButton();
                }

            } else {
                $("#workSheetEditor").data("modified", false);
            }

            toggleEditor();
            $("#editor").unbind();
        }
    });
}


function sortElementsInArray(myArray) {
    var originalArray = myArray;
    var changedArray = false;
    do {
        myArray.sort(function (a, b) {
            return Math.random() - 0.5;
        });
        if(myArray[0] != originalArray[0]) {
            changedArray = true;
        }
    } while (changedArray);

    return myArray;
}

function replaceSelection(html) {
    
    var sel, range, node;

    if (typeof window.getSelection != "undefined") {
        sel = window.getSelection();

        if (sel.getRangeAt && sel.rangeCount) {
            range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            
            //delete resulting empty tags
            $("#editor p, #editor h1, #editor h2").each(function (i, el) {

                var contentHtml = $(el).html().replace(/\s+/, "");

                if ($(el).is(":empty") || contentHtml.length == 0) {
                    $(el).remove();
                }
            });


            if (range.createContextualFragment) {
                node = range.createContextualFragment(html);
            } else {
                var div = document.createElement("div"), child;
                div.innerHTML = html;
                node = document.createDocumentFragment();
                while ((child = div.firstChild)) {
                    node.appendChild(child);
                }
            }
            range.insertNode(node);
            
        }
    }
}

