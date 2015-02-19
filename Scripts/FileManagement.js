function getAndSaveFile(url, suggestedFileName) {
    if (typeof digUPSettings.isOnlineVersion != 'undefined' && digUPSettings.isOnlineVersion) {
        window.open(url, '_blank');
    }
    else {
        $.ajax({
            type: "GET",
            url: url,
            async: true,
            mimeType: "text/plain; charset=x-user-defined",
            success: function (result) {
                var dataType = url.split(".")[url.split(".").length - 1];
                saveFile(result, suggestedFileName + "." + dataType);
            },
            error: function () {
                //console.log("error requesting file");
            }
        });
    }
}

function utf8_to_b64(str) {
    return window.btoa(unescape(encodeURIComponent(str)));
}

function base64Encode(str) {
    var CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var out = "", i = 0, len = str.length, c1, c2, c3;
    while (i < len) {
        c1 = str.charCodeAt(i++) & 0xff;
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt((c1 & 0x3) << 4);
            out += "==";
            break;
        }
        c2 = str.charCodeAt(i++);
        if (i == len) {
            out += CHARS.charAt(c1 >> 2);
            out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += CHARS.charAt((c2 & 0xF) << 2);
            out += "=";
            break;
        }
        c3 = str.charCodeAt(i++);
        out += CHARS.charAt(c1 >> 2);
        out += CHARS.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
        out += CHARS.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
        out += CHARS.charAt(c3 & 0x3F);
    }
    return out.replace("data:image/png;base64,", "");
}

var overallCounter = -1;

function createFolderWithFiles(baseFolder, filePath, files, zip, zipName) {

    $(files).each(function (index, elem) {
        $.ajax({
            type: "GET",
            url: filePath + "/" + elem,
            async: true,
            mimeType: "text/plain; charset=x-user-defined",
            success: function (result) {
            },
            error: function () {
                //console.log("error requesting file");
            },
            complete: function (data) {

                baseFolder.file(elem, base64Encode(data.responseText), { base64: true });
                overallCounter--;
                if (overallCounter == 0) {
                    saveFile(zip.generate(), zipName);
                    window.URL.revokeObjectURL(zip);
                    $(".overlay").remove();
                }
            }
        });
    });
    return baseFolder;
}

