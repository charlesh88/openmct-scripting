/************************************* https://ourcodeworld.com/articles/read/1438/how-to-read-multiple-files-at-once-using-the-filereader-class-in-javascript#google_vignette */
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
        if (fileType.includes('prl') || fileType.includes('py')) {
            filesToDisplays(filenames, values);
        } else if (fileType.includes('csv')) {
            createOpenMCTJSONfromCSV(values[0]);
        }
    });
}

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.rootName = document.getElementById('rootName').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.itemMargin = getFormNumericVal('itemMargin');

    config.dlWidgets = {};
    config.dlWidgets.layoutStrategy = document.getElementById('widgetLayoutStrategy').value;
    config.dlWidgets.layoutStrategyNum = getFormNumericVal('widgetLayoutStrategyNum');
    config.dlWidgets.itemW = getFormNumericVal('widgetLayoutItemWidth');
    config.dlWidgets.itemH = getFormNumericVal('widgetLayoutItemHeight');

    config.dlAlphas = {};
    config.dlAlphas.layoutStrategy = document.getElementById('alphaLayoutStrategy').value;
    config.dlAlphas.layoutStrategyNum = getFormNumericVal('alphaLayoutStrategyNum');
    config.dlAlphas.labelW = getFormNumericVal('alphaLayoutLabelWidth');
    config.dlAlphas.itemW = getFormNumericVal('alphaLayoutItemWidth');
    config.dlAlphas.itemH = getFormNumericVal('alphaLayoutItemHeight');

    return config;
}

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
    let fileDesc = '';
    switch (inputType.value) {
        case 'csv':
            fileDesc = downloadFileDesc.csv;
            break;
        case 'prl':
            fileDesc = downloadFileDesc.prl;
            break;
        case 'py':
            fileDesc = downloadFileDesc.py;
    }

    const filename = config.rootName
        .concat(' - ')
        .concat(fileDesc)
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
    // alert('wtf?!');
    // console.log(file);
    const link = document.createElement('a');
    link.setAttribute('download', file.name);
    const url = URL.createObjectURL(file);
    link.href = url;
    link.setAttribute('target', '_blank');
    // link.download = file.name;
    // document.body.appendChild(link);
    link.click();
    //
    // document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}

function outputMsg(msg) {
    outputMsgText.innerHTML = outputMsgText.innerHTML.concat("<br>".concat(msg));
}
