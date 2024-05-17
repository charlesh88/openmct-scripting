const VALID_TELEM_PATH = [
    'Viper',
    'yamcs'
];

const BRACKET_PATH_ROOT = 'ViperRover';

extractFromPrlTraverse = function (str, filename) {
    /*
    WHAT ARE ALL THE CONSTRUCTS THAT HAVE TELEMETRY IN THEM?
    prl:RecordInstruction <crewMembers>
    prl:Description
        prl:Text <TELEM path>
    prl:Number <#.#>

    prl:VerifyInstruction <crewMembers>
    prl:Description
        prl:Text
    prl:Number <#.#>
    prl:And
        prl:VerifyGoal
            prl:CurrentValue
                prl:DataReference
                    prl:Description <[app] TELEM.aggmember>
                    prl:Identifier <TELEM path>
    */

    function getText(node) {
        return node
            .getElementsByTagName("prl:Description")[0]
            .getElementsByTagName("prl:Text")[0]
            .textContent;
    }

    function getCrewMembers(node, curCrewMembers) {
        const crewMembers = node.getAttribute("crewMembers");
        if (crewMembers && crewMembers.length > 0) {
            curCrewMembers = crewMembers;
        }

        return curCrewMembers;
    }

    function getPathObjects(str, filename, nodeName, number, crewMembers) {
        let paths = [];
        if (isPath(str)) {
            const strPaths = arrPathsFromString(str);
            if (strPaths && strPaths.length > 0) {
                for (let i = 0; i < strPaths.length; i++) {
                    paths.push({
                        'procedure': filename,
                        'path': strPaths[i],
                        'pathShort': strPaths[i].replaceAll('/ViperRover/', ''),
                        'refType': nodeName,
                        'number': number,
                        'crewMembers': curCrewMembers
                    });
                }
            }
        }

        return paths;
    }

    let curCrewMembers = '';
    let curNumber = '';

    function traverseXML(node, paths = []) {
        const nodeName = node.nodeName; // prl:Step, etc.
        let telemNodes = [];
        let arrTelemPathsForNode = [];
        let pathStr = '';

        // Continually look for and track crewMembers values
        curCrewMembers = getCrewMembers(node, curCrewMembers);

        if (nodeName === 'prl:RecordInstruction') {
            // RecordInstruction
            curNumber = node.getElementsByTagName("prl:Number")[0].textContent;
            pathStr = getText(node);
            if (isPath(pathStr)) {
                arrTelemPathsForNode.push(...getPathObjects(
                    pathStr, filename, nodeName, curNumber, curCrewMembers
                ));
            }
        }
        if (nodeName === 'prl:VerifyInstruction') {
            // VerifyInstruction
            curNumber = node.getElementsByTagName("prl:Number")[0].textContent;
            telemNodes = node.getElementsByTagName("prl:DataReference");
            if (telemNodes && telemNodes.length > 0) {
                for (let i = 0; i < telemNodes.length; i++) {
                    // Get the path from prl:DataReference > prl:Description instead of prl:Identifier
                    // prl:Identifier won't include aggregate members
                    pathStr = telemNodes[i].getElementsByTagName("prl:Description")[0].textContent;
                    if (isPath(pathStr)) {
                        arrTelemPathsForNode.push(...getPathObjects(
                            pathStr, filename, nodeName, curNumber, curCrewMembers
                        ));
                    }
                }
            }
        }

        paths.push(...arrTelemPathsForNode);

        // Recursively traverse child nodes
        for (let i = 0; i < node.childNodes.length; i++) {
            const childNode = node.childNodes[i];
            // Only traverse element nodes
            if (childNode.nodeType === 1) {
                traverseXML(childNode, paths);
            }
        }
        return paths;
    }

    const xmlDoc = new DOMParser().parseFromString(str, 'text/xml');
    const arrTelemPathObjs = traverseXML(xmlDoc.documentElement, []);

    return arrTelemPathObjs;
}

procByTelem = function (arr) {
    /*
    Expects an array of objects in format from extractFromPrlTraverse
    Go through arr, get path and add as an object key to the objProcByTelem
    */
    objProcByTelem = {};
    for (let i = 0; i < arr.length; i++) {
        const curPath = arr[i].path;
        if (!Object.keys(objProcByTelem).includes(curPath)) {
            objProcByTelem[curPath] = {
                'refType': arr[i].refType,
                'procs': {},
                'procCount': 0
            }
        }
        const objCurTelemProcs = objProcByTelem[curPath].procs;
        const curProc = arr[i].procedure;
        if (!Object.keys(objCurTelemProcs).includes(curProc)) {
            objProcByTelem[curPath].procCount += 1;
            objProcByTelem[curPath].procs[curProc] = {
                'steps': []
            }
        }
        objProcByTelem[curPath].procs[curProc].steps.push(
            arr[i].number
                .concat(' ', arr[i].crewMembers)
        );
    }

    return objProcByTelem;
}

