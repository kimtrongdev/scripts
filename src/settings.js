let _ids = [];
let _isPauseAction = false;
let _systemConfig = {};
let _IS_REG_USER = false;
let _BACKUP = false;
let _isSystemChecking = false;
let _actionsData = [];
let _ERROR_TYPE_1_MAP = {};
let _EXPIRED_TIME = 400000;
let _MAX_CURRENT_ACC = Number(devJson.maxProfile);
let _MAX_PROFILE = 2;
let _IP = '';
let _useProxy = true;
let _isRunBAT = false;
let _checkProfileTime = undefined;

const settings = {
    get ids() {
        return _ids;
    },
    set ids(value) {
        _ids = value;
    },

    get isPauseAction() {
        return _isPauseAction;
    },
    set isPauseAction(value) {
        _isPauseAction = value;
    },

    get systemConfig() {
        return _systemConfig;
    },
    set systemConfig(value) {
        _systemConfig = value;
    },

    get IS_REG_USER() {
        return _IS_REG_USER;
    },
    set IS_REG_USER(value) {
        _IS_REG_USER = value;
    },

    get BACKUP() {
        return _BACKUP;
    },
    set BACKUP(value) {
        _BACKUP = value;
    },

    get isSystemChecking() {
        return _isSystemChecking;
    },
    set isSystemChecking(value) {
        _isSystemChecking = value;
    },

    get actionsData() {
        return _actionsData;
    },
    set actionsData(value) {
        _actionsData = value;
    },

    get ERROR_TYPE_1_MAP() {
        return _ERROR_TYPE_1_MAP;
    },
    set ERROR_TYPE_1_MAP(value) {
        _ERROR_TYPE_1_MAP = value;
    },

    get EXPIRED_TIME() {
        return _EXPIRED_TIME;
    },
    set EXPIRED_TIME(value) {
        _EXPIRED_TIME = value;
    },

    get MAX_CURRENT_ACC() {
        return _MAX_CURRENT_ACC;
    },
    set MAX_CURRENT_ACC(value) {
        _MAX_CURRENT_ACC = value;
    },

    get MAX_PROFILE() {
        return _MAX_PROFILE;
    },
    set MAX_PROFILE(value) {
        _MAX_PROFILE = value;
    },

    get IP() {
        return _IP;
    },
    set IP(value) {
        _IP = value;
    },

    get useProxy() {
        return _useProxy;
    },
    set useProxy(value) {
        _useProxy = value;
    },

    get isRunBAT() {
        return _isRunBAT;
    },
    set isRunBAT(value) {
        _isRunBAT = value;
    },

    get checkProfileTime() {
        return _checkProfileTime;
    },
    set checkProfileTime(value) {
        _checkProfileTime = value;
    },
};

module.exports = settings;