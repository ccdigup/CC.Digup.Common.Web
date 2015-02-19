var currentPage;
var lessonIndex = new Array();
var lessonIndexObjects = new Array();
var exerciseIndex = new Array();
var pageIndex = new Array();
// **** GENERAL FUNCTIONS **** //

function maskNavigationElements() {
    $("#navigation").mask();
    $("#maximized_navigation").mask();
    $("#tools").mask();
}

function unmaskNavigationElements() {
    $("#navigation").unmask();
    $("#maximized_navigation").unmask();
    $("#tools").unmask();
}



///////////////////////////////
// **** MAIN NAVIGATION **** //
///////////////////////////////
function initLessonIndex() {
    var currentLesson = "";
    var currentPage = "";
    $.getJSON('../Data/Main.json', function (data) {
        $(data.Pages).each(function () {
            if (currentLesson != this.Lesson) {
                lessonIndex.push(this.Lesson);
                currentLesson = this.Lesson;
            }
            if (currentPage != this.Number) {
                pageIndex.push(this.Number);
                currentPage = this.Number;
            }
        });
    }).error(function (data) {
        //console.log(data);
    });
    $.getJSON('../Data/Index.json', function (data) {
        $(data.Modules).each(function () {
            $(this.Lessons).each(function() {
                if (currentLesson.Number != this.Number) {
                    lessonIndex.push(this.Number);
                    lessonIndexObjects.push(this);
                    currentLesson = this;
                }    
            });
            
        });
    }).error(function (data) {
        //console.log(data);
    });

}

function showSupport() {

    var successFunction = function (data) {
        $("body").append(data);
        $("#btnCloseSupportContent").unbind().click(function () {
            $("#supportPage").remove();
        });
    };

    loadSpecificHtml(digUPSettings.viewURIs["Support"], successFunction);
}

function downloadHelp() {
    getAndSaveFile('../Media/Introduction/help.pdf', 'Hilfeleitfaden');
}

function downloadConcept() {
    getAndSaveFile('../Media/Introduction/concept.pdf', 'Konzeption');
}

function showLicense() {

    var successFunction = function (data) {
        $("body").append(data);
        $("#btnCloseLicenseContent").unbind().click(function () {
            $("#licensePage").remove();
        });
    };

    loadSpecificHtml(digUPSettings.viewURIs["License"], successFunction);
}

function showImprint() {
   
    var successFunction = function(data) {
        $("body").append(data);
        $("#btnCloseImprintContent").unbind().click(function() {
            $("#imprintPage").remove();
        });
    };

    loadSpecificHtml(digUPSettings.viewURIs["Imprint"], successFunction);
}

function showSourceDirectory() {
   
    var successFunction = function (data) {
        $("body").append(data);
        $("#btnCloseSourceDirectoryContent").unbind().click(function () {
            $("#sourceDirectoryPage").remove();
        });
    };

    loadSpecificHtml(digUPSettings.viewURIs["SourceDirectory"], successFunction);
}

function showMediaLibrary() {

    var successFunction = function (data) {
        //console.log(data);
        $("body").append(data);
        $("#btnCloseMediaLibraryContent").unbind().click(function () {
            $("#mediaLibraryPage").remove();
        });
    };

    loadSpecificHtml(digUPSettings.viewURIs["MediaLibrary"], successFunction);
}

function loadIntro(isToogle, isShowIndex) {
    var successFunction = function (data) {
        $("body").append(data);
        $(".btnIntroduction").unbind().click(function () {
            var index = $("#introductionImage").data("index");
            if (this.id == "btnIntroductionPrevious") {
                if (index == 1)
                    return;
                index -= 1;
            } else {
                if (index == 6)
                    return;
                index += 1;
            }

            if (index == 1)
                $("#btnIntroductionPrevious").addClass("disabled");
            else
                $("#btnIntroductionPrevious").removeClass("disabled");
            if (index == 6) {
                $("#btnIntroductionNext").addClass("disabled");
                $("#btnIntroductionClose").find(".btnIntroductionText").text("Fertig");
            }
            else {
                $("#btnIntroductionNext").removeClass("disabled");
                $("#btnIntroductionClose").find(".btnIntroductionText").html("Einführung<br/>beenden");
            }

            var src = "/Media/Introduction/Introduction_" + index + ".jpg";
            $("#introductionImage").attr("src", src);
            $("#introductionImage").data("index", index);

        });

        $("#btnIntroductionClose").unbind().click(function () {
            $("#introduction").remove();
            //tiggers save function to skip intro
            if (isToogle) {
                $("#intro").click();

            }
            if (isShowIndex) {
                loadIndexView(0);
            }
        });
        if (isOSX()) {
            $("#introduction .btnContainer a").css("margin-top", 3.3);
        }
    };

    loadSpecificHtml(digUPSettings.viewURIs["Introduction"], successFunction);
}

