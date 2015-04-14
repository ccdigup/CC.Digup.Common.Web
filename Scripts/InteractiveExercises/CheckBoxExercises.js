function setCheckBoxExerciseFunctionalities() {
    var showButtons = false;
    $("#check_answers").show();
    $(".answerBox input[type=checkbox]").change(function () {
        $(".answerBox input[type=checkbox]").each(function (index, elem) {
            if ($(elem).is(':checked')) {
                showButtons = true;
                return false;
            } else {
                showButtons = false;
            }
        });

        if(showButtons) {
            $("#check_answers").show();
        }else {
            $("#check_answers").show();
        }

    });

    $("#check_answers").unbind().click(checkCheckBoxAnswer);
    $("#restart").unbind().click(restartCheckBoxExercise);
    $("#set_answer").unbind().click(setCheckBoxExerciseAnswers);
}

function setCheckBoxExerciseAnswers() {
    $("#set_answer").hide();
    $("#check_answers").hide();

    $(".answerBox input[type=checkbox]").each(function (index, elem) {
        $(elem).removeClass("checkbox_error").attr('checked', $(elem).data("answer"));
    });
}

function restartCheckBoxExercise() {
    $(".answerBox input[type=checkbox]").each(function (index, elem) {
        $(elem)
            .removeClass("checkbox_correct")
            .removeClass("checkbox_error")
            .attr('checked', false);
    });
    
    $("#set_answer").hide();
    $("#restart").hide();
    $("#check_answers").show();
}

function checkCheckBoxAnswer() {
    var containsErrors = false;
    $(".answerBox input[type=checkbox]").each(function (index, elem) {
        if ($(elem).is(':checked') && $(elem).data("answer")) {
            $(elem).addClass("checkbox_correct");
        } else {
            if ($(elem).is(':checked')) {
                $(elem).addClass("checkbox_error");
            }else {
                $(elem).removeClass("checkbox_error").removeClass("checkbox_correct");
            }
            if ((!$(elem).is(':checked') && $(elem).data("answer")) || ($(elem).is(':checked') && !$(elem).data("answer"))) {
                containsErrors = true;
                $(elem).addClass("checkbox_error");
            }
        }
    });
    if(containsErrors) {
        $("#set_answer").show();
		$("#check_answers").show();
    }else {
		$("#check_answers").hide();
        $("#set_answer").hide();
    }
    $("#restart").show();
}