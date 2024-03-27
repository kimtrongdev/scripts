let useProxy = true
let isRunBAT = false
const TIME_REPORT = 290000
const TIME_TO_CHECK_UPDATE = 300000
const isAutoEnableReward = true
let totalRoundForChangeProxy = 5
let countRun = 0
let isAfterReboot = false
require('dotenv').config();
global.devJson = {
    hostIp: process.env.HOST_IP,
    maxProfile: Number(process.env.MAX_PROFILES) || 1,
}

global.IS_SHOW_UI = null
global.IS_LOG_SCREEN = Boolean(Number(process.env.LOG_SCREEN))
global.DEBUG = Boolean(Number(process.env.DEBUG))
let { ids, isPauseAction, systemConfig, IS_REG_USER, isSystemChecking, actionsData, EXPIRED_TIME, MAX_PROFILE, IP } = require('./src/settings')
const ROOT_RUNNING_CHECK_INTERVAL = IS_REG_USER ? 35000 : 20000
let RUNNING_CHECK_INTERVAL = ROOT_RUNNING_CHECK_INTERVAL

global.config
try {
    config = require('./vm_log.json')
} catch (e) { config = {} }

let updateFlag = {}
try {
    updateFlag = require('./update_flag.json')
} catch (e) { updateFlag = {} }

let trace = {}
try {
    trace = require('./trace_config.json')
} catch (e) { trace = {} }

require('log-timestamp')
const request = require('request-promise')
const utils = require('./utils')
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const request_api = require('./request_api')
const path = require('path')
const del = require('del');
const fs = require('fs')
const { getBrowserOfProfile } = require('./src/browser/getBrowserOfProfile')
const { closeChrome } = require('./src/browser/closeChrome')
const { LOCAL_PORT, characters } = require('./src/constant')
const { getProfileIds } = require('./src/profile/getProfileIds')
const { runUpdateVps } = require('./src/execSync/runUpdateVps')
const { checkRunningProfiles } = require('./src/profile/checkRunningProfiles')
const { sendEnter } = require('./src/execSync/sendEnter')
const { resetAllProfiles } = require('./src/profile/resetAllProfiles')
const { setDisplay } = require('./src/execSync/setDisplay')
const { startDisplay } = require('./src/execSync/startDisplay')
const { initExpress } = require('./src/api/initExpress')

let MAX_CURRENT_ACC = Number(devJson.maxProfile)
global.workingDir = utils.getScriptDir()
global.runnings = []
global.usersPosition = []
global.subRunnings = []
global.addnewRunnings = []
global.proxy = {}
global.gui = false
global.WIN_ENV = process.platform === "win32"
global.fisrt_video = 0
global.active_devices = []
global.channelInfo = []


const PLAYLIST_ACTION = {
    WATCH: 0,
    WATCH_TO_SUB: 1,
    SUB: 2
}
const ADDNEW_ACTION = 3

/**
 * Thêm hành động mở trình duyệt vào danh sách hành động
 * @param {Object} action - Hành động
 * @param {string} browser - Tên trình duyệt
 */
function addOpenBrowserAction(action, browser) {
    actionsData.push({
        action: 'OPEN_BROWSER',
        data: action,
        browser: browser
    })
}

/**
 * Thực thi các hành động đang chờ xử lý
 */
async function execActionsRunning() {
    if (actionsData.length) {
        let action = actionsData.shift()
        await handleAction(action)
    }
    await utils.sleep(1000)
    execActionsRunning()
}
/**
 * Xử lý thay đổi giao diện người dùng
 */
async function handleForChangeShowUI() {
    let _pids = getProfileIds()

    for await (let pid of _pids) {
        closeChrome(pid, systemConfig.browsers)
        await utils.sleep(2000)
    }
    await utils.sleep(2000)
    runnings = []
    ids = _pids
}

let runningPid = null
let checkProfileTime
let current_change_profile_time
/**
 * Thay đổi profile đang chạy
 */
function changeProfile() {
    if (!Array.isArray(config.profileTimeLog)) {
        config.profileTimeLog = []
    }

    let currentIds = getProfileIds()
    config.profileTimeLog = config.profileTimeLog.filter(id => currentIds.includes(id))
    let currentData = currentIds.filter(id => !config.profileTimeLog.includes(id))
    currentData = [...currentData, ...config.profileTimeLog]
    _profileRuning = currentData.shift()
    currentData.push(_profileRuning)
    runningPid = _profileRuning
    config.profileTimeLog = currentData
    fs.writeFileSync("vm_log.json", JSON.stringify(config))
}
/**
 * Tải cấu hình hệ thống */
