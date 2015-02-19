function setComboBoxExerciseFunctionalities() {
    $("#combo_container #answerBoxes").find("select").each(function () {
        //$(this).keyup(checkInputFilling);
        $(this).change(checkComboBoxFilling);
    });
    $("#check_answers").click(checkComboBoxAnswers);
    $("#set_answer").click(setComboBoxAnswers);
    $("#restart").click(restartComboBoxAnswerExercise);
}

function restartComboBoxAnswerExercise() {
    $("#answerBoxes .answerBox").each(function () {
        $(this).find("select").first().val("").removeClass("correct").removeClass("error");
    });
    $("#restart").hide();
    $("#set_answer").hide();
}

function setComboBoxAnswers() {
    $("#combo_container .answerBox").each(function () {
        $(this).find("select").first()
            .val($(this).data("answer"))
            .removeClass("error");
    });

    $("#set_answer").hide();
}



function checkComboBoxFilling() {
    var isFilled = false;
    $(this).removeClass("correct").removeClass("error");
    $("#combo_container #answerBoxes").find("select").each(function () {
        if ($(this).val().toString() != "...") {
            isFilled = true;
        } else {
            isFilled = false;
            return false;
        }
    });

    if (isFilled) {
        $("#check_answers").show();
    }
}

function checkComboBoxAnswers() {
    var containsErrors = false;
    $("#combo_container .answerBox").each(function (index, answerBox) {
        if ($(answerBox).find("select").first().val() == $(answerBox).data("answer") ||
           $(answerBox).find("select").first().val().replace(".", ",") == $(answerBox).data("answer").replace(".", ",") ||
           parseFloat($(answerBox).find("select").first().val().replace(",", ".")) == parseFloat($(answerBox).data("answer").replace(",", "."))) {
            $(answerBox).find("select").first().addClass("correct");
        } else {
            containsErrors = true;
            $(answerBox).find("select").first().addClass("error");
        }
    });

    if (containsErrors) {
        $("#set_answer").show();
    } else {
        $("#set_answer").hide();
    }

    $("#check_answers").hide();
    $("#restart").show();
}