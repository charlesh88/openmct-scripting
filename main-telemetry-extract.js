const outputStatsDisplay = document.getElementById('output-stats');
// const myForm = document.getElementById("inputForm");
const inputGCS = document.getElementById("inputGCS");
const btnDownloadTelemList = document.getElementById("btnDownloadTelemList");
const outputMsgText = document.getElementById("outputMsg");

let globalArrUniquePaths = [];

inputGCS.addEventListener("change", function(ev){
    uploadFiles(ev.currentTarget.files, 'py');
}, false);

gcsExtractTelemetry = function (filenames, values) {
    let nonUniqueTelemCntr = 0;

    const lineSepStr = '------------------------------------------------';
    for (let i = 0; i < filenames.length; i++) {
        const telemCnt = extractTelemFromGCS(values[i]);
        nonUniqueTelemCntr += telemCnt;
        outputMsg(filenames[i] + ' has ' + telemCnt + ' telem ref(s)');
    }
    outputMsg(lineSepStr);
    outputMsg('Done. ' +
        'Total telem count = ' + nonUniqueTelemCntr + '; ' +
        'Total uniques = ' + globalArrUniquePaths.length);
    btnDownloadTelemList.removeAttribute('disabled');
}

extractTelemFromGCS = function (strValue) {
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
                if (!globalArrUniquePaths.includes(telem)) {
                    globalArrUniquePaths.push(telem);
                }
            }
        }
    }
    return telemCount;
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
