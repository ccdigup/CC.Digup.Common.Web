//Edited by EBT 26.11.2014 to fix DnD issue in Ipad
function setDnDTextFieldsExerciseFunctionalities() {
    //$("#optionBoxes").height($("#optionBoxes").height());

    // fix image dragging
    $('img').filter(':not([class~="optionBox"])').on('dragstart', function (e) {
        if ($(this).closest('.optionBox').length == 0)
            e.preventDefault();
    });

    var answerBoxHeight = 0;
    $("#dnd_container .optionBox").each(function () {
        $(this).draggable({
            revert: "invalid",
            helper: "clone",
            cursor: "move"
        });
        answerBoxHeight += 27;
    });

    $("#answerBoxes .answerBox").each(function () {
        if ($(this).hasClass("dynamicHeight")) {
            $(this).height(answerBoxHeight + 28);
        }
    });

    //$("#answerBoxes .answerBox").height(answerBoxHeight + 28);


    $("#dnd_container").droppable({
        drop: function (event, ui) {
            $(this).append(ui.draggable);
            _innercheckAnswers();
        }
    });

    $("#answerBoxes .answerBox").each(function () {
        $(this).droppable({
            drop: function (event, ui) {
                $(this).append(ui.draggable);
                _innercheckAnswers();
            }
        });
    });

    $("#check_answers").click(checkAnswersDnD);
    $("#set_answer").click(setAnswersDnD);
    $("#restart").click(restartDnD);
}

function _innercheckAnswers() {

    if ($("#dnd_container #answerBoxes .optionBox").length > 0) {
        $("#check_answers").show();
    } else {
        $("#check_answers").hide();
        $("#set_answer").hide();
    }
}

function restartDnD() {
    $("#dnd_container .optionBox").each(function () {
        $(this).removeClass("error").removeClass("correct");
        $("#dnd_container").append($(this));
    }).sort(function () {
        return Math.floor(Math.random() * $("#dnd_container .optionBox").length);
    }).appendTo($('#dnd_container'));;

    $("#restart").hide();
    $("#set_answer").hide();
}

function checkAnswersDnD() {
    $("#dnd_container #answerBoxes .answerBox").each(function (answerBoxIndex, answerBox) {
        $(answerBox).find(".optionBox").each(function (optionIndex, option) {
            if (checkMatch(getBoxNumber(option), answerBox)) {
                $(option).addClass("correct");
                $("#set_answer").show();
            } else {
                $(option).addClass("error");
                $("#set_answer").show();
            }
        });
    });
    $("#check_answers").hide();
    $("#restart").show();
}

function getBoxNumber(option) {
    var boxNumber = new Array();
    boxNumber.push($(option).data("boxnumber").toString());
    if (boxNumber[0].indexOf("/") != -1)
        boxNumber = boxNumber[0].split("/");

    return boxNumber;

}

function checkMatch(boxNumber, answerBox) {
    var isMatch = false;
    for (var i = 0; i < boxNumber.length; i++) {
        isMatch = isMatch == true ? isMatch : parseInt(boxNumber[i]) == $(answerBox).data("boxnumber");
    }
    return isMatch;

}

function setAnswersDnD() {
    $("#dnd_container .optionBox").each(function () {
        var currentOptionBox = this;
        var solutionArray = getBoxNumber(this);
        var isSet = false;
        for (var i = 0; i < solutionArray.length; i++) {
            if (!isSet) {
                var possibleSolutionTargets = $("#dnd_container").find(".answerBox[data-boxnumber='" + solutionArray[i] + "']");
                var firstUnUsed = null;
                $(possibleSolutionTargets).each(function () {
                    //check if this answer box already is used
                    var isUsed = $(this).find(".optionBox[data-boxnumber='" + solutionArray[i] + "']").length > 0;
                    
                    if (!isUsed) {
                        firstUnUsed = this;
                        return false;
                    }
                    return true;
                });

                if (firstUnUsed != null ) {
                    if (!$(currentOptionBox).hasClass('correct')) {
                        $(currentOptionBox).removeClass("error");
                        $(firstUnUsed).append(currentOptionBox);
                    }
                }
                else {
                    var firstMinMultiple = null
                        , min = 10000
                    ;

                    $(possibleSolutionTargets).each(function () {
                        //check if this answer box already is used
                        var length = $(this).find(".optionBox[data-boxnumber='" + solutionArray[i] + "']").length;
                        var isMultipleAnswerBox = $(this).data("ismultiple");
                        var isMultipleOptionBox = $(currentOptionBox).data("ismultiple");
                        if (length === 0) {
                            firstMinMultiple = this;
                            return false;
                        }

                        if (length < min && (isMultipleAnswerBox && !isMultipleOptionBox)) {
                            min = length;
                            firstMinMultiple = this;
                        }
                        return true;
                    });
                    if (firstMinMultiple != null && !$(currentOptionBox).hasClass('correct')) {
                        $(currentOptionBox).removeClass("error");
                        $(firstMinMultiple).append(currentOptionBox);
                    }
                }
            }
        }
    });

    $("#restart").show();
    $("#set_answer").hide();
}

