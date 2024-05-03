const VALID_TELEM_PATH = [
    'Viper',
    'yamcs'
];

const BRACKET_PATH_ROOT = 'ViperRover';

extractFromPrlExpanded = function (str, filename) {
    /*
    Compiles an array of telem objs as follows:
    path: / sepped path to the telem in use
    refType: reference, nomenclature, verify, etc.
    refDesc: text description for the instruction - sub-element of a step
    stepNumber: prl:Number of the step
    stepDesc: prl:StepTitle > prl:Text of the step
    crewMembers: crewMembers property of prl:Step. Note that crewMembers is a property on numerous other node types than :Step.

    Will look at prl:DataReference > prl:Identifier - this should capture telem in prl:RecordInstructions AND prl:VerifyGoals
    Purposefully ignoring DataNomenclature for now
    */

    let xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    const steps = xmlDoc.getElementsByTagName("prl:Step");
    console.log(steps);
    let arrPrlTelem = [];


    for (let s = 0; s < steps.length; s++) {
        const curStep = steps[s];
        let stepNumber = curStep.getElementsByTagName("prl:StepNumber")[0].textContent;
        const stepTitleText = curStep
            .getElementsByTagName("prl:StepTitle")[0]
            .getElementsByTagName("prl:Text")[0]
            .textContent;
        const verifyIns = curStep.getElementsByTagName("prl:VerifyInstruction");

        if (verifyIns && verifyIns.length > 0) {
            for (let vi = 0; vi < verifyIns.length; vi++) {
                const verifyIn = verifyIns[vi];
                const verifyNum = verifyIn.getElementsByTagName("prl:Number")[0].textContent;
                const verifyGoals = verifyIn.getElementsByTagName("prl:VerifyGoal");
                if (verifyGoals && verifyGoals.length > 0) {
                    for (let vg = 0; vg < verifyGoals.length; vg++) {
                        const verifyGoal = verifyGoals[vg];
                        const targDesc = verifyGoal
                            .getElementsByTagName("prl:TargetDescription")[0]
                            .getElementsByTagName("prl:Text")[0].textContent;
                        const dataRefs = verifyGoal.getElementsByTagName("prl:DataReference");
                        if (dataRefs && dataRefs.length > 0) {
                            const dataRefDesc = dataRefs[0].getElementsByTagName("prl:Description")[0].textContent;
                            if (dataRefDesc) {
                                arrPrlTelem.push({
                                    'procedure': filename,
                                    'path': convertPrideBracketPath(dataRefDesc),
                                    'pathRef': dataRefDesc,
                                    'refType': 'dataReference',
                                    'number': verifyNum,
                                    'desc': targDesc
                                });
                            }
                        }
                    }
                }
            }

        }
    }
    return arrPrlTelem;
}

extractFromPrl = function (str) {
    /*
    * MOVED FROM main-telemetry-extract.js, replaces extractTelemFromPrl
     */

    // TODO; THIS IS NOT WORKING RIGHT NOW! FIX!!

    let xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    const steps = xmlDoc.getElementsByTagName("prl:Step");
    let arrStepsAndTelemForDisplay = [];
    let arrUniqueTelemForProc = [];

    for (let s = 0; s < steps.length; s++) {
        // Collect all telem path references for a given step
        const arrDataReferences = steps[s].getElementsByTagName("prl:DataReference");
        const arrDataNomenclature = steps[s].getElementsByTagName("prl:DataNomenclature");
        const arrVerifyGoals = steps[s].getElementsByTagName("prl:VerifyGoal");
        const nodeStepTitle = steps[s].getElementsByTagName("prl:StepTitle")[0];

        let arrUniquePathsForStep = [];

        if (arrDataReferences && arrDataReferences.length > 0) {
            const arrPaths = extractTelemFromPrlDataReferences(arrDataReferences);
            for (let i = 0; i < arrPaths.length; i++) {
                let path = arrPaths[i];
                if (!arrUniquePathsForStep.includes(path)) {
                    arrUniquePathsForStep.push([path, 'DataReference']);
                }
            }
        }

        if (arrDataNomenclature && arrDataNomenclature.length > 0) {
            const arrPaths = extractTelemFromPrlDataNomenclature(arrDataNomenclature);
            for (let i = 0; i < arrPaths.length; i++) {
                let path = arrPaths[i];
                if (!arrUniquePathsForStep.includes(path)) {
                    arrUniquePathsForStep.push([path, 'DataNomenclature']);
                }
            }
        }

        if (arrVerifyGoals && arrVerifyGoals.length > 0) {
            const arrPaths = extractTelemFromPrlVerifications(arrVerifyGoals);
            for (let i = 0; i < arrPaths.length; i++) {
                let path = arrPaths[i];
                if (!arrUniquePathsForStep.includes(path)) {
                    arrUniquePathsForStep.push([path, 'VerifyGoal']);
                }
            }
        }

        if (arrUniquePathsForStep.length > 0) {
            // Add a step label
            arrStepsAndTelemForDisplay.push(createTableObj('label', 'STEP '.concat(nodeStepTitle.getElementsByTagName("prl:StepNumber")[0].textContent)), '');

            for (let i = 0; i < arrUniquePathsForStep.length; i++) {
                const path = arrUniquePathsForStep[i][0];
                const refType = arrUniquePathsForStep[i][1];
                addToArrUniquePaths(path);
                arrStepsAndTelemForDisplay.push(createTableObj('path', path, refType));
            }
        }
    }

    return arrStepsAndTelemForDisplay;
}

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

extractTelemFromPrlVerifications = function (prlNodesArr) {
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
    const pathConverted = path.replaceAll('[', '/' + BRACKET_PATH_ROOT + '/').replaceAll(']', '/');
    return pathConverted.replaceAll(' ', '');
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
