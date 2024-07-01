const INPUT_TYPE = "csv";
const inputJson = document.getElementById("inputJson");
const inputCsv = document.getElementById("inputCsv");
let srcFileName;
let srcContent;
let replaced;

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
        srcFileName = (files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        readSrc(values[0]);
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

function readSrc(inputTxt) {
    inputJson.toggleAttribute('disabled'); // Toggle to disabled
    inputCsv.toggleAttribute('disabled'); // Toggle to not disabled

    srcContent = inputTxt;

    outputMsg('Source file imported, '
        .concat(srcContent.length.toString())
        .concat(' chars.')
    );
}

function parseFindReplaceCsv(csv) {
    const arrFR = csvToArray(csv);
    outputMsg('Find / replace CSV imported '
        .concat(arrFR.length)
        .concat(' rows.'));

    replacedContent = srcContent;
    // Row [0] is a header row, skip it

    let arrOutputTable = [[
        'Search for',
        'Replace with',
        'Replaced'
    ]];

    for (let i = 1; i < arrFR.length; i++) {
        const findStr = arrFR[i][0].replaceAll(ESC_CHARS.backslash, '/');
        const replaceStr = arrFR[i][1];
        const foundCnt = countInstances(replacedContent, findStr);

        arrOutputTable.push([
            findStr,
            replaceStr,
            foundCnt,
        ]);

        replacedContent = replacedContent.replaceAll(findStr, replaceStr);
    }
    outputMsg(lineSepStr);
    outputMsgAdd(htmlGridFromArray(arrOutputTable));
    btnDownloadJson.removeAttribute('disabled');
}

function countInstances(mainString, searchString) {
    return (mainString.split(searchString).length - 1);
}

function downloadReplaced() {
    const fileType = 'text/'.concat(srcFileName.split('.').pop());

    downloadFile(new File([replacedContent], srcFileName, { type: fileType}));
}
