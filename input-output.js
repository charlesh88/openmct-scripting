/************************************************* INPUTS AND UPLOADING */
function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
        let fr = new FileReader();

        fr.onload = function () {
            resolve(fr.result);
        };

        fr.onerror = function () {
            reject(fr);
        };

        fr.readAsText(file);
    });
}

function uploadFiles(files, fileType) {
    let readers = [];
    let filenames = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    for (let i = 0; i < files.length; i++) {
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]

        switch (fileType) {
            case 'prl':
                processPrlFiles(filenames, values);
                break;
            case 'gcsfilelist':
                processGCSFileList(filenames[0], values[0]);
                break;
            case 'opi':
                processOpiFiles(filenames, values);
                break;
            default:
                processInputCsvs(filenames, values);
        }

/*        if (fileType.includes('prl')) {
            processPrlFiles(filenames, values);
        } else if (fileType.includes('csv')) {
            processInputCsvs(filenames, values);
        } else if (fileType.includes('opi')) {
            processOpiFiles(filenames, values);
        }*/
    });
}

function uploadMatrixFile(files, fileType) {
    let readers = [];
    let filenames = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    for (let i = 0; i < files.length; i++) {
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        createOpenMCTMatrixLayoutJSONfromCSV(values[0]);
    });
}

function csvToArray(str, delimiter = ',') {
    // Break the csv into rows
    const arrLines = listToArray(str); //str.split(/\r?\n/).filter((row) => row.length > 0);

    const arrLinesCleaned = arrLines.map(function (row) {
        let valuesStr = row
            .replaceAll('\\,', ESC_CHARS.escComma)// Encode all escaped commas so they don't drive array splits
            .replaceAll('""',ESC_CHARS.doublequotes); // Escape double-double quotes

        valuesStr = valuesStr.replace(/"[^"]+"/g, function (v) {
            // Isolate strings within double-quote blocks and encode all vanilla commas in there
            return v.replaceAll(',', ESC_CHARS.comma);
        })

        const valuesArr = valuesStr.split(delimiter);

        if (valuesArr.length > 0) {
            const valuesArrFormatted = valuesArr.map(function (value) {
                // Specifically target fields that begin with '/' and treat as telem end point paths, replace all / with ~
                value = (value.startsWith('/') || value.startsWith('"/'))?
                    value.replaceAll('/', '~') : value;
                return value
                    .replaceAll('\\~', ESC_CHARS.tilde) // Escape escaped tildes. These get restored later.
                    .replaceAll('\\/', ESC_CHARS.backslash) // Escape escaped slashes. These get restored later.
                    .replaceAll('\"', '') // Kill all remaining double-quotes.
                    .replaceAll(ESC_CHARS.comma, ',') // Restore escaped "vanilla" commas.
                    .replaceAll(ESC_CHARS.doublequotes, '\"'); // Restore escaped double-double quotes.
            })

            return valuesArrFormatted;
        }
    })
    // console.log('arrLinesCleaned',arrLinesCleaned);
    return arrLinesCleaned;
}

function listToArray(str) {
    return str.split(/\r?\n/).filter((row) => row.length > 0);
}

function csvToObjArray(str) {
    let arrBody = csvToArray(str);
    const arrHeaders = arrBody.shift();
    const objArr = arrBody.map(function (row) {
        const obj = arrHeaders.reduce(function (object, header, index) {
            object[header] = row[index];
            return object;

        }, {});
        return obj;
    })

    return objArr;
}

/************************************************* OUTPUTS AND DOWNLOADING */
function outputJSON() {
    console.log('outputJSON', objJson);
    let outputJSON = JSON.stringify(objJson, null, 4);
    const updateTime = new Date();
    const oStr =
        'Generated ' +
        updateTime.getHours().toString().padStart(2, '0') + ':' +
        updateTime.getMinutes().toString().padStart(2, '0') + ':' +
        updateTime.getSeconds().toString().padStart(2, '0') + ' | ' +
        outputJSON.length + ' chars';
    outputMsg(lineSepStr);
    outputMsg(oStr);
    btnDownloadJson.removeAttribute('disabled');
}

