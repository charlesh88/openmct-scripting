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
        prl:Text <TELEM>
    prl:Number <#.#>

    prl:VerifyInstruction <crewMembers>
    prl:Description
        prl:Text
    prl:Number <#.#>
    prl:And
        prl:VerifyGoal
            prl:CurrentValue
                prl:DataReference
                    prl:Identifier <TELEM>
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
                // console.log(arrTelemPathsForNode);
            }
        }
        if (nodeName === 'prl:VerifyInstruction') {
            // VerifyInstruction
            curNumber = node.getElementsByTagName("prl:Number")[0].textContent;
            telemNodes = node.getElementsByTagName("prl:Identifier");
            if (telemNodes && telemNodes.length > 0) {
                for (let i = 0; i < telemNodes.length; i++) {
                    pathStr = telemNodes[i].textContent;
                    if (isPath(pathStr)) {
                        arrTelemPathsForNode.push(...getPathObjects(
                            pathStr, filename, nodeName, curNumber, curCrewMembers
                        ));
                        // console.log(arrTelemPathsForNode);
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
    // console.log('arrTelemPathObjs', arrTelemPathObjs);

    return arrTelemPathObjs;
}

/*********************************** .PRL FUNCTIONS */
telemByProc = function (arr) {
    /*
    Expects an array of objects in format from extractFromPrlTraverse
    Go through arr, get path and add as an object key to the objTelemByProc
    */
    objTelemByProc = {};
    for (let i = 0; i < arr.length; i++) {
        // console.log('arr[i]',arr[i].path);
        const curPath = arr[i].path;
        if (!Object.keys(objTelemByProc).includes(curPath)) {
            objTelemByProc[curPath] = {
                'refType': arr[i].refType,
                'procs': {},
                'procCount': 0
            }
        }
        const objCurTelemProcs = objTelemByProc[curPath].procs;
        const curProc = arr[i].procedure;
        if (!Object.keys(objCurTelemProcs).includes(curProc)) {
            objTelemByProc[curPath].procCount += 1;
            objTelemByProc[curPath].procs[curProc] = {
                'steps': []
            }
        }
        objTelemByProc[curPath].procs[curProc].steps.push(
            arr[i].number
                .concat(' ', arr[i].crewMembers)
        );
    }

    return objTelemByProc;
}

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

        // curProcsAndSteps is an array of keyed objects, each with an array of steps
        const keysProcs = Object.keys(curProcsAndSteps);

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

    tableArr.unshift(tableHdrArr);

    return tableArr;
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
