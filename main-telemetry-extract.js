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

inputType.addEventListener("change", function(ev){
    toggleHiddenClass([inputGCS, inputPrl]);
}, false);

inputGCS.addEventListener("change", function(ev){
    uploadGCSFiles(ev.currentTarget.files);
}, false);

inputPrl.addEventListener("change", function(ev){
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
    if(!files.length) return;

    // Store promises in array
    for(let i = 0;i < files.length;i++){
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
    if(!files.length) return;

    // Store promises in array
    for(let i = 0;i < files.length;i++){
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        prlExtractTelemetry(filenames, values);
    });
}

/*********************************** MULTIPLE FILE HANDLING */
prlExtractTelemetry = function(filenames, values) {
    let nonUniqueTelemCntr = 0;

    for (let i = 0; i < filenames.length; i++) {
        const telemCnt = extractTelemFromPrl(values[i], filenames[i]);
        nonUniqueTelemCntr += telemCnt;
        outputMsg(filenames[i] + ' has ' + telemCnt + ' telem ref(s)');
    }
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
extractTelemFromPrl = function (strValue, filename) {
    let xmlDoc = new DOMParser().parseFromString(strValue, "text/xml");
    const arrDataReferences = xmlDoc.getElementsByTagName("prl:DataReference");
    const arrDataNomenclature = xmlDoc.getElementsByTagName("prl:DataNomenclature");
    let arrTelem = [];
    let arrUniqueTelemForProc = [];
    // const arrVerifications = xmlDoc.getElementsByTagName("prl:VerifyGoal");
    // const filterParams = checkboxFilterParameters.checked;

    let nonUniqueTelemCntr = 0;

    if (arrDataReferences.length > 0) {
        arrTelem = extractTelemFromPrlDataReferences(arrDataReferences);
        if (arrTelem.length > 0) {
            for (let i = 0; i < arrTelem.length; i++) {
                const path = arrTelem[i];
                addToArrUniquePaths(path);
                if (!arrUniqueTelemForProc.includes(path)) {
                    arrUniqueTelemForProc.push(path);
                    addToArrPathsAndRefs(escForCsv(path), filename,'DataReference');
                }
            }
        }
        nonUniqueTelemCntr += arrUniqueTelemForProc.length;
    }

    // Reset so we can also grab telem in a different ref type
    arrUniqueTelemForProc = [];

    if (arrDataNomenclature.length > 0) {
        arrTelem = extractTelemFromPrlDataNomenclature(arrDataReferences);
        if (arrTelem.length > 0) {
            for (let i = 0; i < arrTelem.length; i++) {
                const path = arrTelem[i];
                addToArrUniquePaths(path);
                if (!arrUniqueTelemForProc.includes(path)) {
                    arrUniqueTelemForProc.push(path);
                    addToArrPathsAndRefs(escForCsv(path), filename,'DataNomenclature');
                }
            }
        }
        nonUniqueTelemCntr += arrUniqueTelemForProc.length;

    }

    return nonUniqueTelemCntr;
}

/*********************************** GCS .PY FUNCTIONS */
extractTelemFromGCS = function (strValue, filename) {
    const lines = strValue.split('\n');
    const regex = "(?<=\\(')(.*?)(?=')";
    let telemCount = 0;

    for (let i = 0; i < lines.length; i++) {
        if (
            !lines[i].includes('#') &&
            (
                lines[i].includes('getval(') ||
                lines[i].includes('checkval(')
            )
        ) {
            const telem = getStrBetweenRegex(lines[i], regex);
            if (telem) {
                telemCount++;
                addToArrPathsAndRefs(telem, filename, (lines[i].includes('getval')) ? 'getval' : 'checkval');
                addToArrUniquePaths(telem);
            }
        }
    }
    return telemCount;
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

function getStrBetween(str, start, end) {
    const result = str.match(new RegExp(start + "(.*?)" + end));
    return result[1];
}

function getStrBetweenRegex(str, regex) {
    const result = str.match(new RegExp(regex));
    if (!result) { return undefined; }
    return result[0];
}
