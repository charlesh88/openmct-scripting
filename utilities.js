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
