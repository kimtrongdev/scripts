const { getBrowserOfProfile } = require("../browser/getBrowserOfProfile");
const settings = require("../settings");
const execSync = require('child_process').execSync;

/**
 * Thiết lập hiển thị cho một profile
 * @param {string} pid - ID của profile
 */
function setDisplay(pid) {
    try {
        // Kiểm tra xem có hiển thị giao diện người dùng hay không
        if (IS_SHOW_UI) {
            // Nếu số lượng tài khoản hiện tại lớn hơn 1
            if (settings.MAX_CURRENT_ACC > 1) {
                // Lấy tên trình duyệt tương ứng với profile
                let browser = getBrowserOfProfile(pid);
                
                // Thiết lập cửa sổ trình duyệt làm cửa sổ hiện tại
                execSync(`wmctrl -x -a ${browser}`);
            }
        } else {
            // Nếu không phải môi trường Windows
            if (!WIN_ENV) {
                // Thiết lập biến môi trường DISPLAY cho profile
                process.env.DISPLAY = ':' + pid;
            }
        }
    }
    catch (e) {
        // Không xử lý lỗi, bỏ qua nếu có lỗi xảy ra
    }
}

module.exports = { setDisplay };