
telemByProcToArr = function (arr) {
    /*
    Expects an array of objects in format from telemByProc or telemByGcs
    Iterate through keys, and format a tabular CSV with these columns:
    parameter
    proc count
    procs and steps
    */

    let tableArr = [];
    const LINE_BREAK = '\r\n';

    let tableHdrArr = [
        'parameter',
        'proc count'
    ];

    const tableHdrIndexOffset = tableHdrArr.length;

    const pathKeys = Object.keys(arr);
    for (let i = 0; i < pathKeys.length; i++) {
        const curKey = pathKeys[i];

        let tableRowArr = [
            curKey,
            arr[curKey].procCount
        ];

        const curProcsAndSteps = arr[curKey].procs;
        /*
        curProcsAndSteps is an array of keyed objects, each with an array of steps
         */

        const keysProcs = Object.keys(curProcsAndSteps);

        // console.log('keysProcs',keysProcs);


        for (let j = 0; j < keysProcs.length; j++) {
            const curProcKey = keysProcs[j];

            if (!tableHdrArr.includes(curProcKey)) {
                tableHdrArr.push(curProcKey);
            }

            const colIndex = findIndexInArray(tableHdrArr,curProcKey);

            let curStepsStr = '"'
                .concat(curProcsAndSteps[curProcKey].steps.join(LINE_BREAK))
                .concat('"');

            tableRowArr = insertValueIntoArrayAtIndex(tableRowArr,colIndex,curStepsStr);
        }

        tableArr.push(tableRowArr);
    }

    // tableArr = tableHdrArr.push(...tableArr);
    tableArr.unshift(tableHdrArr);

    console.log(tableHdrArr);

    return tableArr;
}

function arrPathsFromString(str) {
    // Take in ANY string. If it has anything that matches a telem path, like 'Verify /foo.bar and /bar.foo' or
    // 'Verify [foo] bar', extract it and add it to an array
    // console.log('arrPathsFromString', str);

    let arrMatches = [];
    let strElems = [];

    if (str.includes(' ')) {
        strElems = str.split(' ');
    } else {
        strElems.push(str);
    }

    for (let i = 0; i < strElems.length; i++) {
        const curElem = strElems[i];
        if (curElem.includes('/') && validatePath(curElem)) {
            arrMatches.push(strClean(curElem));
        } else if (curElem.includes('[')) {
            // This will be a subsystem, like '[sys]'.
            // The very next item in the array will be a path to a parameter
            arrMatches.push(strClean(convertPrideBracketPath(
                curElem.concat(strElems[i + 1])
            )));
        }
    }

    return arrMatches;
}

function escForCsv(str) {
    // TODO: determine why this is needed and if so
    // Change all commas; change double-quotes to double-double-quotes
    let o = '"'.concat(str.replace(/,/g, ';;').replace(/"/g, '""')).concat('"');

    // Restore commas
    return o.replace(/;;/g, ',');
}
