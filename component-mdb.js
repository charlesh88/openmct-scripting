/*
Code and front-end for an MDB comparison component
Looks for the MDB_EXTRACT local storage key,
If found, loads it.
If not found, provides a link to the ingest page.
 */

let MDB_CONNECTED = false;
let inputHost;
let inputMdbPath;
let HOST_URL;
let YAMCS_MDB_URL;

const htmlElement = '\n' +
    '        <div class="page-section --expands">\n' +
    '            <div class="c-config">\n' +
    '                <h2>Yamcs MDB Connection</h2>\n' +
    '                <div class="c-config__label">Yamcs URL</div>\n' +
    '                <div class="c-config__value">\n' +
    '                    <input type="text" id="yamcs-server-url-root" value=""/>\n' +
    '                    <input type="text" id="yamcs-server-url-mdb-path" value="" style="width: 250px;"/>\n' +
    '                    <span id="mdb-status" class="c-mdb-status">...</span>\n' +
    '                </div>\n' +
    '            </div>\n' +
    '        </div>';


setMdbConnectionStatus = function (haveMdb) {
    const mdbConnStatusHtmlElem = document.getElementById('mdb-status');
    if (haveMdb) {
        MDB_CONNECTED = true;
        mdbConnStatusHtmlElem.innerText = 'Connected';
        mdbConnStatusHtmlElem.classList.add('--loaded');
    } else {
        mdbConnStatusHtmlElem.innerText = 'Not connected';
        mdbConnStatusHtmlElem.classList.remove('--loaded');
    }
}

async function validateParameter(url = '') {
    const fullUrl = HOST_URL.concat(YAMCS_MDB_URL).concat(url);

    try {
        const response = await fetch(fullUrl);
        return response.status === 200;
    } catch (error) {
        console.error(fullUrl, error);
        return undefined;
    }
}

function testYamcsConnection() {
    validateParameter()
        .then(status => {
            setMdbConnectionStatus(status)
        });
}

function initComponent() {
    const componentMdb = document.getElementById("component-mdb");
    componentMdb.innerHTML = htmlElement;
    inputHost = document.getElementById("yamcs-server-url-root");
    inputMdbPath = document.getElementById("yamcs-server-url-mdb-path");

    inputHost.addEventListener("blur", function (ev) {
        storeLocal(LOCALSTORE_BASE_NAME.concat('YAMCS_HOST_URL'), inputHost.value);
        HOST_URL = inputHost.value;
        testYamcsConnection();
    }, false);

    inputMdbPath.addEventListener("blur", function (ev) {
        storeLocal(LOCALSTORE_BASE_NAME.concat('YAMCS_MDBPATH_URL'), inputMdbPath.value);
        YAMCS_MDB_URL = inputMdbPath.value;
        testYamcsConnection();
    }, false);

    const host = loadLocal(LOCALSTORE_BASE_NAME.concat('YAMCS_HOST_URL'));
    HOST_URL = (host && host.length > 0) ? host : window.location.origin;
    inputHost.value = HOST_URL;

    const mdbPath = loadLocal(LOCALSTORE_BASE_NAME.concat('YAMCS_MDBPATH_URL'));
    YAMCS_MDB_URL = (mdbPath && mdbPath.length > 0) ? mdbPath : '/yamcs/api/mdb/viper/parameters';
    inputMdbPath.value = YAMCS_MDB_URL;

    testYamcsConnection();
}

document.body.onload = initComponent();
