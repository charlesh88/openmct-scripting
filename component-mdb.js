/*
Code and front-end for an MDB comparison component
Looks for the MDB_EXTRACT local storage key,
If found, loads it.
If not found, provides a link to the ingest page.
 */

let mdbExtract = [];

showMdbStatus = function(haveMdb) {
    const mdbStatus = document.getElementById('mdb-status');
    if (haveMdb) {
        mdbStatus.innerText = 'MDB loaded';
        mdbStatus.classList.add('--loaded');
    }
}

loadLocalStorageMDB = function() {
    const storedLocalMdb = loadLocal('MDB_EXTRACT');
    mdbExtract = storedLocalMdb;
    showMdbStatus(mdbExtract);
}

document.body.onload = loadLocalStorageMDB();
