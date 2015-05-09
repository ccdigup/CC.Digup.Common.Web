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
    $("#restart").hide();
    $("#set_answer").hide();
    if ($("#dnd_container #answerBoxes .optionBox").length > 0) {
        $("#check_answers").show();
		//$("#set_answer").show();
    } else {
        $("#check_answers").hide();
        //$("#set_answer").hide();
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
    var containsErrors = false;
    $("#dnd_container #answerBoxes .answerBox").each(function (answerBoxIndex, answerBox) {
        $(answerBox).find(".optionBox").each(function (optionIndex, option) {
            if (checkMatch(getBoxNumber(option), answerBox)) {
                $(option).addClass("correct");
				$(option).removeClass("error");
                //$("#set_answer").hide();
            } else {
                $(option).addClass("error");
				$(option).removeClass("correct");
                containsErrors = true;
                //$("#set_answer").show();
            }
        });
    });
    if(containsErrors)
	{
		$("#set_answer").show();
	}
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
		if(solutionArray.length > 0 && solutionArray[0] == '0'){
			$(this).each(function () {
				$(this).removeClass("error").removeClass("correct");
				$("#dnd_container").append($(this));
			}).sort(function () {
				return Math.floor(Math.random() * $("#dnd_container .optionBox").length);
			}).appendTo($('#dnd_container'));
		}
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