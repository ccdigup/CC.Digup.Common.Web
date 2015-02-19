NOCACHEPARAMETER = (new Date()).getTime();

function setRightPage(page) {
    $('#right_page2').html("<img usemap='#page_right' src='../Media/Lessons/L_" + page.Lesson + "/Pages/" + page.Image + "' />");
}

function setLeftPage(page) {
    $('#left_page2').html("<img usemap='#page_left' src='../Media/Lessons/L_" + page.Lesson + "/Pages/" + page.Image + "'/>");
}


function loadSelectedPage(selectedPage, data, isForward) {
    currentPage = selectedPage;
    var pageNumber = parseInt(selectedPage.Number);
    if (pageNumber % 2 != 0) {
        $("#goto_page_input").val((pageNumber - 1).toString() + "/" + (pageNumber).toString());
        $("#goto_page_input").data("previous_val", (pageNumber - 1).toString() + "/" + (pageNumber).toString());
        setCoords(selectedPage, "right");
        setRightPage(selectedPage);
        //get previous page and set
        var previousPage = data.Pages[(data.Pages.indexOf(selectedPage) - 1)];
        if (previousPage != null && previousPage != undefined) {
            setCoords(previousPage, "left");
            setLeftPage(previousPage);
        }
        var nextPossiblePage = data.Pages[(data.Pages.indexOf(selectedPage) + 1)];
        if (nextPossiblePage != null && nextPossiblePage != undefined) {
            $("#page_forward").parent().removeClass("disabled");
            $("#page_forward").data("disabled", false);
            $("#page_forward").unbind().click(loadPageForward);
        } else {
            $("#page_forward").unbind().parent().addClass("disabled");
            $("#page_forward").data("disabled", true);
        }
        var previousPossiblePage = data.Pages[(data.Pages.indexOf(selectedPage) - 2)];
        if (previousPossiblePage != null && previousPossiblePage != undefined) {
            $("#page_back").parent().removeClass("disabled");
            $("#page_back").data("disabled", false);
            $("#page_back").unbind().click(loadPageBack);
        } else {
            $("#page_back").unbind().parent().addClass("disabled");
            $("#page_back").data("disabled", true);
        }

    } else {
        $("#goto_page_input").val((pageNumber).toString() + "/" + (pageNumber + 1).toString());
        $("#goto_page_input").data("previous_val", (pageNumber).toString() + "/" + (pageNumber + 1).toString());
        setCoords(selectedPage, "left");
        setLeftPage(selectedPage);
        //get nextPage and set
        var nextPage = data.Pages[(data.Pages.indexOf(selectedPage) + 1)];
        if (nextPage != null && nextPage != undefined) {
            setCoords(nextPage, "right");
            setRightPage(nextPage);
        }
        var previousPossiblePage = data.Pages[(data.Pages.indexOf(selectedPage) - 1)];
        if (previousPossiblePage != null && previousPossiblePage != undefined) {
            $("#page_back").parent().removeClass("disabled");
            $("#page_back").data("disabled", false);
            $("#page_back").unbind().click(loadPageBack);
        } else {
            $("#page_back").unbind().parent().addClass("disabled");
            $("#page_back").data("disabled", true);
        }
        var nextPossiblePage = data.Pages[(data.Pages.indexOf(selectedPage) + 2)];
        if (nextPossiblePage != null && nextPossiblePage != undefined) {
            $("#page_forward").parent().removeClass("disabled");
            $("#page_forward").data("disabled", false);
            $("#page_forward").unbind().click(loadPageForward);
        } else {
            $("#page_forward").unbind().parent().addClass("disabled");
            $("#page_forward").data("disabled", true);
        }
    }
    //Slide in the just filled page2
    var direction = isForward ? "left" : "right";
    var inversedDirection = isForward ? "right" : "left";

    $("#page").removeClass("boxShadow").hide("drop", { direction: direction, easing: "easeOutQuad" }, 1000);
    $("#page2").show("drop", { direction: inversedDirection, easing: "easeOutQuad" }, 1000, fillPage);
    //$("#page2").show("drop", { direction: inversedDirection, easing: "easeOutQuad" }, 1000, fillPage);
}

