function setRadioButtonExerciseFunctionalities() {
    $("#check_answers").click(function () {
		$("#check_answers").hide();
        var startIndex = 1;
        $("#CheckboxExercise input[type=radio]").each(function () {

            $("#CheckboxExercise").find("input[name=question" + startIndex + "]").each(function () {
                removeErrorHighlights(this);
                removeCorrectHighlights(this);
                if ($(this).is(':checked') && $(this).data("answer")) {
                    $("#CheckboxExercise").find("input[name=question" + startIndex + "]").parent().removeClass("error");
                    addCorrectHighlights(this);
                    return false;
                } else {
                    $("#CheckboxExercise").find("input[name=question" + startIndex + "]").parent().removeClass("correct");
                    if ($(this).is(':checked')) {
                        addErrorHighlights(this);
                        return false;
                    }
                }
            });
            startIndex++;
        });
        toggleSetAnswerButton();
        toggleRestartButton();
    });

    $("#set_answer").click(function () {

        $("#CheckboxExercise input[type=radio]").each(function () {
            //removeCorrectHighlights(this);
            removeErrorHighlights(this);
            if ($(this).data("answer")) {
                $(this).attr('checked', true);
            }
        });
        $("#restart").show();
        $("#set_answer").hide();
        //$("#check_answers").hide();
    });

    $("#restart").click(function () {
        $("#CheckboxExercise input[type=radio]").each(function () {
            $(this).attr('checked', false);
            removeCorrectHighlights(this);
            removeErrorHighlights(this);
        });
        $(this).hide();
        $("#set_answer").hide();
		$("#check_answers").show();
    });

    $(".answerInput").change(function () {
        toggleCheckAnswerButton();
    });

    $("#check_answers").show();
}

function toggleSetAnswerButton() {
    var isFilledOutAndWrong = false;
    var startIndex = 1;
    $("#CheckboxExercise input[type=radio]").each(function () {
        $("#CheckboxExercise").find("input[name=question" + startIndex + "]").each(function () {
            if ($(this).is(':checked') && $(this).parent().hasClass("error")) {
                isFilledOutAndWrong = true;
                return false;
            }
        });
        if (isFilledOutAndWrong) {
            return true;
        }
        startIndex++;
    });
    if (isFilledOutAndWrong) {
        $("#restart").show();
        $("#check_answers").hide();
        $("#set_answer").show();
    }
}

function toggleRestartButton() {
    var isFilledOutAndChecked = true;
    var startIndex = 1;
    $("#CheckboxExercise input[type=radio]").each(function () {
        $("#CheckboxExercise").find("input[name=question" + startIndex + "]").each(function () {
            if ($(this).is(':checked') && ($(this).parent().hasClass("correct") || $(this).parent().hasClass("error"))) {
                isFilledOutAndChecked = true;
                return false;
            } else {
                isFilledOutAndChecked = true;
            }
        });
        if (!isFilledOutAndChecked) {
            return false;
        }
        startIndex++;
    });
    if (isFilledOutAndChecked) {
        $("#restart").show();
        //$("#check_answers").hide();
    }
}

function toggleCheckAnswerButton() {
    var isFilledOutAndWrong = false;
    var startIndex = 1;
    $("#CheckboxExercise input[type=radio]").each(function () {
        $("#CheckboxExercise").find("input[name=question" + startIndex + "]").each(function () {
            if ($(this).is(':checked') && ($(this).parent().hasClass("correct") || $(this).parent().hasClass("error"))) {
                isFilledOutAndWrong = true;
                return false;
            } else {
                isFilledOutAndWrong = true;
            }
        });
        if (!isFilledOutAndWrong) {
            return false;
        }
        startIndex++;
    });
    if (isFilledOutAndWrong) {
        $("#check_answers").show();
    }
}

function addCorrectHighlights(element) {
    $(element).parent().addClass("correct");
}

function removeCorrectHighlights(element) {
    $(element).parent().removeClass("correct");
}

function removeErrorHighlights(element) {
    $(element).parent().removeClass("error");
}

function addErrorHighlights(element) {
    $(element).parent().addClass("error");
}