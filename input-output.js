const outputStatsDisplay = document.getElementById('output-stats');
const myForm = document.getElementById("inputForm");
const inputFile = document.getElementById("inputFile");
const inputStatsDisplay = document.getElementById("input-stats");
const displayInputCsv = document.getElementById('display-csv');

/*myForm.addEventListener("submit", function (e) {
    // https://sebhastian.com/javascript-csv-to-array/
    // Fires when the Generate button is pressed
    e.preventDefault();
    const input = inputFile.files[0];
    const inputType = document.getElementById('inputType').selectedOptions[0].value;
    // console.log(inputType);
    const reader = new FileReader();

    if (input !== undefined) {
        reader.onload = function (e) {
            if (input.name.includes('.csv')) {
                const data = csvToArray(e.target.result);
                inputStatsDisplay.innerHTML = data.length + ' items found.';
                displayInputCsv.innerHTML = JSON.stringify(data);
                createOpenMCTJSONfromCSV(data, 'csv');
            } else if (input.name.includes('.prl')) {
                // console.log('Pride proc stuff path goes here');
                prlToDisplayMain(e.target.result, input.name);
            } else {
                inputStatsDisplay.innerHTML = 'Please select a CSV or PRL file and try again.'
            }
        };

        reader.readAsText(input);
    } else {
        inputStatsDisplay.innerHTML = 'Please select a CSV or PRL file and try again.'
    }
});*/

/************************************* https://ourcodeworld.com/articles/read/1438/how-to-read-multiple-files-at-once-using-the-filereader-class-in-javascript#google_vignette */
function readFileAsText(file){
    return new Promise(function(resolve,reject){
        let fr = new FileReader();

        fr.onload = function(){
            resolve(fr.result);
            const filename = file.name;
            // console.log(file.name, 'fr.onload',fr);
            if (filename.includes('.csv')) {
                const data = csvToArray(fr.result);
                inputStatsDisplay.innerHTML = data.length + ' items found.';
                displayInputCsv.innerHTML = JSON.stringify(data);
                createOpenMCTJSONfromCSV(data, 'csv');
            } else if (filename.includes('.prl')) {
                // console.log('Pride proc stuff path goes here');
                prlToDisplayMain(fr.result, filename);
            } else {
                inputStatsDisplay.innerHTML = 'Please select a CSV or PRL file and try again.'
            }
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsText(file);
    });
}

// Handle fileupload
document.getElementById("fileinput").addEventListener("change", function(ev){
    let file = ev.currentTarget.files[0];

    // Abort file reading if no file was selected
    if(!file) return;

    readFileAsText(file).then((fileContent) => {
        // Print file content on the console
        console.log(fileContent);
    });
}, false);




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
