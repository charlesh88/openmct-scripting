const VALID_TELEM_PATH = [
    'Viper',
    'yamcs'
];

const BRACKET_PATH_ROOT = 'ViperRover';

extractFromPrlCrawl = function(str, filename) {
    let xmlDoc = new DOMParser().parseFromString(str, "text/xml");
    const steps = xmlDoc.getElementsByTagName("prl:Step");
    let arrPrlTelem = [];

}

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
    let arrPrlTelem = [];


    for (let s = 0; s < steps.length; s++) {
        const curStep = steps[s];
        let stepNumber = curStep.getElementsByTagName("prl:StepNumber")[0].textContent;
        const stepTitleText = curStep
            .getElementsByTagName("prl:StepTitle")[0]
            .getElementsByTagName("prl:Text")[0]
            .textContent;

        // VERIFICATIONS
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
                                    'refType': 'Verify DataReference',
                                    'number': verifyNum,
                                    'parentNumber': stepNumber,
                                    'desc': targDesc
                                });
                            }
                        }
                    }
                }
            }

        }

        // RECORDS
        const recordIns = curStep.getElementsByTagName("prl:RecordInstruction");
        if (recordIns && recordIns.length > 0) {
            for (let ri = 0; ri < recordIns.length; ri++) {
                const recordIn = recordIns[ri];
                const recordNum = recordIn.getElementsByTagName("prl:Number")[0].textContent;
                const recordDesc = recordIn
                    .getElementsByTagName("prl:Description")[0]
                    .getElementsByTagName("prl:Text")[0].textContent;
                const recordDataNs = recordIn.getElementsByTagName("prl:DataNomenclature");
                if (recordDataNs && recordDataNs.length > 0) {
                    for (let rn = 0; rn < recordDataNs.length; rn++) {
                        const recordDataNText = recordDataNs[rn].textContent;
                        // This could be a string that contains a parameter path like: "Current uplink rate, in SPS,
                        // from /Spacesystem/Subsystem/rxDemodulation"
                        const paths = arrPathsFromString(recordDataNText);
                        if (paths && paths.length > 0) {
                            for (let p = 0; p < paths.length; p++) {
                                arrPrlTelem.push({
                                    'procedure': filename,
                                    'path': paths[p],
                                    'pathRef': recordDataNText,
                                    'refType': 'Record DataNomenclature',
                                    'number': recordNum,
                                    'parentNumber': stepNumber,
                                    'desc': recordDesc
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
