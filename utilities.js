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
    // https://sebhastian.com/javascript-csv-to-array/
    str = str.replaceAll('\r','');
    // slice from start of text to the first \n index
    // use split to create an array from string by delimiter
    const headers = str.slice(0, str.indexOf("\n")).split(delimiter);

    // slice from \n index + 1 to the end of the text
    // use split to create an array of each csv value row
    let rowStr = str.slice(str.indexOf("\n") + 1);

    rowStr = rowStr.replace(/"[^"]+"/g, function (v) {
        // Encode all commas that are within double quote chunks with |
        return v.replace(/,/g, '|');
    });

    const rows = rowStr.split("\n");

    // Map the rows
    // split values from each row into an array
    // use headers.reduce to create an object
    // object properties derived from headers:values
    // the object passed as an element of the array
    const arr = rows.map(function (row) {
        const values = row.split(delimiter);
        const el = headers.reduce(function (object, header, index) {
            object[header] = values[index]
                .replaceAll('\"','')
                .replaceAll('|',',');
            return object;
        }, {});
        return el;
    });

    // return the array
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
