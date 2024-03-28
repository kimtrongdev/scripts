const path = require("path");
const { getBrowserOfProfile } = require("./getBrowserOfProfile");
const execSync = require('child_process').execSync;

/**
 * Đóng trình duyệt Chrome cho một profile cụ thể
 * @param {string|number} pid - ID của profile
 */
function closeChrome(pid) {
    try {
        if (WIN_ENV) {
            // Nếu là môi trường Windows, sử dụng lệnh 'input CLOSE_CHROME' để đóng Chrome
            execSync('input CLOSE_CHROME');
        } else {
            let command;
            if (pid) {
                const profilesDir = path.join(process.cwd(), 'profiles');
                // Nếu có pid, đóng Chrome dựa trên pid của profile
                command = `pkill -f "${profilesDir}/${pid}"`;
            } else {
                // Nếu không có pid, đóng Chrome dựa trên tên trình duyệt mặc định của profile
                const browser = getBrowserOfProfile(pid);
                command = `pkill ${browser}`;
            }
            // Thực thi lệnh đóng Chrome
            execSync(command);
        }
    } catch (e) {
        // Xử lý hoặc ghi log ngoại lệ ở đây
        console.error("Error closing Chrome: ", e);
    }
}

module.exports = { closeChrome };