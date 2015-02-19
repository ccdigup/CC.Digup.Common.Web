var markExerciseColor;

function setMarkableExerciseFunctionalities() {
     markExerciseColor = "red";

    $(".markableText").mouseup(function () {
        $(".markableText").attr("contenteditable", true);
        setSelectedText(markExerciseColor);
        $(".markableText").attr("contenteditable", false);

    });

    $(".colorPicker").mouseup(function () {
        $(".markableText").toggleClass("green");
        markExerciseColor = $(this).data("color");
    });

    $("#check_answers").unbind().click(checkMarkedAnswer);
    $("#restart").unbind().click(restartMarkableExercise);
    $("#set_answer").unbind().click(setMarkableExerciseAnswers);
}


function setSelectedText(color) {
    var selectedText = window.getSelection().toString().replace( /[\s\n\r]+/g , ' ').trim();
    selectedText = selectedText.replace(/[\s\n\r]+/g, ' ').trim();
    if (!stringIsNullOrEmpty(selectedText) && selectedText.length > 0) {
        document.execCommand("BackColor", false, color);
        $("#check_answers").show();
    }
}


function checkMarkedAnswer() {
    window.getSelection().empty();

    $(".markableText span").filter(function () {
        return ($(this).css("background-color").trim() == "rgb(255, 0, 0)" || $(this).css("background-color").trim() == "rgb(0, 128, 0)");
    }).each(function (index, elem) {
        var answer = $(elem).data("answer");
        if (!stringIsNullOrEmpty(answer))
            answer = answer.trim();
        if ($(elem).text().trim() == answer) {
            if ($(elem).data("color") == "green") {
                $(elem).addClass("markable_correct");
            }
            else {
                $(elem).addClass("markable_correct_red");
            }
        } else {
            if ($(elem).text().length > 0) {
                $(elem).addClass("markable_error");
            } else {
                $(elem).removeClass("markable_error").removeClass("markable_correct");
            }

        }
    });
   
    $("#set_answer").show();
   
    $("#restart").show();
}


function setMarkableExerciseAnswers() {
    window.getSelection().empty();
    $("#set_answer").hide();
    $("#check_answers").hide();

    $(".markableText").find("span").each(function (index, elem) {
        $(elem).removeClass("markable_correct")
            .removeClass("markable_correct_red")
            .removeClass("markable_error")
            .css("background-color", "transparent")
            .children()
            .each(function (i, child) {
                $(child).css("background-color", "transparent");
            });
    });

    $(".markableText .answerBox").each(function (index, elem) {
        if ($(elem).data("color") == "red") {
            $(elem).addClass("markable_correct_red");
        }else {
            $(elem).addClass("markable_correct");
        }
    });
}

function restartMarkableExercise() {
    window.getSelection().empty();
    $(".markableText").find("span").each(function (index, elem) {
        $(elem).removeClass("markable_correct")
            .removeClass("markable_correct_red")
            .removeClass("markable_error")
            .css("background-color", "transparent")
            .children()
            .each(function (i, child) {
                $(child).css("background-color", "transparent");
            });
    });
   
    $("#set_answer").hide();
    $("#restart").hide();
    $("#check_answers").hide();
}


