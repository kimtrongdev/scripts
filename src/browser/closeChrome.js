const { getBrowserOfProfile } = require("./getBrowserOfProfile");
const execSync = require('child_process').execSync;

/**
 * Đóng trình duyệt Chrome cho một profile cụ thể
 * @param {string|number} pid - ID của profile
 * @param {string[]} defaultBrowsers - Danh sách các trình duyệt mặc định
 */
function closeChrome(pid, defaultBrowsers) {
    try {
        if (WIN_ENV) {
            // Nếu là môi trường Windows, sử dụng lệnh 'input CLOSE_CHROME' để đóng Chrome
            execSync('input CLOSE_CHROME');
        } else {
            let command;
            if (pid) {
                // Nếu có pid, đóng Chrome dựa trên pid của profile
                command = `pkill -f "profiles/${pid}"`;
            } else {
                // Nếu không có pid, đóng Chrome dựa trên tên trình duyệt mặc định của profile
                const browser = getBrowserOfProfile(pid, defaultBrowsers);
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