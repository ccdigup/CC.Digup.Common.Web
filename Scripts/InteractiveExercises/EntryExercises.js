function setEntryExerciseFunctionalities() {
    $("#entry_container #answerBoxes").find("input").each(function () {
        $(this).keyup(checkInputFilling);
    });
    $(document).on('click', hideHintView);
    
    $("#check_answers").click(checkEntryAnswers).after('<div class="hint-view" style="display:none"></div>');
    $("#set_answer").click(setEntryAnswers);
    $("#restart").click(resartEntryAnswerExercise);
    $("#check_answers").show();
}

function hideHintView() {
    $('.hint-view').hide();
}

function resartEntryAnswerExercise() {
    $("#answerBoxes .answerBox").each(function () {
        var $this = $(this);
        $this.find("input").first().val("").removeClass("right").removeClass("alternative").removeClass("wrong");
        $this.siblings('.hint').hide();
    });
    $("#restart").hide();
    $("#set_answer").hide();
	$("#check_answers").show();
}

function setEntryAnswers() {
    $("#entry_container .answerBox").each(function () {
        var $this = $(this);
        $this.find("input").first()
            .val($this.data("answer"))
            .removeClass("alternative").removeClass("wrong");
        $this.siblings('.hint').hide();
    });

    $("#set_answer").hide();
	$("#check_answers").hide();
}

function checkInputFilling() {
    var isFilled = true;
    var $this = $(this);
    $this.removeClass("right").removeClass("alternative").removeClass("wrong");
    $this.closest('.answerBox').siblings('.hint').hide();
    $("#entry_container #answerBoxes").find("input").each(function () {
        if ($(this).val() != "") {
            isFilled = true;
        } else {
            isFilled = true;
            return false;
        }
    });

    if (isFilled) {
        $("#check_answers").show();
    }
}

function checkEntryAnswers() {
    var containsErrors = false;
    $("#entry_container .answerBox").each(function (index, answerBox) {
        var $answerBox = $(answerBox);
        var meta = $answerBox.data('meta');
        if (!meta) {
            if ($answerBox.find("input").first().val() == $answerBox.data("answer") ||
                $answerBox.find("input").first().val().replace(".", ",") == $answerBox.data("answer").toString().replace(".", ",") ||
                parseFloat($answerBox.find("input").first().val().replace(",", ".")) == parseFloat($answerBox.data("answer").toString().replace(",", "."))) {
                $answerBox.find("input").first().addClass("right");
            } else {
                containsErrors = true;
                $answerBox.find("input").first().addClass("wrong");
            }
        } else {
            var punctCharRe = /(\.|,|;|:|\?|!|\u00BF|\u00A1)/g;
            var spaceCharRe = /\s{2,}/g;
            var results = $.map(meta.answers, function (answer) {
                var value = $answerBox.find("input:first").val();
                var pattern = answer.isMainValue ? $answerBox.data("answer") : answer.value;
                
                if (!pattern)
                    return;
                
                if (!!answer.isRegexp) {
                    if (pattern.charAt(0) !== '^')
                        pattern = '^' + pattern;
                    if (pattern.charAt(pattern.length - 1) !== '$')
                        pattern += '$';

                    pattern = new RegExp(pattern);
                }
                
                if (!(pattern instanceof RegExp)) {
                    // remove extra spaces
                    pattern = $.trim(pattern.replace(spaceCharRe, ' '));
                    value = $.trim(value.replace(spaceCharRe, ' '));
                    
                    if (!answer.caseSensitive) {
                        pattern = pattern.toLowerCase();
                        value = value.toLowerCase();
                    }
                    if (!answer.regardPunctChar) {
                        pattern = pattern.replace(punctCharRe, '');
                        value = value.replace(punctCharRe, '');
                    }
                }

                var match = value.match(pattern);
                if ((pattern instanceof RegExp && match !== null) ||
                    (!(pattern instanceof RegExp) && pattern === value))
                    return answer;
            });
            
            if (results.length > 0) {
                var res = results[0];
                var input = $answerBox.find("input:first");
                
                switch (res.rang) {
                    case 1:
                        input.addClass('right');
                        addHintOrShow($answerBox, 'hint-right', res.hint);
                        break;
                    case 2:
                        input.addClass('alternative');
                        addHintOrShow($answerBox, 'hint-alternative', res.hint);
                        break;
                    case 3:
                        containsErrors = true;
                        input.addClass("wrong");
                        addHintOrShow($answerBox, 'hint-wrong', res.hint);
                        break;
                }
            } else {
                containsErrors = true;
                $answerBox.find("input:first").addClass("wrong");
            }
        }
    });

    if (containsErrors) {
        $("#set_answer").show();
		$("#check_answers").show();
    } else {
        $("#set_answer").hide();
		$("#check_answers").hide();
    }
    $("#restart").show();
}

function addHintOrShow($answerBox, cssClass, hintText) {
    if (!!hintText) {
        var hint = $answerBox.siblings('.hint.' + cssClass);
        if (hint.length === 0) {
            var content = prepareHintContent(hintText);
            hint = $('<a class="hint">i</a>').addClass(cssClass).click(onHintClicked).data('text', content).insertAfter($answerBox);
        }

        hint.show();
    }
}

function prepareHintContent(content) {
    var tagRe = /\<[^>]+\>/g;
    return content.replace(tagRe, function (tag) {
        if (tag !== '<br>')
            return '';
        return tag;
    });
}

function onHintClicked(e) {
    e.stopPropagation();
    e.preventDefault();

    var $target = $(e.target);
    if ($target.hasClass('hint')) {
        var text = $target.data('text');
        $('.hint-view').html(text).show();
    }
}