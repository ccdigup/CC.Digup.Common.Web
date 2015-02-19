var timeTable = {
    "name": "timetable",
    "description": "stores and updates timetables",
    "customFunction": function () {
    },
    "resultFunction": function (data, tableElement) {
        data.onsuccess = function(e) {
            var result = e.target.result;
            if(result == null)
                return;
        };
        data.onerror = localDB.indexedDB.onerror;
    }
};

var textSnippet = {
    "name": "textsnippet",
    "description": "stores selected textsnippet from whole app",
    "customFunction": function () {
    },
    "resultFunction": function (data, tableElement) {
        data.onsuccess = function(e) {
            var result = e.target.result;
            if(result == null)
                return;
        };
      
        data.onerror = localDB.indexedDB.onerror;
    }
};

var workSheet = {
    "name": "worksheet",
    "description": "manages worksheets",
    "customFunction": function () {
    },
    "resultFunction": function (data, tableElement) {
        data.onsuccess = function(e) {
            var result = e.target.result;
            if(result == null)
                return;
        };
      
        data.onerror = localDB.indexedDB.onerror;
    }
};

var crossword = {
    "name": "crossword",
    "description": "manages crosswords",
    "customFunction": function () {
    },
    "resultFunction": function (data, tableElement) {
        data.onsuccess = function(e) {
            var result = e.target.result;
            if(result == null)
                return;
        };
        data.onerror = localDB.indexedDB.onerror;
    }
};


var settings = {
    "name": "settings",
    "description": "stores user settings locally",
    "customFunction": function () {
        $("#storedSettings").html("");
    },
    "resultFunction": function (data, tableElement) {
        data.onsuccess = function(e) {
            var todos = $("#storedSettings");
            
            var result = e.target.result;
            if(!!result == false)
                return;
      
            var a = $(document.createElement("a"))
                .text(" [X]")
                .click(function () {
                localDB.indexedDB.deleteElement(result.value.primaryKey, tableElement);
            });

            var li = $("<li></li>");
                li.append(result.value.name + ": " + result.value.bool).append(a);
            todos.append(li);

            result.continue();
        };
      
        data.onerror = localDB.indexedDB.onerror;
    }
};

function createObjectStores(tableName, objectStore) {
    switch (tableName) {
        case "settings":
            objectStore.createIndex("text","text", {unique:false});
            objectStore.createIndex("name","name", {unique:true});
            break;
        case "timetable":
            objectStore.createIndex("primaryKey","primaryKey", {unique:true});
            objectStore.createIndex("name","name", {unique:true});
            objectStore.createIndex("date","date", {unique:false});
            break;
        case "worksheet":
            objectStore.createIndex("primaryKey","primaryKey", {unique:true});
            objectStore.createIndex("date","date", {unique:false});
            objectStore.createIndex("name","name", {unique:true});
            break;
        case "textsnippet":
            objectStore.createIndex("primaryKey","primaryKey", {unique:true});
            objectStore.createIndex("date","date", {unique:false});
            objectStore.createIndex("name","name", {unique:true});
            break;
        case "crossword":
            objectStore.createIndex("primaryKey","primaryKey", {unique:true});
            objectStore.createIndex("date","date", {unique:false});
            objectStore.createIndex("name","name", {unique:true});
            break;    
        default:
    }
}