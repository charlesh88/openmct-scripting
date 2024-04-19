const VALID_TELEM_PATH = [
    'Viper',
    'yamcs'
];

const BRACKET_PATH_ROOT = 'ViperRover';

extractTelemFromPrlDataReferences = function (prlNodesArr) {
    let arrTelemOut = [];

    for (let i = 0; i < prlNodesArr.length; i++) {
        if (prlNodesArr[i].getElementsByTagName("prl:Description")[0]) {
            const description = prlNodesArr[i].getElementsByTagName("prl:Description")[0].textContent;
            const arrPaths = arrPathsFromString(description);
            if (arrPaths.length > 0) {
                for (let p = 0; p < arrPaths.length; p++) {
                    arrTelemOut.push(arrPaths[p]);
                }
            }
        }
    }

    return arrTelemOut;
}

extractTelemFromPrlDataNomenclature = function (prlNodesArr) {
    let arrTelemOut = [];

    for (let i = 0; i < prlNodesArr.length; i++) {
        let path = prlNodesArr[i].textContent;
        const arrPaths = arrPathsFromString(path);

        if (arrPaths.length > 0) {
            for (let p = 0; p < arrPaths.length; p++) {
                arrTelemOut.push(arrPaths[p]);
            }
        }
    }

    return arrTelemOut;
}

extractTelemFromPrlVerifications = function(prlNodesArr) {
    // VerifyGoals holds the telem path in prl:Description > prl:Text
    let arrTelemOut = [];

    for (let i = 0; i < prlNodesArr.length; i++) {
        if (prlNodesArr[i].getElementsByTagName("prl:Text")[0]) {
            const text = prlNodesArr[i].getElementsByTagName("prl:Text")[0].textContent;

            const arrPaths = arrPathsFromString(text);

            if (arrPaths.length > 0) {
                for (let p = 0; p < arrPaths.length; p++) {
                    arrTelemOut.push(arrPaths[p]);
                }
            }
        }
    }

    return arrTelemOut;
}

function validatePath(path) {
    for (let i = 0; i < VALID_TELEM_PATH.length; i++) {
        if (path.includes(VALID_TELEM_PATH[i])) {
            return true;
        }
    }
    return false;
}

function convertPrideBracketPath(path) {
    // Converts paths like [Subsystem] parameterName
    return path.replaceAll('[','/'+ BRACKET_PATH_ROOT + '/').replaceAll(']','/');
}

function arrPathsFromString(str) {
    // Take in ANY string. If it has anything that matches a telem path, like 'Verify /foo.bar and /bar.foo' or
    // 'Verify [foo] bar', extract it and add it to an array
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
