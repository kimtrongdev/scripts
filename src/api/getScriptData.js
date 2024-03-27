const request_api = require("../../request_api")
const utils = require("../../utils")
const { PLAYLIST_ACTION } = require("../constant")
const { IS_REG_USER, systemConfig, ids, MAX_PROFILE, useProxy, isRunBAT } = require("../settings")
const settings = require('../settings');

/**
 * Lấy dữ liệu script cho một profile
 * @param {string|number} pid - ID của profile
 * @param {boolean} [isNewProxy=false] - Cờ chỉ định có tải proxy mới hay không
 * @returns {Promise<Object|undefined>} - Promise trả về đối tượng action hoặc undefined nếu không tìm thấy dữ liệu
 */
async function getScriptData(pid, isNewProxy = false) {
    let action = {}
    if (IS_REG_USER) {
        if (systemConfig.unsub_youtube) {
            // Lấy thông tin profile cho việc hủy đăng ký kênh YouTube
            action = await request_api.getProfileForRegChannel()
            if (action) {
                action.pid = action.id
                pid = action.pid
                isNewProxy = true
            } else {
                console.log('Not found user data.');
                return
            }
        }
        else if (systemConfig.is_change_pass) {
            // Lấy thông tin profile cho việc thay đổi mật khẩu
            action = await request_api.getProfileForRegChannel(pid)
            if (action) {
                action.pid = action.id
                pid = action.pid
                isNewProxy = true
            } else {
                console.log('Not found reg user data.');
                return
            }
        }
        else if (systemConfig.is_reg_account && systemConfig.new_account_type == 'facebook') {
            // Lấy thông tin profile cho việc đăng ký tài khoản Facebook mới
            action = await request_api.getProfileForRegChannel(pid)
            if (action) {
                action.pid = utils.randomRanger(100, 400)
                settings.ids.push(action.pid)
                settings.ids = settings.ids.map(String)
                settings.ids = [...new Set(settings.ids)]
                pid = action.pid
                isNewProxy = true
            } else {
                console.log('Not found reg user data.');
                return
            }
        }
        else if (systemConfig.is_check_mail_1 && systemConfig.is_check_mail_1 != 'false') {
            // Lấy profile mới cho việc kiểm tra email
            let newProfile = await request_api.getNewProfile()
            utils.log('newProfile: ', newProfile)
            if (!newProfile.err && newProfile.profile) {
                let profile = newProfile.profile
                pid = profile.id
                action = {
                    ...profile,
                    mail_type: systemConfig.check_mail_1_type,
                    script_code: 'check_mail_1'
                }
            } else {
                console.log('Not found profile');
                return
            }
        }
        else if (systemConfig.is_reg_ga && systemConfig.is_reg_ga != 'false') {
            // Lấy profile mới cho việc đăng ký tài khoản Google
            let newProfile = await request_api.getNewProfile()
            utils.log('newProfile: ', newProfile)
            if (!newProfile.err && newProfile.profile) {
                let profile = newProfile.profile
                pid = profile.id
                action = {
                    ...profile,
                    script_code: 'reg_account',
                    account_type: 'gmail',
                    process_login: true
                }
            } else {
                console.log('Not found profile');
                return
            }
        } else if (systemConfig.is_reg_account && systemConfig.is_reg_account != 'false') {
            // Thiết lập action cho việc đăng ký tài khoản Gmail
            action = {
                script_code: 'reg_account',
                account_type: 'gmail'
            }
        } else {
            // Lấy thông tin profile cho việc đăng ký kênh
            if (ids.length < MAX_PROFILE) {
                pid = 0
            }
            action = await request_api.getProfileForRegChannel(pid)
            if (action && action.id) {
                action.pid = action.id
                settings.ids.push(action.id)
                settings.ids = settings.ids.map(String)
                settings.ids = [...new Set(settings.ids)]
                pid = action.id
                isNewProxy = true
            } else {
                console.log('Not found reg user data.');
                return
            }
        }
    } else {
        // Lấy script mới cho profile
        action = await request_api.getNewScript(pid)
    }

    if (action) {
        if (useProxy && isNewProxy) {
            let isLoadNewProxy = true

            if (isLoadNewProxy || action.is_ver_mail_type) {
                // Lấy proxy mới cho profile
                let proxyV6 = await request_api.getProfileProxy(pid, PLAYLIST_ACTION.WATCH, isLoadNewProxy)

                if (proxyV6) {
                    proxy[pid] = proxyV6
                }
            } else {
                // Lấy proxy hiện tại của profile
                let proxyV6 = await request_api.getProfileProxy(pid, PLAYLIST_ACTION.WATCH, isLoadNewProxy)
                if (proxyV6 && proxyV6.server) {
                    proxy[pid] = proxyV6
                }
            }
        }

        if (useProxy && (!proxy[pid] || !proxy[pid].server)) {
            console.log('Not found proxy')
            return
        }
        utils.log('Script data: ', action)

        if (!runnings.some(i => i.pid == pid)) {
            // Thêm profile vào danh sách đang chạy
            let startTime = Date.now()
            let actionRecord = { pid: pid, start: startTime, lastReport: startTime, browser: true, action: 'watch' }
            runnings.push(actionRecord)
        }

        // Thiết lập các thông tin cho action
        action.id = action.script_code
        action.pid = pid
        action.is_show_ui = IS_SHOW_UI
        action.os_vm = process.env.OS
        if (isRunBAT) {
            action.isRunBAT = isRunBAT
        }
        if (systemConfig.is_fb) {
            action.is_fb = true
        }
        if (systemConfig.is_tiktok) {
            action.is_tiktok = true
        }
        Object.keys(systemConfig).forEach(key => {
            if ((key + '').startsWith('client_config_')) {
                action[key] = systemConfig[key]
            }
        });

        // Khởi tạo dữ liệu cho action
        if (action.mobile_percent === undefined || action.mobile_percent === null) {
            // Thiết lập các thông số liên quan đến tỷ lệ thiết bị di động, tìm kiếm, quảng cáo, v.v.
            if (systemConfig.total_rounds_for_change_proxy) {
                totalRoundForChangeProxy = Number(systemConfig.total_rounds_for_change_proxy)
            }
            delete settings.systemConfig.search_percent
            delete settings.systemConfig.direct_percent
            delete settings.systemConfig.suggest_percent
            delete settings.systemConfig.page_percent
            Object.assign(action, systemConfig)
            delete action.systemParams

            action.mobile_percent = systemConfig.browser_mobile_percent
            active_devices = systemConfig.active_devices || []
            if (active_devices.length) {
                action.mobile_percent = 100
            }

            if (systemConfig.ads_percent && !Number(action.ads_percent)) {
                action.ads_percent = systemConfig.ads_percent
            }

            action.total_channel_created = Number(systemConfig.total_channel_created)

            if (['youtube_sub', 'watch', 'watch_video', 'comment_youtube', 'like_fb_page', 'like_fb_post', 'like_youtube'].includes(action.id)) {
                // Thiết lập vị trí kênh cho action
                let oldUserPosition = usersPosition.find(u => u.pid == action.pid)
                if (oldUserPosition) {
                    action.channel_position = Number(oldUserPosition.position)
                } else {
                    action.channel_position = -1
                }
            }

            if (action.id == 'watch' || action.id == 'watch_video') {
                // Thiết lập thông tin về playlist cho action xem video
                action.total_loop_find_ads = systemConfig.total_loop_find_ads || 0

                if (!action.playlist_url) {
                    action.playlist_url = action.data
                }
                action.playlist_data = action.playlist_url
            }
        }

        if (Number(systemConfig.is_clear_browser_data)) {
            action.is_clear_browser_data = true
        }
        return action
    }
}

module.exports = getScriptData