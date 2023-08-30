const outputStatsDisplay = document.getElementById('output-stats');
const myForm = document.getElementById("inputForm");
const inputFile = document.getElementById("inputFile");
const inputStatsDisplay = document.getElementById("input-stats");
const displayInputCsv = document.getElementById('display-csv');

myForm.addEventListener("submit", function (e) {
    // https://sebhastian.com/javascript-csv-to-array/
    // Fires when the Generate button is pressed
    e.preventDefault();
    const input = inputFile.files[0];
    const inputType = document.getElementById('inputType').selectedOptions[0].value;
    // console.log(inputType);
    const reader = new FileReader();

    if (input !== undefined) {
        reader.onload = function (e) {
            if (inputType.includes('csv')) {
                const data = csvToArray(e.target.result);
                inputStatsDisplay.innerHTML = data.length + ' items found.';
                displayInputCsv.innerHTML = JSON.stringify(data);
                createOpenMCTJSONfromCSV(data, 'csv');
            } else {
                // console.log('Pride proc stuff path goes here');
                prlToDisplayMain(e.target.result, input.name);
            }
        };

        reader.readAsText(input);
    } else {
        inputStatsDisplay.innerHTML = 'Please select a telemetry objects CSV file and try again.'
    }
});

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
