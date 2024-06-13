/********************************** UTILITIES */
function createIdentifier(id, namespace) {
    let o = {};
    o.namespace = (namespace) ? namespace : '';
    o.key = id;

    return o;
}

function createUUID() {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}

function isGUID(key) {
    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return guidRegex.test(key);
}

function convertStringToJSON(inputString) {
    const ESC_COMMA = "$";
    // Remove whitespace and line breaks from the input string
    // inputString = inputString.replace(/\s+/g, '');

    // Esc commas within square brackets
    inputString = inputString.replace(/\[(.*?)\]/g, function (match, p1) {
        return "[" + p1.replace(/,/g, ESC_COMMA) + "]";
    });

    // Remove the surrounding double quotes if present
    if (inputString.startsWith('"') && inputString.endsWith('"')) {
        inputString = inputString.slice(1, -1);
    }

    // Remove the outer curly braces if present
    if (inputString.startsWith("{") && inputString.endsWith("}")) {
        inputString = inputString.slice(1, -1);
    }

    // Split the string by commas to separate key-value pairs
    var pairs = inputString.split(",");

    // Initialize an empty object to store key-value pairs
    var jsonObject = {};

    // Iterate through each pair and add them to the object
    pairs.forEach(function (pair) {
        // Split each pair by colon to separate key and value
        var keyValue = pair.split(":");

        // Trim any leading or trailing spaces from key and value
        var key = keyValue[0].trim();
        var value = keyValue[1].trim();
        // Un-escape any escaped commas
        value = value.replaceAll(ESC_COMMA, ",");
        // console.log("value 1", value);

        // Convert certain values to their appropriate data types
        if (value === "true" || value === "false") {
            value = value === "true";
        } else if (!isNaN(value)) {
            console.log("value 3", value, parseFloat(value), isNaN(value));
            value = parseFloat(value);
        } else if (
            typeof value === "string" &&
            value.startsWith("[") &&
            value.endsWith("]")
        ) {
            // Store arrays as arrays
            value = JSON.parse(value);
        }

        // Assign the key-value pair to the object
        jsonObject[key] = value;
    });

    return jsonObject;
}

function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function addStat(objID, str, clear = false) {
    const dispObj = document.getElementById(objID);
    if (dispObj) {
        if (clear) {
            dispObj.innerHTML = '';
        }
        dispObj.innerHTML += str + '<br />';
    }
}

function getFormNumericVal(id) {
    const v = document.getElementById(id).value;
    return (v) ? parseInt(v) : null;
}

function getStrBetween(str, start, end) {
    const startIndex = str.indexOf(start);
    if (startIndex === -1) return ""; // start not found
    const endIndex = str.indexOf(
        end,
        startIndex + start.length
    );
    if (endIndex === -1) return ""; // end not found
    return str.substring(startIndex + start.length, endIndex);
}

function getStrBetweenRegex(str, regex) {
    const result = str.match(new RegExp(regex));
    if (!result) {
        return undefined;
    }
    return result[0];
}

toggleHiddenClass = function (arrIDs) {
    for (let i = 0; i < arrIDs.length; i++) {
        if (arrIDs[i].className.includes('--hidden')) {
            arrIDs[i].classList.remove('--hidden');
        } else {
            arrIDs[i].classList.add('--hidden');
        }
    }
}

function removeExtension(str) {
    // Remove the last '.' separated element from a string
    return str.substring(0, str.lastIndexOf('.'));
}

function restoreEscChars(str) {
    return str
        .replaceAll(ESC_CHARS.escComma, ',')
        .replaceAll(ESC_CHARS.tilde, '~')
        .replaceAll(ESC_CHARS.backslash, '/');
}

function labelWidthFromChars(pxScale, charCnt) {
    // Calcs a label width to a scale from a character count
    const pxPerChar = 16;
    const retinaScanAdj = 0.5;
    return Math.ceil(((pxPerChar * retinaScanAdj) / pxScale) * charCnt);
}

function strClean(str) {
    return str.replaceAll('\n', '');
}

function getCurrentTimeEpoch() {
    return Math.floor(Date.now() / 1000); // Convert milliseconds to seconds
}

function findIndexInArray(array, member, equals = true) {
    for (let i = 0; i < array.length; i++) {
        if (!equals) {
            if (array[i].includes(member)) {
                return i;
            }
        } else {
            if (array[i] === member) {
                return i;
            }
        }
    }
    return -1; // Return -1 if the member is not found in the array
}

function insertValueIntoArrayAtIndex(array, index, value) {
    while (index >= array.length) {
        array.push(undefined); // Add empty values to the array until the index is within bounds
    }
    array.splice(index, 0, value); // Insert the value at the specified index
    return array;
}

function arrSortByKey(arr) {
    // Convert the array of objects into an array of key-value pairs
    const keyValuePairArray = arr.map(obj => Object.entries(obj)[0]);

    // Sort the array of key-value pairs based on the key
    keyValuePairArray.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    // Reconstruct the object from the sorted array of key-value pairs
    const sortedObject = keyValuePairArray.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});

    return sortedObject;
}

function arrSortByProperty(arr, property) {
    // Sort the array of objects by the specified property
    return arr.sort((a, b) => {
        if (a[property] < b[property]) {
            return -1;
        }
        if (a[property] > b[property]) {
            return 1;
        }
        return 0;
    });
}

function arrSortAndKeyByProperty(arr, property) {
    arr = arrSortByProperty(arr, property);

    // console.log('arrSortAndKeyByProperty sorted',arr);

    // Create a new array of objects keyed to the specified property
    const keyedArray = arr.map(obj => {
        const newObj = {};
        newObj[obj[property]] = obj;
        return newObj;
    });

    return keyedArray;
}

function strRemoveRegex(str, regex) {
    return str.replace(regex, '');
}