function checkPreviousAndNextLessonExists(previousLesson, nextLesson, data) {
    //find previous and next lesson
    //u have to iterate a second time
    var previousLessonFound = false;
    var nextLessonFound = false;
    $(data.Pages).each(function() {
        previousLessonFound = (!previousLessonFound && this.Lesson == previousLesson) ? true : previousLesson;
        nextLessonFound = (!nextLessonFound && this.Lesson == nextLesson) ? true : nextLessonFound;
    });
    if (nextLessonFound) {
        $("#section_forward").parent().removeClass("disabled");
        $("#section_forward").data("disabled", false);
        $("#section_forward").unbind().click(loadSectionForward);
    } else {
        $("#section_forward").unbind().parent().addClass("disabled");
        $("#section_forward").data("disabled", true);
    }
    if (previousLessonFound) {
        $("#section_back").parent().removeClass("disabled");
        $("#section_back").data("disabled", false);
        $("#section_back").unbind().click(loadSectionBack);
    } else {
        $("#section_back").unbind().parent().addClass("disabled");
        $("#section_back").data("disabled", true);
    }
}

//Load specific page by pageNumber & slide-in direction
function loadPageRequest(pageNumber, isForward) {
    var pageFound = false;
    var previousLesson;
    var nextLesson;
    $.getJSON('../Data/Main.json', function (data) {
        $(data.Pages).each(function () {
            //if correct page is found insert correct image
            if (parseInt(this.Number) == pageNumber) {
                pageFound = true;
                loadSelectedPage(this, data, isForward);
            }
            previousLesson = (pageFound) ? previousLesson : this.Lesson;
            nextLesson = (pageFound && (currentPage.Lesson != this.Lesson) && nextLesson == undefined) ? this.Lesson : nextLesson;
        });
        checkPreviousAndNextLessonExists(previousLesson, nextLesson, data);
    }).error(function (data) {
        //console.log("Error: failed to load json");
    });
}


//Load specific lesson by lessonNumber & slide-in direction
function loadLessonRequest(lessonNumber, isForward) {
    var pageFound = false;
    var previousLesson;
    var nextLesson;
    $.getJSON('../Data/Main.json', function (data) {
        $(data.Pages).each(function () {
            //if correct lesson is found insert correct page/image
            if (!pageFound && this.Lesson == lessonNumber) {
                pageFound = true;

                //only load page if it is not already visible
                var pageToCheck = isForward ? data.Pages[(data.Pages.indexOf(this) - 1)] : data.Pages[(data.Pages.indexOf(this) + 1)];

                if (pageToCheck.Number == currentPage.Number) {
                    //lesson is already visible -> so it would be intended to load next lesson

                    var lessonToLoad = isForward ? lessonIndex[lessonIndex.indexOf(this.Lesson) + 1] : lessonIndex[lessonIndex.indexOf(this.Lesson) - 1];
                    if (!stringIsNullOrEmpty(lessonToLoad))
                        loadLessonRequest(lessonToLoad, isForward);
                    else {
                        unmaskNavigationElements();
                    }
                }
                else {
                    loadSelectedPage(this, data, isForward);
                }

            }
            previousLesson = (pageFound) ? previousLesson : this.Lesson;
            nextLesson = (pageFound && (currentPage.Lesson != this.Lesson) && nextLesson == undefined) ? this.Lesson : nextLesson;
        });
        checkPreviousAndNextLessonExists(previousLesson, nextLesson, data);



    }).error(function (data) {
        //console.log("Error: failed to load json");
    });
}

function loadSpecificHtml(path, onComplete) {
    $.get(path, function (data) {
        onComplete(data);
    }).error(function () {
        //console.log("Error: failed to load specific-html");
    });
}

function initExerciseIndex(exercise) {
    exerciseIndex = new Array();
    $.getJSON("../Data/Exercises.json?nocache=" + NOCACHEPARAMETER, function (data) {
        //Set exerciseByNumber
        $(data.Exercises).each(function () {
            if (this.Lesson == exercise.Lesson) {
                exerciseIndex.push(this.Number);
            }
        });
    });
 
}

