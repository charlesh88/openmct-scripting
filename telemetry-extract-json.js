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

