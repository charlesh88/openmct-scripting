const inputType = document.getElementById("inputType");
const inputFile = document.getElementById("inputFile");
const btnDownloadTelem = document.getElementById("btnDownloadTelem");
const btnValidateTelem = document.getElementById("btnValidateTelem");
const OUTPUT_BASE_NAME_KEY = '_TELEM_EXTRACT_BASE_NAME';
const outputMsgText = document.getElementById("outputMsg");

const FILE_TYPES = {
    'gcs': ['.py', true],
    'json': ['.json', false],
    'prl': ['.prl', true],
};
let CUR_FILE_TYPE = 'json';
let gObjByTelem = {};
let gStrArrByTelem = [];

const OUTPUTMSG_ARR = [[
    'File',
    'Telemetry Refs'
]];

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

/*********************************** FILE UPLOADING */
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

/*********************************** FILE DOWNLOADING */
downloadTelemCsv = function () {
    const filename = config.outputBaseName;
    const list = gStrArrByTelem.join('\n');
    const file = new File([list], filename, {type: 'text/csv'});
    downloadFile(file);
    return false;
}

/*********************************** FILE PROCESSING - EXTRACTION */
prlExtractTelemetry = function (filenames, values) {
    let arrAllProcsAndTelem = [];

    for (let i = 0; i < filenames.length; i++) {
        const arrStepsAndTelem = extractFromPrlTraverse(values[i], filenames[i]);
        arrAllProcsAndTelem.push(...arrStepsAndTelem);

        OUTPUTMSG_ARR.push([
            filenames[i],
            arrStepsAndTelem.length
        ]);
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

        OUTPUTMSG_ARR.push([
            filenames[i],
            telemCnt
        ]);
    }

    const objGcsByTelem = gcsByTelem(arrAllGcsAndTelem);

    gObjByTelem = objGcsByTelem;

    gcsPackageExtractedTelemetryForCsv(gObjByTelem);
}

jsonExtractTelemetry = function (filename, value) {
    const jsonExtract = JSON.parse(value);

    let arrAllContainersAndTelem = extractCompositionKeysToObjArray(jsonExtract);
    const objOpenMCTContainerByTelem = openMCTContainerByTelem(arrAllContainersAndTelem);

    gObjByTelem = objOpenMCTContainerByTelem;

    jsonPackageExtractedTelemetryForCsv(objOpenMCTContainerByTelem);
}

/*********************************** FILE PROCESSING - PACKAGING FOR OUTPUT */
prlPackageExtractedTelemetryForCsv = function (objByTelem) {
    const outTelemByProcArr = telemByProcToCsvArr(objProcByTelem);

    let outTelemByProcStrArr = [];
    outTelemByProcArr.forEach(row => {
        outTelemByProcStrArr.push(
            row.join(',')
        );
    })

    gStrArrByTelem = outTelemByProcStrArr;

    OUTPUTMSG_ARR.push([
        'TOTAL UNIQUE TELEM REFERENCES',
        Object.keys(objByTelem).length
    ])

    outputMsg(htmlGridFromArray(OUTPUTMSG_ARR));

    btnDownloadTelem.removeAttribute('disabled');
    if (MDB_CONNECTED) {
        btnValidateTelem.removeAttribute('disabled');
    }
}

gcsPackageExtractedTelemetryForCsv = function (objByTelem) {
    const outGcsByTelemArr = gcsByTelemToCsvArr(objByTelem);

    gStrArrByTelem = outGcsByTelemArr;

    OUTPUTMSG_ARR.push([
        'TOTAL UNIQUE TELEM REFERENCES',
        Object.keys(objByTelem).length
    ])

    outputMsg(htmlGridFromArray(OUTPUTMSG_ARR));

    btnDownloadTelem.removeAttribute('disabled');
    if (MDB_CONNECTED) {
        btnValidateTelem.removeAttribute('disabled');
    }
}

jsonPackageExtractedTelemetryForCsv = function (objByTelem) {
    const arrOut = openMCTContainerByTelemToCsvArr(objByTelem);

    gStrArrByTelem = arrOut;

    console.log('jsonPackageExtractedTelemetryForCsv', gStrArrByTelem);

    OUTPUTMSG_ARR.push([
        'TOTAL UNIQUE TELEM REFERENCES',
        Object.keys(objByTelem).length
    ])

    outputMsg(htmlGridFromArray(OUTPUTMSG_ARR));

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
    const keysToValidate = Object.keys(gObjByTelem);
    const maxParams = 700;
    let continueValidation = false;

    if (keysToValidate && keysToValidate.length > 0) {
        if (keysToValidate.length > maxParams) {
            continueValidation = confirm('The number of parameters to validate is greater than '
                .concat(maxParams.toString()
                    .concat(' and may not complete. Do you want to try anyway?')));
        } else {
            continueValidation = true;
        }

        if (continueValidation) {
            btnDownloadTelem.setAttribute('disabled', true);
            btnValidateTelem.setAttribute('disabled', true);

            outputMsg(lineSepStr);
            outputMsg('Validating '.concat(Object.keys(gObjByTelem).length)
                .concat(' paths...'));

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
                                jsonPackageExtractedTelemetryForCsv(gObjByTelem);

                        }
                    }
                })
        }
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
