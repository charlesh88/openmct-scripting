const outputStatsDisplay = document.getElementById('output-stats');
const defaultFileType = 'GCS';
const inputType = document.getElementById("inputType");
const inputGCS = document.getElementById("inputGCS");
const inputPRL = document.getElementById("inputPRL");
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
    toggleHiddenClass([inputGCS, inputPRL]);
}, false);

inputGCS.addEventListener("change", function (ev) {
    uploadGCSFiles(ev.currentTarget.files);
}, false);

inputPRL.addEventListener("change", function (ev) {
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
    let arrAllProcsAndTelem = [];

    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromPrlTraverse(values[i], filenames[i]);
        arrAllProcsAndTelem.push(...arrStepsAndTelem);

        outputMsg(filenames[i] + ' has ' + arrStepsAndTelem.length + ' telem ref(s)');
    }

    const objTelemByProc = procByTelem(arrAllProcsAndTelem);
    // TODO: this is the point to iterate through objTelemByGcs keys and validate against the dictionary array

    const outTelemByProcArr = telemByProcToCsvArr(objTelemByProc);

    console.log('outTelemByProcArr',outTelemByProcArr);

    let outTelemByProcStrArr = [];
    outTelemByProcArr.forEach(row => {
        outTelemByProcStrArr.push(
            row.join(',')
        );
    })

    // console.log('outTelemByProcStrArr', outTelemByProcStrArr);

    globalArrPathsAndRefs = outTelemByProcStrArr;

    outputMsg(lineSepStr);
    outputMsg('prl extraction done.  Total telem count = ' + Object.keys(objTelemByProc).length);

    btnDownloadTelemList.removeAttribute('disabled');
    btnDownloadTelemAndRefsList.removeAttribute('disabled');
}

gcsExtractTelemetry = function (filenames, values) {
    let nonUniqueTelemCntr = 0;
    arrAllProcsAndTelem = [];

    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromGcs(values[i], filenames[i]);
        arrAllProcsAndTelem.push(...arrStepsAndTelem);

        const telemCnt = arrStepsAndTelem.length;
        nonUniqueTelemCntr += telemCnt;
        outputMsg(filenames[i] + ' has ' + telemCnt + ' telem ref(s)');
    }

    const objTelemByGcs = telemByGcs(arrAllProcsAndTelem);
    // TODO: this is the point to iterate through objTelemByGcs keys and validate against the dictionary array

    const outTelemByGcsArr = telemByGcsToCsvArr(objTelemByGcs);

    // console.log(outTelemByGcsArr);

    globalArrPathsAndRefs = outTelemByGcsArr;

    outputMsg(lineSepStr);
    outputMsg('gcs extraction done.  Total telem count = ' + Object.keys(objTelemByGcs).length);

    btnDownloadTelemList.removeAttribute('disabled');
    btnDownloadTelemAndRefsList.removeAttribute('disabled');
}

function addToArrPathsAndRefs(path, filename, type) {
    let value = path.concat(",").concat(filename);
    if (type) {
        value += (",").concat(type);
    }
    globalArrPathsAndRefs.push(value);

    return true;
}

initPage = function() {
    for (let i = 0; i < inputType.options.length; i++) {
        if (inputType.options[i].value === defaultFileType.toLowerCase()) {
            inputType.selectedIndex = i;
            break;
        }
    }

    document.getElementById('input' + defaultFileType).classList.remove('--hidden');
}

document.body.onload = initPage();