function showContent(pageNumber) {
    $("#content, #navigation, #tools").show(); 
    loadInitPage(pageNumber); 
}

function setIndexTable(indexData, offSet) {
    if (offSet < 0 || offSet >= indexData.Modules.length)
        return 0;
    $(".indexTable").html("");
    $(".indexTable").data("startpage", offSet);
    var previousModule = (offSet - 4) < 0 ? 0 : (offSet - 4);
    var nextModule = (offSet + 4) > indexData.Modules.length ? indexData.Modules.length : (offSet + 4);
    if(nextModule  > (indexData.Modules.length-1)) {
        $("#btnPageForward").hide();
    } else {
        $("#btnPageForward").show();
    }
    if(previousModule >= offSet) {
        $("#btnPageBack").hide();
    } else {
        $("#btnPageBack").show();
    }
    $("#btnPageBack").text("< Modul " + (previousModule + 1) + "-" + (previousModule + 4));
    $("#btnPageForward").text("Modul " + (nextModule + 1) + "-" + (nextModule + 4)+ " >");
    var rowIdentifier;
    $(indexData.Modules).each(function (i, module) {
        if ((i - offSet) >= 0) {
            var count = i - offSet;
            rowIdentifier = drawIndexTable(count, module, rowIdentifier);
        }
    });
    $(".indexLesson").unbind().click(function () {
        $("#indexPage").remove();
        showContent($(this).data("pagenumber"));
    });
}
/*<span style='font-family: digicons_three;'>3</span>*/
function drawIndexTable(i, module, rowIdentifier) {
    
    if (i > 3)
        return 0;

    if (i % 2 == 0) {
        rowIdentifier = "indexRow_" + i;
        $(".indexTable").append("<tr id='" + rowIdentifier + "'></tr>");
    }

    var tableDataIdentifier = "tableData_" + module.Number;

    var modulText = digUPSettings.enableModules ? "Modul " + parseInt(module.Number) : "";

    $("#" + rowIdentifier).append("<td style='vertical-align: top;' id='" + tableDataIdentifier + "'><span class='indexModul'>" + modulText + "</span><br/><br/>");

    $(module.Lessons).each(function(index, value) {

        var lessonNumber = this.Number.indexOf("_") == -1 ? parseInt(this.Number) : "<span style='font-family:digicons_three'>π</span>";

        if (index == 4 && digUPSettings.enableModules)
            $("#" + tableDataIdentifier).append("<br/><br/>");

        var header = this.Header == "Lesemagazin" ? "Modul-Plus" : this.Header;
        $("#" + tableDataIdentifier).append("<a data-pagenumber='" + this.StartPage + "' class='indexLesson'><span class='indexLessonNumber' style='display:inline-block'>" + lessonNumber + "</span><span>" + header + "</span></a>");
    });
    $("#" + rowIdentifier).append("</div></td>");

    //moduleCount += 1;
    return rowIdentifier;
}

function loadIndexView(startPage) {

    var loadIndexComplete = function (indexData) {
        var successFunction = function (data) {
            $("body").append(data);

            setIndexTable(indexData, startPage);

            $("#btnPageBack").unbind().click(function () {
                loadIndex(function(data) {
                    setIndexTable(data, $(".indexTable").data("startpage") - 4);
                });
            });
            $("#btnPageForward").unbind().click(function () {
                loadIndex(function (data) {
                    setIndexTable(data, $(".indexTable").data("startpage") + 4);
                });
            });
            $("#btnShowImprint").unbind().click(function () {
                showImprint();
            });
            $("#btnShowSupport").unbind().click(function () {
                showSupport();
            });
            $("#btnShowLicense").unbind().click(function () {
                showLicense();
            });
            $("#btnDownloadConcept").unbind().click(function () {
                downloadConcept();
            });
            $("#btnDownloadHelp").unbind().click(function () {
                downloadHelp();
            });
            $("#btnShowSourceDirectory").unbind().click(function () {
                showSourceDirectory();
            });
            $("#btnShowIntroduction").unbind().click(function () {
                loadIntro(false, false);
            });

            $("#btnCloseIndexContent").unbind().click(function () {
                if (stringIsNullOrEmpty(currentPage))
                    showContent(pageIndex[0]);
                $("#indexPage").remove();
            });
            $(".indexLesson").unbind().click(function () {
                $("#indexPage").remove();
                showContent($(this).data("pagenumber"));
            });
            if (isOSX()) {
                $("#tableIndexLinks").css("right", -11);
            }
        };
        loadSpecificHtml(digUPSettings.viewURIs["Index"], successFunction);
    };

    loadIndex(loadIndexComplete);

}

