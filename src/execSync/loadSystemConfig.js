const request_api = require("../../request_api");
const utils = require("../../utils");
const { closeChrome } = require("../browser/closeChrome");
const { changeProfile } = require("../profile/changeProfile");
const { resetAllProfiles } = require("../profile/resetAllProfiles");
const { systemConfig } = require("../settings");
const settings = require('../settings');
const execSync = require('child_process').execSync;

/**
 * Tải cấu hình hệ thống */
async function loadSystemConfig() {
    let rs = await request_api.getSystemConfig();
    if (rs && !rs.error) {
        settings.systemConfig = rs
    }

    if (Number(systemConfig.max_current_profiles)) {
        settings.MAX_CURRENT_ACC = Number(systemConfig.max_current_profiles)
    }

    if (systemConfig.max_total_profiles) {
        settings.MAX_PROFILE = DEBUG ? 1 : settings.MAX_CURRENT_ACC * Number(systemConfig.max_total_profiles)
    }

    // handle time change profile running
    const change_profile_time = Number(systemConfig.change_profile_time)
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
        if (systemConfig.show_ui_config && systemConfig.show_ui_config != 'false') {
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

    let IS_REG_USER_new = (systemConfig.is_reg_user && systemConfig.is_reg_user != 'false') ||
        (systemConfig.is_ver_mail && systemConfig.is_ver_mail != 'false') ||
        (systemConfig.is_rename_channel && systemConfig.is_rename_channel != 'false') ||
        (systemConfig.is_reg_account && systemConfig.is_reg_account != 'false') ||
        (systemConfig.is_reg_ga && systemConfig.is_reg_ga != 'false') ||
        (systemConfig.is_check_mail_1 && systemConfig.is_check_mail_1 != 'false') ||
        (systemConfig.is_change_pass && systemConfig.is_change_pass != 'false') ||
        (systemConfig.is_recovery_mail && systemConfig.is_recovery_mail != 'false') ||
        (systemConfig.unsub_youtube && systemConfig.unsub_youtube != 'false')
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
    if (systemConfig.browsers) {
        systemConfig.browsers.forEach(br => {
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

            if (systemConfig && systemConfig.browsers && !systemConfig.browsers.includes(browserMaped)) {
                config.browser_map[browserMaped].forEach(pid => {
                    closeChrome(pid);
                    execSync('rm -rf profiles/' + pid);
                });
                delete config.browser_map[browserMaped];
            }
        })
    }

    if (systemConfig.stop_tool == 1) {
        execSync('pm2 stop all')
    }

    if (DEBUG) {
        settings.systemConfig.is_stop = false
    }

    if (systemConfig.not_allow_use_proxy) {
        settings.useProxy = false
    }
    utils.log('SYSTEMCONFIG--', systemConfig);
}

module.exports = { loadSystemConfig };