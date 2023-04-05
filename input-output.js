const outputStatsDisplay = document.getElementById('output-stats');
const myForm = document.getElementById("inputForm");
const csvFile = document.getElementById("csvFile");
const inputStatsDisplay = document.getElementById("input-stats");
const displayInputCsv = document.getElementById('display-csv');

myForm.addEventListener("submit", function (e) {
    // https://sebhastian.com/javascript-csv-to-array/
    e.preventDefault();
    const input = csvFile.files[0];
    const reader = new FileReader();

    if (input !== undefined) {
        reader.onload = function (e) {
            const text = e.target.result;
            const data = csvToArray(text);
            inputStatsDisplay.innerHTML = data.length + ' items found.';
            displayInputCsv.innerHTML = JSON.stringify(data);
            createOpenMCTJSON(data);
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

function getFormNumericVal(id) {
    const v = document.getElementById(id).value;
    return (v) ? parseInt(v) : null;
}

downloadJson = function (filename = 'Generated Open MCT import.json') {
    const strJson = JSON.stringify(objJson, null, 4);
    const file = new File([strJson], filename, {
        type: 'text/plain',
    })

    const link = document.createElement('a');
    const url = URL.createObjectURL(file);

    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
}
