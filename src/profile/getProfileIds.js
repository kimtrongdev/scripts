const fs = require('fs');
const path = require('path');

// Lấy danh sách ID của các profile
function getProfileIds() {
    try {
        // Thay đổi đường dẫn dựa trên cấu trúc thư mục của dự án
        let directoryPath = path.resolve(__dirname, '..', 'profiles');
        let files = fs.readdirSync(directoryPath);

        if (files && Array.isArray(files)) {
            return files;
        }
    } catch (error) {
        console.error("Error in getProfileIds:", error);
    }

    return [];
}

module.exports = { getProfileIds };