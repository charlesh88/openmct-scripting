/*********************************** GCS .PY FUNCTIONS */
extractFromGcs = function(str, filename) {
    let paths = [];

    const lines = str.split('\n');
    const regex = "(?<=\\(')(.*?)(?=')";

    for (let i = 0; i < lines.length; i++) {
        if (
            !lines[i].includes('#') &&
            (
                lines[i].includes('getval(') ||
                lines[i].includes('checkval(')
            )
        ) {
            const path = getStrBetweenRegex(lines[i], regex);
            const refType = lines[i].includes('getval') ? 'getval' : 'checkval';

            if (path) {
                paths.push({
                    'gcs': filename,
                    'path': path,
                    'refType': refType
                });
            }
        }
    }

    return paths;
}

gcsByTelem = function (arr) {
    /*
    Expects an array of objects in format from extractFromGcs
    Go through arr, get path and add as an object key to the objGcsByTelem
    */
    objGcsByTelem = {};
    for (let i = 0; i < arr.length; i++) {
        const curPath = arr[i].path;
        if (!Object.keys(objGcsByTelem).includes(curPath)) {
            objGcsByTelem[curPath] = {
                'refType': arr[i].refType,
                'gcs': {},
                'gcsCount': 0
            }
        }
        const objCurTelemGcs = objGcsByTelem[curPath].gcs;
        const gcsForThisPath = arr[i].gcs;
        if (!Object.keys(objCurTelemGcs).includes(gcsForThisPath)) {
            objGcsByTelem[curPath].gcsCount += 1;
            objGcsByTelem[curPath].gcs[gcsForThisPath] = {}; // This should probably just be an array
        }
    }

    return objGcsByTelem;
}

gcsByTelemToCsvArr = function (arr) {
    /*
    Expects an array of objects in format from gcsByTelem
    Iterate through keys, and format a tabular CSV with these columns:
    parameter
    gcs count
    gcs's
    */

    let tableArr = [];
    const LINE_BREAK = '\r\n';
    const markerStr = 'Y';

    let tableHdrArr = [
        'parameter',
        'gcs count'
    ];

    const pathKeys = Object.keys(arr);

    // Check the first entry for a valid property
    const validation = (arr[pathKeys[0]].valid);

    if (validation) {
        tableHdrArr.push('valid');
    }


    for (let i = 0; i < pathKeys.length; i++) {
        const curKey = pathKeys[i];

        let tableRowArr = [
            curKey,
            arr[curKey].gcsCount
        ];

        if (validation) {
            tableRowArr.push(arr[curKey].valid)
        }

        const gcsForThisPath = arr[curKey].gcs;

        // gcsForThisPath is an array of keyed objects
        const keysGcsForThisPath = Object.keys(gcsForThisPath);

        for (let j = 0; j < keysGcsForThisPath.length; j++) {
            const gcsForThisPathKey = keysGcsForThisPath[j];

            if (!tableHdrArr.includes(gcsForThisPathKey)) {
                tableHdrArr.push(gcsForThisPathKey);
            }

            const colIndex = findIndexInArray(tableHdrArr,gcsForThisPathKey);

            tableRowArr = insertValueIntoArrayAtIndex(tableRowArr,colIndex,markerStr);
        }

        tableArr.push(tableRowArr);
    }

    tableArr.unshift(tableHdrArr);

    return tableArr;
}
