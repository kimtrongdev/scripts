const execSync = require('child_process').execSync;

/**
 * Gửi phím Enter cho một profile
 * @param {string|number} pid - ID của profile
 */
function sendEnter(pid) {
    try {
        if (!WIN_ENV) {
            utils.log('sendEnter', pid)
            
            // Nếu không hiển thị giao diện người dùng
            if (!IS_SHOW_UI) {
                // Thiết lập biến môi trường DISPLAY cho profile
                process.env.DISPLAY = ':' + pid
            }

            // Gửi phím Enter bằng lệnh xdotool và chờ 3 giây
            execSync(`xdotool key KP_Enter && sleep 3`)
            
            // Dòng lệnh bị chú thích:
            // && xdotool windowsize $(xdotool search --onlyvisible --pid $(pgrep -f "profiles/${pid}" | head -n 1) --class surf) 1920 1040 && sleep 1`)
            // Có thể đã được sử dụng để đặt kích thước cửa sổ của profile
        }
    }
    catch (e) {
        // Không xử lý lỗi, bỏ qua nếu có lỗi xảy ra
    }
}

module.exports = { sendEnter }