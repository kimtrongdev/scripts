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
                // Xác định đường dẫn của thư mục profiles từ vị trí hiện tại của script
                const profilesPath = path.relative(__dirname, path.join(process.cwd(), 'profiles'));
                // Tạo lệnh pkill với đường dẫn tương đối
                const command = `pkill -f "${profilesPath}/${pid}"`;
                execSync(command);
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