function loadSplashScreen(result) {
    
    $("body").append("<img id='splashScreen' src='/Media/StartScreen/StartScreen.jpg' />");
    //todo check initial
    if (((!result || result.bool) && digUPSettings.enableIndexedDB) /*|| ($.cookie('show_intro') == undefined || $.cookie('show_intro') == "true")*/) {
        $("#intro").addClass("activeEntry");
        setTimeout(function () {
            $("#splashScreen").remove();
            if (!result)
                loadIntro(true, true);
            else {
                loadIntro(false, true);    
            }
        }, 1000);
    } else {
        $("#intro").removeClass("activeEntry");
        setTimeout(function () {
            $("#splashScreen").remove();
            loadIndexView(0);
            //showContent(9);
        }, 3000);
    }
    
    
    
}

function loadInitPage(pageNumber) {

    $.getJSON('../Data/Main.json', function (data) {
        $(data.Pages).each(function () {
            //if correct page is found insert correct image
            if (parseInt(this.Number) == pageNumber) {
                currentPage = this;
                //$("#page").removeClass("boxShadow").hide("drop", { direction: "left", easing: "easeOutQuad" }, 1000, slideInPage(pageNumber, "right"));
                loadPageRequest(pageNumber, true);
            }
        });
    }).error(function (data) {
        //console.log(data);
    });
}

function loadPage(pageNumber) {
    
    var isForward = true;
    
    var currentPageNumber = parseInt(currentPage.Number);
    //Requested page is different to current one?
    //or not alread displayed
    if (currentPageNumber != pageNumber)
    {
        hideCanvas();
        if (currentPageNumber % 2 == 0 && currentPageNumber + 1 != pageNumber || currentPageNumber % 2 != 0 && currentPageNumber - 1 != pageNumber) {
            //mask navigation elements
            maskNavigationElements();
            
            //Set direction for sliding forward/back
            if (pageNumber < currentPageNumber) {
                isForward = false;
            }
            //Slide to new page
            loadPageRequest(pageNumber, isForward);

            $("#exerciseView").dialog("close");
            
            //$("#page").removeClass("boxShadow").hide("drop", { direction: direction, easing: "easeOutQuad" }, 1000, slideInPage(pageNumber, inversedDirection));
        }
    }
}

function loadLesson(lessonNumber) {

    var isForward = true;

    //Requested page is different to current one?
    if (lessonNumber != currentPage.Lesson) {
        //mask navigation elements
        maskNavigationElements();
        
        //Set direction for sliding forward/back
        if (lessonIndex.indexOf(lessonNumber) < lessonIndex.indexOf(currentPage.Lesson)) {
            isForward = false;
        }
        //Slide to new page
        //$("#page").removeClass("boxShadow").hide("drop", { direction: direction, easing: "easeOutQuad" }, 1000, slideInLesson(lessonNumber, inversedDirection));
        loadLessonRequest(lessonNumber, isForward);
    }
}

//Load JSON-object by sliding in
function slideInPage(pageNumber, inversedDirection) {
    loadPageRequest(pageNumber, inversedDirection);
};
function slideInLesson(lessonNumber, inversedDirection) {
    loadLessonRequest(lessonNumber, inversedDirection);
};

