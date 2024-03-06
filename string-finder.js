const inputForm = document.getElementById("input-form");
const replaceForm = document.getElementById("replace-form");
let inputFileText;
let inputFileName;
let replaceFileText;
let replacedFileText;
const btnSearch = document.getElementById('search-button');
const btnReplace = document.getElementById('replace-button');
const btnSaveReplaced = document.getElementById('save-replaced-button');

inputForm.addEventListener("submit", function (e) {
    // https://sebhastian.com/javascript-csv-to-array/
    e.preventDefault();
    const inputFile = document.getElementById("input-file");
    const input = inputFile.files[0];
    inputFileName = inputFile.files[0].name;
    const reader = new FileReader();

    if (input !== undefined) {
        reader.onload = function (e) {
            inputFileText = e.target.result;
        };

        reader.readAsText(input);
        btnSearch.removeAttribute("disabled");
    } else {
        inputStatsDisplay.innerHTML = 'Please select a file and try again.'
    }
});

replaceForm.addEventListener("submit", function (e) {
    // https://sebhastian.com/javascript-csv-to-array/
    e.preventDefault();
    const replaceFile = document.getElementById("replace-file");
    const input = replaceFile.files[0];
    const reader = new FileReader();

    if (input !== undefined) {
        reader.onload = function (e) {
            replaceFileText = e.target.result;
        };

        reader.readAsText(input);
        // btnReplace.disabled = false;
        btnReplace.removeAttribute("disabled");
    } else {
        inputStatsDisplay.innerHTML = 'Please select a file and try again.'
    }
});


findMatches = function() {
    const searchStr = document.getElementById("search-regex").value;
    const outputHolder = document.getElementById("matches-output");
    let resultsArr = [];

    addStat("matches-stats", "Length: " + inputFileText.length, true);
    // addStat("matches-stats", "Searching for matches: " + searchStr);

    const matches = [...inputFileText.matchAll(searchStr)];

    outputHolder.innerHTML = '';

    for (let i = 0; i < matches.length; i++) {
        resultsArr.push(matches[i][0]);
    }

    let resultsUnique = [...new Set(resultsArr)];

    addStat("matches-stats", resultsUnique.length + " unique matches found:");

    const resultsUniqueSorted = resultsUnique.sort();

    for (let i = 0; i < resultsUniqueSorted.length; i++) {
        outputHolder.innerHTML += resultsUniqueSorted[i] + '<br />';
    }
}

replaceStrings = function() {
    const replaceTable = csvToObjArray(replaceFileText);
    const replaceOutput = document.getElementById("replace-output");
    let replaceCnt = 0;

    addStat("replace-stats", "Replace table has " + replaceTable.length + " rows", true);
    // console.log(replaceTable[0].Find);

    if (inputFileText && inputFileText.length > 0) {
        // Do replacements
        let replacedText = inputFileText;
        // let replacingText = replacedText;
        for (let i = 0; i < replaceTable.length; i++) {
            replacedText = replacedText.replaceAll(replaceTable[i].Find, replaceTable[i].Replace);
        }

        //replaceOutput.innerHTML = replacedText;
        replacedFileText =  replacedText;
        btnSaveReplaced.removeAttribute("disabled");

        addStat("replace-stats", "Replace action complete");

    } else {
        addStat("replace-stats", "Select an input file to search first");
    }
}

saveReplacedFile = function () {
    // const strJson = JSON.stringify(objJson, null, 4);
    const filename = inputFileName.replaceAll(".json", " replaced.json");

    const file = new File([replacedFileText], filename, {
        type: 'text/plain',
    })

    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
