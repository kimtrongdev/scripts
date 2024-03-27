const execSync = require('child_process').execSync;
const exec = require('child_process').exec;

/**
 * Khởi động màn hình ảo cho một profile
 * @param {string|number} pid - ID của profile
 */
function startDisplay(pid) {
    try {
        if (!WIN_ENV) {
            // Khởi động màn hình ảo sử dụng Xvfb với độ phân giải 1920x1040 và 24-bit color
            exec(`Xvfb :${pid} -ac -screen 0, 1920x1040x24`)
            
            // Tính toán số lõi CPU và RAM cho profile
            let core = (pid % 4 + 1) * 2
            let ram = core * (pid % 2 + 1) * 2
            
            // Cấu hình số lõi CPU và RAM trong tệp prefs.js
            execSync(`sed -i '241 s/"value":.*/"value":${core}/' trace/js/background/prefs.js;sed -i '245 s/"value":.*/"value":${ram}/' trace/js/background/prefs.js`)
            
            // Kiểm tra pid và bật/tắt tính năng trong tệp prefs.js
            if (pid % 10 < 0) {
                execSync(`sed -i '404 s/"enabled":.*/"enabled":false,/' trace/js/background/prefs.js`)
            }
            else {
                execSync(`sed -i '404 s/"enabled":.*/"enabled":true,/' trace/js/background/prefs.js`)
            }
        }
    }
    catch (e) {
        // Không xử lý lỗi, bỏ qua nếu có lỗi xảy ra
    }
}

module.exports = { startDisplay }