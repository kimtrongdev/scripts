const useProxy = false
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
let addresses = []
require('dotenv').config();
let systemConfig = {}
global.devJson = {
    hostIp: '',
    maxProfile: 1,
}

global.IS_SHOW_UI = null
global.IS_LOG_SCREEN = false
global.DEBUG = true
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
const utils = {
    ACTION: {
        WATCH: 0,
        WATCH_TO_SUB: 1,
        SUB: 2,
        ADD_NEW: 3
    },
    getRndInteger: (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    log: (...pr) => {
        if (DEBUG) {
            console.log(...pr)
        }
    },
    randomRanger: function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    },
    sleep: function(ms) {
        return new Promise(resolve => setTimeout(function () {
            resolve('ok')
        }, ms));
    },
    shuffleArray: function (array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array
    }
}
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
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

async function loadSystemConfig () {
    let rs = {
        ads_percent: 100,
        max_total_profiles: '1',
        max_total_profiles_mobile: 1,
        playlists: 'v=lyn35tXuGv0&list=PLc21mL3vVoTtSkMQ2vecMUCFNiHx_RAzt',
        total_channel_created: 20,
        total_loop_find_ads: '0',
        sub_percent: '0',
        brave_replay_ads_rounds: 2,
        brave_view_news_count: 1,
        total_rounds_for_change_proxy: 5,
        reset_system_time: '1',
        max_current_profiles: '1',
        browsers: [ 'brave-browser' ],
        is_setting_brave: true,
        new_account_type: 'gmail',
        zone_name: 'rd',
        fb_verify_type: 'rd',
        auto_renew_proxy: true,
        total_page_created: '3',
        renew_for_suspend: true,
        allow_verify: true,
        trace_names_ex: [],
        is_stop: false
    }
      
    if (rs && !rs.error) {
        systemConfig = rs
    }
    
    if (Number(systemConfig.max_current_profiles)) {
        MAX_CURRENT_ACC = Number(systemConfig.max_current_profiles)
    }

    if (systemConfig.max_total_profiles) {
        MAX_PROFILE = DEBUG ? 1 : MAX_CURRENT_ACC * Number(systemConfig.max_total_profiles)
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
    (systemConfig.is_recovery_mail && systemConfig.is_recovery_mail != 'false')
    if (IS_REG_USER_new != undefined && IS_REG_USER != IS_REG_USER_new) {
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

    if (DEBUG) {
        systemConfig.is_stop = false
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

    // handle flag data
    action.browser_name = _browser
    if (isRunBAT) {
        action.isRunBAT = isRunBAT
    }

    let exs = ["ex"]
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

        let newProfile = {
            profile: {
                id: Date.now(),
                pid: Date.now(),
            }
        }

        utils.log('newProfile: ', newProfile)
        if (!newProfile.err && newProfile.profile) {
            RUNNING_CHECK_INTERVAL = ROOT_RUNNING_CHECK_INTERVAL
            // copy main to clone profile
            let profile = newProfile.profile

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
            if (!action || action.not_found || !action.script_code) {
                await utils.sleep(5000)
                runnings = runnings.filter(i => i.pid != pid)
            }
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
    action = {
        link: 'https://www.youtube.com/watch?v=c5jGtB-APko',
        script_code: 'direct_link',
        _id: '643d747a86f7409240fded12',
        is_break: true,
        success: true
    }

    if (action) {
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
        action.os_vm = process.env.OS
        if (isRunBAT) {
            action.isRunBAT = isRunBAT
        }
        if (systemConfig.is_fb) {
            action.is_fb = true
        }
        // init action data
        if(action.mobile_percent === undefined || action.mobile_percent === null){
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
    
            if (systemConfig.ads_percent  && !Number(action.ads_percent)) {
                action.ads_percent = systemConfig.ads_percent
            }
    
            action.total_channel_created = Number(systemConfig.total_channel_created)
    
            if (['youtube_sub', 'watch', 'watch_video', 'comment_youtube', 'like_fb_page', 'like_fb_post'].includes(action.id)) {
                let oldUserPosition = usersPosition.find(u => u.pid == action.pid)
                if (oldUserPosition) {
                    action.channel_position = Number(oldUserPosition.position)
                } else {
                    action.channel_position = -1
                }
            }

            if (action.id == 'watch' || action.id == 'watch_video') {
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
        let rs = false

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

async function start() {
    try {
        
        if (updateFlag && updateFlag.updating) {
            isAfterReboot = true
            execSync('rm -rf update_flag.json')
            await utils.sleep(180000)
        }
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

    app.get('/login', (req, res) => {
        utils.log(req.query)
        if (req.query.status == 1) {
            utils.log(req.query.pid, 'login success')
        }
        else {
            utils.log(req.query.pid, 'login error', req.query.msg)
        }
        removePidAddnew(req.query.pid, req.query.status)

        res.send({ rs: 'ok' })
    })

    app.get('/report', async (req, res) => {
        if (isPauseAction) {
            //res.send({ rs: 'ok' })
            return
        }
        utils.log(req.query)

        if (req.query.id == 'live_report') {
            runnings.forEach(running => {
                if (running.pid == req.query.pid) {
                    running.lastReport = Date.now()
                }
            });
        }
        else if (req.query.isScriptReport) {
            if ([1, '1', 'true', true].includes(req.query.isBreak)) {
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
        else if ((req.query.report_error_profile && req.query.report_error_profile != 'false') || req.query.id == 'login' || req.query.id == 'reg_user' || req.query.id == 'check_mail_1'|| req.query.id == 'recovery_mail') {
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'login success')
                if (req.query.id == 'reg_user') {
                } else {
                    let params = { pid: req.query.pid, status: 'SYNCED' }
                    if (systemConfig.is_fb) {
                        params.proxy_server = proxy[req.query.pid].server
                    }
                }
            }
            else {
            }
            removePidAddnew(req.query.pid, req.query.status)
        }

        if (req.query.msg && req.query.msg == 'NOT_LOGIN') {
            utils.log('error', req.query.pid, 'NOT_LOGIN')
            deleteProfile(req.query.pid)
            ids = ids.filter(x => x != req.query.pid)
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
    
    if (actionData.action == 'OPEN_BROWSER') {
        await startChromeAction(actionData.data, actionData.browser)
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
    
    else if (actionData.action == 'ONLY_TYPE_ENTER') {
        execSync(`xdotool key Control_L+v && sleep 3 && xdotool key KP_Enter && sleep 1`)
    }
    else if (actionData.action == 'CLICK_ENTER') {
        execSync(`xdotool mousemove ${actionData.x} ${actionData.y} && sleep 1 && xdotool click 1 && sleep 1 && xdotool key KP_Enter && sleep 1`)
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

start()
