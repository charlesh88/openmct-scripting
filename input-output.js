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
        };

        fr.onerror = function(){
            reject(fr);
        };

        fr.readAsText(file);
    });
}

// Handle fileupload
document.getElementById("fileinput").addEventListener("change", function(ev){
    let files = ev.currentTarget.files;
    let readers = [];
    let filenames = [];
    const fileType = document.getElementById('inputType').selectedOptions[0].value;

    // Abort if there were no files selected
    if(!files.length) return;

    // Store promises in array
    for(let i = 0;i < files.length;i++){
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        // console.log(filenames);
        // console.log(values);
        if (fileType.includes('prl')) {
            prlToDisplays(filenames, values);
        }
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
