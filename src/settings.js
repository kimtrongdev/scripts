
/**
 * không thay đổi trực tiếp toàn bộ setting : settings = { isPauseAction = true }  không làm như vậy.
 * chỉ thay đổi từng phần nhỏ ví dụ setting.isPauseAction = true 
 * */
let settings = {
    ids: [],
    isPauseAction: false,
    systemConfig: {},
    IS_REG_USER: false,
    BACKUP: false,
    isSystemChecking: false,
    actionsData: [],
    ERROR_TYPE_1_MAP: {},
    EXPIRED_TIME: 400000,
    MAX_CURRENT_ACC: Number(devJson.maxProfile),
    MAX_PROFILE: 2,
    IP: '',
    useProxy: true,
    isRunBAT: false,
    checkProfileTime: undefined,

};

module.exports = settings;