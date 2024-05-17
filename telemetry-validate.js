// CHATGPT START
async function validateParamsAgainstYamcsMdb(arrParamPaths) {
    // REQUIRES COMPONENT-MDB.JS
    let arrV = [];
    try {
        const promises = arrParamPaths.map(async (url, index) => {
            const massagedUrl = url.replace(/\[\d\]/g, ''); // Remove any elements in brackets
            const fullUrl = HOST_URL.concat(YAMCS_MDB_URL).concat(massagedUrl);
            const response = await fetch(fullUrl);
            if (response.status === 200) {
                // const data = await response.json();
                arrV[url] = 'OK'; // Update the array with the result
            } else {
                arrV[url] = 'DID NOT VALIDATE'; // Update the array with the result
                // console.error(`Error: Failed to fetch data from ${url}`);
            }
        });
        await Promise.all(promises);
        return arrV; // Return true when all requests are completed
    } catch (error) {
        console.error("Error:", error);
        return false;
    }
}
