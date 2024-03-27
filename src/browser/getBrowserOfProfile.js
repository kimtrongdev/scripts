function getBrowserOfProfile(pid, defaultBrowsers) {
    let selectedBrowser;

    // Duyệt qua danh sách các trình duyệt
    for (const browser of defaultBrowsers) {
        // Kiểm tra xem pid có nằm trong map của trình duyệt này không
        if (config.browser_map[browser] && config.browser_map[browser].includes(pid)) {
            selectedBrowser = browser;
            break; // Dừng vòng lặp nếu tìm thấy
        }
    }

    // Nếu không tìm thấy trình duyệt phù hợp, sử dụng trình duyệt mặc định đầu tiên
    return selectedBrowser || defaultBrowsers[0];
}

module.exports = { getBrowserOfProfile };