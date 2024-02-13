const INPUT_TYPE = "csv";

inputCsv.addEventListener("change", function (ev) {
    uploadFiles(ev.currentTarget.files, 'csv');
}, false);

function getConfigFromForm() {
    // Get form values
    const config = {};

    config.rootName = document.getElementById('rootName').value;
    config.layoutGrid = document.getElementById('layoutGrid').value.split(',');
    config.imageSize = document.getElementById('imageSize').value.split(',');

    return config;
}

function createOpenMCTJSONfromCSV(csv) {
    /*
    condObjs: array of Condition objects with these properties:
    [{
        imageId: string that defines unique images. Allows more than one image to be overlayed, with different Condition Sets for each
        desc: not used
        condDataSource: full path to datasource
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

    condObjs = csvToArray(csv);

    config = getConfigFromForm();

    // Create the root folder
    folderRoot = new Obj(config.rootName, 'folder', true);
    root.addJson(folderRoot);
    objJson.rootId = folderRoot.identifier.key;

    // Create a Display Layout for the conditional image and add it to the root folder
    let dlCondImage = new DisplayLayout({
        'name': 'DL '.concat(config.rootName),
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
    });
    root.addJson(dlCondImage);
    folderRoot.addToComposition(dlCondImage.identifier.key);
    dlCondImage.setLocation(folderRoot);

    outputMsg('Condition-driven Image CSV imported, '
        .concat(condObjs.length.toString())
        .concat(' rows found')
    );

    let curImageId = '';
    let curImageView;
    let curConditionSet;

    for (const condObj of condObjs) {
        const curIndex = condObjs.indexOf(condObj);

        // If telemObject dataSource includes "," then it's synthetic
        // Create the source, add it to the telemSource folder and to the composition
        // Update telemtryObject.dataSource to use the UUID of the created object

        let dlItem = {};

        if (!condObj.condDataSource.length > 0) {
            // If no datasource, add a standalone image view that is NOT conditionally styled
            if (condObj.imageUrl.length > 0) {
                dlItem = dlCondImage.addImageView(
                    {
                        x: 0,
                        y: 0,
                        width: displayLayoutConvertPxToGridUnits(parseInt(config.layoutGrid[0]), parseInt(config.imageSize[0])),
                        height: displayLayoutConvertPxToGridUnits(parseInt(config.layoutGrid[1]), parseInt(config.imageSize[1])),
                        url: condObj.imageUrl;
                    }
                )
            }
            curImageId = condObj.imageId;
        } else {
            // There is a datasource, so add as a Condition
            if (curImageId !== condObj.imageId) {
                // Make a new Condition Set

            } else {
                // Just add a new Condition to the current Condition Set for the current image view.
            }
        }



        // Add conditionals
        if (condObj.cond1.length > 0) {
            let cs = new ConditionSet(condObj);

            const conditionsArr = cs.conditionsToArr(condObj);
            cs.addConditions(condObj, conditionsArr);

            condObjs[curIndex].csKey = cs.identifier.key;

            // Add a "styles" collection for Conditional styling in dlAlpha.objectStyles[dlItem.id]
            if (condObj.alphaUsesCond === 'TRUE') {
                for (const cond of cs.configuration.conditionCollection) {
                    const args = {
                        border: ALPHA_BORDER,
                        bgColor: cond.bgColor,
                        fgColor: cond.fgColor,
                        id: cond.id
                    }
                    const alphaCondStyleObj = createStyleObj(args);
                    dlAlphas.configuration.objectStyles[dlItem.id].styles.push(alphaCondStyleObj);
                    dlAlphas.configuration.objectStyles[dlItem.id].conditionSetIdentifier = createIdentifier(cs.identifier.key);
                }
                condObjs[curIndex].alphaObjStyles = dlAlphas.configuration.objectStyles[dlItem.id].styles;
            }

            root.addJson(cs);
            folderConditionSets.addToComposition(cs.identifier.key);
            cs.setLocation(folderConditionSets);

            // Create Condition Widget
            let cw = new ConditionWidget(cs, condObj, conditionsArr);
            root.addJson(cw);
            folderConditionWidgets.addToComposition(cw.identifier.key);
            cw.setLocation(folderConditionWidgets);

            condObjs[curIndex].cwKey = cw.identifier.key;

            // Add Widget to Widgets Display Layout
            dlCondImage.addToComposition(cw.identifier.key);

            const widget = dlCondImage.addSubObjectView({
                index: curIndex,
                ident: cw.identifier.key,
                itemW: config.dlCondImage.itemW,
                itemH: config.dlCondImage.itemH,
                hasFrame: false,
                layoutStrategy: config.dlCondImage.layoutStrategy,
                layoutStrategyNum: config.dlCondImage.layoutStrategyNum,
                placeIndex: widgetsItemPlacementTracker.placeIndex,
                shiftIndex: widgetsItemPlacementTracker.shiftIndex
            });

            widgetsItemPlacementTracker.placeIndex = widget.placeIndex;
            widgetsItemPlacementTracker.shiftIndex = widget.shiftIndex;
        }
    }

    outputJSON();
}

function createOpenMCTMatrixLayoutJSONfromCSV(csv) {
    // console.log('createOpenMCTMatrixLayoutJSONfromCSV\n', csv);
    csv = csv.replaceAll('\r', '');
    csv = csv.replace(/"[^"]+"/g, function (v) {
        // Encode all commas that are within double quote chunks with |
        return v.replace(/,/g, '|');
    });

    const rows = csv.split('\n');
    const rowArr = rows.map(function (row) {
        const values = row.split(',');
        return values;
    });

    // console.log('condObjs', condObjs);

    // Create a layout for the matrix and add it to the root folder
    let dlMatrix = new DisplayLayout({
        'name': 'DL Matrix',
        'layoutGrid': [parseInt(config.layoutGrid[0]), parseInt(config.layoutGrid[1])],
        'itemMargin': config.itemMargin
    });
    root.addJson(dlMatrix);
    folderRoot.addToComposition(dlMatrix.identifier.key);
    dlMatrix.setLocation(folderRoot);

    const arrColWidths = rowArr[0];
    let curY = 0;
    let dlItem = {};

    outputMsg('Matrix Layout started: '
        .concat(arrColWidths.length.toString())
        .concat(' columns and ')
        .concat(rowArr.length.toString())
        .concat(' rows')
    );

    // Iterate through telemetry collection
    for (let r = 1; r < rowArr.length; r++) {
        const row = rowArr[r];
        const rowH = parseInt(row[0]);
        let curX = 0;

        // Iterate through row cells
        for (let c = 1; c < row.length; c++) {
            // Process each cell in the matrix
            let cell = row[c].trim();
            let colW = parseInt(arrColWidths[c]);
            let itemW = colW;

            /*
                Look for converted commas, and if present, strip out and handle args
                - If a | followed by "_xx", display as:
                - _cw: Condition Widget
                - _op: Overlay Plot (NOT IMPLEMENTED)
             */

            const argSeparator = '|';
            let cellArgs;

            if (cell.includes(argSeparator)) {
                cellArgs = cell.substring(cell.indexOf(argSeparator) + 1, cell.length);
                cell = cell.substring(0, cell.indexOf(argSeparator)).replaceAll('"', '').trim();
            }

            if (cellArgs && cellArgs.includes('_span')) {
                const start = cellArgs.indexOf('_span');
                let spanNumStr = cellArgs.substring(start + 6);
                const spanNum = parseInt(spanNumStr.substring(0, spanNumStr.indexOf(')')));

                // Span includes the current column, c
                // Add widths from columns to be spanned to itemW
                for (let i = c + 1; i < (c + spanNum); i++) {
                    itemW += parseInt(arrColWidths[i]) + config.itemMargin;
                    // console.log('...incrementing itemW',itemW);
                }
            }

            // console.log('Row',r,'Cell',c,'colW',colW,'itemW',itemW);

            if (cell.includes("~")) {
                // If telem, get the corresponding condObj
                const condObj = condObjs.find(e => e.dataSource === cell);

                if (cellArgs) {
                    if (cellArgs.includes('_cw')) {
                        // Add previously created Condition Widget
                        dlMatrix.addSubObjectViewInPlace({
                            itemW: itemW,
                            itemH: rowH,
                            x: curX,
                            y: curY,
                            ident: condObj.cwKey,
                            hasFrame: false
                        });

                        dlMatrix.addToComposition(condObj.cwKey);
                    }
                } else {
                    // Add as a telemetry view (alphanumeric)
                    dlItem = dlMatrix.addTelemetryView({
                        itemW: itemW,
                        itemH: rowH,
                        x: curX,
                        y: curY,
                        ident: cell,
                        alphaFormat: condObj.alphaFormat,
                        alphaShowsUnit: condObj.alphaShowsUnit
                    });

                    if (condObj.alphaObjStyles) {
                        dlMatrix.configuration.objectStyles[dlItem.id].styles = condObj.alphaObjStyles;
                        dlMatrix.configuration.objectStyles[dlItem.id].conditionSetIdentifier = condObj.csKey;
                    }
                }

                dlMatrix.addToComposition(cell, getNamespace(cell));
            } else if (cell.length > 0) {
                const args = {
                    itemW: itemW,
                    itemH: rowH,
                    x: curX,
                    y: curY,
                    text: cell
                };

                // console.log('args for', cell,'colW:',colW);

                if (cellArgs && cellArgs.includes('_bg')) {
                    const start = cellArgs.indexOf('_bg');
                    const bgColorStr = cellArgs.substring(start + 4, start + 11);
                    args.bgColor = bgColorStr;
                }

                if (cellArgs && cellArgs.includes('_fg')) {
                    const start = cellArgs.indexOf('_fg');
                    const fgColorStr = cellArgs.substring(start + 4, start + 11);
                    args.fgColor = fgColorStr;
                }

                dlItem = dlMatrix.addTextView(args);
            }

            curX += colW + ((c > 1) ? config.itemMargin : 0);
        }

        curY += rowH + config.itemMargin;
    }

    outputMsg('Matrix Layout generated');
}