/*
var dragElement = null;

function handleDragEnter(e) {
    this.className = 'over';
    return false;
}

function handleDragOver(e) {
    e.dataTransfer = e.originalEvent.dataTransfer; //set default for jquery
    if (e.preventDefault) {
        e.preventDefault();
    } // allows us to drop
    this.className = 'over';
    e.dataTransfer.dropEffect = 'move';
    
    return false;
}

function handleDragStart(e) {
    $(this).removeClass("correct");
    $(this).removeClass("error ");

    e.dataTransfer = e.originalEvent.dataTransfer; //set default for jquery
    $(this).addClass("opacity");

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text', $(this).prop('outerHTML'));

    $(this).addClass("moving");

    dragElement = this;
}

function handleDragEnter(e) {
    $(".answerBox").removeClass("over");
    $(this).addClass("over");
}

function handleDragLeave(e) {
    $(".answerBox").removeClass("over");
    $(this).removeClass("over");
}

function handleDragOver(e) {
    e.dataTransfer = e.originalEvent.dataTransfer; //set default for jquery
    if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
    }

    e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.

    return false;
}

function handleDrop(e) { 
    if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
    }

    e.dataTransfer = e.originalEvent.dataTransfer; //set default for jquery

    $(this).append(e.dataTransfer.getData('text'));

//    if($(this).children().length == 0)
//        $(this).append(e.dataTransfer.getData('text/html'));
//    else {
//        $("#optionBoxes").append(e.dataTransfer.getData('text/html'));
//    }
    return false;
}

function handleDragEnd(e) {
    e.dataTransfer = e.originalEvent.dataTransfer; //set default for jquery
    var countAnswerElement = 0;
    if (e.dataTransfer.dropEffect !== 'none') {
        $(this).remove();
        $("#answerBoxes .optionBox").each(function () {
            $(this).unbind().removeClass("over").removeClass("moving").removeClass("opacity").off()
            .on("dragstart", handleDragStart, null);
            $(this).on("dragenter", handleDragEnter, null);
            $(this).on("dragover", handleDragOver, null);
            $(this).on("dragleave", handleDragLeave, null);
            $(this).on("dragend", handleDragEnd, null);
            countAnswerElement++;
        });

        $("#dnd_container .optionBox").each(function () {
            $(this).unbind().removeClass("over").removeClass("moving").removeClass("opacity").off()
            .on("dragstart", handleDragStart, null);
            $(this).on("dragenter", handleDragEnter, null);
            $(this).on("dragover", handleDragOver, null);
            $(this).on("dragleave", handleDragLeave, null);
            $(this).on("dragend", handleDragEnd, null);
        });

    }

    /*var answerBoxLength = $("#dnd_container #answerBoxes .answerBox").length;

    if ($("#dnd_container .optionBox").filter(function () { return !$(this).parent().hasClass('answerBox'); }).length == 0
        || ($("#dnd_container #answerBoxes .answerBox").length < $("#dnd_container .optionBox[data-boxnumber='" + answerBoxLength + "']").length > 0
            && $("#dnd_container #answerBoxes .optionBox").length == answerBoxLength)) {#1#
    if ($("#dnd_container #answerBoxes .optionBox").length > 0) {
        $("#check_answers").show();
    } else {
        $("#check_answers").hide();
        $("#set_answer").hide();
    }

    $(".optionBox").css("-webkit-transform", "-webkit-transform: scale(1.0)").removeClass("over").removeClass("opacity").removeClass("moving"); ;
    $(".answerBox, #dnd_container").removeClass("over").removeClass("opacity").removeClass("moving");
}*/