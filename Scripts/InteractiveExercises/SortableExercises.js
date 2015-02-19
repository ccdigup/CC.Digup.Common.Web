function setSortableExerciseFunctionalities() {
    $("#sortable_container #sortable_list, #sortable_container .sortable_list2").sortable({
        update: function () {
            $("#check_answers").show();
        }
    });
    $("#sortable_container #sortable_list, #sortable_container .sortable_list2").disableSelection();

    $("#check_answers").click(evaluateSortableAnswer);
    $("#set_answer").click(setSortableAnswer);
    $("#restart").click(restartSortableExercise);
    $("#check_answers").show();

    var exVer = $("#sortable_container").data('exerciseVersion');
    if (!!exVer) { // exercise created with editor version 1.0.0.0
        restartSortableExercise();
    }
}

function evaluateSortableAnswer() {
    //$("#check_answers").hide();

    var containsErrors = false;
    
    $("#sortable_list .optionBox").each(function (index, option) {
        if (index == $(option).data("answerposition")) {
            $(option).addClass("correct");
            $(option).removeClass("error");
        } else {
            containsErrors = true;
            $(option).addClass("error");
            $(option).removeClass("correct");
        }
    });

    // check answer for new exercises
    $('.sortable_list2').each(function (index, list) {
        var $list = $(list);
        var sortableElements = $list.children('.optionBox');
        var answers = sortableElements.map(function (idx, option) {
            var $option = $(option);
            return {value: $option.text(), idx: parseInt($option.data('answerposition'))};
        }).get().sort(function (one, two) {
            return one.idx - two.idx;
        });
        
        sortableElements.each(function (idx, option) {
            var answer = answers[idx];
            var $option = $(option);
            if (answer.value === $option.text()) {
                $option.addClass("correct");
                $option.removeClass("error");
            } else {
                containsErrors = true;
                $option.addClass("error");
                $option.removeClass("correct");
            }
        });
    });
    
    if(containsErrors) {
        $("#set_answer").show();
    }
    $("#restart").show();
}

function setSortableAnswer() {
    $("#set_answer").hide();
    $("#sortable_list .optionBox, .sortable_list2 .optionBox").removeClass("error");

    $('#sortable_list, .sortable_list2').each(function () {
        var list = $(this);
        var options = list.children('.optionBox');
        list.html('');
        
        options.sort(function (one, two) {
            return parseInt($(one).data("answerposition")) - parseInt($(two).data("answerposition"));
        }).appendTo(list);
    });
}

function restartSortableExercise() {
    $("#restart").hide();
    $("#set_answer").hide();

    $('#sortable_list, .sortable_list2').each(function () {
        var list = $(this);
        var sortableElements = list.children('.optionBox');
        var sortableElementsLength = sortableElements.length;

        sortableElements
            .removeClass('error')
            .removeClass('correct')
            .sort(function() {
                return Math.floor(Math.random() * sortableElementsLength);
            }).appendTo(list);
    });
}