const INPUT_TYPE = "csv";
const OUTPUT_BASE_NAME_KEY = '_STACKED-VIEW_BASE_NAME';

storeOutputBaseName();
loadLocalSettings();
inputCsv.addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    config.outputBaseName = document.getElementById('output-base-name').value;
    return config;
}

function processInputCsvs(filenames, values) {
    initDomainObjects();
    config = getConfigFromForm();
    // Create an array to track Overlay Plot names
    let existingOverlayPlots = []; // Array of objects, with props name and obj
    let folders = {};

    // Create the root folder
    let folderRoot = new Obj(config.outputBaseName, 'folder', true);
    root.addJson(folderRoot);
    objJson.rootId = folderRoot.identifier.key;

    // Make a folder to hold Overlay Plots
    let folderOverlayPlots = new Obj('Overlay Plots', 'folder', true);
    root.addJson(folderOverlayPlots);
    folderRoot.addToComposition(folderOverlayPlots.identifier.key);
    folderOverlayPlots.setLocation(folderRoot);

    // Make a folder to hold Stacked Plots
    let folderStackedPlots = new Obj('Stacked Plots', 'folder', true);
    root.addJson(folderStackedPlots);
    folderRoot.addToComposition(folderStackedPlots.identifier.key);
    folderStackedPlots.setLocation(folderRoot);

    // Make a folder to hold Flexible Layouts
    let folderFlexLayouts = new Obj('Flexible Layouts', 'folder', true);
    root.addJson(folderFlexLayouts);
    folderRoot.addToComposition(folderFlexLayouts.identifier.key);
    folderFlexLayouts.setLocation(folderRoot);

    for (let i = 0; i < filenames.length; i++) {
        const csvObjArray = csvToObjArray(values[i]);
        const holderName = filenames[i].split('.')[0];

        let stackedPlotObj = new StackedPlot('SP '.concat(holderName));
        root.addJson(stackedPlotObj);
        folderStackedPlots.addToComposition(stackedPlotObj.identifier.key);
        stackedPlotObj.setLocation(folderStackedPlots);

        let flexLayoutObj = new FlexibleLayout('FL '.concat(holderName));
        root.addJson(flexLayoutObj);
        folderFlexLayouts.addToComposition(flexLayoutObj.identifier.key);
        flexLayoutObj.setLocation(folderFlexLayouts);

        let existingOverlayPlot;
        let plotObj;

        for (let i = 0; i < csvObjArray.length; i++) {
            const telemObj = csvObjArray[i];
            const telemObjDataSrc = telemObj.DataSource;
            const overlayPlotName = telemObj.OverlayPlotName;

            if (overlayPlotName.length > 0) {
                // An OP is specified, so add it or create it
                existingOverlayPlot = existingOverlayPlots.find(e => e.name === overlayPlotName);

                if (existingOverlayPlot) {
                    // The overlay plot already exists
                    plotObj = existingOverlayPlot;
                } else {
                    // The overlay plot does not exist, create a new overlayPlotObj
                    plotObj = new OverlayPlot(overlayPlotName);
                    folderOverlayPlots.addToComposition(plotObj.identifier.key);
                    plotObj.setLocation(folderOverlayPlots);
                    root.addJson(plotObj);
                    existingOverlayPlots.push(plotObj);
                }

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
                if (telemObjDataSrc && telemObjDataSrc.length > 0) {
                    stackedPlotObj.addToComposition(telemObjDataSrc, 'taxonomy');
                    stackedPlotObj.addToSeries(telemObj);
                    flexLayoutObj.addToComposition(telemObjDataSrc, 'taxonomy');
                    flexLayoutObj.addFrame(telemObjDataSrc, 'taxonomy');
                }
            }
        }

        flexLayoutObj.setFrameSizes();
    }
    outputJSON();
}
