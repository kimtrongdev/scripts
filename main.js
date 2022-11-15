const useProxy = true
let isRunBAT = false
let isSystemChecking = false
const TIME_REPORT = 290000
const TIME_TO_CHECK_UPDATE = 300000
const isAutoEnableReward = true
let EXPIRED_TIME = 400000
let totalRoundForChangeProxy = 5
let countRun = 0
let isPauseAction = false
let isAfterReboot = false
let actionsData = []
let addresses = require('./src/adress.json').addresses
require('dotenv').config();
let systemConfig = {}
global.devJson = {
    hostIp: process.env.HOST_IP,
    maxProfile: Number(process.env.MAX_PROFILES) || 1,
}

global.IS_SHOW_UI = null
global.IS_LOG_SCREEN = Boolean(Number(process.env.LOG_SCREEN))
global.DEBUG = Boolean(Number(process.env.DEBUG))
const LOCAL_PORT = 2000
let IP
let IS_REG_USER = false
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
const utils = require('./utils')
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
const request_api = require('./request_api')
global.workingDir = getScriptDir()
const publicIp = require('public-ip')
const path = require('path')
const del = require('del');
const fs = require('fs')
let MAX_CURRENT_ACC = Number(devJson.maxProfile)
let MAX_PROFILE = 2

let ids = []
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
let BACKUP = false

const PLAYLIST_ACTION = {
    WATCH: 0,
    WATCH_TO_SUB: 1,
    SUB: 2
}
const ADDNEW_ACTION = 3

function addOpenBrowserAction (action, browser) {
    actionsData.push({
        action: 'OPEN_BROWSER',
        data: action,
        browser: browser
    })
}

async function execActionsRunning () {
    if (actionsData.length) {
        let action = actionsData.shift()
        await handleAction(action)
    }
    await utils.sleep(1000)
    execActionsRunning()
}

async function handleForChangeShowUI() {
    let _pids = getProfileIds()

    for await (let pid of _pids) {
        closeChrome(pid)
        await utils.sleep(2000)
    }
    await utils.sleep(2000)
    runnings = []
    ids = _pids
}

async function loadSystemConfig () {
    let rs = await request_api.getSystemConfig();
    if (rs && !rs.error) {
        systemConfig = rs
    }
    
    if (Number(systemConfig.max_current_profiles)) {
        MAX_CURRENT_ACC = Number(systemConfig.max_current_profiles)
    }

    if (systemConfig.max_total_profiles) {
        MAX_PROFILE = MAX_CURRENT_ACC * Number(systemConfig.max_total_profiles)
    }
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

    let IS_REG_USER_new = (systemConfig.is_reg_user && systemConfig.is_reg_user != 'false') || 
    (systemConfig.is_ver_mail && systemConfig.is_ver_mail != 'false') ||
    (systemConfig.is_rename_channel && systemConfig.is_rename_channel != 'false') ||
    (systemConfig.is_reg_account && systemConfig.is_reg_account != 'false') ||
    (systemConfig.is_reg_ga && systemConfig.is_reg_ga != 'false') ||
    (systemConfig.is_check_mail_1 && systemConfig.is_check_mail_1 != 'false') ||
    (systemConfig.is_recovery_mail && systemConfig.is_recovery_mail != 'false')
    if (IS_REG_USER_new != undefined && IS_REG_USER != IS_REG_USER_new) {
        await resetAllProfiles()
        IS_REG_USER = IS_REG_USER_new
        if (IS_REG_USER) {
            EXPIRED_TIME = 200000
        }
    }

    // handle browsers for centos and ubuntu
    let browsers = []
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
    systemConfig.browsers = browsers

    if (config.browser_map) {
        Object.keys(config.browser_map).forEach(browserMaped => {
            if (!systemConfig.browsers.includes(browserMaped)) {
                config.browser_map[browserMaped].forEach(pid => {
                    closeChrome(pid)
                    execSync('rm -rf profiles/'+pid)
                });
                delete config.browser_map[browserMaped]
            }  
        })
    }

    if (systemConfig.stop_tool == 1) {
        execSync('pm2 stop all')
    }

    utils.log('SYSTEMCONFIG--', systemConfig);
}

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
                    countRun++
                    newRunProfile()
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

