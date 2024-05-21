async function validateParamsAgainstYamcsMdb(arrParamPaths) {
    // REQUIRES COMPONENT-MDB.JS
    let arrV = [];
    try {
        const promises = arrParamPaths.map(async (url, index) => {
            const testPath = url.replace(/\[\d*]/g, ''); // Remove any elements in brackets
            const fullUrl = YAMCS_URL.concat(testPath);
            const response = await fetch(fullUrl);
            return  arrV[url] = {
                'testPath': testPath,
                'validated': response.status === 200
            };
        });
        await Promise.all(promises);
        return arrV; // Return array when all requests are completed
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}