//Set image-map attributes dynamically
function setCoords(page, position) {

    //fix for blank pages -> insert blank image to provide correct map scaling by requesting containerWidth/Height
    if ($(".content_page").first().height() == 0 || $(".content_page").first().width() == 0) {
        $(".content_page").first().html("<img src='/Media/Lessons/blank.gif' usemap='#page_left' />");
    }
   
    var areaShapes = new Array();

    //Set area shapes to image-map
    $(page.Exercises).each(function (i) {
        var coords = "";
        for (var j = 0; j < this.Shape.length; j++) {
            var coordPos = this.Shape[j];
            if (j != 0) {
                coords += "," + coordPos.PosX + "," + coordPos.PosY;
            }
            else {
                coords += coordPos.PosX + "," + coordPos.PosY;
            }                
        }
        areaShapes[i] = "<area shape='poly' class='rect_area_shape' href='#' coords='" + coords + "' data-exercisenumber='" + this.Number + "' data-lessonnumber='" + this.Lesson + "'>";    
    });

    //clear old and append new shapes to the map
    $("#map_page_" + position).html("");
    
    for (var a = 0; a < areaShapes.length; a++) {
        $("#map_page_" + position).append(areaShapes[a]);
    }
    
    //add clickEvent to open up the correct exercise by clicking on a map-shape
    $("#map_page_" + position).children().click(function () {
        openExercise($(this));
    });

}

//(Re)Fill page, fill page1 and remove dummy page2
function fillPage() {
    $('#left_page').html($("#page2 #left_page2").html());
    $('#right_page').html($("#page2 #right_page2").html());

    $("#page").addClass("boxShadow").show();
    $("#page2").remove();

    unmaskNavigationElements();
    
    //Append new dummy page2 for other new slices
    $("#content").append('<div id="page2"><div id="left_page2" class="content_page"></div><div id="right_page2" class="content_page"></div></div>');
}


///////////////////////////////
// ******* TOOL MENU ******* //
///////////////////////////////

function toggleSecondToolMenu(elem) {
    
    $("#tools .second_menu, #exerciseMenuMinimized .second_menu").each(function () {
        if ($(this).css("display") != "none" || $(this).parent().find(elem).length > 0) {
            $(this).toggle("fade");
        }
    });
}


///////////////////////////////
// ***** EXTENDED MENU ***** //
///////////////////////////////

function transformLessonBarContent(container, element) {
   
    //delete all flags/red backgrounds from previous bars
    $(".inactiveLessonBar").each(function () {
        if($(this).find(".lessonInfo").first().data("lessonnumber") != currentPage.Lesson) {
            $(this).removeClass("activeLessonNumber");
        } 
    });

    //Get LessonInfos from current element before it is transformed
    var lessonInfos = $(element).find(".lessonInfo").first();

    //Generate new LessonInfos string / p-tag   
    var lessonInfoString = "";

    if ($(lessonInfos).data("lessonnumber").toString().indexOf('_') !== -1) {
        lessonInfoString = '<p class="lessonInfo icon_font" data-lessonnumber="' + $(lessonInfos).data("lessonnumber") + '" data-startpage="' + $(lessonInfos).data("startpage") + '" data-endpage="' + $(lessonInfos).data("endpage") + '" data-icon="' + $(lessonInfos).data("icon") + '"><span>' + (stringIsNullOrEmpty($(lessonInfos).data("icon")) ? 'π' : $(lessonInfos).data("icon")) + '</span></p>';
    } else {
        lessonInfoString = '<p class="lessonInfo" data-lessonnumber="' + $(lessonInfos).data("lessonnumber") + '" data-startpage="' + $(lessonInfos).data("startpage") + '" data-endpage="' + $(lessonInfos).data("endpage") + '">' + parseInt($(lessonInfos).data("lessonnumber")) + '</p>';
    }


    //Flag/Red Background for current Lesson
    var isCurrentLessonBar = $(lessonInfos).data("lessonnumber") == currentPage.Lesson;
    
    
    //If the bar is currently active switch to inactive & remove content
    if ($(element).hasClass("activeLessonBar")) {
        //overwrite existing (active)html
        $(container).hide("drop", { direction: "up" }, function () {
            container.show();
            container.html('<div class="inactiveLessonBar">' + lessonInfoString + '</div>');

            //add specific class(es) if the current bar is the active page
            if (isCurrentLessonBar) {
                $(container).find("div").first().addClass("activeLessonNumber");

            }

            //unbind current click events to prevent double-click-bugs and add transform-functionalities back on all inactive lesson bars - including the just created one
            $(".inactiveLessonBar").unbind().click(function () {
                transformLessonBarContent($(this).parent(), $(this));
            });
        });
    }

    //If the clicked bar is inactive switch to active and add content
    if ($(element).hasClass("inactiveLessonBar")) {
        //overwrite existing (inactive)html
        container.html('<div class="activeLesson" >' +
                                    '<div class="activeLessonContent">' +
                                        '<div class="activeLessonBar">' +
                                            lessonInfoString +
                                        '</div>' +
                                    '</div>' +
                                '</div>');
        //add specific class(es) if the current bar is the active page
        if (isCurrentLessonBar) {
            $(container).find(".activeLessonBar").first().addClass("activeLessonNumber");
        }
       
       
        //get the container where the images are going to implemented/added 
        var imageContent = $(container).find(".activeLessonContent").first();
        //Add images & resize parent container to have all images in line
        loadMaximizedImagePreviews(lessonInfos.data("startpage"), lessonInfos.data("endpage"), lessonInfos.data("lessonnumber"), imageContent);

        $(imageContent).show("drop", {direction:"up"});
      
        //unbind current click events to prevent double-click-bugs and add transform-functionalities back on all active lesson bars - including the new one
        $(".activeLessonBar").unbind().click(function () {
            transformLessonBarContent($(this).parent().parent().parent(), $(this));
          
        });
    }

    if (($("#maximized_menu_content").width() + $("#maximized_menu_content").position().left) > ($("#maximized_navigation").width() - 70)) {
        $("#maximized_navigation_slideRight_btn").unmask();
    } else {
        $("#maximized_navigation_slideRight_btn").mask();
    }
}

