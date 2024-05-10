// COMMON FUNCTIONS FOR TELEMETRY EXTRACTION
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

function addToArrUniquePaths(path) {
    if (!globalArrUniquePaths.includes(path)) {
        globalArrUniquePaths.push(path);
        return true;
    }

    return false;
}

function escForCsv(str) {
    // TODO: determine why this is needed
    // Change all commas; change double-quotes to double-double-quotes
    let o = '"'.concat(str.replace(/,/g, ';;').replace(/"/g, '""')).concat('"');

    // Restore commas
    return o.replace(/;;/g, ',');
}
