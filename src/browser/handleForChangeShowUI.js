const utils = require("../../utils")
const { getProfileIds } = require("../profile/getProfileIds")
const settings = require("../settings")
const { closeChrome } = require("./closeChrome")

/**
 * Xử lý thay đổi giao diện người dùng
 */
async function handleForChangeShowUI() {
    let _pids = getProfileIds()

    for await (let pid of _pids) {
        closeChrome(pid)
        await utils.sleep(2000)
    }
    await utils.sleep(2000)
    runnings = []
    settings.ids = _pids
}

module.exports = { handleForChangeShowUI };