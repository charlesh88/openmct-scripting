const INPUT_TYPE = "csv";

inputCsv.addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    config.rootName = document.getElementById('rootName').value;
    return config;
}

function processInputCsvs(filenames, values) {
    // console.log(filenames, values);
    config = getConfigFromForm();
    // Create an array to track Overlay Plot names
    let existingOverlayPlots = []; // Array of objects, with props name and obj
    let folders = {};


    // Create the root folder
    let folderRoot = new Obj(config.rootName, 'folder', true);
    root.addJson(folderRoot);
    objJson.rootId = folderRoot.identifier.key;

    // Make a folder to hold Overlay Plots
    let folderOverlayPlots = new Obj('Overlay Plots', 'folder', true);
    root.addJson(folderOverlayPlots);
    folderRoot.addToComposition(folderOverlayPlots.identifier.key);
    folderOverlayPlots.setLocation(folderRoot);


    for (let i = 0; i < filenames.length; i++) {
        const plotObjectArr = csvToArray(values[i]);
        const holderName = config.rootName.concat(' ')
            .concat(filenames[i].split('.')[0]);

        let stackedPlotObj = new StackedPlot('SP '.concat(holderName));
        root.addJson(stackedPlotObj);
        folderRoot.addToComposition(stackedPlotObj.identifier.key);
        stackedPlotObj.setLocation(folderRoot);

        let flexLayoutObj = new FlexibleLayout('FL '.concat(holderName));
        root.addJson(flexLayoutObj);
        folderRoot.addToComposition(flexLayoutObj.identifier.key);
        flexLayoutObj.setLocation(folderRoot);

        let existingOverlayPlot;
        let plotObj;

        for (let i = 0; i < plotObjectArr.length; i++) {
            const telemObj = plotObjectArr[i];
            const telemObjDataSrc = telemObj.DataSource;
            const overlayPlotName = telemObj.OverlayPlotName;

            if (overlayPlotName.length > 0) {
                // An OP is specified, so add it or create it
                existingOverlayPlot = existingOverlayPlots.find(e => e.name === overlayPlotName);

                if (existingOverlayPlot) {
                    // The overlay plot already exists
                    plotObj = existingOverlayPlot;
                    // console.log(overlayPlotName, ' already exists');
                } else {
                    // The overlay plot does not exist, create a new overlayPlotObj
                    // console.log(overlayPlotName, ' does not exist, creating');
                    plotObj = new OverlayPlot(overlayPlotName);
                    folderOverlayPlots.addToComposition(plotObj.identifier.key);
                    plotObj.setLocation(folderOverlayPlots);
                    root.addJson(plotObj);
                    existingOverlayPlots.push(plotObj);
                }

                // console.log(stackedPlotObj.composition);

                if (!stackedPlotObj.composition.find(e => e.key === plotObj.identifier.key)) {
                    // The plotObj hasn't been added yet to the holders
                    stackedPlotObj.addToComposition(plotObj.identifier.key);
                    flexLayoutObj.addToComposition(plotObj.identifier.key);
                    flexLayoutObj.addFrame(plotObj.identifier.key);
                }

                // if a datasource is specified, add it to the current Overlay Plot;
                if (telemObjDataSrc && telemObjDataSrc.length > 0) {
                    plotObj.addToComposition(telemObjDataSrc, 'taxonomy');
                    plotObj.addToSeries(telemObj);
                }
            } else {
                // An OP is not specified, just add the telem point
                stackedPlotObj.addToComposition(telemObjDataSrc, 'taxonomy');
                stackedPlotObj.addToSeries(telemObj);
                flexLayoutObj.addToComposition(telemObjDataSrc, 'taxonomy');
                flexLayoutObj.addFrame(telemObjDataSrc, 'taxonomy');
            }
        }

        flexLayoutObj.setFrameSizes();

    }
    outputJSON();
}