function getAndSaveFilesFromMediaLibrary(mediaLibrary, lessonNumber, type) {
    overallCounter = -1;
    var zip = new JSZip();
    var counter = 0;
    var folder = lessonNumber;
    var zipName = "Materialen.zip";
    var files = { };
    var baseUrl = "/Media/Lessons/L_" + lessonNumber + "/Resources/";
    switch (type) {
    case "Images":
        folder = zip.folder("Bilder");
        zipName = "Lesson_" + lessonNumber + "_Bilder.zip";
        baseUrl += "Image";
        files = mediaLibrary.Images;
        overallCounter = files.length;
        createFolderWithFiles(folder, baseUrl, files, zip, zipName);
        break;
    case "Audios":
        folder = zip.folder("Audio");
        zipName = "Lesson_" + lessonNumber + "_Audio.zip";
        baseUrl += "Audio";
        files = mediaLibrary.Audios;
        overallCounter = files.length;
        createFolderWithFiles(folder, baseUrl, files, zip, zipName);
        break;
    case "Videos":
        folder = zip.folder("Video");
        zipName = "Lesson_" + lessonNumber + "_Video.zip";
        baseUrl += "Video";
        files = mediaLibrary.Videos;
        overallCounter = files.length;
        createFolderWithFiles(folder, baseUrl, files, zip, zipName);
        break;
    case "Texts":
        folder = zip.folder("Text");
        zipName = "Lesson_" + lessonNumber + "_Text.zip";
        baseUrl += "Text";
        files = mediaLibrary.Texts;
        overallCounter = files.length;
        createFolderWithFiles(folder, baseUrl, files, zip, zipName);
        break;
    case "MasterCopies":
        folder = zip.folder("Kopiervorlagen");
        zipName = "Lesson_" + lessonNumber + "_Kopiervorlagen.zip";
        baseUrl += "Text";
        files = mediaLibrary.Texts;
        overallCounter = files.length;
        createFolderWithFiles(folder, baseUrl, files, zip, zipName);
        break;
    case "all":
        overallCounter = mediaLibrary.Images.length + mediaLibrary.Audios.length + mediaLibrary.Videos.length + mediaLibrary.Texts.length + mediaLibrary.MasterCopies.length;
        var containerFolder = zip.folder("Material");
        zipName = "Lesson_" + lessonNumber + "_Material.zip";
        for (var k in mediaLibrary) {
            if (mediaLibrary.hasOwnProperty(k)) {
                
                switch (k) {
                case "Images":
                    folder = containerFolder.folder("Images");
                    baseUrl = "/Media/Lessons/L_" + lessonNumber + "/Resources/Image";
                    files = mediaLibrary.Images;
                    createFolderWithFiles(folder, baseUrl, files, zip, zipName);
                    break;
                case "Audios":
                    folder = containerFolder.folder("Audio");
                    baseUrl = "/Media/Lessons/L_" + lessonNumber + "/Resources/Audio";
                    files = mediaLibrary.Audios;
                    createFolderWithFiles(folder, baseUrl, files, zip, zipName);
                    break;
                case "Videos":
                    folder = containerFolder.folder("Video");
                    baseUrl = "/Media/Lessons/L_" + lessonNumber + "/Resources/Video";
                    files = mediaLibrary.Videos;
                    createFolderWithFiles(folder, baseUrl, files, zip, zipName);
                    break;
                case "Texts":
                    folder = containerFolder.folder("Text");
                    baseUrl = "/Media/Lessons/L_" + lessonNumber + "/Resources/Text";
                    files = mediaLibrary.Texts;
                    createFolderWithFiles(folder, baseUrl, files, zip, zipName);
                    break;
                case "MasterCopies":
                    folder = containerFolder.folder("Kopiervorlagen");
                    baseUrl = "/Media/Lessons/L_" + lessonNumber + "/Resources/Text";
                    files = mediaLibrary.MasterCopies;
                    createFolderWithFiles(folder, baseUrl, files, zip, zipName);
                    break;
                }
            }
        }
        break;
    }
}

function getAndSaveFiles(files) {

    var zip = new JSZip();
    var folderName = "material";
    var counter = 0;
    var zipName = "Material";

    var tempNames = files[0].fileDescription.split("-");
    if (tempNames.length > 1) {
        zipName = tempNames[0] + "-" + tempNames[1].substr(0, 5);
    }


    switch (files[0].fileName.substr(-4)) {
        case ".png":
            folderName = "Bilder";
            break;
        case ".jpg":
            folderName = "Bilder";
            break;
        case ".mp3":
            folderName = "Audio";
            break;
        case ".mp4":
            folderName = "Video";
            break;
        case ".ogv":
            folderName = "Video";
            break;
        case ".pdf":
            folderName = "Kopiervorlagen";
            break;
        default:
            break;
    }

    zipName += "-" + folderName.toUpperCase() + ".zip";

    var img = zip.folder(folderName);

    $(files).each(function (index, elem) {
        $.ajax({
            type: "GET",
            url: this.fileName,
            async: true,
            mimeType: "text/plain; charset=x-user-defined",
            success: function (result) {
            },
            error: function () {
                //console.log("error requesting file");
            },
            complete: function (data) {
                img.file(elem.fileDescription.replace(".mp3", "") + elem.fileName.substr(-4), base64Encode(data.responseText), { base64: true });
                counter++;

                if (counter == files.length) {
                    saveFile(zip.generate(), zipName);
                    delete(zip);
                }
            }
        });

    });
}

