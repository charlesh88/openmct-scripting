let telemetryObjects = [];
const ALPHA_BORDER = '1px solid #555555';
function displayAppVersion() {
    document.getElementById('app-version').innerText = APP_VERSION;
}

function initApp() {
    addNav();
    displayAppVersion();
}

function resetApp() {

}

document.body.onload = initApp();