downloadJson = function () {
    const filename = (config.outputBaseName.length > 0) ? config.outputBaseName : 'Scripted Open MCT';
    const strJson = JSON.stringify(objJson, null, 4);
    const file = new File([strJson], filename.concat('.json'), {
        type: 'text/json',
    })

    downloadFile(file);
}

downloadFile = function (file) {
    const link = document.createElement('a');
    link.setAttribute('download', file.name);
    const url = URL.createObjectURL(file);
    link.href = url;
    link.setAttribute('target', '_blank');
    link.click();
    window.URL.revokeObjectURL(url);
}

function outputMsg(msg) {
    outputMsgAdd('<p>'.concat(msg).concat('</p>'));
}

function outputMsgAdd(str) {
    outputMsgText.innerHTML += str;
}

function outputTable(rowArray = [], startTable = false, endTable = false) {
    if (startTable) {
        outputMsgAdd('<table>');
    }

    if (rowArray.length > 0) {
        let rowStr = '<table><tr><td>Some text in a td</td><td>Some text in a td</td><td>Some text in a td</td></tr></table>';

        // for (let i = 0; i < rowArray.length; i++) {
        //     rowStr = rowStr.concat('<td>'.concat(rowArray[i]).concat('</td>'));
        // }
        // rowStr = rowStr.concat('</tr>');
        outputMsgAdd(rowStr);
    }

    if (endTable) {
        outputMsgAdd('</table>');
    }
}

function htmlTableFromArray(arr) {
    // arr is a multidimensional grid
    let tableStr = '<table class="c-msg__table">';
    for (let i = 0; i < arr.length; i++) {
        let rowStr = (i === 0) ? '<thead><tr>' : '<tr>';
        const row = arr[i];
        for (let j = 0; j < row.length; j++) {
            rowStr = rowStr
                .concat('<td>')
                .concat(row[j])
                .concat('</td>');
        }
        rowStr = rowStr.concat((i === 0) ? '</tr></thead>' : '</tr>');
        tableStr = tableStr.concat(rowStr);
    }

    tableStr = tableStr.concat('</table>');

    return tableStr;
}

function htmlGridFromArray(arr) {
    // arr is a multidimensional grid
    let gridStr = '<div class="c-msg__grid" '
        .concat(' style="grid-template-columns: repeat(')
        .concat(arr[0].length)
        .concat(', max-content);"')
        .concat('>');
    for (let i = 0; i < arr.length; i++) {
        const cellClass = (i === 0) ? '<div class="hdr">' : '<div class="bdy">'
        const row = arr[i];
        let rowStr = '';
        for (let j = 0; j < row.length; j++) {
            rowStr = rowStr
                .concat(cellClass)
                .concat(row[j])
                .concat('</div>');
        }
        gridStr = gridStr.concat(rowStr);
    }

    gridStr = gridStr.concat('</div>');

    return gridStr;
}

/************************************************* LOCAL STORAGE */
function storeLocal(key, value) {
    try {
        window.localStorage.setItem(key, value);
        window.localStorage.getItem(key);
        return true;
    } catch (e) {
        return false;
    }
}

function loadLocal(key) {
    return window.localStorage.getItem(key);
}

function loadLocalSettings() {
    const retrievedOutputBaseName = loadLocal(LOCALSTORE_BASE_NAME.concat(OUTPUT_BASE_NAME_KEY));
    document.getElementById('output-base-name').value = (retrievedOutputBaseName) ? retrievedOutputBaseName : 'Open MCT Scripting';
}

function storeOutputBaseName() {
    document.getElementById('output-base-name').addEventListener("blur", function (ev) {
        storeLocal(LOCALSTORE_BASE_NAME.concat(OUTPUT_BASE_NAME_KEY), document.getElementById('output-base-name').value);
    }, false);

}
