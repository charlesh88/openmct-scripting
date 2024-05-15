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

telemByGcs = function (arr) {
    /*
    Expects an array of objects in format from extractFromGcs
    Go through arr, get path and add as an object key to the objTelemByGcs
    */
    objTelemByProc = {};
    for (let i = 0; i < arr.length; i++) {
        // console.log('arr[i]',arr[i].path);
        const curPath = arr[i].path;
        if (!Object.keys(objTelemByProc).includes(curPath)) {
            objTelemByProc[curPath] = {
                'refType': arr[i].refType,
                'gcs': {},
                'gcsCount': 0
            }
        }
        const objCurTelemGcs = objTelemByProc[curPath].gcs;
        const gcsForThisPath = arr[i].gcs;
        if (!Object.keys(objCurTelemGcs).includes(gcsForThisPath)) {
            objTelemByProc[curPath].gcsCount += 1;
            objTelemByProc[curPath].gcs[gcsForThisPath] = {}; // This should probably just be an array
        }
    }

    return objTelemByProc;
}

telemByGcsToCsvArr = function (arr) {
    /*
    Expects an array of objects in format from telemByGcs
    Iterate through keys, and format a tabular CSV with these columns:
    parameter
    gcs count
    gcs's
    */

    let tableArr = [];
    const LINE_BREAK = '\r\n';

    let tableHdrArr = [
        'parameter',
        'gcs count'
    ];

    if (MDB_LOADED) {
        arr = validateAgainstDictionary(arr);
        tableHdrArr.push('valid');
    }

    const pathKeys = Object.keys(arr);
    const markerStr = 'Y';

    for (let i = 0; i < pathKeys.length; i++) {
        const curKey = pathKeys[i];

        let tableRowArr = [
            curKey,
            arr[curKey].gcsCount
        ];

        if (MDB_LOADED) {
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
