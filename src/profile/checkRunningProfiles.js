const utils = require("../../utils");
const { closeChrome } = require("../../closeChrome");
const settings = require("../settings");
const execSync = require('child_process').execSync;

/**
 * Kiểm tra và xử lý các tiến trình đang chạy
 * @returns {Promise<void>}
 */
async function checkRunningProfiles() {
    try {
        // Nếu hành động đang tạm dừng, không thực hiện kiểm tra
        if (settings.isPauseAction) {
            return
        }
        utils.log('runnings: ', runnings.length)
        let watchingLength = runnings.length
        // Lặp qua các tiến trình đang chạy và xử lý các tiến trình đã hết hạn
        for (let i = 0; i < watchingLength; i++) {
            // calculate last report time
            let timeDiff = Date.now() - runnings[i].lastReport
            // Nếu thời gian kể từ lần báo cáo cuối cùng vượt quá thời gian hết hạn

            if (timeDiff > settings.EXPIRED_TIME) {
                let pid = runnings[i].pid
                utils.log('----- expired time -----', pid)
                try {
                    // Đóng trình duyệt của tiến trình
                    closeChrome(pid)
                    // Nếu là hành động đăng nhập hoặc đăng ký người dùng
                    if (runnings[i].action == 'login' || settings.IS_REG_USER) {
                        // Xóa thư mục profile của tiến trình
                        execSync('rm -rf profiles/' + pid)
                        // Xóa pid khỏi danh sách ids
                        settings.ids = settings.ids.filter(id => id != pid)
                    }
                }
                catch (e) {
                    utils.log('error', 'closeChrome or removeProfile failed:', error);
                }
                finally {
                    // delete in watching queue
                    runnings = runnings.filter(x => x.pid != pid)
                    watchingLength -= 1
                    i -= 1
                }
            }
        }
    }
    catch (e) {
        utils.log('error', 'checkWatchingProfile err: ', e)
    }
}

module.exports = { checkRunningProfiles };