//Load specific Exercise
function loadExercise(exerciseNumber, lessonNumber, onComplete, exerciseType) {

    var exercise;

    switch (exerciseType) {
        case "Exercise":
            $.getJSON("../Data/Exercises.json?nocache=" + NOCACHEPARAMETER, function (data) {
                //Set exerciseByNumber
                $(data.Exercises).each(function () {
                    if (this.Number == exerciseNumber && this.Lesson == lessonNumber) {
                        exercise = this;
                        //check if exercise is on currentPage
                        //                        var exerciseOnPage = false;
                        //                        if (exercise.PageNumber != currentPage.Number)
                        //                                loadPage(exercise.PageNumber);
                        //                        }

                        //check if previous exercise exists
                        var previousExercise = data.Exercises[(data.Exercises.indexOf(this) - 1)];
                        if (previousExercise != null && previousExercise != undefined && previousExercise.Lesson == this.Lesson) {
                            $("#exercise_back").parent().removeClass("disabled");
                        }
                        else {
                            $("#exercise_back").parent().addClass("disabled");
                        }
                        //check if next exercise exists
                        var nextExercise = data.Exercises[(data.Exercises.indexOf(this) + 1)];
                        if (nextExercise != null && nextExercise != undefined && nextExercise.Lesson == this.Lesson) {
                            $("#exercise_forward").parent().removeClass("disabled");
                        }
                        else {
                            $("#exercise_forward").parent().addClass("disabled");
                        }

                        initExerciseIndex(exercise);

                        return false;
                    }
                });
            }).error(function () {
                //console.log("Error: failed to load exercise-json");
            }).complete(function () {
                //Callback the given function with the exercise (open exercise dialog for example)
                onComplete(exercise, exerciseType);
            });
            break;
        case "WorkBookExercise":
            $.getJSON("../Data/WorkBookExercises.json", function (data) {
                //Set exerciseByNumber
                $(data.WorkBookExercises).each(function () {
                    if (this.Number == exerciseNumber && this.Lesson == lessonNumber) {
                        exercise = this;
                        return false;
                    }
                });
            }).error(function () {
                //console.log("Error: failed to load exercise-json");
            }).complete(function () {
                //Callback the given function with the exercise (open exercise dialog for example)
                onComplete(exercise, exerciseType);
            });
            break;
        default:
            exerciseType = "Exercise";

            $.getJSON("../Data/Exercises.json?nocache=" + NOCACHEPARAMETER, function (data) {
                //Set exerciseByNumber
                $(data.Exercises).each(function () {
                    if (this.Number == exerciseNumber && this.Lesson == lessonNumber) {
                        exercise = this;
                        var previousExercise = data.Exercises[(data.Exercises.indexOf(this) - 1)];
                        if (previousExercise != null && previousExercise != undefined && previousExercise.Lesson == this.Lesson) {
                            $("#exercise_back").parent().removeClass("disabled");
                        }
                        else {
                            $("#exercise_back").parent().addClass("disabled");
                        }
                        var nextExercise = data.Exercises[(data.Exercises.indexOf(this) + 1)];
                        if (nextExercise != null && nextExercise != undefined && nextExercise.Lesson == this.Lesson) {
                            $("#exercise_forward").parent().removeClass("disabled");
                        }
                        else {
                            $("#exercise_forward").parent().addClass("disabled");
                        }

                        initExerciseIndex(exercise);
                        return false;
                    }
                });
            }).error(function () {
                //console.log("Error: failed to load exercise-json");
            }).complete(function () {
                //Callback the given function with the exercise (open exercise dialog for example)
                onComplete(exercise, exerciseType);
            });
            break;
    }
}



//load specific textFile
function loadText(filePath, onComplete) {
    $.ajax({
        type: 'GET',
        url: filePath,
        async: true,
        dataType: 'text',
        complete: function (data) {
            onComplete(data.responseText);
        },
        error: function (data) {
            alert('Ein Fehler trat auf, bitte probieren Sie es nocheinmal.');
        }
    });
}

//load specific educationReference
function loadTextAndLoadNext(filePath, onComplete, count) {
    $.ajax({
        type: 'GET',
        url: filePath,
        async: true,
        dataType: 'text',
        complete: function (data) {
            onComplete(data.responseText, count);
        },
        error: function (data) {
            alert('Ein Fehler trat auf, bitte probieren Sie es nocheinmal.');
        }
    });
}

//load MainJson
function loadExercisesJson(onSuccess) {
    $.getJSON('../Data/Exercises.json?nocache=' + NOCACHEPARAMETER, function (data) {
        onSuccess(data);
    }).error(function (data) {
    });
}

