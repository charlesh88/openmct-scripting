// COMMON FUNCTIONS FOR TELEMETRY EXTRACTION
function pathFromString(str) {
    /*
     Take in ANY string. If it has anything that matches a telem path, like 'Verify /foo.bar and /bar.foo' or
    'Verify [foo] bar', extract it and add it to an array
     Examples:
     [App] Parameter.aggregateMember
     /Spacesystem/App/Parameter [0]
     Rover foo (/Spacesystem/App/Parameter.aggregateMember)
     Current foo rate, in SPS, from /Spacesystem/App/Parameter
     */
    const bracketRegex = /\[.*]/;
    let arrWords = str.split(' ');
    let strOut = '';

    if (bracketRegex.test(arrWords[0])) {
        // If the first word has brackets, the whole str is like [App] Parameter.aggregateMember
        strOut = convertPrideBracketPath(str);
        arrWords.shift();
    }

    for (let w = 0; w < arrWords.length; w++) {
        if (arrWords[w].includes('/')) {
            strOut = arrWords[w];
        } else {
            if (bracketRegex.test(arrWords[w])) {
                // Find elements like trailing [0]
                strOut = strOut.concat(arrWords[w]);
            }
        }
    }
    strOut = strOut
        .replaceAll('(','')
        .replaceAll(')','');

    return (isPath(strOut)) ? strOut : false;
}
