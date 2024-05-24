function extractCompositionKeys(jsonObj) {
    // const jsonObj = JSON.parse(jsonStr);
    const result = {};

    function extractKeys(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (isGUID(key) && typeof value === 'object' && value !== null) {
                    if (Array.isArray(value.composition)) {
                        result[key] = {
                            'name': value.name,
                            'composition': value.composition.map(comp => comp.key)
                        };
                    }
                }
                if (typeof value === 'object' && value !== null) {
                    extractKeys(value);
                }
            }
        }
    }

    extractKeys(jsonObj);
    return result;
}

function extractCompositionKeysToObjArray(jsonObj) {
    // const jsonObj = JSON.parse(jsonStr);
    const result = [];

    function extractKeys(obj) {
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                if (isGUID(key) && typeof value === 'object' && value !== null) {
                    if (Array.isArray(value.composition)) {
                        value.composition.map(comp => {
                            if (comp.key && comp.key.includes('~')) {
                                result.push({
                                    'key': key,
                                    'name': value.name,
                                    'type': value.type,
                                    'createdBy': value.createdBy ? value.createdBy : undefined,
                                    'path': comp.key
                                })
                            }
                        })
                    }
                }
                if (typeof value === 'object' && value !== null) {
                    extractKeys(value);
                }
            }
        }
    }

    extractKeys(jsonObj);
    return result;
}

openMCTContainerByTelem = function (arr) {
    /*
    Expects an array of objects in format from extractCompositionKeysToObjArray
    Go through arr, get path and add as an object key to the openMCTContainerByTelem
    For each key, add relevant properties
    */
    openMCTContainerByTelem = {};
    for (let i = 0; i < arr.length; i++) {
        const curPath = arr[i].path.replaceAll('~','/');
        if (!Object.keys(openMCTContainerByTelem).includes(curPath)) {
            openMCTContainerByTelem[curPath] = {
                'containers': {},
                'containerCount': 0
            }
        }
        const objCurTelemOpenMCTContainer = openMCTContainerByTelem[curPath].containers;
        const openMCTContainerForThisPath = arr[i].key;
        if (!Object.keys(objCurTelemOpenMCTContainer).includes(openMCTContainerForThisPath)) {
            openMCTContainerByTelem[curPath].containerCount += 1;
            openMCTContainerByTelem[curPath].containers[openMCTContainerForThisPath] = {
                'name': arr[i].name,
                'type': arr[i].type,
                'createdBy': arr[i].createdBy
            };
        }
    }

    return openMCTContainerByTelem;
}

openMCTContainerByTelemToCsvArr = function (arr) {
    /*
    Expects an array of objects in format from openMCTContainerByTelem
    Iterate through keys, and format a tabular CSV for output
    */

    let tableArr = [];
    const LINE_BREAK = '\r\n';

    let tableHdrArr = [
        'parameter',
        'in object count',
        'objects'
    ];

    const pathKeys = Object.keys(arr);

    // Check the first entry for a valid property
    const validation = (arr[pathKeys[0]].valid);
    console.log('openMCTContainerByTelemToCsvArr', arr);

    if (validation) {
        tableHdrArr.push('valid');
    }

    for (let i = 0; i < pathKeys.length; i++) {
        const curKey = pathKeys[i]; // /SpaceSystem/Sub-system/Parameter.etc

        let tableRowArr = [
            curKey,
            arr[curKey].containerCount
        ];

        if (validation) {
            tableRowArr.push(arr[curKey].valid)
        }

        const containersForThisPath = arr[curKey].containers; // Object with keyed containers.

        const keysContainersForThisPath = Object.keys(containersForThisPath); // Array of container guids
        let containersStr = '';

        for (let j = 0; j < keysContainersForThisPath.length; j++) {
            const curContainerGuid = keysContainersForThisPath[j];
            const curContainer = containersForThisPath[curContainerGuid];
            containersStr = containersStr
                .concat(curContainer.name)
                .concat(' [')
                .concat(curContainer.type)
                .concat(']')
                .concat(LINE_BREAK);
        }

        tableRowArr.push('"' + containersStr + '"');
        tableArr.push(tableRowArr);
    }

    tableArr.unshift(tableHdrArr);

    return tableArr;
}