async function runUpdateVps () {
    try {
        isSystemChecking = true
        await loadSystemConfig()
        // make for report upgrade

        let pids = getProfileIds()
        for (let pid of pids) {
            closeChrome(pid)
        }

        try {
            let gitKey = systemConfig.update_key
            if (gitKey) {
                execSync(`git remote set-url origin https://kimtrongdev:${gitKey}@github.com/kimtrongdev/scripts.git`)
            }

            execSync("git config user.name kim && git config user.email kimtrong@gmail.com && git stash && git pull")
        } catch (error) {
            console.log(error);
            isSystemChecking = false
            return
        }

        fs.writeFileSync("update_flag.json", JSON.stringify({ updating: true }))

        if (Number(systemConfig.reboot_on_update)) {
            execSync('sudo systemctl reboot')
        } else {
            execSync('pm2 restart all')
        }

        await utils.sleep(15000)
        runnings = []
    } catch (error) {
        console.log('Error while update vps, error: ', error);
    } finally {
        isSystemChecking = false
    }
}

function getProfileIds() {
    try {
        let directoryPath = path.resolve("profiles")
        let files = fs.readdirSync(directoryPath)
        if (files && Array.isArray(files)) {
            return files
        }
    } catch (error) {
        console.log(error);
    }
    
    return []
}

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

    // try {
    //     const ramdom1 = utils.getRndInteger(1000, 9000)
    //     const ramdom2 = utils.getRndInteger(1000, 9000)
    //     execSync(`export EZTUB_FINGERPRINT_KEY="17349330445822${ramdom2}${ramdom1}"`)
    // } catch (error) {
    //     console.log(error);
    // }

    let widthSizes = [950, 1100, 1200]
    let positionSize = action.isNew ? 0 : utils.getRndInteger(0, 2)
    let screenWidth = 1400//widthSizes[positionSize]
    let screenHeight = 950 //action.isNew ? 950 : utils.getRndInteger(950, 1000)

    //handle userDataDir
    let userDataDir =  ` --user-data-dir="${path.resolve("profiles", action.pid + '')}"`

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
        action.proxy_username = proxy[action.pid].username
        action.proxy_password = proxy[action.pid].password
    }

    // handle flag data
    action.browser_name = _browser
    if (isRunBAT) {
        action.isRunBAT = isRunBAT
    }

    let exs = ["ex", "quality"]
    let level_name = ''
    if (action.id != 'reg_user' && systemConfig.trace_names_ex.length) {
        let traceName = 'trace'

        if (trace[action.pid] && systemConfig.trace_names_ex.includes(trace[action.pid])) {
            traceName = 'trace_ex/' + trace[action.pid]
        } else {
            if (systemConfig.trace_names_ex && systemConfig.trace_names_ex.length) {
                traceName = systemConfig.trace_names_ex[Math.floor(Math.random()*systemConfig.trace_names_ex.length)]
                
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
        closeChrome(action.pid)
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
                closeChrome(action.pid)
                exec(`${_browser}${userDataDir}${windowSize}`)
            } else {
                exec(cmdRun)
            }

            if (['opera', 'microsoft-edge', 'microsoft-edge-stable'].includes(_browser)) {
                await utils.sleep(10000)
                closeChrome(action.pid)
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
        action.os_vm = process.env.OS == 'centos_vps' ? 'vps':'' 

        // handle log browser for profile
        if (!config.browser_map) {
            config.browser_map = {}
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
            if (proxy) {
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

function getBrowserOfProfile (pid) {
    let _browser
    systemConfig.browsers.forEach((browser) => {
        if (config.browser_map[browser] && config.browser_map[browser].some(id => id == pid)) {
            _browser = browser
        }
    })

    if (!_browser) {
        return systemConfig.browsers[0]
    }
    return _browser
}

async function newRunProfile() {
    utils.log('ids: ', ids)
    let pid = ids.shift()
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
                            closeChrome(id)
                            execSync('rm -rf profiles/'+id)
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
            if (action && action.script_code) {
                // handle get browser loged
                let _browser = getBrowserOfProfile(pid)
                addOpenBrowserAction(action, _browser)
            }
        }
        catch (e) {
            utils.log('error', 'pid: ', pid, 'run profile error: ', e)
        }
    }
}

async function getScriptData(pid, isNewProxy = false) {
    let action = {}
    if (IS_REG_USER) {
        if (systemConfig.is_reg_account && systemConfig.new_account_type == 'facebook') {
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
            let newProfile = await request_api.getNewProfile()
            utils.log('newProfile: ', newProfile)
            if (!newProfile.err && newProfile.profile) {
                // copy main to clone profile
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
            let newProfile = await request_api.getNewProfile()
            utils.log('newProfile: ', newProfile)
            if (!newProfile.err && newProfile.profile) {
                // copy main to clone profile
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
            action = {
                script_code: 'reg_account',
                account_type: 'gmail'
            }
        } else {
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
        action = await request_api.getNewScript(pid)
    }

    if (action) {
        if (useProxy && isNewProxy) {
            let isLoadNewProxy = '' 
            let totalRound = totalRoundForChangeProxy * MAX_PROFILE
            if (countRun % totalRound  > 0 &&  countRun % totalRound <= MAX_PROFILE && countRun > MAX_PROFILE) {
                isLoadNewProxy = true
                utils.log('Load new proxy for pid')
            }

            if (isLoadNewProxy && isRunBAT || action.is_ver_mail_type) {
                let newProxy = await request_api.getProxyV4()
                let proxyV6 = await request_api.getProfileProxy(pid, PLAYLIST_ACTION.WATCH, isLoadNewProxy)
                if (newProxy.server) {
                    proxy[pid] = {
                        server: newProxy.server
                    }
                    // let proxyInfo = newProxy.server.split(':')
                    // if (proxyInfo.length >= 2) {
                    //     execSync(`sudo gsettings set org.gnome.system.proxy.https host '${proxyInfo[0]}'`)
                    //     execSync(`sudo gsettings set org.gnome.system.proxy.https port ${proxyInfo[1]}`)
                    //     execSync(`sudo gsettings set org.gnome.system.proxy mode 'manual'`)
                    //     proxy[pid] = undefined
                    // }
                } else {
                    proxy[pid] = proxyV6
                }
            } else {
                //execSync(`sudo gsettings set org.gnome.system.proxy mode 'none'`)
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
            let startTime = Date.now()
            let actionRecord = { pid: pid, start: startTime, lastReport: startTime, browser: true, action: 'watch' }
            runnings.push(actionRecord)
        }
        
        action.id = action.script_code
        action.pid = pid
        action.is_show_ui = IS_SHOW_UI
        action.os_vm = process.env.OS == 'centos_vps' ? 'vps':'' 
        if (isRunBAT) {
            action.isRunBAT = isRunBAT
        }
        // init action data
        if(action.mobile_percent === undefined || action.mobile_percent === null){
            if (systemConfig.total_rounds_for_change_proxy) {
                totalRoundForChangeProxy = Number(systemConfig.total_rounds_for_change_proxy)
            }
            Object.assign(action, systemConfig)
            delete action.systemParams
    
            action.mobile_percent = systemConfig.browser_mobile_percent
            active_devices = systemConfig.active_devices || []
            if (active_devices.length) {
                action.mobile_percent = 100
            }
    
            if (systemConfig.ads_percent  && !Number(action.ads_percent)) {
                action.ads_percent = systemConfig.ads_percent
            }
    
            action.total_channel_created = Number(systemConfig.total_channel_created)
    
            if (['watch', 'watch_video', 'comment_youtube'].includes(action.id)) {
                let oldUserPosition = usersPosition.find(u => u.pid == action.pid)
                if (oldUserPosition) {
                    action.channel_position = Number(oldUserPosition.position)
                } else {
                    action.channel_position = -1
                }
            }

            if (action.id == 'watch' || action.id == 'watch_video') {
                action.total_loop_find_ads = systemConfig.total_loop_find_ads || 0
                // if (systemConfig.total_times_next_video && !Number(action.total_times_next_video)) {
                //     action.total_times_next_video = systemConfig.total_times_next_video
                // }
                // if (systemConfig.watching_time_non_ads && !Number(action.watching_time_non_ads)) {
                //     action.watching_time_non_ads = systemConfig.watching_time_non_ads
                // }
                // if (systemConfig.watching_time_start_ads && !Number(action.watching_time_start_ads)) {
                //     action.watching_time_start_ads = systemConfig.watching_time_start_ads
                // }
                // if (systemConfig.watching_time_end_ads && !Number(action.watching_time_end_ads)) {
                //     action.watching_time_end_ads = systemConfig.watching_time_end_ads
                // }
    
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

async function checkRunningProfiles () {
    try {
        if (isPauseAction) {
            return
        }
        utils.log('runnings: ', runnings.length)
        let watchingLength = runnings.length
        for (let i = 0; i < watchingLength; i++) {
            // calculate last report time
            let timeDiff = Date.now() - runnings[i].lastReport
            if (timeDiff > EXPIRED_TIME) {
                let pid = runnings[i].pid
                utils.log('----- expired time -----', pid)
                try {
                    closeChrome(pid)

                    if (runnings[i].action == 'login' || IS_REG_USER) {
                        execSync('rm -rf profiles/'+pid)
                        ids = ids.filter(id => id != pid)
                    }
                }
                catch (e) { }
                finally {
                    // delete in watching queue
                    runnings = runnings.filter(x => x.pid != pid)
                    watchingLength -= 1
                    i -= 1
                }
            }
        }
    }
    catch (e) {
        utils.log('error', 'checkWatchingProfile err: ', e)
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
            closeChrome(removePID)
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

    // if (!fs.existsSync(path.resolve('logs'))) {
    //     fs.mkdirSync(path.resolve('logs'));
    // }

    if (!fs.existsSync('screen')) {
        fs.mkdirSync('screen');
    }

    if (!fs.existsSync('profiles')) {
        fs.mkdirSync('profiles');
    }

    if (!fs.existsSync('error')) {
        fs.mkdirSync('error');
    }

    // if (!fs.existsSync('backup')) {
    //     fs.mkdirSync('backup');
    // }
}

async function start() {
    try {
        
        if (updateFlag && updateFlag.updating) {
            isAfterReboot = true
            await request_api.reportUpgrade()
            execSync('rm -rf update_flag.json')
            await utils.sleep(180000)
        }
        checkToUpdate()
        execActionsRunning()
        initDir()
        await initConfig()
        initExpress()
        running()
        console.log('--- Running ---')
    }
    catch (e) {
        utils.log('error', 'start:', e)
    }
    finally {
        let cleanup = async function () {
            utils.log('cleanup')
            closeChrome()
            process.exit()
        }
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);
    }
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * 
 charactersLength));
   }
   return result;
}

async function initConfig() {
   /* execSync(`export EZTUB_CPU_ARCHITECTURE="x86" \
        EZTUB_CPU_BITNESS="64" \
        EZTUB_DEVICE_SCALE_FACTOR="1" \
        EZTUB_FINGERPRINT_KEY="17349330445822630091" \
        EZTUB_HARDWARE_CONCURRENCY="2" \
        EZTUB_MAX_TOUCH_POINTS="0" \
        EZTUB_NAVIGATOR_PLATFORM="Win32" \
        EZTUB_NAVIGATOR_UA_DATA_PLATFORM="Windows" \
        EZTUB_NAVIGATOR_VENDOR="Google Inc." \
        EZTUB_PLATFORM_VERSION="10.0" \
        EZTUB_SCREEN_DEPTH="24" \
        EZTUB_SCREEN_HEIGHT="864" \
        EZTUB_SCREEN_WIDTH="1536" \
        EZTUB_USER_AGENT="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.54 Safari/537.36" \
        EZTUB_WEBGL_RENDERER="ANGLE (NVIDIA, NVIDIA GeForce GTX 1050 Ti Direct3D11 vs_5_0 ps_5_0, D3D11)" \
        EZTUB_WEBGL_VENDOR="Google Inc. (NVIDIA)"`)
*/
    // load configuration
    //utils.log('config: ', config)
    // let ip = ''
    // while(!ip || ip.length > 50){
    //     await utils.sleep(5000)
    //     try {
    //         if (fs.existsSync('./ip.log')) {
    //             ip = fs.readFileSync('./ip.log', 'utf8')
    //             if (ip.length > 50) {
    //                 ip = await publicIp.v4()
    //             }
    //         }
    //         else {
    //             ip = await publicIp.v4()
    //         }
    //     }
    //     catch (e) {
    //         utils.log('error', 'get ip err')
    //     }
    // }

    // utils.log('ip: ', ip)
    // check config
    let ip = await publicIp.v4()
    IP = ip

    if (process.env.VM_NAME && process.env.VM_NAME != '_VM_NAME') {
        config.vm_name = process.env.VM_NAME
    } else {
        config.vm_name = 'DEFAULT_PC'
    }

    if (!config.vm_id) {
        config.vm_id = makeid(9)
    }

    if (!config.browser_map) {
        config.browser_map = {}
    }

    if (config.usersPosition) {
        usersPosition = config.usersPosition
    }
    
    fs.writeFileSync("vm_log.json", JSON.stringify(config))

    await loadSystemConfig()
    console.log(' -> SYSTEM CONFIG : ', systemConfig);
    //utils.log('version: ', version)
}

function getScriptDir() {
    utils.log('__dirname: ' + __dirname)
    return __dirname
}

function handlePlaylistData (playlist) {
    if (!playlist.total_times_next_video) {
        delete playlist.total_times_next_video
    }
    if (!playlist.watching_time_non_ads) {
        delete playlist.watching_time_non_ads
    }
    if (!playlist.watching_time_start_ads) {
        delete playlist.watching_time_start_ads
    }
    if (!playlist.watching_time_end_ads) {
        delete playlist.watching_time_end_ads
    }
}

function initExpress() {
    const express = require('express')
    const app = express()

    app.get('/favicon.ico', (req, res) => {
        res.sendFile(path.resolve("favicon.ico"))
        return
    })

    app.get('/debug', (req, res) => {
        isPauseAction = true
        res.send({ rs: 'ok' })
        return
    })

    app.get('/report-playlist-jct', async (req, res) => {
        let rs = await request_api.reportPlaylistJCT(req.query)
        return res.send(rs)
    })

    app.get('/get-comment', async (req, res) => {
        let rs = await request_api.getComment()
        return res.send(rs)
    })

    app.get('/get-phone', async (req, res) => {
        let rs = await request_api.getPhone()
        res.send(rs)
        return
    })

    app.get('/get-address-random', async (req, res) => {
        console.log(addresses.length);
        const randomAddress = addresses[Math.floor(Math.random() * addresses.length)]
        console.log(randomAddress);
        return res.send(randomAddress)
    })

    app.get('/get-phone-code', async (req, res) => {
        let order_id = req.query.order_id
        let api_name = req.query.api_name
        let rs = await request_api.getPhoneCode(order_id, api_name)
        res.send(rs)
        return
    })

    app.get('/login', (req, res) => {
        utils.log(req.query)
        if (req.query.status == 1) {
            utils.log(req.query.pid, 'login success')
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED')
        }
        else {
            utils.log(req.query.pid, 'login error', req.query.msg)
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'ERROR', req.query.msg)
        }
        removePidAddnew(req.query.pid, req.query.status)

        res.send({ rs: 'ok' })
    })

    app.get('/get-new-playlist', async (req, res) => {
        let rs = await request_api.getYTVideo()
        let playlist = rs.playlist
        handlePlaylistData(playlist)
        res.send(playlist)
    })

    app.get('/report', async (req, res) => {
        if (isPauseAction) {
            //res.send({ rs: 'ok' })
            return
        }
        utils.log(req.query)

        if (req.query.id == 'reg_account') {
            let action = req.query
            
            if (action.username && action.password) {
                request_api.reportAccount({
                    username: action.username,
                    password: action.password,
                    verify: action.verify,
                    type: action.type,
                    reg_ga_success: action.reg_ga_success
                })
            }

            if (action.reg_ga_success || (action.stop && action.stop != 'false')) {
                request_api.updateProfileData({ pid: Number(action.pid), status: 'ERROR', description: 'ga' })
                removePidAddnew(req.query.pid, 0)
            }
        }
        else if (req.query.id == 'total_created_channel') {
            request_api.updateProfileData({ pid: req.query.pid, total_created_users: req.query.count })
        }
        else if (req.query.id == 'live_report') {
            runnings.forEach(running => {
                if (running.pid == req.query.pid) {
                    running.lastReport = Date.now()
                }
            });
        }
        else if (req.query.isScriptReport) {
            if (!['watch', 'create_playlist', 'search', 'end_script'].includes(req.query.script_code)) {
                await request_api.reportScript(req.query.pid, req.query.service_id, req.query.status, req.query.data_reported)
            }

            if ([1, '1', 'true', true].includes(req.query.isBreak)) {
               // execSync(`xdotool key Control_L+w && sleep 1`)
                // browser will closed by background extention
                closeChrome(req.query.pid)
                runnings = runnings.filter(i => i.pid != req.query.pid)
            } else {
                let action = await getScriptData(req.query.pid)
                if (req.query.script_code == action.script_code) {
                    closeChrome(req.query.pid)
                    runnings = runnings.filter(i => i.pid != req.query.pid)
                } else {
                    runnings.forEach(running => {
                        if (running.pid == req.query.pid) {
                            running.lastReport = Date.now()
                        }
                    });
                    return res.json(action)
                }
            }
        }
        else if (req.query.id == 'channel-position') {
            let channel = usersPosition.find(u => u.pid == req.query.pid)
            if (channel) {
                channel.position = req.query.position
            } else {
                usersPosition.push({
                    pid: req.query.pid,
                    position: req.query.position,
                })
            }

            if (usersPosition) {
                config.usersPosition = usersPosition
                fs.writeFileSync("vm_log.json", JSON.stringify(config))
            }
        }
        else if (req.query.id == 'watched'){
            runnings.forEach(running => {
                if (running.pid == req.query.pid) {
                    running.lastReport = Date.now()
                }
            });
            request_api.updateWatchedVideo(req.query.pid, req.query.viewedAds)
        }
        else if (req.query.id == 'login' || req.query.id == 'reg_user' || req.query.id == 'check_mail_1'|| req.query.id == 'recovery_mail') {
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'login success')
                if (req.query.id == 'reg_user') {
                    request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR' })
                } else {
                    request_api.updateProfileData({ pid: req.query.pid, status: 'SYNCED' })
                }
            }
            else {
                utils.log(req.query.pid, 'login error', req.query.msg)
                request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR', description: req.query.msg })
            }
            removePidAddnew(req.query.pid, req.query.status)
        }
        else if(req.query.id == 'logout'){
            utils.log(req.query.pid, 'logout ok')
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'ERROR', 'disabled_logout')
            ids = ids.filter(x => x != req.query.pid)
            deleteProfile(req.query.pid)
        }
        else if(req.query.id == 'confirm'){
            utils.log(req.query.pid, 'confirm',req.query.status)
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'confirm success')
                request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', 'CONFIRM_SUCCESS')
            }
            else {
                utils.log(req.query.pid, 'confirm error', req.query.msg)
                request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
            }
        }
        else if(req.query.id == 'changepass'){
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
        }
        else if(req.query.id == 'checkpremium' || req.query.id == 'checkcountry'){
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
        }
        else if (req.query.id == 'watch') {
            if (req.query.stop == 'true' || req.query.stop == true) {
                runnings = runnings.filter(i => i.pid != req.query.pid)
            }
        }
        else if (req.query.id == 'sub') {
            if (req.query.stop == 'true' || req.query.stop == true) {
                utils.log('remove pid from subRunnings', req.query.pid)
                subRunnings = subRunnings.filter(x => x.pid != req.query.pid)
            }
        }
        if (req.query.msg && req.query.msg == 'NOT_LOGIN') {
            utils.log('error', req.query.pid, 'NOT_LOGIN')
            deleteProfile(req.query.pid)
            ids = ids.filter(x => x != req.query.pid)
            deleteBackup(req.query.pid)
        }
        res.send({ rs: 'ok' })
    })

    app.get('/run-update-vps', (req, res) => {
        runUpdateVps()
        res.send({success: true})
    })

    app.get('/action', (req, res) => {
        utils.log(req.query)
        res.send(JSON.stringify(req.query))
    })

    app.get('/input', async (req, res) => {
        actionsData.push({...req.query, res})
    })

    app.listen(LOCAL_PORT, () => {
        utils.log('start app on', LOCAL_PORT)
    })
}

async function handleAction (actionData) {
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
    if(actionData.str){
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

    if (actionData.action == 'SELECT_AVATAR') {
        del.sync([path.resolve('avatar.jpg')], { force: true })
        let avatar = await request_api.getAvatar(actionData.pid,path.resolve('avatar.jpg'),actionData.str)

        if(true && avatar){
            await utils.sleep(5000)
            execSync(`xdotool key KP_Enter`)
            await utils.sleep(5000)
            execSync(`xdotool type "${path.resolve('avatar.jpg')}" && sleep 1 && xdotool key KP_Enter`)
        }
        else{
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
        execSync(`xdotool key Shift+Tab`)//13
        execSync(`xdotool key Shift+Tab`)// 14

        execSync(`xdotool key Up`)
        execSync(`xdotool key Up`)
        execSync(`xdotool key Up`)

        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)
        execSync(`xdotool key Shift+Tab`)

        execSync(`xdotool key Down`)
        execSync(`xdotool key Down`)
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
            count ++
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
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click --repeat 3 1 && sleep 1 && xdotool key Control_L+v && sleep 1`)
    }
    else if (actionData.action == 'KEY_ENTER') {
        execSync(`xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'TYPE_ENTER') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click --repeat 3 1 && sleep 1 && xdotool key Control_L+v && sleep 3 && xdotool key KP_Enter && sleep 1`)
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
        for(let i = 0; i < actionData.str*1; i++){
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

function removePidAddnew(pid, status) {
    try {
        runnings = runnings.filter(x => x.pid != pid)
        if (status != 1 || IS_REG_USER) {
            // login error
            deleteProfile(pid)
            utils.log('removePidAddnew', pid, status)
        }
        else {
            // login success
            closeChrome(pid)
            if (!ids.filter(x => x == pid).length) {
                ids.push(pid)
            }
        }

        if (IS_REG_USER) {
            ids = ids.filter(x => x != pid)
        }
        utils.log(ids)
    }
    catch (e) {
        utils.log('error', 'removePidAddnew', pid, status, addnewRunnings, ids, e)
    }
}

async function deleteProfile(pid, retry = 0) {
    ids = ids.filter(x => x != pid)
    runnings = runnings.filter(r => r.pid != pid)
    try {
        stopDisplay(pid)
        closeChrome(pid)
        del.sync([path.resolve("profiles", pid + '', '**')], { force: true })
    }
    catch (e) {
        utils.log('error', 'deleteProfile', pid, retry)
        if (retry < 3) {
            await utils.sleep(3000)
            await deleteProfile(pid, retry + 1)
        }
    }
}

function runAutoRebootVm () {
    setInterval(async () => {
        let myDate = new Date()
        let hour = Number(myDate.toLocaleTimeString("vi-VN", {timeZone: "Asia/Ho_Chi_Minh", hour12: false}).split(':')[0])

        let resetProfilesTimeInterval = Number(systemConfig.reset_profiles_time_interval)
        if (resetProfilesTimeInterval && hour % resetProfilesTimeInterval == 0) {
            await resetAllProfiles()
        }
        
        if (Number(systemConfig.reset_system_time) > 0 && hour == Number(systemConfig.reset_system_time)){
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

function closeChrome(pid) {
    try {
        if (WIN_ENV) {
            execSync('input CLOSE_CHROME')
        }
        else {
            if (pid) {
                execSync(`pkill -f "profiles/${pid}"`)
            }
            else {
                execSync(`pkill ${getBrowserOfProfile(pid)}`)
            }
        }
    }
    catch (e) {
    }
}

function startDisplay(pid) {
    try {
        if (!WIN_ENV) {
            exec(`Xvfb :${pid} -ac -screen 0, 1920x1040x24`)
            // execSync(`unzip -o -P Trung@123456 ex.zip`)
            // execSync(`unzip -o -P Trung@123456 quality.zip`)
            let core = (pid % 4 + 1) * 2
            let ram = core * (pid % 2 + 1) * 2
            execSync(`sed -i '241 s/"value":.*/"value":${core}/' trace/js/background/prefs.js;sed -i '245 s/"value":.*/"value":${ram}/' trace/js/background/prefs.js`)
            if (pid % 10 < 0) {
                execSync(`sed -i '404 s/"enabled":.*/"enabled":false,/' trace/js/background/prefs.js`)
            }
            else {
                execSync(`sed -i '404 s/"enabled":.*/"enabled":true,/' trace/js/background/prefs.js`)
            }
        }
    }
    catch (e) {
    }
}

function stopDisplay(pid) {
    try {
        if (!WIN_ENV) {
            execSync(`pkill -f "Xvfb :${pid}"`)
        }
    }
    catch (e) {
    }
}

function setDisplay(pid) {
    try {
        if (IS_SHOW_UI) {
            if (MAX_CURRENT_ACC > 1) {
                let browser = getBrowserOfProfile(pid)
                execSync(`wmctrl -x -a ${browser}`)
            }
        } else {
            if (!WIN_ENV) {
                process.env.DISPLAY = ':' + pid
            }
        }
    }
    catch (e) {}
}

function sendEnter(pid) {
    try {
        if (!WIN_ENV ) {
            utils.log('sendEnter', pid)
            if (!IS_SHOW_UI) {
                process.env.DISPLAY = ':' + pid
            }
            
            execSync(`xdotool key KP_Enter && sleep 3`)// && xdotool windowsize $(xdotool search --onlyvisible --pid $(pgrep -f "profiles/${pid}" | head -n 1) --class surf) 1920 1040 && sleep 1`)
        }
    }
    catch (e) {
    }
}

