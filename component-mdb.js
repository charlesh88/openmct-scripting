/*
Code and front-end for an MDB comparison component
Looks for the MDB_EXTRACT local storage key,
If found, loads it.
If not found, provides a link to the ingest page.
 */

let MDB_CONNECTED = false;
let inputYamcsUrl;
let YAMCS_URL;
let YAMCS_MDB_URL;

const htmlElement = '\n' +
    '        <div class="page-section">\n' +
    '            <div class="c-config">\n' +
    '                <h2>Yamcs MDB Connection</h2>\n' +
    '                <div class="c-config__label">Yamcs URL</div>\n' +
    '                <div class="c-config__value">\n' +
    '                    <input class="--lg" type="text" id="yamcs-server-url" value=""/>\n' +
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
    const fullUrl = YAMCS_URL.concat(url);

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
    inputYamcsUrl = document.getElementById("yamcs-server-url");

    inputYamcsUrl.addEventListener("blur", function (ev) {
        storeLocal(LOCALSTORE_BASE_NAME.concat('YAMCS_URL'), inputYamcsUrl.value);
        YAMCS_URL = inputYamcsUrl.value;
        testYamcsConnection();
    }, false);

    const yamcsUrl = loadLocal(LOCALSTORE_BASE_NAME.concat('YAMCS_URL'));
    YAMCS_URL = (yamcsUrl && yamcsUrl.length > 0) ? yamcsUrl : window.location.origin;
    inputYamcsUrl.value = YAMCS_URL;

    testYamcsConnection();
}

document.body.onload = initComponent();
