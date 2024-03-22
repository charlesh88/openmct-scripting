const INPUT_TYPE = "csv";
const inputJson = document.getElementById("inputJson");
const inputCsv = document.getElementById("inputCsv");
let jsonFileName;
let jsonSrc;
let jsonReplaced;

inputJson.addEventListener("change", function (ev) {
    uploadJsonSrc(ev.currentTarget.files);
}, false);

inputCsv.addEventListener("change", function (ev) {
    uploadFRCsv(ev.currentTarget.files);
}, false);

function uploadJsonSrc(files) {
    let readers = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    for (let i = 0; i < files.length; i++) {
        jsonFileName = (files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        readJsonSrc(values[0]);
    });
}

function uploadFRCsv(files) {
    let readers = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    readers.push(readFileAsText(files[0]));

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        parseFindReplaceCsv(values[0]);
    });
}

function readJsonSrc(json) {
    inputJson.toggleAttribute('disabled'); // Toggle to disabled
    inputCsv.toggleAttribute('disabled'); // Toggle to not disabled

    jsonSrc = json;
    // console.log(jsonSrc);

    outputMsg('Open MCT JSON imported '
        .concat(jsonSrc.length.toString())
        .concat(' chars.')
    );
}

function parseFindReplaceCsv(csv) {
    const arrFR = csvToArray(csv);
    outputMsg('Find replace CSV imported '
        .concat(arrFR.length)
        .concat(' rows.'));

    jsonReplaced = jsonSrc;
    // Row [0] is a header row, skip it

    let arrOutputTable = [[
        'Found',
        'Search',
        'Replace'
    ]];

    for (let i = 1; i < arrFR.length; i++) {
        const findStr = arrFR[i][0].replaceAll(ESC_CHARS.backslash, '/');
        const replaceStr = arrFR[i][1];
        const foundCnt = countInstances(jsonReplaced, findStr);

        arrOutputTable.push([
            foundCnt,
            findStr,
            replaceStr
        ]);

        jsonReplaced = jsonReplaced.replaceAll(findStr, replaceStr);
    }
    outputMsgAdd(htmlGridFromArray(arrOutputTable));
    btnDownloadJson.removeAttribute('disabled');
}

function countInstances(mainString, searchString) {
    return (mainString.split(searchString).length - 1);
}

function downloadReplaced() {
    downloadFile(new File([jsonReplaced], jsonFileName, { type: 'text/json'}));
}