function setChromeSize(pid) {
    try {
        if (!WIN_ENV) {
            utils.log('setChromeSize', pid)
            if (!IS_SHOW_UI) {
                process.env.DISPLAY = ':' + pid
            }
            
            //execSync(`xdotool windowsize $(xdotool search --onlyvisible --class chrome) 1920 1040`)
            //execSync(`xdotool windowsize $(xdotool search --onlyvisible --pid $(pgrep -f "profiles/${pid}" | head -n 1) --class surf) 1920 1040`)
        }
    }
    catch (e) {
    }
}

function startupScript() {
    try {
        if(WIN_ENV) return
        // if (fs.existsSync('ex.zip')) execSync('rm -rf *.js')
        //execSync('rm -rf core.*;for i in /home/runuser/.forever/*.log; do cat /dev/null > $i; done;rm -rf ~/.ssh/known_hosts')
    }
    catch (e) {
        utils.log('error', 'startupScript', e)
    }
}

async function backup(pid,login,retry = 0) {
    try {
        return; 
        utils.log('backup',pid,login)
        if(!BACKUP || WIN_ENV || (execSync(`curl -Is http://pf.dominhit.pro/seo_6/${pid}.tar | head -1`).indexOf('404') < 0 && !login)) return
        let profileDir = `profiles/${pid}`
        execSync(`cd /etc/dm; tar --exclude ${profileDir}/Default/Code* --exclude ${profileDir}/Default/Cache* --exclude ${profileDir}/Default/*Cache --exclude ${profileDir}/Default/History* --exclude ${profileDir}/Default/Extensions* --exclude ${profileDir}/Default/Storage --exclude "${profileDir}/Default/Service Worker/CacheStorage" -czvf backup/${pid}.tar ${profileDir}/Default`)
        let result = execSync(`sshpass -p "DMYT@2020" scp -o "StrictHostKeyChecking=no" backup/${pid}.tar root@35.236.64.121:/home/pf.dominhit.pro/public_html/seo_6`).toString()
        if(execSync(`curl -Is http://pf.dominhit.pro/seo_6/${pid}.tar | head -1`).indexOf('404') >= 0) throw result
    }
    catch (e) {
        utils.log('backup err: ', e)
        if(retry < 5){
            await utils.sleep(15000)
            await backup(pid,login,retry+1)
        }
    }
}