async function loadSystemConfig() {
    let rs = await request_api.getSystemConfig();
    if (rs && !rs.error) {
        systemConfig = rs
    }

    if (Number(systemConfig.max_current_profiles)) {
        MAX_CURRENT_ACC = Number(systemConfig.max_current_profiles)
    }

    if (systemConfig.max_total_profiles) {
        MAX_PROFILE = DEBUG ? 1 : MAX_CURRENT_ACC * Number(systemConfig.max_total_profiles)
    }

    // handle time change profile running
    const change_profile_time = Number(systemConfig.change_profile_time)
    if (MAX_CURRENT_ACC == 1 && change_profile_time && change_profile_time != current_change_profile_time) {
        current_change_profile_time = change_profile_time
        if (checkProfileTime) {
            clearInterval(checkProfileTime)
        }
        changeProfile()
        checkProfileTime = setInterval(() => {
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
                isSystemChecking = true
                await handleForChangeShowUI()
                isSystemChecking = false
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
    if (IS_REG_USER_new != undefined && IS_REG_USER != IS_REG_USER_new) {
        await resetAllProfiles()
        IS_REG_USER = IS_REG_USER_new
        if (IS_REG_USER) {
            EXPIRED_TIME = 200000
        }
    }

    if (DEBUG) {
        EXPIRED_TIME = 400000
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
    systemConfig.browsers = browsers

    if (config.browser_map) {
        Object.keys(config.browser_map).forEach(browserMaped => {
            if (!systemConfig.browsers.includes(browserMaped)) {
                config.browser_map[browserMaped].forEach(pid => {
                    closeChrome(pid, systemConfig.browsers)
                    execSync('rm -rf profiles/' + pid)
                });
                delete config.browser_map[browserMaped]
            }
        })
    }

    if (systemConfig.stop_tool == 1) {
        execSync('pm2 stop all')
    }

    if (DEBUG) {
        systemConfig.is_stop = false
    }

    if (systemConfig.not_allow_use_proxy) {
        useProxy = false
    }
    utils.log('SYSTEMCONFIG--', systemConfig);
}
// Hàm quản lý các profile đang chạy
async function profileRunningManage() {
    try {
        if (!isSystemChecking) {
            await checkRunningProfiles()
            if (systemConfig.is_stop && systemConfig.is_stop != 'false') {
                return
            }

            utils.log('profileRunningManage')

            if (MAX_CURRENT_ACC > runnings.length) {
                let currentIds = getProfileIds()
                ids = ids.filter(id => {
                    return currentIds.some(cid => cid == id)
                })
                currentIds.forEach(cID => {
                    if (!ids.some(cid => cid == cID)) {
                        ids.push(cID)
                    }
                });

                utils.log('ids--', ids);
                if (runnings.some(running => running.action == 'login')) {
                    return
                }
                if (ids.length < MAX_PROFILE && !IS_REG_USER) {
                    newProfileManage()
                } else {
                    if (systemConfig.only_run_login) {
                        // something
                    } else {
                        countRun++
                        newRunProfile()
                    }
                }
            }
        }
    }
    catch (e) {
        utils.log('profileRunningManage err: ', e)
    }
    finally {
        setTimeout(profileRunningManage, RUNNING_CHECK_INTERVAL)
    }
}

/**
 * Khởi động trình duyệt Chrome với hành động được chỉ định
 * @param {Object} action - Hành động
 * @param {string} _browser - Tên trình duyệt
 */
async function startChromeAction(action, _browser) {
    let params = ''
    if (systemConfig.systemParams) {
        let ss = systemConfig.systemParams.split('##')
        if (ss.length) {
            let index = utils.getRndInteger(0, ss.length - 1)
            params = ss[index]

            try {
                params = params.replace('\\n', '')
                const ramdom1 = utils.getRndInteger(1000, 9000)
                const ramdom2 = utils.getRndInteger(1000, 9000)

                params = params.replace('123456789', `173493304458${ramdom2}${ramdom1}`)
                console.log(params);
            } catch (error) {
                console.log(error);
            }
        }
    }

    if (systemConfig.is_setting_brave) {
        action.is_setting_brave = true
    }

    let widthSizes = [950, 1100, 1200]
    let positionSize = action.isNew ? 0 : utils.getRndInteger(0, 2)
    let screenWidth = 1400//widthSizes[positionSize]
    let screenHeight = 950 //action.isNew ? 950 : utils.getRndInteger(950, 1000)

    //handle userDataDir
    let userDataDir = ` --user-data-dir="${path.resolve("profiles", action.pid + '')}"`

    //handle browser size
    action['positionSize'] = positionSize
    action['screenWidth'] = screenWidth
    action['screenHeight'] = screenHeight
    let windowPosition = ' --window-position=0,0'
    let windowSize = ` --window-size="${screenWidth},${screenHeight}"` //(IS_SHOW_UI || action.isNew) ? ` --window-size="${screenWidth},${screenHeight}"` : ' --window-size="1920,1040"'
    //debug
    if (_browser == 'brave-browser' && action.id == 'reg_account' && !IS_SHOW_UI) {
        screenWidth = 1400
        windowSize = ` --window-size="${screenWidth},${screenHeight}"`
    }
    else if (_browser == 'brave-browser' && action.id == 'login' && !IS_SHOW_UI) {
        screenWidth = 1400
    } else {
        if (IS_SHOW_UI) {
            windowSize = ' --start-maximized'
            windowPosition = ''
        }
    }

    // handle proxy
    let userProxy = ''
    if (proxy && proxy[action.pid] && proxy[action.pid].server) {
        utils.log('set proxy', proxy[action.pid])
        userProxy = ` --proxy-server="${proxy[action.pid].server}" --proxy-bypass-list="story-shack-cdn-v2.glitch.me,randomuser.me,random-data-api.com,localhost:2000,${devJson.hostIp}"`
    }
    if (proxy && proxy[action.pid] && proxy[action.pid].username) {
        utils.log('set proxy user name', proxy[action.pid].username)
        action.proxy_server = proxy[action.pid].server
        action.proxy_username = proxy[action.pid].username
        action.proxy_password = proxy[action.pid].password
    }

    if (!useProxy) {
        userProxy = ''
    }

    // handle flag data
    action.browser_name = _browser
    if (isRunBAT) {
        action.isRunBAT = isRunBAT
    }

    let exs = ["ex"]
    if (process.env.OS == 'centos') {
        exs.push('quality')
    }

    if (systemConfig.use_adblock) {
        exs.push('extensions/adblock')
    }

    if (systemConfig.client_config_use_recaptcha_for_login && action.id == 'login') {
        exs.push('AutocaptchaProExtension')
    }

    let level_name = ''
    if (action.id != 'reg_user' && systemConfig.trace_names_ex.length) {
        let traceName = 'trace'

        if (trace[action.pid] && systemConfig.trace_names_ex.includes(trace[action.pid])) {
            traceName = 'trace_ex/' + trace[action.pid]
        } else {
            if (systemConfig.trace_names_ex && systemConfig.trace_names_ex.length) {
                traceName = systemConfig.trace_names_ex[Math.floor(Math.random() * systemConfig.trace_names_ex.length)]

                if (traceName.includes('level_')) {
                    level_name = traceName
                    traceName = 'win_10_chrome'
                }

                trace[action.pid] = traceName
                traceName = 'trace_ex/' + traceName
                fs.writeFileSync("trace_config.json", JSON.stringify(trace))
            }
        }

        exs.push(traceName)
        action.trace_name = level_name
        console.log('------action.trace_name', action.trace_name);
    }
    exs = exs.map(x => path.resolve(x)).join(",")

    let param = new URLSearchParams({ data: JSON.stringify(action) }).toString();
    let startPage = `http://localhost:${LOCAL_PORT}/action?` + param

    utils.log('--BROWSER--', _browser)
    utils.log('--PID--', action.pid)
    if (WIN_ENV) {
        exec(`${_browser}${userProxy} --lang=en-US,en${windowPosition}${windowSize}${userDataDir} --load-extension="${exs}" "${startPage}"`)
    }
    else {
        closeChrome(action.pid, systemConfig.browsers)
        await utils.sleep(3000)
        utils.log('startDisplay')
        startDisplay(action.pid)
        await utils.sleep(3000)

        utils.log('start browser', action.pid)
        if (action.id == 'login') {
            setDisplay(action.pid)
            let cmdRun = `${params} ${_browser}${userProxy} --lang=en-US,en --disable-quic${userDataDir} --load-extension="${exs}" "${startPage}"${windowPosition}${windowSize}`

            if (_browser == 'opera') {
                exec(`${_browser}${userDataDir}${windowSize}`)
                await utils.sleep(19000)
                closeChrome(action.pid, systemConfig.browsers)
                exec(`${_browser}${userDataDir}${windowSize}`)
            } else {
                exec(cmdRun)
            }

            if (['opera', 'microsoft-edge', 'microsoft-edge-stable'].includes(_browser)) {
                await utils.sleep(10000)
                closeChrome(action.pid, systemConfig.browsers)
                await utils.sleep(2000)
                exec(cmdRun)
            } else {
                if (isAfterReboot) {
                    await utils.sleep(35000)
                    isAfterReboot = false
                } else {
                    await utils.sleep(17000)
                }
                setDisplay(action.pid)

                if (process.env.OS == 'vps') {
                    await utils.sleep(10000)
                }

                if (_browser != 'iridium-browser') {
                    sendEnter(action.pid)
                }

                await utils.sleep(8000)
            }
            utils.log('process login')
        }
        else {
            setDisplay(action.pid)
            let run = `${params} ${_browser}${userProxy} --lang=en-US,en --disable-quic${userDataDir} --load-extension="${exs}" "${startPage}"${windowPosition}${windowSize}`
            exec(run)
            if (IS_REG_USER) {
                await utils.sleep(10000)
                setDisplay(action.pid)
                sendEnter(action.pid)
            }

            await utils.sleep(5000)
        }
    }
}

async function loginProfileChrome(profile) {
    try {
        try {
            execSync(`sudo xrandr -s 1600x1200`)
        } catch (error) {
            console.log(error);
        }

        utils.log('loginProfileChrome', profile)
        let action = profile
        action.pid = profile.id
        action.id = 'login'
        action.isNew = true
        action.is_show_ui = IS_SHOW_UI
        action.os_vm = process.env.OS

        // handle log browser for profile
        if (systemConfig.scan_check_recovery) {
            action.scan_check_recovery = true
        }

        if (!config.browser_map) {
            config.browser_map = {}
        }
        if (systemConfig.skip_pau_history) {
            action.skip_pau_history = true
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

        if (systemConfig.total_page_created) {
            action.total_page_created = systemConfig.total_page_created
        }

        if (systemConfig.allow_verify) {
            action.allow_verify = true
        }

        systemConfig.browsers = utils.shuffleArray(systemConfig.browsers)
        let _browser = systemConfig.browsers[0]
        systemConfig.browsers.some((browser) => {
            if (!config.browser_map[browser]) {
                _browser = browser
                return true
            } else if (config.browser_map[browser].length < config.browser_map[_browser].length) {
                _browser = browser
            }
        })

        if (!config.browser_map[_browser]) {
            config.browser_map[_browser] = []
        }
        if (!config.browser_map[_browser].includes(action.pid)) {
            config.browser_map[_browser].push(action.pid)
        }
        fs.writeFileSync("vm_log.json", JSON.stringify(config))

        if (isAutoEnableReward) {
            action.enableBAT = true
        }

        addOpenBrowserAction(action, _browser)
    }
    catch (e) {
        utils.log('error', 'loginProfile', profile.id, e)
    }
}

async function newProfileManage() {
    try {
        let ids = getProfileIds()
        systemConfig.browsers.forEach((browser) => {
            if (config.browser_map[browser]) {
                config.browser_map[browser] = config.browser_map[browser].filter(pid => ids.some(id => id == pid))
            }
        })

        //if (ids.length + addnewRunnings.length >= MAX_PROFILE) return
        // get new profile
        let newProfile = await request_api.getNewProfile()
        utils.log('newProfile: ', newProfile)
        if (!newProfile.err && newProfile.profile) {
            RUNNING_CHECK_INTERVAL = ROOT_RUNNING_CHECK_INTERVAL
            // copy main to clone profile
            let profile = newProfile.profile
            if (proxy && useProxy) {
                proxy[profile.id] = await request_api.getProfileProxy(profile.id, ADDNEW_ACTION)
                utils.log('pid', profile.id, 'proxy', proxy[profile.id])
                if (!proxy[profile.id]) {
                    utils.log('error', 'pid:', profile.id, 'get proxy:', proxy[profile.id])
                    await request_api.updateProfileStatus(profile.id, config.vm_id, 'NEW')
                    return
                }
            }

            runnings.push({ action: 'login', pid: profile.id, lastReport: Date.now() })
            ids.push(profile.id)
            await loginProfileChrome(profile)
        } else {
            RUNNING_CHECK_INTERVAL = utils.randomRanger(180000, 300000)
        }
    }
    catch (e) {
        utils.log('newProfileManage err: ', e)
    }
}

async function newRunProfile() {
    utils.log('ids: ', ids)
    let pid
    if (runningPid) {
        let indexOfPid = ids.indexOf(runningPid)
        if (indexOfPid > -1) {
            pid = ids[indexOfPid]
            ids.splice(indexOfPid, 1)
        }
    }
    if (!pid) {
        pid = ids.shift()
    }

    if (pid || IS_REG_USER) {
        if (pid) {
            // handle remove undefined folder
            if (pid == 'undefined' && !IS_REG_USER) {
                console.log('Handle remove undefined folder');
                try {
                    execSync('rm -rf profiles/undefined')
                } catch (error) { console.log(error) }
                return
            }

            let currentIds = getProfileIds()
            currentIds = currentIds.filter(cid => cid != pid)
            if (currentIds.length > MAX_PROFILE - 1) {
                currentIds.splice(0, MAX_PROFILE - 1)
                currentIds.forEach(id => {
                    try {
                        if (id != pid) {
                            closeChrome(id, systemConfig.browsers)
                            execSync('rm -rf profiles/' + id)
                            ids = ids.filter(_id => _id != id)
                            runnings = runnings.filter(r => r.pid != id)
                        }
                    } catch (error) { console.log(error) }
                });
            }
            ids.push(pid)
        } else if (systemConfig.is_reg_account && systemConfig.is_reg_account != 'false') {
            pid = Math.floor(Math.random() * 5000)
        }

        try {
            let action = await getScriptData(pid, true)
            if (!action || action.not_found || !action.script_code) {
                await utils.sleep(5000)
                runnings = runnings.filter(i => i.pid != pid)
            }
            if (action && action.script_code) {
                // handle get browser loged
                let _browser = getBrowserOfProfile(pid, config.browser_map, systemConfig.browsers);
                addOpenBrowserAction(action, _browser)
            }
        }
        catch (e) {
            utils.log('error', 'pid: ', pid, 'run profile error: ', e)
        }
    }
}
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
                ids.push(action.pid)
                ids = ids.map(String)
                ids = [...new Set(ids)]
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
                ids.push(action.id)
                ids = ids.map(String)
                ids = [...new Set(ids)]
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
            delete systemConfig.search_percent
            delete systemConfig.direct_percent
            delete systemConfig.suggest_percent
            delete systemConfig.page_percent
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

async function updateVmStatus() {
    try {
        await loadSystemConfig()
        let _pids = getProfileIds()
        let pids = _pids.join(',')
        let rs = await request_api.reportVM({
            vm_id: config.vm_id,
            vm_name: config.vm_name,
            running: runnings.length,
            pids,
            IP
        })

        if (rs && rs.removePid) {
            let removePID = Number(rs.removePid)
            closeChrome(removePID, systemConfig.browsers)
            await utils.sleep(5000)
            try {
                execSync("rm -rf profiles/" + removePID)
            } catch (error) {
                console.log(error);
            }
            runnings = runnings.filter(i => i.pid != removePID)
            ids = ids.filter(i => i != removePID)
        }

        if (rs && rs.reset_all_profiles) {
            await resetAllProfiles()
        }
    }
    catch (e) {
        utils.log('updateVmStatus err: ', e)
    }
    finally {
        setTimeout(updateVmStatus, TIME_REPORT)
    }
}
// Hàm quản lý các profile
async function profileManage() {
    try {
        if (!IS_SHOW_UI) {
            logScreen()
        }

        updateVmStatus()
        profileRunningManage()
    }
    catch (e) {
        utils.log('error', 'profileManage:', e)
    }

}

async function running() {
    try {
        execSync(`sudo xrandr -s 1600x1200`)
    } catch (error) {
        console.log(error);
    }

    // get profile ids
    if (!fs.existsSync('profiles')) {
        fs.mkdirSync('profiles')
    }

    ids = getProfileIds()
    utils.log('ids: ', ids)
    ids.forEach(pid => startDisplay(pid))

    runAutoRebootVm()
    // manage profile actions
    await profileManage()
}

function initDir() {
    if (!fs.existsSync(path.resolve('logscreen'))) {
        fs.mkdirSync(path.resolve('logscreen'));
    }


    if (!fs.existsSync('screen')) {
        fs.mkdirSync('screen');
    }

    if (!fs.existsSync('profiles')) {
        fs.mkdirSync('profiles');
    }

    if (!fs.existsSync('error')) {
        fs.mkdirSync('error');
    }

}
// Hàm khởi động ứng dụng
async function start() {
    try {

        if (updateFlag && updateFlag.updating) {
            isAfterReboot = true
            await request_api.reportUpgrade()
            execSync('rm -rf update_flag.json')
            await utils.sleep(180000)
        }
        // Kiểm tra và cập nhật phiên bản mới
        checkToUpdate()
        // Thực thi các hành động đang chờ xử lý
        execActionsRunning()
        // Khởi tạo các thư mục cần thiết
        initDir()
        // Khởi tạo cấu hình
        await initConfig()
        // Khởi tạo máy chủ Express
        initExpress()
        // Chạy các tác vụ chính
        running()
        console.log('--- Running ---')
    }
    catch (e) {
        utils.log('error', 'start:', e)
    }
    finally {
        let cleanup = async function () {
            utils.log('cleanup')
            closeChrome("", systemConfig.browsers)
            process.exit()
        }
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }
}



async function initConfig() {

    if (process.env.VM_NAME && process.env.VM_NAME != '_VM_NAME') {
        config.vm_name = process.env.VM_NAME
    } else {
        config.vm_name = 'DEFAULT_PC'
    }

    if (!config.vm_id) {
        config.vm_id = utils.makeid(9)
    }

    IP = config.vm_name

    if (!config.browser_map) {
        config.browser_map = {}
    }

    if (config.usersPosition) {
        usersPosition = config.usersPosition
    }

    fs.writeFileSync("vm_log.json", JSON.stringify(config))

    await loadSystemConfig()
    console.log(' -> SYSTEM CONFIG : ', systemConfig);
}


async function getRandomImagePath(returnFile = false) {
    let fileName = Date.now() + '.jpg'
    let fimg = await request_api.getRandomImage()
    if (fimg) {
        let fetchedImage = await request({ uri: fimg.path, encoding: null })
        if (returnFile) {
            return fetchedImage
        }
        if (!fs.existsSync('./images')) {
            fs.mkdirSync('images')
        }
        fs.writeFileSync('./images/' + fileName, fetchedImage);
        return path.resolve('./images/' + fileName)
    }
}
// Hàm xử lý hành động
async function handleAction(actionData) {
    if (isPauseAction) {
        res.send({ rs: 'ok' })
        return
    }

    setDisplay(actionData.pid)
    await utils.sleep(1000)

    let logStr = '---> ' + actionData.action
    if (actionData.x) {
        logStr += '-' + actionData.x + '-' + actionData.y
    }
    utils.log(logStr)

    // copy str
    if (actionData.str) {
        console.log(actionData.str)
        try {
            const clipboardy = require('clipboardy');
            if (actionData.str == 'none') {
                actionData.str = ''
            }
            clipboardy.writeSync(actionData.str)
        } catch (error) {
            console.log('----error:', error)
        }
    }

    if (actionData.action == 'PASTE_IMAGE') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && xdotool click 1`)

        let filePath = await getRandomImagePath()

        execSync(`xclip -selection clipboard -t image/png -i ${filePath}`)
        execSync(`xdotool key Control_L+v`)
    }
    else if (actionData.action == 'DRAG') {
        let xTarget = Number(actionData.x) + Number(actionData.sx)
        let yTarget = Number(actionData.sy)

        execSync(`xdotool mousemove ${actionData.x} ${actionData.y}`)
        execSync(`xdotool mousedown 1`)
        execSync(`xdotool mousemove ${xTarget / 2} ${yTarget}`)
        await utils.sleep(2000)
        execSync(`xdotool mousemove ${xTarget + 10} ${yTarget}`)
        execSync(`xdotool mousemove ${xTarget + 5} ${yTarget}`)
        execSync(`xdotool mousemove ${xTarget + -5} ${yTarget}`)
        execSync(`xdotool mousemove ${xTarget + 2} ${yTarget}`)

        execSync(`xdotool mouseup 1`)

        // robot.moveMouse(Number(actionData.x), Number(actionData.y))
        // robot.mouseToggle('down')
        // robot.dragMouse(Number(actionData.x) + Number(actionData.sx)/2, Number(actionData.sy))
        // await utils.sleep(2000)
        // robot.dragMouse(Number(actionData.x) + Number(actionData.sx) + 10, Number(actionData.sy))
        // robot.dragMouse(Number(actionData.x) + Number(actionData.sx) + 5, Number(actionData.sy))
        // robot.dragMouse(Number(actionData.x) + Number(actionData.sx) + -5, Number(actionData.sy))
        // robot.dragMouse(Number(actionData.x) + Number(actionData.sx) + 2, Number(actionData.sy))
        // robot.mouseToggle('up')
    }
    else if (actionData.action == 'SELECT_AVATAR') {
        await utils.sleep(5000)
        del.sync([path.resolve('avatar.jpg')], { force: true })
        let avatar = await request_api.getAvatar(actionData.pid, path.resolve('../'), actionData.str)

        if (true && avatar) {
            await utils.sleep(5000)
            execSync(`xdotool mousemove 319 134 && sleep 1 && xdotool click 1 && sleep 2`)
            execSync(`xdotool mousemove 623 158 && sleep 1 && xdotool click 1 && xdotool click 1 && xdotool click 1 && sleep 1`)
        }
        else {
            execSync(`xdotool key Escape`)
        }
    }
    else if (actionData.action == 'OPEN_BROWSER') {
        await startChromeAction(actionData.data, actionData.browser)
    }
    else if (actionData.action == 'BRAVE_SETTINGS') {
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        //execSync(`xdotool key Shift+Tab`)//13

        execSync(`xdotool key Up`)
        execSync(`xdotool key Up`)
        execSync(`xdotool key Up`)

        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        //execSync(`xdotool key Shift+Tab`)

        execSync(`xdotool key Up`)
        execSync(`xdotool key Up`)
    }
    else if (actionData.action == 'IRIDIUM_SETTING') {
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Up`)
        execSync(`xdotool key Up`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key Tab && sleep 1`)
        execSync(`xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'CLOSE_BROWSER') {
        execSync(`xdotool key Control_L+w && sleep 1`)
    }
    else if (actionData.action == 'TABS') {
        let totalClick = Number(actionData.x)
        let count = 0
        while (count < totalClick) {
            execSync(`xdotool key Tab && sleep 1`)
            count++
        }
    }
    else if (actionData.action == 'SHOW_BRAVE_ADS') {
        execSync(`xdotool key Shift+Tab && sleep 1`)
        execSync(`xdotool key Shift+Tab && sleep 1`)
        execSync(`xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'COPY_BAT') {
        try {
            execSync(`xdotool key Control_L+c && sleep 1`)
        } catch (error) {

        }

        await utils.sleep(1000)

        let currentBat = ''
        const clipboardy = require('clipboardy');
        currentBat = clipboardy.readSync()
        utils.log('currentBat', currentBat)
        currentBat = Number(currentBat)

        if (currentBat) {
            try {
                let braveInfo = await request_api.getBraveInfo(actionData.pid)
                if (braveInfo) {
                    if (braveInfo.total_bat) {
                        if (!braveInfo.is_disabled_ads) {
                            if (braveInfo.total_bat == currentBat) {
                                request_api.updateProfileData({ is_disabled_ads: true, pid: actionData.pid, count_brave_rounds: 0 })
                                request_api.getProfileProxy(actionData.pid, PLAYLIST_ACTION.WATCH, true)
                                return res.send({ disable_ads: true })
                            }
                        } else {
                            if (braveInfo.count_brave_rounds >= braveInfo.brave_replay_ads_rounds) {
                                request_api.updateProfileData({ is_disabled_ads: false, pid: actionData.pid })
                                return res.send({ enable_ads: true })
                            }
                        }
                    }
                }
                request_api.updateProfileData({ total_bat: currentBat, pid: actionData.pid, '$inc': { count_brave_rounds: 1 } })
            } catch (error) {
                utils.log(error)
            }
        }
    }
    else if (actionData.action == 'ESC') {
        execSync(`xdotool key Escape && sleep 0.5`)
    }
    else if (actionData.action == 'GO_TO_FISRT_TAB') {
        execSync(`xdotool key Control_L+1 && sleep 1`)
    }
    else if (actionData.action == 'DOUBLE_CLICK') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click 1 && xdotool click 1 && sleep 1`)
    }
    else if (actionData.action == 'NEW_TAB') {
        execSync(`xdotool key Control_L+t && sleep 1`)
    } else if (actionData.action == 'RELOAD_PAGE') {
        execSync(`xdotool key F5 && sleep 1`)
    } else if (actionData.action == 'END_SCRIPT') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click 1 && sleep 1`)
        await utils.sleep(5000)
        runnings = runnings.filter(i => i.pid != actionData.pid)
    }

    //if (actionData.action == 'GO_ADDRESS' || actionData.action == 'OPEN_DEV') setChromeSize(actionData.pid)
    // execSync(`xdotool windowactivate $(xdotool search --onlyvisible --pid $(pgrep brave-browser | head -n 1)) && sleep 1`)
    else if (actionData.action == 'CTR_CLICK') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && xdotool keydown Control_L && xdotool click 1`)
    }
    else if (actionData.action == 'CLICK') {
        if (actionData.x > 65) {
            execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click 1 && sleep 1`)
        }
    }
    else if (actionData.action == 'TYPE') {
        let repeat = 3
        if (actionData.selector == 'input_post_fb') {
            repeat = 2
        }
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click --repeat ${repeat} 1 && sleep 1 && xdotool key Control_L+v && sleep 1`)
    }
    else if (actionData.action == 'KEY_ENTER') {
        execSync(`xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'TYPE_ENTER') {
        console.log('actionData.str', actionData.str);
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click --repeat 3 1 && sleep 1 && xdotool key Control_L+v && sleep 3 && xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'TYPE_KEY_ENTER') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click 1 && sleep 1 && xdotool key E && xdotool key n && xdotool key g && sleep 1 && xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'ONLY_TYPE') {
        execSync(`xdotool key Control_L+v sleep 1`)
    }
    else if (actionData.action == 'ONLY_TYPE_ENTER') {
        execSync(`xdotool key Control_L+v && sleep 3 && xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'CLICK_ENTER') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click 1 && sleep 1 && xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'NEXT_VIDEO') {
        execSync(`xdotool key Shift+n && sleep 1`)
    }
    else if (actionData.action == 'SCROLL') {
        if (actionData.str == 6) {
            execSync(`xdotool key Shift+Tab && sleep 1`)
            execSync(`xdotool key Page_Down && sleep 1`)
        } else {
            if (actionData.str > 0) {
                let pageNumber = Math.ceil(actionData.str / 5)
                while (pageNumber > 0) {
                    execSync(`xdotool key Page_Down && sleep 1`)
                    pageNumber--
                }
            }
            else {
                let pageNumber = Math.ceil(actionData.str / -5)
                while (pageNumber > 0) {
                    execSync(`xdotool key Page_Up && sleep 1`)
                    pageNumber--
                }
            }
        }
    }
    else if (actionData.action == 'SEND_KEY') {
        execSync(`xdotool type ${actionData.str}`)
    }
    else if (actionData.action == 'GO_ADDRESS') {
        execSync(`xdotool key Escape && sleep 0.5 && xdotool key Control_L+l && sleep 0.5`)
        if (actionData.str.length > 40) {
            execSync(`xdotool key Control_L+v`)
            await utils.sleep(2000)
        } else {
            execSync(`xdotool type "${actionData.str}"`)
        }
        await utils.sleep(1000)
        execSync(`xdotool key KP_Enter`)
        await utils.sleep(2000)
    }
    else if (actionData.action == 'OPEN_DEV') {
        execSync(`sleep 3;xdotool key Control_L+Shift+i;sleep 7;xdotool key Control_L+Shift+p;sleep 3;xdotool type "bottom";sleep 3;xdotool key KP_Enter`)
    }
    else if (actionData.action == 'OPEN_MOBILE') {
        utils.log('open mobile simulator')
        let po = {
            0: 4,
            1: 5,
            2: 6,
            3: 7,
            4: 8,
            5: 9,
            6: 10,
            7: 11,
            8: 12,
            9: 12,
        }
        let devicePo = Number(active_devices[Number(actionData.pid) % active_devices.length])
        devicePo -= 1
        execSync(`xdotool key Control_L+Shift+m;sleep 2;xdotool mousemove 855 90;sleep 1;xdotool click 1;sleep 1;xdotool mousemove 855 ${150 + 24 * devicePo};sleep 1;xdotool click 1;sleep 1`)
    }
    else if (actionData.action == 'OPEN_MOBILE_CUSTOM') {
        utils.log('add custom mobile')
        execSync(`xdotool key Control_L+Shift+m;sleep 2;xdotool key Control_L+Shift+p;sleep 1;xdotool type "show devices";sleep 1;xdotool key KP_Enter;sleep 1;xdotool key KP_Enter;xdotool type "custom";xdotool key Tab;xdotool type ${actionData.x};xdotool key Tab;xdotool type ${actionData.y};xdotool key Tab;xdotool key Tab;xdotool key Control_L+v;xdotool key Tab;xdotool key Tab;xdotool key KP_Enter;xdotool key Escape;xdotool mousemove 855 90;sleep 1;xdotool click 1;sleep 1;xdotool mousemove 855 150;sleep 1;xdotool click 1;sleep 1`)
    }
    else if (actionData.action == 'REOPEN_MOBILE_CUSTOM') {
        utils.log('add custom mobile')
        execSync(`sleep 2;xdotool key Control_L+Shift+p;sleep 1;xdotool type "show devices";sleep 1;xdotool key KP_Enter;sleep 1;xdotool key KP_Enter;xdotool type "custom";xdotool key Tab;xdotool type ${actionData.x};xdotool key Tab;xdotool type ${actionData.y};xdotool key Tab;xdotool key Tab;xdotool key Control_L+v;xdotool key Tab;xdotool key Tab;xdotool key KP_Enter;xdotool key Escape;xdotool mousemove 855 90;sleep 1;xdotool click 1;sleep 1;xdotool mousemove 855 150;sleep 1;xdotool click 1;sleep 1`)
    }
    else if (actionData.action == 'SELECT_MOBILE') {
        utils.log('open mobile simulator')
        let po = {
            0: 4,
            1: 5,
            2: 6,
            3: 7,
            4: 8,
            5: 9,
            6: 10,
            7: 11,
            8: 12,
            9: 12,
        }
        let devicePo = Number(active_devices[Number(actionData.pid) % active_devices.length])
        devicePo -= 1
        execSync(`xdotool mousemove 855 90;sleep 0.5;xdotool click 1;sleep 1;xdotool mousemove 855 ${150 + 24 * devicePo};sleep 0.5;xdotool click 1;sleep 1`)
    }
    else if (actionData.action == 'SELECT_MOBILE_CUSTOM') {
        utils.log('open mobile simulator')
        execSync(`xdotool mousemove 855 90;sleep 0.5;xdotool click 1;sleep 1;xdotool mousemove 855 150;sleep 0.5;xdotool click 1;sleep 1`)
    }
    else if (actionData.action == 'SHOW_PAGE') {
        execSync(`xdotool key Control_L+Shift+p;sleep 0.5;xdotool type "elements";sleep 0.5;xdotool key KP_Enter;sleep 0.5;xdotool key Control_L+Shift+p;sleep 0.5;xdotool type "search";sleep 0.5;xdotool key KP_Enter`)
    }
    else if (actionData.action == 'SELECT_OPTION') {
        execSync(`xdotool key Page_Up && sleep 1`)
        for (let i = 0; i < actionData.str * 1; i++) {
            execSync(`xdotool key Down && sleep 0.2`)
        }
        execSync(`xdotool key KP_Enter`)
    }
    else if (actionData.action == 'SCREENSHOT') {
        utils.errorScreenshot(actionData.pid + '_input')
    }

    if (actionData.res) {
        actionData.res.json({ success: true })
    }
}
// Hàm tự động khởi động lại máy ảo
function runAutoRebootVm() {
    setInterval(async () => {
        let myDate = new Date()
        let hour = Number(myDate.toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour12: false }).split(':')[0])

        let resetProfilesTimeInterval = Number(systemConfig.reset_profiles_time_interval)
        if (resetProfilesTimeInterval && hour % resetProfilesTimeInterval == 0) {
            await resetAllProfiles()
        }

        if (Number(systemConfig.reset_system_time) > 0 && hour == Number(systemConfig.reset_system_time)) {
            try {
                isSystemChecking = true
                if (systemConfig.reset_profile_when_reset_system && systemConfig.reset_profile_when_reset_system != 'false') {
                    await resetAllProfiles()
                }
                execSync('sudo systemctl reboot')
            } catch (error) {
                isSystemChecking = false
                console.log(error);
            }
        }
    }, 3600000);
}



async function logScreen() {
    if (!IS_LOG_SCREEN) {
        return
    }
    try {
        if (IS_LOG_SCREEN) {
            utils.logScreenshot('log_sr_')
        }
    }
    catch (e) {
        utils.log('logScreen err: ', e)
    }
    finally {
        setTimeout(logScreen, 10000)
    }
}

// Hàm kiểm tra và cập nhật phiên bản mới
async function checkToUpdate() {
    try {
        setTimeout(async () => {
            utils.log('check to update')
            let result = await request_api.checkToUpdate()
            if (result && result.resetAllItem) {
                await resetAllProfiles()
            }

            if (result && result.upgradeTool) {
                runUpdateVps()
            } else {
                checkToUpdate()
            }
        }, TIME_TO_CHECK_UPDATE)
    }
    catch (e) {
        utils.log('check to update err: ', e)
    }
}
start()

module.exports = { getScriptData, loadSystemConfig }