function openMenuWithSpecificLessonNumber(lessonNumberStr) {
    var lessonElement = $(".lessonInfo[data-lessonnumber='" + lessonNumberStr + "']").first().parent();
    
    var lessonContainer = lessonElement.parent();
    
    //slide to the correct position in div
    $("#maximized_menu_content").css("left", -lessonContainer.position().left);
    
    //open selected content
    transformLessonBarContent(lessonContainer, lessonElement);
}

function loadMaximizedMenuEntries(data) {
    //find blank maximized menu container
    var menuContent = $("#maximized_menu_content").find(".tableRow").first();

    $(data.Modules).each(function () {
        $(this.Lessons).each(function () {
            //Generate new LessonInfos string / p-tag with current infos
            if (!stringIsNullOrEmpty(this.Enabled) && this.Enabled == "false")
                return false;

            var lessonInfoString = "";
            if (this.Number.indexOf('_') !== -1) {
                lessonInfoString = '<p class="lessonInfo icon_font" data-lessonnumber="' + this.Number + '" data-startpage="' + this.StartPage + '" data-endpage="' + this.EndPage + '" data-icon="' + (stringIsNullOrEmpty(this.Icon) ? 'π' : this.Icon) + '"><span>' + (stringIsNullOrEmpty(this.Icon) ? 'π' : this.Icon) + '</span></p>';
            } else {
                lessonInfoString = '<p class="lessonInfo" data-lessonnumber="' + this.Number + '" data-startpage="' + this.StartPage + '" data-endpage="' + this.EndPage + '">' + parseInt(this.Number) + '</p>';
            }

            //hide everything but add all required infos for toggle to active content
            menuContent.append('<div class="tableCell">' +
                                        '<div class="inactiveLessonBar">' +
                                            lessonInfoString +
                                        '</div>' +
                                   '</div>');
        });
    });

    //load buttons and onclick-functionalities for maximized menu bar
    loadMaximizedMenuElements();
}

function loadMaximizedImagePreviews(startPage, endPage, lessonNumber, aContent) {
    
    //append lesson-images with correct classes/margines to the given container
    for (var x = parseInt(startPage); x <= parseInt(endPage); x++) {

        var classStr = "";

        if (x % 2 != 0) {
            classStr += "sm";
        }

        if (x == parseInt(currentPage.Number)) {
            classStr += " selectedImage";
        }

        $(aContent).append('<img data-pagenumber="' + x + '" class="' + classStr + '" src="/Media/Lessons/L_' + lessonNumber + '/Pages/P_' + convertNumberToString(x) + '.jpg" />');
    }

    //adjust parent divs width dynamically by counting all new appended images
    var elements = (parseInt(endPage) - parseInt(startPage) + 1);
 
    $(aContent).parent().width(($(aContent).find("img").first().width() + 4) * elements + 80);

    //add onlick-functionality to the new included images
    $(aContent).find("img").click(function () {
       //Load clicked paged
        loadPage($(this).data("pagenumber"));

        //hide maximized menu
        hideMaximizedMenu();

        //Hide ExerciseDialog
        $("#exerciseView").dialog("close");

        //on lesson change -> change active bar background
        $("#maximized_menu_content .activeLessonNumber").removeClass("activeLessonNumber");
        $(aContent).find(".activeLessonBar").addClass("activeLessonNumber");
    });
}

