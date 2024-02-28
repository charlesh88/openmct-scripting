/************************************************* INPUTS AND UPLOADING */
function readFileAsText(file){
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(){
            resolve(fr.result);
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsText(file);
    });
}

function uploadFiles(files, fileType) {
    let readers = [];
    let filenames = [];

    // Abort if there were no files selected
    if(!files.length) return;

    // Store promises in array
    for(let i = 0;i < files.length;i++){
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]

        if (fileType.includes('prl')) {
            processInputPrls(filenames, values);
        } else if (fileType.includes('csv')) {
            processInputCsvs(filenames, values);
        }
    });
}

function uploadMatrixFile(files, fileType) {
    let readers = [];
    let filenames = [];

    // Abort if there were no files selected
    if(!files.length) return;

    // Store promises in array
    for(let i = 0;i < files.length;i++){
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
    const arrLines = str.split(/\r?\n/).filter((row) => row.length > 0);

    const arrCleaned = arrLines.map(function (row) {
        // Convert escaped characters like commas, backslashes and tildes
        let valuesStr = row
            .replaceAll('\\,', ESC_CHARS.escComma)
            .replaceAll('\\~', ESC_CHARS.tilde)
            .replaceAll('\\/', ESC_CHARS.backslash);

        valuesStr = valuesStr.replace(/"[^"]+"/g, function (v) {
            // Isolate strings within double-quote blocks and encode all commas in there
            return v.replaceAll(',', ESC_CHARS.comma);
        })
        // Convert all tildes to backslashes - TODO: change these to tildes at the time of path creation
        // TEMP: don't do this right now!
        //.replaceAll('~','/');

        const valuesArr = valuesStr.split(delimiter);

        if (valuesArr.length > 0) {
            // Restore escaped characters
            const valuesArrRestored = valuesArr.map(function (value) {
                const valueRestored = value
                    .replaceAll('\"', '')
                    .replaceAll(ESC_CHARS.comma, ',')
                    .replaceAll(ESC_CHARS.tilde, '~')
                    .replaceAll('/', '~') // TEMP
                    .replaceAll(ESC_CHARS.backslash, '/');
                return valueRestored;
            })

            return valuesArrRestored;
        }
    })

    console.log('csvToArray', arrCleaned);

    return arrCleaned;
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
    let outputJSON = JSON.stringify(objJson, null, 4);
    const updateTime = new Date();
    outputStatsDisplay.innerHTML =
        'Generated ' +
        updateTime.getHours().toString().padStart(2, '0') + ':' +
        updateTime.getMinutes().toString().padStart(2, '0') + ':' +
        updateTime.getSeconds().toString().padStart(2, '0') + ' | ' +
        outputJSON.length + ' chars';
    btnDownloadJson.removeAttribute('disabled');
}

downloadJson = function () {
    const filename = config.outputBaseName
        .concat(' - ')
        .concat(INPUT_TYPE.includes('csv')? downloadFilenames.csv : downloadFilenames.prl)
        .concat('.json');
    const strJson = JSON.stringify(objJson, null, 4);
    const file = new File([strJson], filename, {
        type: 'text/json',
    })

    downloadFile(file);
}

downloadTelemList = function() {
    const filename = config.outputBaseName.concat(' - Uniques.csv');
    const list = globalArrUniquePaths.join('\n');
    const file = new File([list], filename, { type: 'text/csv'});
    downloadFile(file);
    return false;
}

downloadTelemAndRefsList = function() {
    const filename = config.outputBaseName.concat(' - Telemetry and Refs.csv');
    const list = globalArrPathsAndRefs.join('\n');
    const file = new File([list], filename, { type: 'text/csv'});
    downloadFile(file);
    return false;
}

downloadFile = function(file) {
    const link = document.createElement('a');
    link.setAttribute('download', file.name);
    const url = URL.createObjectURL(file);
    link.href = url;
    link.setAttribute('target', '_blank');
    link.click();
    window.URL.revokeObjectURL(url);
}

function outputMsg(msg) {
    outputMsgText.innerHTML = outputMsgText.innerHTML.concat("<br>".concat(msg));
}

/************************************************* LOCAL STORAGE */
function storeLocal(key, value) {
    // console.log('storeLocal', key, value);
    window.localStorage.setItem(key, value);
}

function loadLocal(key) {
    // console.log('loadLocal', key);
    return window.localStorage.getItem(key);
}
