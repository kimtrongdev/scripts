const fs = require("fs");
const { getProfileIds } = require("./getProfileIds");
/**
 * Thay đổi profile đang chạy
 */
function changeProfile() {
    if (!Array.isArray(config.profileTimeLog)) {
        config.profileTimeLog = []
    }

    let currentIds = getProfileIds()
    config.profileTimeLog = config.profileTimeLog.filter(id => currentIds.includes(id))
    let currentData = currentIds.filter(id => !config.profileTimeLog.includes(id))
    currentData = [...currentData, ...config.profileTimeLog]
    _profileRuning = currentData.shift()
    currentData.push(_profileRuning)
    runningPid = _profileRuning
    config.profileTimeLog = currentData
    fs.writeFileSync("vm_log.json", JSON.stringify(config))
}

module.exports = { changeProfile };
