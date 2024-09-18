const APP_VERSION = '5.0';
const LOCALSTORE_BASE_NAME = 'OPENMCT_SCRIPTING';
const LOCALSTORE_MDB_EXTRACT = 'MDB_EXTRACT';
const ESC_CHARS = {
    'colon': '$ON',
    'comma': '$C',
    'escComma': '$EC',
    'tilde': '$T',
    'backslash': '$BS',
    'doublequotes': '$DDQ'
}
const lineSepStr = '------------------------------------------------';
let OBJ_JSON, ROOT, FOLDER_ROOT;
let config = {};
