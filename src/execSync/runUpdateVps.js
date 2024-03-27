const { loadSystemConfig } = require("../../main");
const { closeChrome } = require("../browser/closeChrome");
const { getProfileIds } = require("../profile/getProfileIds");
const { systemConfig } = require("../settings");
const settings = require('../settings');
const fs = require('fs');
const execSync = require('child_process').execSync;

/**
 * Thực hiện cập nhật VPS
 * @returns {Promise<void>}
 */
async function runUpdateVps() {
  try {
    settings.isSystemChecking = true;
    await loadSystemConfig();
    // Thực hiện báo cáo cập nhật

    // Lấy danh sách ID của các profile
    let pids = getProfileIds();
    
    // Đóng trình duyệt của các profile
    for (let pid of pids) {
      closeChrome(pid);
    }

    try {
      // Cấu hình remote repository với khóa bí mật
      let gitKey = systemConfig.update_key;
      if (gitKey) {
        execSync(`git remote set-url origin https://kimtrongdev:${gitKey}@github.com/kimtrongdev/scripts.git`);
      }

      // Cấu hình thông tin người dùng Git, lưu các thay đổi hiện tại và cập nhật từ remote repository
      execSync("git config user.name kim && git config user.email kimtrong@gmail.com && git stash && git pull");
    } catch (error) {
      console.log(error);
      settings.isSystemChecking = false;
      return;
    }

    // Ghi cờ cập nhật vào file update_flag.json
    fs.writeFileSync("update_flag.json", JSON.stringify({ updating: true }));

    // Kiểm tra cấu hình khởi động lại VPS sau khi cập nhật
    if (Number(systemConfig.reboot_on_update)) {
      execSync('sudo systemctl reboot');
    } else {
      execSync('pm2 restart all');
    }

    // Đợi 15 giây sau khi cập nhật
    await utils.sleep(15000);
    
    // Xóa danh sách các tiến trình đang chạy
    runnings = [];
  } catch (error) {
    console.log('Error while update vps, error: ', error);
  } finally {
    settings.isSystemChecking = false;
  }
}

module.exports = { runUpdateVps };