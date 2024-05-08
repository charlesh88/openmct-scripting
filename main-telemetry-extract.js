const outputStatsDisplay = document.getElementById('output-stats');
const inputType = document.getElementById("inputType");
const inputGCS = document.getElementById("inputGCS");
const inputPrl = document.getElementById("inputPrl");
const btnDownloadTelemList = document.getElementById("btnDownloadTelemList");
// const checkboxFilterParameters = document.getElementById("checkboxFilterParameters");
const OUTPUT_BASE_NAME_KEY = '_TELEM_EXTRACT_BASE_NAME';
const btnDownloadTelemAndRefsList = document.getElementById("btnDownloadTelemAndRefsList");
const outputMsgText = document.getElementById("outputMsg");
const lineSepStr = '------------------------------------------------';
let globalArrUniquePaths = [];
let globalArrPathsAndRefs = [];

storeOutputBaseName();
loadLocalSettings();

inputType.addEventListener("change", function (ev) {
    toggleHiddenClass([inputGCS, inputPrl]);
}, false);

inputGCS.addEventListener("change", function (ev) {
    uploadGCSFiles(ev.currentTarget.files);
}, false);

inputPrl.addEventListener("change", function (ev) {
    uploadPrlFiles(ev.currentTarget.files);
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;

    return config;
}

function resetTelemetryExtract() {
    globalArrUniquePaths = ['Unique Path'];
    globalArrPathsAndRefs = ['Path,Filename,Type'];
    outputMsgText.innerHTML = '';
}

function uploadGCSFiles(files) {
    config = getConfigFromForm();
    resetTelemetryExtract();
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
        gcsExtractTelemetry(filenames, values);
    });
}

function uploadPrlFiles(files) {
    config = getConfigFromForm();
    resetTelemetryExtract();
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
        prlExtractTelemetry(filenames, values);
    });
}

/*********************************** MULTIPLE FILE HANDLING */
prlExtractTelemetry = function (filenames, values) {
    let nonUniqueTelemCntr = 0;
    arrAllProcsAndTelem = [];

    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromPrlExpanded(values[i], filenames[i]);
        arrAllProcsAndTelem.push(...arrStepsAndTelem);

        const telemCnt = arrStepsAndTelem.length;
        nonUniqueTelemCntr += telemCnt;
        outputMsg(filenames[i] + ' has ' + telemCnt + ' telem ref(s)');
    }

    // console.log('arrAllProcsAndTelem', arrAllProcsAndTelem);
    const objTelemByProc = telemByProc(arrAllProcsAndTelem);
    // console.log('objTelemByProc', objTelemByProc);

    const outTelemByProcArr = telemByProcToArr(objTelemByProc);

    console.log('outTelemByProcArr',outTelemByProcArr);

    let outTelemByProcStrArr = [];
    outTelemByProcArr.forEach(row => {
        outTelemByProcStrArr.push(
            row.join(',')
        );
    })

    console.log('outTelemByProcStrArr', outTelemByProcStrArr);

    globalArrPathsAndRefs = outTelemByProcStrArr;

    outputMsg(lineSepStr);
    outputMsg('Prl extraction done. ' +
        'Total telem count = ' + nonUniqueTelemCntr + '; ' +
        'Total uniques = ' + globalArrUniquePaths.length);

    btnDownloadTelemList.removeAttribute('disabled');
    btnDownloadTelemAndRefsList.removeAttribute('disabled');
}

gcsExtractTelemetry = function (filenames, values) {
    let nonUniqueTelemCntr = 0;

    for (let i = 0; i < filenames.length; i++) {
        const telemCnt = extractTelemFromGCS(values[i], filenames[i]);
        nonUniqueTelemCntr += telemCnt;
        outputMsg(filenames[i] + ' has ' + telemCnt + ' telem ref(s)');
    }
    outputMsg(lineSepStr);
    outputMsg('GCS extraction done. ' +
        'Total telem count = ' + nonUniqueTelemCntr + '; ' +
        'Total uniques = ' + globalArrUniquePaths.length);
    btnDownloadTelemList.removeAttribute('disabled');
    btnDownloadTelemAndRefsList.removeAttribute('disabled');
}

/*********************************** .PRL FUNCTIONS */
telemByProc = function (arr) {
    /*
    Expects an array of objects in format from extractFromPrlExpanded
    Go through arr, get path and add as an object key to the objTelemByProc
    */
    objTelemByProc = {};
    for (let i = 0; i < arr.length; i++) {
        // console.log('arr[i]',arr[i].path);
        const curPath = arr[i].path;
        if (!Object.keys(objTelemByProc).includes(curPath)) {
            objTelemByProc[curPath] = {
                'refType': arr[i].refType,
                'procs': {},
                'procCount': 0
            }
        }
        const objCurTelemProcs = objTelemByProc[curPath].procs;
        const curProc = arr[i].procedure;
        if (!Object.keys(objCurTelemProcs).includes(curProc)) {
            objTelemByProc[curPath].procCount += 1;
            objTelemByProc[curPath].procs[curProc] = {
                'steps': []
            }
        }
        objTelemByProc[curPath].procs[curProc].steps.push(arr[i].number.concat(' ', arr[i].desc));
    }

    return objTelemByProc;
}

function addToArrUniquePaths(path) {
    if (!globalArrUniquePaths.includes(path)) {
        globalArrUniquePaths.push(path);
        return true;
    }

    return false;
}

function addToArrPathsAndRefs(path, filename, type) {
    let value = path.concat(",").concat(filename);
    if (type) {
        value += (",").concat(type);
    }
    globalArrPathsAndRefs.push(value);

    return true;
}
