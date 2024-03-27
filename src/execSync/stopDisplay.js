const execSync = require('child_process').execSync;

// dừng môi trường đồ họa ảo trên server
function stopDisplay(pid) {
    try {
        if (!WIN_ENV) {
            // Nếu không phải là môi trường Windows, hãy thực thi lệnh dưới đây
            // execSync là một hàm của Node.js dùng để thực thi lệnh shell/command-line
            // `pkill -f "Xvfb :${pid}"` là lệnh để giết (kill) các quá trình có liên quan đến Xvfb (X virtual framebuffer) chạy với ID cụ thể
            // Xvfb cho phép chạy các ứng dụng yêu cầu giao diện đồ họa trên server không có màn hình
            execSync(`pkill -f "Xvfb :${pid}"`)
        }
    }
    catch (e) {
    }
}

module.exports = { stopDisplay };