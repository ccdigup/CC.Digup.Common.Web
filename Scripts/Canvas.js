var canvas,
    context,
    tool,
    useRubber = false,
    markable = false,
    transparency = 1,
    penSize = 10, 
    color = "rgba(0, 0, 0, 1)";

function initCanvas() {
    canvas =  $("#markableContext")[0];
    context = canvas.getContext("2d");

    context.canvas.width = window.innerWidth;
    context.canvas.height = window.innerHeight;

    tool = new PencilTool();

    canvas.addEventListener('mousedown', ev_canvas, false);
    canvas.addEventListener('mousemove', ev_canvas, false);
    canvas.addEventListener('mouseup', ev_canvas, false);

    loadCanvasElements();
    setFillColor();
}

function hideCanvas() {
    if ($("#mark").hasClass("enabled")) {
        $("#mark").click();    
    }
    
}

function loadCanvasElements() {
    $("#clearCanvas").click(function () {
        clearCanvas();
    });

    $("#mark").click(function () {
        $(this).toggleClass("enabled");
        if ($(this).hasClass("enabled")) {
            $("#content").unbind();
            var savedPage = parseInt($("#markableContext").data("page"));
            var nextPrevioisPage = (savedPage % 2) ? savedPage - 1 : savedPage + 1;
            
            if ((savedPage != parseInt(currentPage.Number) && nextPrevioisPage != parseInt(currentPage.Number)) || (!stringIsNullOrEmpty(currentExercise) && currentExercise.Number != $("#markableContext").data("exercise")))
                clearCanvas();

            $("#markableContext").data("page", currentPage.Number);
            if(!stringIsNullOrEmpty(currentExercise))
                $("#markableContext").data("exercise", currentExercise.Number);

            $("#markText").text("an");
            $("#pencil").addClass("activeEntry");
            $("#rubber").removeClass("activeEntry");
            useRubber = false;

            $("#markableContext").css("zIndex", 19).css("position", "fixed");
            markable = true;
            $("#whiteboard_tools").parent().addClass("enabled");
            $("body").css("background-color", "#F9F5EC");
        } else {
            $("#content").unbind().click(function () {
                toggleSecondToolMenu();
                $("#content").unbind();
            });
            $("#markText").text("aus");
            $("#pencil").removeClass("activeEntry");
            $("#rubber").removeClass("activeEntry");
            $("#whiteboard_tools").parent().removeClass("enabled");
            unmarkableCanvas();
            $("body").css("background-color", "#F9F5EC");
        }
    });

    $("#pencil").click(function () {
        rubber();
    });

    $("#rubber").click(function () {
        rubber();
    });

    $("#saveCanvas").click(function () {
        saveCanvas();
    });

    $("#pencilSizeSlider").slider({
        range: "max",
        min: 1,
        max: 20,
        value: 10,
        slide: function (event, ui) {
            $("#pencilSize").val(ui.value);
            penSize = ui.value;
        }
    });
}


function setFillColor() {
  
    $("#useTransparency").click(function () {
        $(this).toggleClass("activeEntry");
        if ($(this).hasClass("activeEntry")) {
           transparency = .3;
        }
        else {
           transparency = 1;
        }
        $(".fillColor_type").each(function () {
            if ($(this).hasClass("selectedColor")) {
                color = "rgba(" + $(this).data("value") + ", " + transparency + ")";
            }
        });
    });

    $(".fillColor_type").click(function () {
        $(".fillColor_type").removeClass("selectedColor");
        $(this).addClass("selectedColor");
        color = "rgba(" + $(this).data("value") + ", " + transparency + ")";
    });
}

function unmarkableCanvas() {
    $("#markableContext").css("zIndex", -1).css("position", "relative");
    markable = false;
}

function PencilTool() {
    this.started = false;

    this.mousedown = function (ev) {
        if (markable) {
            context.beginPath();
            context.moveTo(ev._x, ev._y);
            tool.started = true;
        }
    };

    this.mousemove = function (ev) {
        if (!useRubber) {
            if (tool.started && markable) {
                context.strokeStyle = color;
                context.lineWidth = penSize;
                context.lineJoin = "round";
                context.lineTo(ev._x, ev._y);
                context.stroke();
                context.globalCompositeOperation = "source-over";
                if (transparency != 1) {
                    context.globalCompositeOperation = 'destination-atop'; //for transparency
                }

            }
        } else {
            if (tool.started && markable) {
                context.clearRect(ev._x, ev._y, parseInt(penSize * 3), parseInt(penSize * 3));
            }
        }
    };

    this.mouseup = function (ev) {
        if (tool.started && markable) {
            tool.mousemove(ev);
            tool.started = false;
        }
    };
}

function saveCanvas() {
    
}

function clearCanvas() {
    canvas.width = canvas.width;
}

function rubber() {
    if(useRubber) {
        useRubber = false;
        $("#pencil").addClass("activeEntry");
        $("#rubber").removeClass("activeEntry");
    }else {
        useRubber = true;
        $("#rubber").addClass("activeEntry");
        $("#pencil").removeClass("activeEntry");
    }
}

function ev_canvas(ev) {
    if (ev.layerX || ev.layerX == 0) {
        ev._x = ev.layerX;
        ev._y = ev.layerY;
    }

    var func = tool[ev.type];
    if (func) {
        func(ev);
    }
}