telemByProc = function (arrProcObjs) {
    /*
    Expects an array of objects in format from extractFromPrlTraverse, like
    { procedure, path, refType, number, crewMembers }
    Go through arrProcObjs, get proc and add as an object key to the objTelemByProc
    */

    objTelemByProc = {};
    for (let i = 0; i < arrProcObjs.length; i++) {
        const curProc = arrProcObjs[i].procedure;

        if (!Object.keys(objTelemByProc).includes(curProc)) {
            objTelemByProc[curProc] = {
                'steps': []
            }
        }

        objTelemByProc[curProc].steps.push({
            'paths': arrProcObjs[i].path,
            'stepNumber': arrProcObjs[i].number,
            'stepDesc': 'Step description TK',
            'refType': arrProcObjs[i].refType,
            'crewMembers': arrProcObjs[i].crewMembers
        })
    }

    return objTelemByProc;
}

telemByProcEnhanced = function (arrProcObjs) {
    /*
    Expects an array of objects in format from extractFromPrlTraverse, like
    { procedure, path, refType, number, crewMembers }
    Go through arrProcObjs, get proc and add as an object key to the objTelemByProc
    */

    objTelemByProc = {};

    // First, compile all telem by step into an object for a given procedure
    for (let i = 0; i < arrProcObjs.length; i++) {
        let curProcSteps = [];
        const curProc = arrProcObjs[i];

        if (!Object.keys(curProcSteps).includes(curProc.stepNumber)) {
            curProcSteps[curProc.stepNumber] = {
                'crewMembers': curProc.crewMembers,
                'paths': []
            };
        }
        curProcSteps[curProc.stepNumber].paths.push(
            curProc.paths
        );
    }

    for (let i = 0; i < arrProcObjs.length; i++) {
        const curProcName = arrProcObjs[i].procedure;
        let curProcSteps = []; // Will hold an array of step objects for this proc; each object will have a telem array

        if (!Object.keys(objTelemByProc).includes(curProcName)) {
            objTelemByProc[curProcName] = {
                'steps': []
            }
        }

        if (!Object.keys(curProcSteps).includes(arrProcObjs[i].number)) {
            curProcSteps[arrProcObjs[i].number] = {
                'paths': []
            };
        }
        curProcSteps[arrProcObjs[i].number].paths.push(
            arrProcObjs[i].path
        )

        objTelemByProc[curProcName].steps.push({
            'paths': arrProcObjs[i].path,
            'stepNumber': arrProcObjs[i].number,
            'stepDesc': 'Step description TK',
            'refType': arrProcObjs[i].refType,
            'crewMembers': arrProcObjs[i].crewMembers
        })
    }

    return objTelemByProc;
}


telemByProcToCsvArr = function (arr) {
    /*
    Expects an array of objects in format from procByTelem or gcsByTelem
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
            arr[curKey].procCount
        ];

        if (validation) {
            tableRowArr.push(arr[curKey].valid)
        }

        const curProcsAndSteps = arr[curKey].procs;

        // curProcsAndSteps is an array of keyed objects, each with an array of steps
        const keysProcs = Object.keys(curProcsAndSteps);

        for (let j = 0; j < keysProcs.length; j++) {
            const curProcKey = keysProcs[j];

            if (!tableHdrArr.includes(curProcKey)) {
                tableHdrArr.push(curProcKey);
            }

            const colIndex = findIndexInArray(tableHdrArr, curProcKey);
            let curStepsStr = '"'
                .concat(curProcsAndSteps[curProcKey].steps.join(LINE_BREAK))
                .concat('"');

            tableRowArr = insertValueIntoArrayAtIndex(tableRowArr, colIndex, curStepsStr);
        }

        tableArr.push(tableRowArr);
    }

    tableArr.unshift(tableHdrArr);

    return tableArr;
}

function isPath(str) {
    // Look for brackets (prl files) or '/' in textContent of str
    const bracketRegex = /\[.*\]/;
    return (bracketRegex.test(str) || str.includes('/'));
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
    const pathConverted = path.replaceAll('[', '/' + BRACKET_PATH_ROOT + '/').replaceAll(']', '/');
    return pathConverted.replaceAll(' ', '');
}

function getProcShortName(procName) {
    const regex = /^(.*?)_(.*?)_/;
    const match = procName.match(regex);
    if (match) {
        return match[1].concat('_').concat(match[2]);
    } else {
        return null; // Return null if no match is found
    }
}
