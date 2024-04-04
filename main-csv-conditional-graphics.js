const INPUT_TYPE = "csv";
const OUTPUT_BASE_NAME_KEY = '_CONDITIONAL_GRAPHICS_BASE_NAME';

inputCsv.addEventListener("change", function (ev) {
    uploadTelemetryFile(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.outputBaseName = document.getElementById('output-base-name').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.imageSize = document.getElementById('imageSize').value.split(',');

    return config;
}

function uploadTelemetryFile(files) {
    initDomainObjects();
    let readers = [];
    let filenames = [];

    // Abort if there were no files selected
    if (!files.length) return;

    // Store promises in array
    for (let i = 0; i < files.length; i++) {
        filenames.push(files[i].name);
        readers.push(readFileAsText(files[i]));
    }

    // Trigger Promises
    Promise.all(readers).then((values) => {
        // Values will be an array that contains an item
        // with the text of every selected file
        // ["File1 Content", "File2 Content" ... "FileN Content"]
        parseCSVTelemetry(values[0]);
    });
}

function parseCSVTelemetry(csv) {
    /*
    arrRowObjs: array of Condition objects with these properties:
    [{
        imageId: string that defines unique images. Allows more than one image to be overlayed, with different Condition Sets for each
        desc: not used
        datasSource: full path to datasource
        dataSourceToEval: this | any | all TODO: make sure Condition Set creator can properly add a discrete telem point
        condEvaluator: equalTo, notEqualTo, between, etc.
        condVals: either single string or number, or comma-sepped same
        condOutputString: output string for a given Condition
        colorBg
        colorFg
        colorBorder
        imageUrl
        condWidgetUsesOutputAsLabel: boolean
    }]
    */

    // array of objects
    arrRowObjs = csvToObjArray(csv);

    config = getConfigFromForm();

    // Create the root folder
    folderRoot = new Obj(config.outputBaseName, 'folder', true);
    root.addJson(folderRoot);
    objJson.rootId = folderRoot.identifier.key;

    // Create a Display Layout for the conditional image and add it to the root folder
    let dlCondImage = new DisplayLayout({
        'name': 'DL '.concat(config.outputBaseName),
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
    });
    root.addJson(dlCondImage);
    folderRoot.addToComposition(dlCondImage.identifier.key);
    dlCondImage.setLocation(folderRoot);

    outputMsg('Condition-driven Image CSV imported, '
        .concat(arrRowObjs.length.toString())
        .concat(' rows found')
    );

    let curConditionSet;
    let dataSources = [];
    let curDataSourceId;
    let imageViewNames = [];
    let imageViewObjs = {}; // Tracks created image view objects, keyed by name

    for (const rowObj of arrRowObjs) {
        let curDataSourceName;
        let curImageViewObj;
        let addDataSourceToConditionSet = false;

        rowObj.url = rowObj.imageUrl.replaceAll('~', '/');

        console.log(imageViewNames, rowObj);

        /***************************** IMAGE VIEW */
        if (imageViewNames.includes(rowObj.imageViewName)) {
            // We've already created this imageview object, retrieve and make that the current one.
            curImageViewObj = imageViewObjs[rowObj.imageViewName];
        } else {
            // Create a new image view and add it to dlCondImage composition.
            curImageViewObj = dlCondImage.addImageView(
                {
                    x: 0,
                    y: 0,
                    width: displayLayoutConvertPxToGridUnits(parseInt(config.layoutGrid[0]), parseInt(config.imageSize[0])),
                    height: displayLayoutConvertPxToGridUnits(parseInt(config.layoutGrid[1]), parseInt(config.imageSize[1])),
                    url: rowObj.url
                }
            );
            imageViewNames.push(rowObj.imageViewName);
            imageViewObjs[rowObj.imageViewName] = curImageViewObj;
        }

        /***************************** DATASOURCE */
        if (rowObj.dataSource) {
            // Either a parameter path, SWG definition or the name of a SWG.
            // Create an SWG and get back an object, or use the path to create an object.
            // Set the object to be the current data source and provide it to the condition set below.
            let dataSourceObj;

            if (rowObj.dataSource.includes('~')) {
                // It's a parameter
                curDataSourceName = curDataSourceId = rowObj.dataSource;
                rowObj.metadata = 'value';

                if (!dataSources.includes(curDataSourceName)) {
                    console.log('dataSources !included '.concat(curDataSourceName));
                    dataSources.push(curDataSourceName);
                    addDataSourceToConditionSet = true;
                }
            } else {
                // It's a SWG or a named ref to a SWG
                if (rowObj.dataSource.includes('{')) {
                    // It's a SWG definition
                    dataSourceObj = JSON.parse(rowObj.dataSource);
                    curDataSourceName = Object.keys(dataSourceObj)[0];

                    const dataSourcePropsObj = dataSourceObj[curDataSourceName];

                    let swgObj = new SineWaveGenerator(curDataSourceName, {
                        'period': dataSourcePropsObj.period,
                        'amplitude': dataSourcePropsObj.amplitude,
                        'dataRateInHz': dataSourcePropsObj.dataRateInHz,
                        'offset': dataSourcePropsObj.offset
                    })

                    curDataSourceId = swgObj.identifier.key;
                    root.addJson(swgObj);
                    folderRoot.addToComposition(curDataSourceId);
                    swgObj.setLocation(folderRoot);

                    rowObj.metadata = dataSourcePropsObj.metadata;

                    dataSources[curDataSourceName] = {
                        'id': curDataSourceId,
                        'metadata': dataSourcePropsObj.metadata
                    };
                    addDataSourceToConditionSet = true;


                } else {
                    // It's a SWG ref, assume it has been created, get its ID and metadata
                    dataSourceObj = dataSources[rowObj.dataSource];
                    curDataSourceName = rowObj.dataSource;
                    curDataSourceId = dataSourceObj.id;
                    rowObj.metadata = dataSourceObj.metadata;

                }
            }
        }

        /***************************** CONDITION SET */
        if (rowObj.operation) {
            // If condition props are defined for this row, create a condition and add it by ID as part of a styles obj
            // i.e. rowObj.conditionId
            if (!curConditionSet) {
                // Make a Condition Set using the provided parameters
                curConditionSet = new ConditionSet({
                    'name': 'CS '.concat(config.outputBaseName),
                    'dataSource': curDataSourceId
                });

                // Add the CS to folderRoot compositions
                // Set location of the CS to folderRoot
                root.addJson(curConditionSet);
                folderRoot.addToComposition(curConditionSet.identifier.key);
                curConditionSet.setLocation(folderRoot);

                // The datasource has already been added to the CS, don't add it again
                addDataSourceToConditionSet = false;

                // Add the conditionSetIdentifier to the current image view's objectStyles collection
                dlCondImage.configuration.objectStyles[curImageViewObj.id].conditionSetIdentifier = createIdentifier(curConditionSet.identifier.key);
            }

            if (addDataSourceToConditionSet) {
                // If addDataSourceToConditionSet then add to the curConditionSet's composition
                curConditionSet.addToComposition(curDataSourceId);
            }

            // Create a new condition and add it to curConditionSet
            const curCondition = createConditionFromObj(rowObj);
            curConditionSet.configuration.conditionCollection.push(curCondition);

            /***************************** CONDITIONAL STYLING */
                // Add a style object to the current image view

            let conditionStyleObj = createStyleObj(rowObj);
            conditionStyleObj.conditionId = curCondition.id
            dlCondImage.configuration.objectStyles[curImageViewObj.id].styles.push(conditionStyleObj);
        }
    }

    console.log('dataSources', dataSources);

    outputJSON();
}
