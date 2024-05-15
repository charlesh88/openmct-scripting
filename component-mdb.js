/*
Code and front-end for an MDB comparison component
Looks for the MDB_EXTRACT local storage key,
If found, loads it.
If not found, provides a link to the ingest page.
 */

let ARR_MDB_PATHS = [];
let MDB_LOADED = false;

showMdbStatus = function (haveMdb) {
    const mdbStatus = document.getElementById('mdb-status');
    if (haveMdb) {
        mdbStatus.innerText = 'MDB loaded from local storage';
        mdbStatus.classList.add('--loaded');
    }
}

loadLocalStorageMDB = function () {
    const m = loadLocal('MDB_EXTRACT');
    if (m) {
        MDB_LOADED = true;
        const mdbExtract = JSON.parse(m);
        for (let i = 0; i < mdbExtract.length; i++) {
            ARR_MDB_PATHS.push(mdbExtract[i][0]);
        }
    }
    showMdbStatus(MDB_LOADED);
}

document.body.onload = loadLocalStorageMDB();
