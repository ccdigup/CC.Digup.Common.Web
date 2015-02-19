function initUserSettings() {
    
    var tables = new Array();
    tables[0] = settings;
    tables[1] = timeTable;
    tables[2] = workSheet;
    tables[3] = textSnippet;
    tables[4] = crossword;

    $("#intro").click(function () {
        $(this).toggleClass("activeEntry");

        if (!digUPSettings.enableIndexedDB) {
            $.cookie('show_intro', $(this).hasClass("activeEntry"), { expires: 365 });
        } else {
            var data = {
                "primaryKey": "showIntro_2",
                "name": "ShowIntro",
                "bool": true,
                "description": "Switch to false to show the dfvsdo on statrup."
            };

            var successFunction = function(result) {
                if (result && !result.bool) {
                    data.bool = true;
                    localDB.indexedDB.addElement(data, settings);
                } else {
                    data.bool = false;
                    if (!result) {
                        localDB.indexedDB.addElement(data, settings);
                    } else {
                        if (result.bool) {
                            localDB.indexedDB.addElement(data, settings);
                        }
                    }
                }
            };

            localDB.indexedDB.getTableElementByTag(settings, "ShowIntro", "name", successFunction);
        }
    });

    if (digUPSettings.enableIndexedDB) {
        if (typeof localDbName != 'undefined') {
            initDatabase(localDbName    , tables, 1);
        }else {
            initDatabase('DigUpDatabase', tables, 1);
        }
    }
}

function checkUpUserSettings(table) {
    var setCheckBoxOption = function (result) {
        loadSplashScreen(result);
    };

    //loads settings
    localDB.indexedDB.getTableElementByTag(table, "ShowIntro", "name", setCheckBoxOption);
}
