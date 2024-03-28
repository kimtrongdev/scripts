const request_api = require("../../request_api");
const utils = require("../../utils");
const { closeChrome } = require("../../closeChrome");
const { handleForChangeShowUI } = require("../browser/handleForChangeShowUI");
const { changeProfile } = require("../profile/changeProfile");
const { resetAllProfiles } = require("../profile/resetAllProfiles");
const settings = require('../settings');
const execSync = require('child_process').execSync;

/**
 * Tải cấu hình hệ thống */
async function loadSystemConfig() {
    let rs = await request_api.getSystemConfig();
    if (rs && !rs.error) {
        settings.systemConfig = rs
    }

    if (Number(settings.systemConfig.max_current_profiles)) {
        settings.MAX_CURRENT_ACC = Number(settings.systemConfig.max_current_profiles)
    }

    if (settings.systemConfig.max_total_profiles) {
        settings.MAX_PROFILE = DEBUG ? 1 : settings.MAX_CURRENT_ACC * Number(settings.systemConfig.max_total_profiles)
    }

    // handle time change profile running
    const change_profile_time = Number(settings.systemConfig.change_profile_time)
    if (settings.MAX_CURRENT_ACC == 1 && change_profile_time && change_profile_time != current_change_profile_time) {
        current_change_profile_time = change_profile_time
        if (settings.checkProfileTime) {
            clearInterval(settings.checkProfileTime)
        }
        changeProfile()
        settings.checkProfileTime = setInterval(() => {
            changeProfile()
        }, change_profile_time * 3600000)
    }

    if (DEBUG) {
        IS_SHOW_UI = true
    } else {
        let newShowUIConfig = false
        if (settings.systemConfig.show_ui_config && settings.systemConfig.show_ui_config != 'false') {
            newShowUIConfig = true
        }

        if (IS_SHOW_UI != newShowUIConfig) {
            if (IS_SHOW_UI != null) {
                settings.isSystemChecking = true
                await handleForChangeShowUI()
                settings.isSystemChecking = false
            }

            IS_SHOW_UI = newShowUIConfig

            if (IS_SHOW_UI) {
                process.env.DISPLAY = ':0'
            }
        }
    }

    let IS_REG_USER_new = (settings.systemConfig.is_reg_user && settings.systemConfig.is_reg_user != 'false') ||
        (settings.systemConfig.is_ver_mail && settings.systemConfig.is_ver_mail != 'false') ||
        (settings.systemConfig.is_rename_channel && settings.systemConfig.is_rename_channel != 'false') ||
        (settings.systemConfig.is_reg_account && settings.systemConfig.is_reg_account != 'false') ||
        (settings.systemConfig.is_reg_ga && settings.systemConfig.is_reg_ga != 'false') ||
        (settings.systemConfig.is_check_mail_1 && settings.systemConfig.is_check_mail_1 != 'false') ||
        (settings.systemConfig.is_change_pass && settings.systemConfig.is_change_pass != 'false') ||
        (settings.systemConfig.is_recovery_mail && settings.systemConfig.is_recovery_mail != 'false') ||
        (settings.systemConfig.unsub_youtube && settings.systemConfig.unsub_youtube != 'false')
    if (IS_REG_USER_new != undefined && settings.IS_REG_USER != IS_REG_USER_new) {
        await resetAllProfiles()
        settings.IS_REG_USER = IS_REG_USER_new
        if (settings.IS_REG_USER) {
            settings.EXPIRED_TIME = 200000
        }
    }

    if (DEBUG) {
        settings.EXPIRED_TIME = 400000
    }
    // handle browsers for centos and ubuntu
    let browsers = []
    if (settings.systemConfig.browsers) {
        settings.systemConfig.browsers.forEach(br => {
            if (process.env.OS == 'centos' || process.env.OS == 'centos_vps') {
                if (br == 'brave') {
                    br = 'brave-browser'
                }

                if (br == 'microsoft-edge') {
                    br = 'microsoft-edge-stable'
                }

                if (br == 'vivaldi-stable') {
                    br = 'vivaldi'
                }
                browsers.push(br)
            } else {
                if (br != 'iridium-browser') {
                    browsers.push(br)
                }
            }
        })
    } else {
        browsers = ['brave-browser']
    }
    settings.systemConfig.browsers = browsers

    if (config.browser_map) {
        Object.keys(config.browser_map).forEach(browserMaped => {

            if (settings.systemConfig && settings.systemConfig.browsers && !settings.systemConfig.browsers.includes(browserMaped)) {
                config.browser_map[browserMaped].forEach(pid => {
                    closeChrome(pid);
                    execSync('rm -rf profiles/' + pid);
                });
                delete config.browser_map[browserMaped];
            }
        })
    }

    if (settings.systemConfig.stop_tool == 1) {
        execSync('pm2 stop all')
    }

    if (DEBUG) {
        settings.systemConfig.is_stop = false
    }

    if (settings.systemConfig.not_allow_use_proxy) {
        settings.useProxy = false
    }
    utils.log('SYSTEMCONFIG--', settings.systemConfig);
}

module.exports = { loadSystemConfig };