function hideMaximizedMenu() {
    $("#digUp").unmask();
    $("#maximized_navigation").hide("fade", function () {
        $(".activeLessonBar").each(function () {
            transformLessonBarContent($(this).parent().parent().parent(), $(this));
        });    
    });

    
}

/**** Set MaximizedMenuFunctionalities ****/

function loadNavigationElements() {
    //make navigation draggable 
    //$("#navigation").draggable({ axis: "x", containment: "parent" });
    //$("#navigationExercise").draggable({ axis: "x", containment: "parent" });
    //$("#tools").draggable({ axis: "y", containment: "body" });
    //$("#exerciseMenuMinimized").draggable({ axis: "y", containment: "body" });

    $("#index").click(function () {
        $("#exerciseView").dialog('close');
        loadIndexView(0);
    });

    $("#maximize_menu").click(function () {
        $("#digUp").mask();
        $(".loadmask").css("z-index", 50);

        if ($("#maximized_menu_content").position().left < 0) {
            $("#maximized_navigation_slideLeft_btn").unmask();
        } else {
            $("#maximized_navigation_slideLeft_btn").mask();
        }

        if (($("#maximized_menu_content").width() + $("#maximized_menu_content").position().left) < ($("#maximized_navigation").width() - 70)) {
            $("#maximized_navigation_slideRight_btn").unmask();
        } else {
            $("#maximized_navigation_slideRight_btn").mask();
        }

        $("#maximized_navigation").show("fade");
        

        openMenuWithSpecificLessonNumber(currentPage.Lesson);

        $(".loadmask").click(function () {
            $(".loadmask").css("z-index", 50);
            hideMaximizedMenu();
        });

    });

    setOptionalPageNavigationElements();

    $("#goto_page_input").blur(function () {
        checkIfPageExists($(this).val());
    });

    $("#goto_page_input").keyup(function (e) {
        if (e.keyCode == 13 /*enterkey*/) {
            checkIfPageExists($(this).val());
        }
    });
    $("#goto_page_input").focus(function () {
        $(this).data("previous_val", $(this).val());
        $(this).val("");
    });
}

function checkIfPageExists(value) {
    if (value.indexOf("/") > 0) {
        value = value.split("/")[0];
    }
    
    if ((!stringIsNullOrEmpty(value) && parseInt(value) > 0)) {
        if (parseInt(value) < parseInt(pageIndex[0])) {
            loadPage(parseInt(pageIndex[0]));
        }
        else if (parseInt(value) > parseInt(pageIndex[pageIndex.length - 1])) {
            loadPage(parseInt(pageIndex[pageIndex.length - 1]));
        } else {
            loadPage(value);
        }
    } else {
        $("#goto_page_input").val($("#goto_page_input").data("previous_val"));

    }
}

function loadPageForward() {
    var pageToLoad = parseInt(currentPage.Number) % 2 == 0 ? parseInt(currentPage.Number) + 2 : parseInt(currentPage.Number) + 1;
    loadPage(pageToLoad);
}

function loadPageBack() {
    var pageToLoad = parseInt(currentPage.Number) % 2 != 0 ? parseInt(currentPage.Number) - 2 : parseInt(currentPage.Number) - 1;
    loadPage(pageToLoad);
}

function loadSectionForward() {
    var lessonToLoad = lessonIndex[lessonIndex.indexOf(currentPage.Lesson) + 1];
    loadLesson(lessonToLoad);
}

function loadSectionBack() {
    var lessonToLoad = lessonIndex[lessonIndex.indexOf(currentPage.Lesson) - 1];
    loadLesson(lessonToLoad);
}

function setOptionalPageNavigationElements() {
    if (!$("#section_back").data("disabled")) {
        $("#section_back").parent().removeClass("disabled");
        $("#section_back").unbind().click(loadSectionBack);    
    }
    
    if (!$("#page_back").data("disabled")) {
        $("#page_back").parent().removeClass("disabled");
        $("#page_back").unbind().click(loadPageBack);
    }
        
    if (!$("#page_forward").data("disabled")) {
        $("#page_forward").parent().removeClass("disabled");
        $("#page_forward").unbind().click(loadPageForward);    
    }

    if (!$("#section_forward").data("disabled")) {
        $("#section_forward").parent().removeClass("disabled");
        $("#section_forward").unbind().click(loadSectionForward);
    }
}

