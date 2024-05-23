const inputType = document.getElementById("inputType");
const inputFile = document.getElementById("inputFile");
const btnDownloadTelem = document.getElementById("btnDownloadTelem");
const btnValidateTelem = document.getElementById("btnValidateTelem");
const OUTPUT_BASE_NAME_KEY = '_TELEM_EXTRACT_BASE_NAME';
const outputMsgText = document.getElementById("outputMsg");
const lineSepStr = '------------------------------------------------';

const FILE_TYPES = {
    'gcs': ['.py', true],
    'json': ['.json', false],
    'prl': ['.prl', true],
};
let CUR_FILE_TYPE = 'json';
let gObjByTelem = {};
let gStrArrByTelem = [];

storeOutputBaseName();
loadLocalSettings();

setFileInputProps = function (target, type) {
    target.accept = FILE_TYPES[type][0];
    target.multiple = FILE_TYPES[type][1];
}

inputType.addEventListener("change", function (ev) {
    CUR_FILE_TYPE = ev.target.value;
    setFileInputProps(
        inputFile, ev.target.value
    );
}, false);

inputFile.addEventListener("change", function (ev) {
    switch (CUR_FILE_TYPE) {
        case 'gcs':
            uploadGCSFiles(ev.currentTarget.files);
            break;
        case 'prl':
            uploadPrlFiles(ev.currentTarget.files);
            break;
        default:
            uploadJSONFiles(ev.currentTarget.files);
    }
}, false);

function getConfigFromForm() {
    return {
        'outputBaseName': document.getElementById('output-base-name').value
    };
}

function resetTelemetryExtract() {
    gStrArrByTelem = [];
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

function uploadJSONFiles(files) {
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
        jsonExtractTelemetry(filenames, values);
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

downloadTelemCsv = function () {
    const filename = config.outputBaseName;
    const list = gStrArrByTelem.join('\n');
    const file = new File([list], filename, {type: 'text/csv'});
    downloadFile(file);
    return false;
}

/*********************************** MULTIPLE FILE HANDLING */
prlExtractTelemetry = function (filenames, values) {
    let arrAllProcsAndTelem = [];

    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromPrlTraverse(values[i], filenames[i]);
        arrAllProcsAndTelem.push(...arrStepsAndTelem);

        outputMsg(filenames[i] + ' has ' + arrStepsAndTelem.length + ' telem ref(s)');
    }

    const objProcByTelem = procByTelem(arrAllProcsAndTelem);

    gObjByTelem = objProcByTelem;

    prlPackageExtractedTelemetryForCsv(gObjByTelem);
}

gcsExtractTelemetry = function (filenames, values) {
    let nonUniqueTelemCntr = 0;
    arrAllGcsAndTelem = [];

    for (let i = 0; i < filenames.length; i++) {
        const arrTelem = extractFromGcs(values[i], filenames[i]);
        arrAllGcsAndTelem.push(...arrTelem);

        const telemCnt = arrTelem.length;
        nonUniqueTelemCntr += telemCnt;
        outputMsg(filenames[i] + ' has ' + telemCnt + ' telem ref(s)');
    }

    const objGcsByTelem = gcsByTelem(arrAllGcsAndTelem);

    gObjByTelem = objGcsByTelem;

    gcsPackageExtractedTelemetryForCsv(gObjByTelem);
}

jsonExtractTelemetry = function (filename, value) {
    const jsonExtract = JSON.parse(value);
    console.log('jsonExtractTelemetry', jsonExtract);
    console.log(extractCompositionKeys(jsonExtract));

}

prlPackageExtractedTelemetryForCsv = function (objByTelem) {
    // console.log(CUR_FILE_TYPE, 'objByTelem', objByTelem, gObjByTelem);
    const outTelemByProcArr = telemByProcToCsvArr(objProcByTelem);

    let outTelemByProcStrArr = [];
    outTelemByProcArr.forEach(row => {
        outTelemByProcStrArr.push(
            row.join(',')
        );
    })

    gStrArrByTelem = outTelemByProcStrArr;

    outputMsg(lineSepStr);
    outputMsg('prl extraction done.  Total telem count = ' + Object.keys(objByTelem).length);

    btnDownloadTelem.removeAttribute('disabled');
    if (MDB_CONNECTED) {
        btnValidateTelem.removeAttribute('disabled');
    }
}

gcsPackageExtractedTelemetryForCsv = function (objByTelem) {
    // console.log(CUR_FILE_TYPE, 'objByTelem', objByTelem, gObjByTelem);
    const outGcsByTelemArr = gcsByTelemToCsvArr(objByTelem);

    gStrArrByTelem = outGcsByTelemArr;

    outputMsg(lineSepStr);
    outputMsg('gcs extraction done.  Total telem count = ' + Object.keys(objByTelem).length);

    btnDownloadTelem.removeAttribute('disabled');
    if (MDB_CONNECTED) {
        btnValidateTelem.removeAttribute('disabled');
    }
}

addValidationResult = function (obj, arrValidation) {
    const arrTelemPaths = Object.keys(arrValidation);
    let invalidCnt = 0;

    for (let i = 0; i < arrTelemPaths.length; i++) {
        const telemPath = arrTelemPaths[i];
        const pathValid = arrValidation[telemPath].validated;
        obj[telemPath].testPath = arrValidation[telemPath].testPath;
        obj[telemPath].valid = pathValid;
        invalidCnt = pathValid ? invalidCnt : invalidCnt + 1;
    }

    outputMsg('Validation complete. '
        .concat(invalidCnt.toString())
        .concat(' invalid paths found; ')
        .concat((arrTelemPaths.length - invalidCnt).toString())
        .concat(' valid paths found.'));

    console.log('addValidationResult', obj);
    return obj;
}

validateTelem = function () {
    btnDownloadTelem.setAttribute('disabled', true);
    btnValidateTelem.setAttribute('disabled', true);

    outputMsg(lineSepStr);
    outputMsg('Validating '.concat(Object.keys(gObjByTelem).length)
        .concat(' paths...'));

    const keysToValidate = Object.keys(gObjByTelem);
    if (keysToValidate && keysToValidate.length > 0) {
        validateParamsAgainstYamcsMdb(keysToValidate)
            .then(arrKeysValidated => {
                if (arrKeysValidated) {
                    gObjByTelem = addValidationResult(gObjByTelem, arrKeysValidated);

                    switch (CUR_FILE_TYPE) {
                        case 'gcs':
                            gcsPackageExtractedTelemetryForCsv(gObjByTelem);
                            break;
                        case 'prl':
                            prlPackageExtractedTelemetryForCsv(gObjByTelem);
                            break;
                        default:
                            // jsonPackageExtractedTelemetryForCsv(gObjByTelem); TODO: add this function!

                    }
                }
            })
    }
}

initPage = function () {
    for (let i = 0; i < inputType.options.length; i++) {
        if (inputType.options[i].value === CUR_FILE_TYPE) {
            inputType.selectedIndex = i;
            break;
        }
    }

    setFileInputProps(inputFile, CUR_FILE_TYPE);
}

document.body.onload = initPage();
