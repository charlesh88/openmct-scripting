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

    // Create the root folder
    let folderRoot = new Obj(config.rootName, 'folder', true);
    root.addJson(folderRoot);
    objJson.rootId = folderRoot.identifier.key;

    // Create a folder for Overlay Plots
    let folderOverlayPlots = new Obj('Overlay Plots', 'folder', true);
    root.addJson(folderOverlayPlots);
    folderRoot.addToComposition(folderOverlayPlots.identifier.key);
    folderOverlayPlots.setLocation(folderRoot);

    let stackedPlotObj = new StackedPlot(config.rootName.concat(' Stacked Plot'));
    root.addJson(stackedPlotObj);
    folderRoot.addToComposition(stackedPlotObj.identifier.key);
    stackedPlotObj.setLocation(folderRoot);


    let flexLayoutObj = new FlexibleLayout(config.rootName.concat(' Flexible Layout'));
    root.addJson(flexLayoutObj);
    folderRoot.addToComposition(flexLayoutObj.identifier.key);
    flexLayoutObj.setLocation(folderRoot);


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
                folderOverlayPlots.addToComposition(curOverlayPlotObj.identifier.key);
                curOverlayPlotObj.setLocation(folderOverlayPlots);
                // Add it to views as curOverlayPlotObj
                root.addJson(curOverlayPlotObj);
                stackedPlotObj.addToComposition(curOverlayPlotObj.identifier.key);
                flexLayoutObj.addToComposition(curOverlayPlotObj.identifier.key);
                flexLayoutObj.addFrame(curOverlayPlotObj.identifier.key);
                // Set curOverlayPlotName to the new name
                curOverlayPlotName = overlayPlotName;
            }
            // add telemObj to curOverlayPlotObj;
            curOverlayPlotObj.addToComposition(telemObjDataSrc, 'taxonomy');
            curOverlayPlotObj.addToSeries(telemObj);
        } else {
            stackedPlotObj.addToComposition(telemObjDataSrc, 'taxonomy');
            stackedPlotObj.addToSeries(telemObj);
            flexLayoutObj.addToComposition(telemObjDataSrc, 'taxonomy');
            flexLayoutObj.addFrame(telemObjDataSrc, 'taxonomy');
        }
    }

    flexLayoutObj.setFrameSizes();

    outputJSON();
}
