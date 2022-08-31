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

function csvToArray(str, delimiter = ",") {
    // https://sebhastian.com/javascript-csv-to-array/
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    const rows = str.slice(str.indexOf("\n") + 1).split("\n");

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index];
            return object;
        }, {});
        return el;
    });

    // return the array
    return arr;
}

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

    // console.log(config);

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

    const link = document.createElement('a')
    const url = URL.createObjectURL(file)

    link.href = url
    link.download = file.name
    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
}