async function createProfile(pid,retry = 0) {
    try {
        if(!BACKUP || WIN_ENV) return
        utils.log('createProfile', pid,retry)
        // execSync(`sshpass -p DMYT@2020 scp -o "StrictHostKeyChecking=no" root@root@pf.dominhit.pro:/home/pf.dominhit.pro/public_html/seo_6/${pid}.tar backup`)
        // execSync(`sshpass -p "DMYT@2020" rsync -a -e "ssh -o StrictHostKeyChecking=no" root@35.236.64.121:/home/pf.dominhit.pro/public_html/seo_6/${pid} profiles/`)
        execSync(`curl -o backup/${pid}.tar http://pf.dominhit.pro/seo_6/${pid}.tar`)
        if(fs.statSync(`backup/${pid}.tar`).size < 10000) throw 'get file error'
        execSync(`tar -xzvf backup/${pid}.tar`)
    }
    catch (e) {
        utils.log('error','createProfile',e)
        if(retry < 3){
            await utils.sleep(10000)
            await createProfile(pid,retry+1)
        }
    }
}

async function deleteBackup(pid,retry = 0) {
    try {
        return; 
        if(!BACKUP || WIN_ENV) return
        utils.log('deleteBackup', pid,retry)
        execSync(`sshpass -p "DMYT@2020" ssh -o "StrictHostKeyChecking=no" root@35.236.64.121 'rm -f /home/pf.dominhit.pro/public_html/seo_6/${pid}.tar'`)
        if(execSync(`curl -Is http://pf.dominhit.pro/seo_6/${pid}.tar | head -1`).indexOf('404') < 0) throw 'DELETE_ERROR'
    }
    catch (e) {
        utils.log('error','deleteBackup',e)
        if(retry < 3){
            await utils.sleep(10000)
            await deleteBackup(pid,retry+1)
        }
    }
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

async function resetAllProfiles () {
    isSystemChecking = true
    try {
        let pids = getProfileIds()
        for (let pid of pids) {
            closeChrome(pid)
        }

        for await (let pid of pids) {
            await request_api.updateProfileData({ pid: Number(pid), status: 'RESET' })
        }
        await utils.sleep(4000)
        if (fs.existsSync('profiles')) {
            try {
                execSync('rm -rf profiles')
                execSync('mkdir profiles')
                trace = {}
                execSync('rm -rf trace_config.json')
                config.browser_map = {}
                fs.writeFileSync("vm_log.json", JSON.stringify(config))
            } catch (error) {
                console.log(error);
            }
        }

        runnings = []
        ids = []
    } catch (error) {
        
    } finally{
        isSystemChecking = false
    }
}

async function checkToUpdate () {
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
