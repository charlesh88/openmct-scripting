const APP_VERSION = '4.1.1';
const LOCALSTORE_BASE_NAME = 'OPENMCT_SCRIPTING';
const LOCALSTORE_MDB_EXTRACT = 'MDB_EXTRACT';
const ESC_CHARS = {
    'comma': '$C',
    'escComma': '$EC',
    'tilde': '$T',
    'backslash': '$BS',
    'doublequotes': '$DDQ'
}
const lineSepStr = '------------------------------------------------';
let config = {};
