/*********************************** GCS .PY FUNCTIONS */
extractTelemFromGCS = function (strValue, filename) {
    const lines = strValue.split('\n');
    const regex = "(?<=\\(')(.*?)(?=')";
    let telemCount = 0;

    for (let i = 0; i < lines.length; i++) {
        if (
            !lines[i].includes('#') &&
            (
                lines[i].includes('getval(') ||
                lines[i].includes('checkval(')
            )
        ) {
            const telem = getStrBetweenRegex(lines[i], regex);
            if (telem) {
                telemCount++;
                addToArrPathsAndRefs(telem, filename, (lines[i].includes('getval')) ? 'getval' : 'checkval');
                addToArrUniquePaths(telem);
            }
        }
    }
    return telemCount;
}
