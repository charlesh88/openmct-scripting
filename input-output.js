/************************************* https://ourcodeworld.com/articles/read/1438/how-to-read-multiple-files-at-once-using-the-filereader-class-in-javascript#google_vignette */
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
    const filename = config.rootName
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
    const filename = 'Unique Telemetry List.csv';
    const list = globalArrUniquePaths.join('\n');
    const file = new File([list], filename, { type: 'text/csv'});
    downloadFile(file);
    return false;
}

downloadTelemAndRefsList = function() {
    const filename = 'Telemetry and Refs.csv';

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
    // Example: { csv-to-stacked-view.base-name: string }
    window.localStorage.setItem(key, value);
}

function loadLocal(key) {
    return window.localStorage.getItem(key);
}

function checkLocalStorageExists() {
    return window.localStorage.getItem(LOCAL_STORAGE_KEY);
}
storeBaseName = function() {
    storeLocal('OPENMCT_SCRIPTING__BASENAME', config.rootName.value);
}

retrieveBaseName = function() {
    storeLocal('OPENMCT_SCRIPTING__BASENAME', config.rootName.value);
}
