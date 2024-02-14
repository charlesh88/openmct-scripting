/********************************** UTILITIES */
function createIdentifier(id, namespace) {
    let o = {};
    o.namespace = (namespace) ? namespace : '';
    o.key = id;

    return o;
}

function createStyleObj(args) {
    /*
    args = {
        border: 1px solid #666666,
        bgColor: #ff0000,
        fgColor: #ffffff,
        id (sets a related condition id)
    }
     */
    let s = {};
    s.style = {};
    s.style.border = (args && args.border) ? args.border : '';
    s.style.isStyleInvisible = '';
    s.style.backgroundColor = (args && args.bgColor) ? args.bgColor : '';
    s.style.color = (args && args.fgColor) ? args.fgColor : '';
    if (args && args.id) {
        s.conditionId = args.id;
    }

    return s;
}

function csvToArray(str, delimiter = ",") {
    // Based on https://sebhastian.com/javascript-csv-to-array/
    console.log(str);
    outputMsg("csvToArray:");
    outputMsg("Read in ".concat(str.length).concat(" chars"));

    // Split the text into lines and remove empty rows
    const rows = str.split(/\r?\n/)
        .filter((row) => row.length > 0);
    outputMsg("File split into ".concat(rows.length.toString()).concat(" rows including header"));
    // console.log(rows);

    // Get headers from the first row
    const headers = rows.shift().split(delimiter);

    // Map the rows: each row becomes an object with property names from the headers array
    const arr = rows.map(function (row) {
        // console.log(row.length, 'row pre-replace: ', row);
        row = row.replace(/"[^"]+"/g, function (v) {
            // Encode all commas that are within double quote chunks with '|'
            // then restore them after removing the double quotes below
            return v.replace(/,/g, '|');
        })

        // console.log(row.length, 'row post-replace: ', row);
        const values = row.split(delimiter);

        if (values.length > 0) {
            const el = headers.reduce(function (object, header, index) {
                object[header] = values[index]
                    .replaceAll('/', '~')
                    .replaceAll('\"', '')
                    .replaceAll('|', ',');
                return object;

            }, {});
            return el;
        }
    });

    // return the array
    console.log('csvToArray arr', arr);
    return arr;
}

function getNamespace(source) {
    return (source.indexOf('~') != -1) ? 'taxonomy' : '';
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

function labelWidthFromChars(pxScale, charCnt) {
    // Calcs a label width to a scale from a character count
    const pxPerChar = 14;
    const retinaScanAdj = 0.5;
    const width = Math.ceil(((pxPerChar * retinaScanAdj) / pxScale) * charCnt);

    return width;
}

function strClean(str) {
    let oStr = '';
    oStr = str.replaceAll('\n', '');
    return oStr;
}

function validatePath(path) {
    for (let i = 0; i < VALID_PATH.length; i++) {
        if (path.includes(VALID_PATH[i])) {
            return true;
        }
    }
    return false;
}

function escForCsv(str) {
    // Change all commas; change double-quotes to double-double-quotes
    let o = '"'.concat(str.replace(/,/g, ';;').replace(/"/g, '""')).concat('"');

    // Restore commas
    o = o.replace(/;;/g, ',');

    return o;
}
