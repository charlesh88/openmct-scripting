const INPUT_TYPE = "csv";

inputCsv.addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};
    config.rootName = document.getElementById('rootName').value;
    return config;
}

function createOpenMCTJSONfromCSV(csv) {
    const plotObjectArr = csvToArray(csv);

    config = getConfigFromForm();
    let root = objJson.openmct = new Container();

    let stackedPlotObj = new StackedPlot(config.rootName);
    root.addJson(stackedPlotObj);
    objJson.rootId = stackedPlotObj.identifier.key;

    let curOverlayPlotName = '';
    let curOverlayPlotObj;

    for (let i = 0; i < plotObjectArr.length; i++) {
        const telemObj = plotObjectArr[i];
        const telemObjDataSrc = telemObj.DataSource;
        const overlayPlotName = telemObj.OverlayPlotName;

        if (overlayPlotName.length > 0) {
            if (curOverlayPlotName !== overlayPlotName) {
                // Create a new overlayPlotObj
                curOverlayPlotObj = new OverlayPlot(overlayPlotName);
                // Add it to stackedPlotObj as curOverlayPlotObj
                root.addJson(curOverlayPlotObj);
                stackedPlotObj.addToComposition(curOverlayPlotObj.identifier.key);
                // Set curOverlayPlotName to the new name
                curOverlayPlotName = overlayPlotName;
            }
            // add telemObj to curOverlayPlotObj;
            curOverlayPlotObj.addToComposition(telemObjDataSrc, 'taxonomy');
            curOverlayPlotObj.addToSeries(telemObj);
        } else {
            stackedPlotObj.addToComposition(telemObjDataSrc, 'taxonomy');
            stackedPlotObj.addToSeries(telemObj);
        }
    }

    outputJSON();
}