//load vocabulary
//load MainJson
function loadVocabularyJson(onSuccess) {
    $.getJSON('../Data/Vocabulary.json', function (data) {
        onSuccess(data);
    }).error(function (data) {
    });
}


function loadVocabulary(exercise, onComplete, loadAll) {
    var vocabulary = new Array();

    var lessonNumber = "";
    if(!stringIsNullOrEmpty(exercise))
        lessonNumber = exercise.Lesson.replace(/^0+/, '');

    $.getJSON('../Data/Vocabulary.json', function (data) {
        $(data.Vocabulary).each(function () {
            if (loadAll || (this.Lesson.Value == lessonNumber && this.Exercise.Value.replace(/^0+/, '') == exercise.Number.replace(/^0+/, ''))) {
                vocabulary.push(this);
            }
        });
    }).error(function (e) {
        //console.log("Error: failed to load vocabulary-json");
    }).complete(function () {
        onComplete(vocabulary);
    });
}

function checkIfVocabularyExistsForExercise(exercise, onComplete) {
    var lessonNumber = "";
    var vocabularyExists = false;
    
    if (!stringIsNullOrEmpty(exercise))
        lessonNumber = exercise.Lesson.replace(/^0+/, '');
    

    $.getJSON('../Data/Vocabulary.json', function (data) {
        $(data.Vocabulary).each(function () {
            if (this.Lesson.Value == lessonNumber && !stringIsNullOrEmpty(this.Exercise.Value) && this.Exercise.Value.replace(/^0+/, '') == exercise.Number.replace(/^0+/, '')) {
                vocabularyExists = true;
            }
        });
    }).error(function () {
        //console.log("Error: failed to load index-json");
    }).complete(function () {
        onComplete(exercise, vocabularyExists);
    });
}

function loadVocabularyFilteredByLessonAndAlphabetic(filterLesson, filterAlphabetic , onComplete) {
    var vocabulary = new Array();
    var regex = /\b(\()?(der|die|das|)(\))?\b/i;
    var fromLesson = parseFloat(filterLesson.fromLesson.replace("_", "."));
    var untilLesson = parseFloat(filterLesson.untilLesson.replace("_", "."));
    var fromExercise = parseFloat(filterLesson.fromExercise.replace("_", "."));
    var untilExercise = parseFloat(filterLesson.untilExercise.replace("_", "."));
  
    $.getJSON('../Data/Vocabulary.json', function (data) {
        $(data.Vocabulary).each(function () {
            //filter lesson
            var currentLesson = parseFloat(this.Lesson.Value.replace("_", "."));
            var currentExercise = parseFloat(this.Exercise.Value.replace("_", "."));
            if (currentLesson >= fromLesson && currentLesson <= untilLesson) {
                if ((currentLesson == fromLesson && currentExercise < fromExercise) ||
                   (currentLesson == untilLesson && (currentExercise > untilExercise && untilExercise != -1))) {
                    //dont add
                    //depricated
                } else {
                    //filterAlphabetic
                    for (var i = 0; i < filterAlphabetic.length; i++) {
                        if (this.Sort.trim().toLowerCase().match(filterAlphabetic[i]) != null && this.Sort.trim().toLowerCase().match(filterAlphabetic[i]).length > 0) {
                            vocabulary.push(this);
                        }
                    }
                }
            }
        });
    }).error(function () {
        //console.log("Error: failed to load index-json");
    }).complete(function () {
        onComplete(vocabulary);
    });
}

function loadVocabularyFilteredByLesson(lesson, onComplete) {
    var vocabulary = new Array();
    lesson = lesson.replace(/^0+/, '');
    $.getJSON('../Data/Vocabulary.json', function (data) {
        $(data.Vocabulary).each(function () {
            //filter lesson
            if (this.Lesson.Value == lesson || lesson == -1) {
                $(this.Crossword).each(function () {
                    if(this.length > 0) {
                        vocabulary.push(this);
                    }
                });
            }
        });
    }).error(function () {
        //console.log("Error: failed to load index-json");
    }).complete(function () {
        onComplete(vocabulary);
    });
}

//Load Index.json
function loadIndex(onComplete) {
    var indexData;
    $.getJSON('../Data/Index.json', function (data) {
        indexData = data;
    }).error(function () {
        //console.log("Error: failed to load index-json");
    }).complete(function () {
        onComplete(indexData);
    });
}
