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
