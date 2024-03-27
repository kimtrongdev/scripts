const { getBrowserOfProfile } = require("./getBrowserOfProfile");
const execSync = require('child_process').execSync;

function closeChrome(pid, defaultBrowsers) {
    try {
        if (WIN_ENV) {
            execSync('input CLOSE_CHROME');
        } else {
            const command = pid ? `pkill -f "profiles/${pid}"` : `pkill ${getBrowserOfProfile(pid, defaultBrowsers)}`;
            execSync(command);
        }
    } catch (e) {
        // Xử lý hoặc ghi log ngoại lệ ở đây
        console.error("Error closing Chrome: ", e);
    }
}

module.exports = { closeChrome };
