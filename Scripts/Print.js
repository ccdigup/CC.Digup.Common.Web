function ShowPrintContentView(printContent) {
    $("body div").addClass("hide-by-printing-content");
    var body = $("body");
    $(body).append('<div id="printview">'
                        + printContent
                        + '<a href="#" id="print-content-view-btn">Drucken</a>'
                        + '<a href="#" id="close-content-view-btn">Schließen</a>'
                   + '</div>');

    $("#print-content-view-btn").unbind().click(PrintContent);
    $("#close-content-view-btn").unbind().click(HidePrintContentView);

    var height = "768";
    if (!stringIsNullOrEmpty($(body).data("height"))) {
        height = $(body).data("height");
    }

    $(body).height(height).css("background-color", "#ffffff");
}


function savePrintContent(printContent, fileName) {
    $("body div").addClass("hide-by-printing-content");
    var body = $("body");
    $(body).append('<div id="printview">'
                        + printContent
                   + '</div>');

    var height = "768";
    if (!stringIsNullOrEmpty($(body).data("height"))) {
        height = $(body).data("height");
    }

    $(body).height(height).css("background-color", "#ffffff");
    saveFile($("#printview")[0].outerHTML, fileName);
    HidePrintContentView();
}

function PrintContent() {
    window.print();
    setTimeout(HidePrintContentView, 10);
}

function HidePrintContentView() {
    $("body").removeAttr("style");
    $("#printview").remove();
    $(".hide-by-printing-content").removeClass("hide-by-printing-content");
}