extractTelemFromPrlDataReferences = function (prlNodesArr) {
    let telemArrOut = [];

    for (let i = 0; i < prlNodesArr.length; i++) {
        let description = '', identifier = ''; //

        if (prlNodesArr[i].getElementsByTagName("prl:Description")[0]) {
            description = prlNodesArr[i].getElementsByTagName("prl:Description")[0].textContent;
            identifier = prlNodesArr[i].getElementsByTagName("prl:Identifier")[0].textContent;
            let path = identifier;
            /*
                Pride stores aggregates like this:
                DataReference > Description: [EpsIo] SaciTelemetry.LIG_CTLR_CURR
                DataReference > Idenfitier: /ViperRover/EpsIo/SaciTelemetry
                So, we have to look for '.' in the Description to figure out if its an aggregate
                If so, grab everything past the first '.' and append it to the Identifier to get a valid path
             */

            if (description.includes('.')) {
                const pathEnd = description.substring(description.indexOf('.'), description.length);
                path = identifier.concat(pathEnd);
            }

            if (validatePath(path)) {
                path = strClean(path);

                if (path.length > 0) {
                    telemArrOut.push(path);
                }
            }
        }
    }

    // console.log('extractTelemFromPrlDataReferences', telemArrOut);

    return telemArrOut;
}

extractTelemFromPrlDataNomenclature = function (prlNodesArr) {
    let telemArrOut = [];

    for (let i = 0; i < prlNodesArr.length; i++) {
        let path = prlNodesArr[i].textContent;

        // Sometimes this node contains a useful path to telem, like this:
        // Current uplink rate, in SPS, from /ViperRover/RadIo/rxDemodulation
        if (validatePath(path) && path.includes('/')) {
            path = path.substring(path.indexOf('/'), path.length);
            if (path.includes(' ')) {
                path = path.substring(0, path.indexOf(' '));
            }

            path = strClean(path);

            if (path.length > 0) {
                telemArrOut.push(path);
            }
        }
    }

    // console.log('extractTelemFromPrlDataNomenclature', telemArrOut);

    return telemArrOut;
}


extractTelemFromPrlVerifications = function (arrToIterate, filename, boolFilterParams) {
    // OLD, NOT USED: NEEDS UPDATING FOR APPROACH AS ABOVE
    // arrToIterate is an array of the following
    // <prl:VerifyGoal>
    //    <prl:TargetDescription>
    //         <prl:Text>/ViperRover/MsoloIo/enabledFlag</prl:Text>
    let telemCntr = 0;

    for (let i = 0; i < arrToIterate.length; i++) {
        const targDesc = arrToIterate[i].getElementsByTagName('prl:TargetDescription');

        if (targDesc.length > 0) {
            let path = targDesc[0].getElementsByTagName('prl:Text')[0].textContent;
            path = escForCsv(path);
            const pathFilter = (boolFilterParams) ? (path.length > 0 && !path.includes(' ')) : path.length > 0;
            if (pathFilter) {
                addToArrPathsAndRefs(path, filename,'VerifyGoal');

                if (addToArrUniquePaths(path)) {
                    telemCntr++;
                }
            }
        }
    }

    return telemCntr;
}
