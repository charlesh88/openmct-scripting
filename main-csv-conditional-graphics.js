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
    let dataSourceNames = [];
    let curDataSourceId;
    let imageViewNames = [];
    let imageViewObjs = {}; // Tracks created image view objects, keyed by name

    for (const rowObj of arrRowObjs) {
        let curDataSourceName;
        let curImageViewObj;
        let addDataSourceToConditionSet = false;

        rowObj.url = rowObj.imageUrl.replaceAll('~','/');
        console.log('rowObj', rowObj);

        // console.log('imageViewNames', imageViewNames, 'rowObj', rowObj);

        if (imageViewNames.includes(rowObj.name)) {
            // We've already created this imageview object, retrieve and make that the current one.
            curImageViewObj = imageViewObjs[rowObj.name];
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
            imageViewNames.push(rowObj.name);
            imageViewObjs[rowObj.name] = curImageViewObj;
        }

        console.log('curImageViewObj', curImageViewObj.id, curImageViewObj);

        /***************************** DATASOURCE */
        if (rowObj.dataSource) {
            // Either a parameter path or a SWG.
            // Create an SWG and get back an object, or use the path to create an object.
            // Set the object to be the current data source and provide it to the condition set below.

            if (rowObj.dataSource.includes('~')) {
                // It's a parameter
                curDataSourceName = curDataSourceId = rowObj.dataSource;
                rowObj.metadata = 'value';
                if (!dataSourceNames.includes(curDataSourceName)) {
                    dataSourceNames.push(curDataSourceName);
                    addDataSourceToConditionSet = true;
                }
            } else { // It's a SWG
                // Convert string value to JSON obj {"Scripted SWG": {"period": 10, "amplitude": 1, "offset": 0, "dataRateInHz": 1}}
                const dataSourceObj = JSON.parse(rowObj.dataSource);

                // See if this SWG is already in the composition; create if not.
                curDataSourceName = Object.keys(dataSourceObj)[0];
                const dataSourcePropsObj = dataSourceObj[curDataSourceName];
                rowObj.metadata = dataSourcePropsObj.metadata;

                if (!dataSourceNames.includes(curDataSourceName)) {
                    let swgObj = new SineWaveGenerator(curDataSourceName, {
                        'period': dataSourcePropsObj.period,
                        'amplitude': dataSourcePropsObj.amplitude,
                        'dataRateInHz': dataSourcePropsObj.dataRateInHz,
                        'offset': dataSourcePropsObj.offset
                    })

                    console.log('created SWG', swgObj);

                    curDataSourceId = swgObj.identifier.key;
                    root.addJson(swgObj);
                    folderRoot.addToComposition(curDataSourceId);
                    swgObj.setLocation(folderRoot);
                    dataSourceNames.push(curDataSourceName);
                    addDataSourceToConditionSet = true;
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
                // console.log('created Condition Set', curConditionSet.identifier.key);
                root.addJson(curConditionSet);
                folderRoot.addToComposition(curConditionSet.identifier.key);
                curConditionSet.setLocation(folderRoot);

                // The datasource has already been added to the CS, don't add it again
                addDataSourceToConditionSet = false;
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
            // console.log('adding conditional styling', rowObj, conditionStyleObj);
            dlCondImage.configuration.objectStyles[curImageViewObj.id].styles.push(conditionStyleObj);
        }
    }

    // console.log(curConditionSet, curConditionSet.configuration.conditionCollection);
    // console.log(dlCondImage);

    outputJSON();
}
