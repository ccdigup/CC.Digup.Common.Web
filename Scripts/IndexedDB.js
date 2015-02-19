if (digUPSettings.enableIndexedDB) {
    var localDB = {};
    var supportIndexedDb =  typeof digUPSettings.isOnlineVersion != 'undefined' &&  digUPSettings.isOnlineVersion ? false : true;
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.msIndexedDB;
    window.IDBTransaction = window.hasOwnProperty('webkitIndexedDB') ? window.webkitIDBTransaction : window.IDBTransaction;
    window.IDBKeyRange = window.hasOwnProperty('webkitIndexedDB') ? window.webkitIDBKeyRange : window.IDBKeyRange;
    
    if (!window.indexedDB) {
        supportIndexedDb = false;
    }

    localDB.indexedDB = {};
    localDB.indexedDB.db = null;
      
    localDB.indexedDB.onerror = function(e) {
        //console.log(e);
    };
      
    localDB.indexedDB.open = function (dbName, tables, dbVersion) {

        if (supportIndexedDb) {
            var request = indexedDB.open(dbName, dbVersion);

            request.onupgradeneeded = function (e) {
                localDB.indexedDB.db = e.target.result;
                var db = localDB.indexedDB.db;

                $(tables).each(function (tableIndex, table) {
                    if (db.objectStoreNames.contains(table.name)) {
                        db.deleteObjectStore(table.name);
                    }

                    var store = db.createObjectStore(table.name, { keyPath: "primaryKey", autoIncrement: false });
                    createObjectStores(table.name, store);
                });

            };

            request.onsuccess = function (e) {

                localDB.indexedDB.db = e.target.result;

                $(tables).each(function (tableIndex, table) {
                    if (table.name == "settings") {
                        checkUpUserSettings(table);
                    }
                });

            };
            request.onerror = localDB.indexedDB.onerror;
        }else {
            _.each(tables, function (table) {
                localDB.indexedDB[table.name] = [];
            });
            $(tables).each(function (tableIndex, table) {
                if (table.name == "settings") {
                    checkUpUserSettings(table);
                }
            });
        }
    };
      
    localDB.indexedDB.addElement = function(data, table, successFunction, errorFunction) {

        if (supportIndexedDb) {
            var db = localDB.indexedDB.db;
            var trans = db.transaction([table.name], "readwrite");
            var store = trans.objectStore(table.name);

            /*for (var i = 0; i < data.length; i++) { 
                request = store.put(data[i]);
            } 
            */
            var request = store.put(data);

            request.onsuccess = function (e) {
                if (!stringIsNullOrEmpty(successFunction)) {
                    successFunction(data);
                }
                //localDB.indexedDB.getAllTableElements(table);
            };

            request.onerror = function (e) {
                if (e.target.error.name == "ConstraintError") {
                    if (typeof errorFunction == 'function') {
                        errorFunction();
                    }
                }

                //console.log("Error Adding: ", e);
            };
        }else {
            localDB.indexedDB[table.name].push(data);
            if (!stringIsNullOrEmpty(successFunction)) {
                if (!stringIsNullOrEmpty(successFunction)) {
                    successFunction(data);
                }
            }
        }
    };

    localDB.indexedDB.getTableElementByTag = function getByTag(table, value, columnName, successFunction) {
        if (supportIndexedDb) {
            var db = localDB.indexedDB.db;

            var trans = db.transaction([table.name], "readonly");
            var objectStore = trans.objectStore(table.name);

            var index = objectStore.index(columnName);
            var request = index.get(value);

            request.onsuccess = function (e) {
                successFunction(e.target.result);
            };
        } else {
            var props = {};
            props[columnName] = value;
            var item = _.findWhere(localDB.indexedDB[table.name], props);
            
            successFunction(item);
        }
    };

    localDB.indexedDB.updateElement = function (newData, table, successFunction, errorFunction) {
        if (supportIndexedDb) {
            var db = localDB.indexedDB.db;
            var trans = db.transaction([table.name], "readwrite");
            var store = trans.objectStore(table.name);

            var request = store.delete(newData.primaryKey);

            request.onsuccess = function (e) {
                var addElementResult = store.put(newData);

                addElementResult.onsuccess = function (ev) {
                    if (!stringIsNullOrEmpty(successFunction)) {
                        successFunction(ev);
                    }
                };

                addElementResult.onerror = function (ex) {
                    if (ex.target.error.name == "ConstraintError")
                        errorFunction();

                    //console.log("Error Adding: ", ex);
                };
            };

            request.onerror = localDB.indexedDB.onerror;
        }else {
            _.each(localDB.indexedDB[table.name], function (item) {
                if (item.primaryKey == newData.primaryKey) {
                    for (var prop in newData) {
                        if (newData.hasOwnProperty(prop)) {
                            item[prop] = newData[prop];
                        }
                    }

                    if (!stringIsNullOrEmpty(successFunction)) {
                        successFunction({ primaryKey: item.primaryKey, value: item });
                    }
                }
            });
        }
    };
      
    localDB.indexedDB.deleteElement = function (id, table) {
        if (supportIndexedDb) {
            var db = localDB.indexedDB.db;
            var trans = db.transaction([table.name], "readwrite");
            var store = trans.objectStore(table.name);

            var request = store.delete(id);

            //        request.onsuccess = function(e) {
            //            localDB.indexedDB.getAllTableElements(table);
            //        };

            request.onerror = function (e) {
                //console.log("Error Adding: ", e);
            };
        }else {
            localDB.indexedDB[table.name] = _.filter(localDB.indexedDB[table.name], function (item) { return item.primaryKey != id;});
        }
    };
      
    localDB.indexedDB.getAllTableElements = function(table, successFunction) {
        if (supportIndexedDb) {
            if (table.customFunction != null) {
                table.customFunction();
            }

            var db = localDB.indexedDB.db;

            var trans = db.transaction([table.name], "readwrite");
            var store = trans.objectStore(table.name);

            var keyRange = IDBKeyRange.lowerBound(0);
            var cursorRequest = store.openCursor(keyRange);

            cursorRequest.onsuccess = function (e) {
                var result = e.target.result;
                if (!!result == false)
                    return;

                successFunction(result);

                result.continue();
            };

            cursorRequest.onerror = localDB.indexedDB.onerror;
        }else {
            successFunction(_.map(localDB.indexedDB[table.name], function(item) {
                return { primaryKey: item.primaryKey, value: item };
            }));
        }
    };
      
    function returnTableElements(tuple, table) {
        table.resultFunction(tuple, table);
    }
      
    function initDatabase(dbName, tables, dbVersion) {
        if (supportIndexedDb) {
            //for debug - if need clear db
            //window.indexedDB.deleteDatabase(dbName);
        }
        localDB.indexedDB.open(dbName, tables, dbVersion);
    }
}else {
     $(function() {
        loadSplashScreen(null);
     });
}