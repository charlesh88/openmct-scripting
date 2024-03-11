let telemetryObjects = [];
const ALPHA_BORDER = '1px solid #555555';
const downloadFilenames = {
    'csv': 'from CSV',
    'prl': 'from Pride procedures'
}
const VALID_PATH = [
    'Viper',
    'yamcs'
];

function displayAppVersion() {
    document.getElementById('app-version').innerText = APP_VERSION;
}

function loadLocalSettings() {
    const retrievedOutputBaseName = loadLocal(LOCALSTORE_BASE_NAME.concat(OUTPUT_BASE_NAME_KEY));
    document.getElementById('output-base-name').value = (retrievedOutputBaseName) ? retrievedOutputBaseName : 'Open MCT Scripting';
}

function initApp() {
    addNav();
    loadLocalSettings();
    displayAppVersion();
}

function resetApp() {

}

document.getElementById('output-base-name').addEventListener("blur", function (ev) {
    storeLocal(LOCALSTORE_BASE_NAME.concat(OUTPUT_BASE_NAME_KEY), document.getElementById('output-base-name').value);
}, false);

document.body.onload = initApp();