function transformImagesInHtml(file, suggestedFileName) {

    var imageCount = $(file).find("img").length;

    var clonedFile = $(file).clone();

    if(imageCount > 0) {
        
        $(clonedFile).find("img").each(function (imageIndex, imageElement) {
            var elementSrc = $(imageElement).attr("src");

            $.ajax({
                type: "GET",
                url: elementSrc,
                async: true,
                mimeType: "text/plain; charset=x-user-defined",
                success: function (data) {
                    var dataType = elementSrc.split(".")[elementSrc.split(".").length - 1];
                    $(imageElement).attr("data-imagenr", imageIndex).attr("src", "data:image/" + dataType + ";base64," + base64Encode(data));
                    imageCount--;
                },
                error: function () {
                    //console.log("error requesting file");
                },
                complete: function () {
                    if (imageCount == 0) {
                        $(clonedFile).find("td").each(function (tdIndex, tdElement) {
                            if (stringIsNullOrEmpty($(tdElement).text().trim())) {
                                $(tdElement).html("&nbsp;");
                            }
                        });
                        $(clonedFile).find(".timeTable_icon.timeTable_minus_icon").remove();
                        saveFile($(clonedFile).html(), suggestedFileName);
                        $(clonedFile).remove();
                    }
                }
            });
        });
    } else {
        $(clonedFile).find(".timeTable_text_column p").css("width", "");
        $(clonedFile).find(".timeTable_icon.timeTable_minus_icon").remove();
        saveFile($(clonedFile).html(), suggestedFileName);
        $(clonedFile).remove();
    }
}

function proofImageSrc(file, suggestedFileName) {
    var count = 0;
    var imageCount = $(file).find("img").length;
    
    $(file).find("tr td img").each(function (imageIndex, imageElement) {
        var elementSrc = $(imageElement).attr("src");
        var srcArray = elementSrc.split("/");
        if (srcArray[0] == "Media") {
            transformImagesInHtml(file, suggestedFileName);
        } else {
            count++;
        }
    });

    if(count +1 == imageCount) {
        saveFile($(file).html(), suggestedFileName);
    }
    
    
    
}

function saveFile(file, suggestedName) {

    //if (!isOSX() || (isOSX() && suggestedName.substr(-4) != ".zip")) {
        var additionalEnding = suggestedName.substr(-4); //dl-hack for * users without file-endings...
    /*}else {
        additionalEnding = "";
    }*/
    
    var mimeType;
    switch (suggestedName.substr(-4)) {
        case ".mp3":
            mimeType = "audio/mpeg3";
            break;
        case ".ogv":
            mimeType = "audio/ogg";
            break;
        case ".mp4":
            mimeType = "video/mp4";
            break;
        case ".zip":
            mimeType = "application/zip";
            break;
        case ".jpg":
            mimeType = "image/jpeg";
            break;
        case "jpeg":
            mimeType = "image/jpeg";
            additionalEnding = ".jpeg";
            break;
        case ".png":
            mimeType = "image/png";
            break;
        case ".jpg":
            mimeType = "image/jpeg";
            break;
        case ".pdf":
            mimeType = "application/pdf";
            break;
        case "html":
            mimeType = "text/html";
            additionalEnding = ".html";
            break;
        default:
            mimeType = "application/zip";
            break;
    }

    var config = { type: 'saveFile', suggestedName: suggestedName + additionalEnding };

    if (mimeType == "application/zip") {
            
            chrome.fileSystem.chooseEntry(config, function(writableFileEntry) {
                writableFileEntry.createWriter(function (writer) {
                    writer.onerror = function (err) {
                        // console.log(err)
                    };
                    writer.onwriteend = function (e) {

                    };
                    // write the bytes of the string to an ArrayBuffer
                    var raw = atob(file);

                    var uInt8Array = new Uint8Array(raw.length);
                    for (var i = 0; i < raw.length; i++) {
                        uInt8Array[i] = raw.charCodeAt(i);
                    }
                    writer.write(new Blob([uInt8Array], { type: mimeType }));
                }, function (err) {
                    // console.log(err)
                });

            });
    }else {
    chrome.fileSystem.chooseEntry(config, function (writableFileEntry) {
        writableFileEntry.createWriter(function (writer) {

            writer.onerror = function (err) {
                //console.log(err);
            };
            writer.onwriteend = function (e) {
                //var notification = webkitNotifications.createNotification('', '', 'Datei wurde erfolgreich gespeichert.');
                //notification.show();
            };

            var byteArray = new Uint8Array(file.length);
            for (var i = 0; i < file.length; i++) {
                byteArray[i] = file.charCodeAt(i) & 0xff;
            }

            writer.write(new Blob([byteArray], { type: mimeType }));

        }, function (err) {
            //console.log(err);
        });
    });
    }

    
    
}