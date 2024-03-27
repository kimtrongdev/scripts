const request_api = require("../../request_api")
const utils = require("../../utils")
const { closeChrome } = require("../browser/closeChrome")
const settings = require("../settings")
const { getProfileIds } = require("./getProfileIds")
const fs = require('fs')
const execSync = require('child_process').execSync;
const path = require("path")

/**
 * Đặt lại tất cả các profile
 */
async function resetAllProfiles() {
    settings.isSystemChecking = true
    try {
        // Lấy danh sách các profile ID
        let pids = getProfileIds()
        
        // Đóng trình duyệt của tất cả các profile
        for (let pid of pids) {
            closeChrome(pid)
        }

        // Cập nhật trạng thái của tất cả các profile thành 'RESET'
        for await (let pid of pids) {
            await request_api.updateProfileData({ pid: Number(pid), status: 'RESET' })
        }
        
        // Đợi 4 giây
        await utils.sleep(4000)
        
        // Kiểm tra sự tồn tại của thư mục 'profiles'
        if (fs.existsSync(path.resolve('profiles'))) {
            try {
                // Xóa thư mục 'profiles'
                execSync('rm -rf profiles')
                
                // Tạo lại thư mục 'profiles'
                execSync('mkdir profiles')
                
                // Xóa dữ liệu trace
                trace = {}
                execSync('rm -rf trace_config.json')
                
                // Xóa dữ liệu ánh xạ trình duyệt
                config.browser_map = {}
                
                // Ghi lại file cấu hình 'vm_log.json'
                fs.writeFileSync("vm_log.json", JSON.stringify(config))
            } catch (error) {
                console.log(error);
            }
        }

        // Xóa danh sách các profile đang chạy và danh sách ID
        runnings = []
        settings.ids = []
    } catch (error) {
        // Không xử lý lỗi
    } finally {
        // Đánh dấu hệ thống không còn đang kiểm tra
        settings.isSystemChecking = false
    }
}

module.exports = { resetAllProfiles }