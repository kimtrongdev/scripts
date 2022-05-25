let isRunBAT = true
let isSystemChecking = false
const TIME_REPORT = 110000
const TIME_TO_CHECK_UPDATE = 300000
const isAutoEnableReward = true
const EXPIRED_TIME = 240000
let totalRoundForChangeProxy = 5
let countRun = 0
let isPauseAction = false
let isAfterReboot = false
require('dotenv').config();
let systemConfig = {}
global.devJson = {
    hostIp: process.env.HOST_IP,
    maxProfile: Number(process.env.MAX_PROFILES) || 1,
}

let BROWSER = process.env.BROWSER == '_BROWSER_NAME' ? 'brave' : process.env.BROWSER
global.IS_SHOW_UI = Boolean(Number(process.env.SHOW_UI))
global.IS_LOG_SCREEN = Boolean(Number(process.env.LOG_SCREEN))
global.DEBUG = Boolean(Number(process.env.DEBUG))
const LOCAL_PORT = 2000
let IS_REG_USER = Boolean(Number(process.env.IS_REG_USER))
const RUNNING_CHECK_INTERVAL = IS_REG_USER ? 35000 : 20000

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

async function handleForChangeShowUI() {
    let _pids = getProfileIds()

    for await (let pid of _pids) {
        closeChrome(pid)
        await utils.sleep(2000)
    }
    await utils.sleep(2000)
    runnings = []
    ids = []
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
        isSystemChecking = true
        await handleForChangeShowUI()
        IS_SHOW_UI = newShowUIConfig

        if (IS_SHOW_UI) {
            process.env.DISPLAY = ':0'
        }

        isSystemChecking = false
    }

    let IS_REG_USER_new = (systemConfig.is_reg_user && systemConfig.is_reg_user != 'false') || 
    (systemConfig.is_ver_mail && systemConfig.is_ver_mail != 'false')
    if (IS_REG_USER != IS_REG_USER_new) {
        await resetAllProfiles()
        IS_REG_USER = IS_REG_USER_new
    }

    let newBrowser = systemConfig.browser_name || 'brave'
    if (BROWSER != newBrowser) {
        await resetAllProfiles()
        BROWSER = newBrowser
        isRunBAT = ['brave-browser', 'brave'].includes(BROWSER)
    }
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
        execSync('sudo systemctl reboot')
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

async function startChromeAction(action) {
    let widthSizes = [950, 1100, 1200]
    let positionSize = action.isNew ? 0 : utils.getRndInteger(0, 2)
    let screenWidth = widthSizes[positionSize]
    let screenHeight = 950 //action.isNew ? 950 : utils.getRndInteger(950, 1000)

    //handle userDataDir
    let userDataDir =  `--user-data-dir="${path.resolve("profiles", action.pid + '')}"`
    if (BROWSER == 'firefox') {
        userDataDir = `--profile="${path.resolve("profiles", action.pid + '')}"`
    }

    //handle browser size
    action['positionSize'] = positionSize
    action['screenWidth'] = screenWidth
    action['screenHeight'] = screenHeight
    let windowPosition = '--window-position=0,0'
    let windowSize = ` --window-size="${screenWidth},${screenHeight}"` //(IS_SHOW_UI || action.isNew) ? ` --window-size="${screenWidth},${screenHeight}"` : ' --window-size="1920,1040"'
   
    // handle proxy
    let userProxy = ''
    if (proxy && proxy[action.pid] && proxy[action.pid].server) {
        utils.log('set proxy', proxy[action.pid])
        userProxy = ` --proxy-server="${proxy[action.pid].server}" --proxy-bypass-list="random-data-api.com,localhost:2000,${ devJson.hostIp },*dominhit.pro*"`
    }
    if (proxy && proxy[action.pid] && proxy[action.pid].username) {
        utils.log('set proxy user name', proxy[action.pid].username)
        action.proxy_username = proxy[action.pid].username
        action.proxy_password = proxy[action.pid].password
    }

    // handle flag data
    action.browser_name = BROWSER
    if (isRunBAT) {
        action.isRunBAT = isRunBAT
    }

    let param = new URLSearchParams({ data: JSON.stringify(action) }).toString();
    let startPage = `http://localhost:${LOCAL_PORT}/action?` + param

    let exs = ["ex", "quality"]
    if (action.id != 'reg_user') {
        let traceName = 'trace'

        if (trace[action.pid] && systemConfig.trace_names_ex.includes(trace[action.pid])) {
            traceName = 'trace_ex/' + trace[action.pid]
        } else {
            if (systemConfig.trace_names_ex && systemConfig.trace_names_ex.length) {
                traceName = systemConfig.trace_names_ex[Math.floor(Math.random()*systemConfig.trace_names_ex.length)]
                trace[action.pid] = traceName
                traceName = 'trace_ex/' + traceName
                fs.writeFileSync("trace_config.json", JSON.stringify(trace))
            }
        }
        
        exs.push(traceName)
    }

    exs = exs.map(x => path.resolve(x)).join(",")
    if (WIN_ENV) {        
        exec(`start chrome${userProxy} --lang=en-US,en --start-maximized${userDataDir} --load-extension="${exs}" "${startPage}"`)
    }
    else {
        utils.log('startChromeAction', action.pid)
        closeChrome(action.pid)
        await utils.sleep(3000)
        utils.log('startDisplay')
        startDisplay(action.pid)
        await utils.sleep(3000)

        utils.log('start chrome', action.pid)
        if (action.id == 'login') {
            utils.log('start chrome login', action.pid)

            await createProfile(action.pid)

            setDisplay(action.pid)

            let cmdRun = `${BROWSER}${userProxy} --lang=en-US,en --disable-quic${userDataDir} --load-extension="${exs}" "${startPage}" ${windowPosition}${windowSize}`
            exec(cmdRun)
            if (BROWSER == 'microsoft-edge') {
                await utils.sleep(5000)
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
                sendEnter(action.pid)
                await utils.sleep(8000)
            }
            utils.log('process login')
        }
        else {
            setDisplay(action.pid)
            let run = `${BROWSER}${userProxy} --lang=en-US,en --disable-quic${userDataDir} --load-extension="${exs}" "${startPage}" ${windowPosition}${windowSize}`
            exec(run)
            if (IS_REG_USER) {
                await utils.sleep(10000)
                setDisplay(action.pid)
                sendEnter(action.pid)
            }
            
            await utils.sleep(8000)
        }
    }
}

async function loginProfileChrome(profile) {
    try {
        utils.log('loginProfileChrome', profile)
        let action = profile
        action.pid = profile.id
        action.id = 'login'
        action.isNew = true
        action.is_show_ui = IS_SHOW_UI

        if (isAutoEnableReward) {
            action.enableBAT = true
        }
        
        await startChromeAction(action)
    }
    catch (e) {
        utils.log('error', 'loginProfile', profile.id, e)
    }
}

async function newProfileManage() {
    try {
        if (ids.length + addnewRunnings.length >= MAX_PROFILE) return
        utils.log('newProfileManage')
        // get new profile
        let newProfile = await request_api.getNewProfile()
        utils.log('newProfile: ', newProfile)
        if (!newProfile.err && newProfile.profile) {
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

            runnings.push({pid: profile.id, lastReport: Date.now()})
            ids.push(profile.id)
            utils.log('addProfile: ', profile)
            await loginProfileChrome(profile)
        }
    }
    catch (e) {
        utils.log('newProfileManage err: ', e)
    }
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
            ids.push(pid)
        }

        try {
            let action = await getScriptData(pid, true)
            if (action && action.script_code) {
                await startChromeAction(action)
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
    } else {
        action = await request_api.getNewScript(pid)
    }

    if (action) {
        if (isNewProxy) {
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

        if (!proxy[pid] || !proxy[pid].server) {
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
        if (isRunBAT) {
            action.isRunBAT = isRunBAT
        }
        // init action data
        if(action.mobile_percent === undefined || action.mobile_percent === null){
            if (systemConfig.total_rounds_for_change_proxy) {
                totalRoundForChangeProxy = Number(systemConfig.total_rounds_for_change_proxy)
            }
            Object.assign(action, systemConfig)
    
            action.mobile_percent = systemConfig.browser_mobile_percent
            active_devices = systemConfig.active_devices || []
            if (active_devices.length) {
                action.mobile_percent = 100
            }
    
            if (systemConfig.ads_percent  && !Number(action.ads_percent)) {
                action.ads_percent = systemConfig.ads_percent
            }
    
            action.total_channel_created = Number(systemConfig.total_channel_created)
    
            if (action.id == 'watch' || action.id == 'watch_video') {
                let oldUserPosition = usersPosition.find(u => u.pid == action.pid)
                if (oldUserPosition) {
                    action.channel_position = Number(oldUserPosition.position) + 1
                    usersPosition = usersPosition.filter(u => u.pid != action.pid)
                } else {
                    action.channel_position = 0
                }
                
                action.total_loop_find_ads = systemConfig.total_loop_find_ads
                if (systemConfig.total_times_next_video && !Number(action.total_times_next_video)) {
                    action.total_times_next_video = systemConfig.total_times_next_video
                }
                if (systemConfig.watching_time_non_ads && !Number(action.watching_time_non_ads)) {
                    action.watching_time_non_ads = systemConfig.watching_time_non_ads
                }
                if (systemConfig.watching_time_start_ads && !Number(action.watching_time_start_ads)) {
                    action.watching_time_start_ads = systemConfig.watching_time_start_ads
                }
                if (systemConfig.watching_time_end_ads && !Number(action.watching_time_end_ads)) {
                    action.watching_time_end_ads = systemConfig.watching_time_end_ads
                }
    
                if (!action.playlist_url) {
                    action.playlist_url = action.data
                }
                action.playlist_data = action.playlist_url
            }
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
                utils.log('--- expired time,', pid)
                try {
                    closeChrome(pid)
                    if (IS_REG_USER) {
                        await utils.sleep(3000)
                        execSync('rm -rf profiles/'+pid)
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
        let rs = await request_api.updateVmStatus({
            vm_id: config.vm_id,
            vm_name: config.vm_name,
            running: runnings.length,
            pids
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
    checkToUpdate()
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
    await loadSystemConfig()
    console.log(' -> SYSTEM CONFIG : ', systemConfig);
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
    if (process.env.VM_NAME && process.env.VM_NAME != '_VM_NAME') {
        config.vm_name = process.env.VM_NAME
    } else {
        config.vm_name = 'DEFAULT_PC'
    }

    if (!config.vm_id) {
        config.vm_id = makeid(9)
    }

    fs.writeFileSync("vm_log.json", JSON.stringify(config))

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

    app.get('/debug', (req, res) => {
        isPauseAction = true
        res.send({ rs: 'ok' })
        return
    })

    app.get('/get-phone', async (req, res) => {
        let rs = await request_api.getPhone()
        res.send(rs)
        return
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
            res.send({ rs: 'ok' })
            return
        }
        utils.log(req.query)

        if (req.query.id == 'total_created_channel') {
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
            await request_api.reportScript(req.query.pid, req.query.service_id)
            if ([1, '1', 'true', true].includes(req.query.isBreak)) {
               // execSync(`xdotool key Control_L+w && sleep 1`)
                // browser will closed by background extention
                runnings = runnings.filter(i => i.pid != req.query.pid)
            } else {
                let action = await getScriptData(req.query.pid)
                runnings.forEach(running => {
                    if (running.pid == req.query.pid) {
                        running.lastReport = Date.now()
                    }
                });
                return res.json(action)
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
        }
        else if (req.query.id == 'watched'){
            runnings.forEach(running => {
                if (running.pid == req.query.pid) {
                    running.lastReport = Date.now()
                }
            });
            request_api.updateWatchedVideo(req.query.pid, req.query.viewedAds)
        }
        else if (req.query.id == 'login' || req.query.id == 'reg_user') {
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'login success')
                request_api.updateProfileData({ pid: req.query.pid, status: 'SYNCED' })
            }
            else {
                utils.log(req.query.pid, 'login error', req.query.msg)
                request_api.updateProfileData({ pid: req.query.pid, status: 'ERROR', description: req.query.msg })
            }
            execSync(`xdotool key Control_L+Shift+w && sleep 2`)
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
        if (isPauseAction) {
            res.send({ rs: 'ok' })
            return
        }
        utils.log(req.query)
        addnewRunnings = addnewRunnings.map(x => {
            if (x.pid == req.query.pid) {
                x.lastReport = Date.now()
            }
            return x
        })
        

        if (process.platform === "win32") {
            // copy str
            if(req.query.str){
                const clipboardy = require('clipboardy');
                clipboardy.writeSync(req.query.str)
            }
            if(req.query.action == 'OPEN_MOBILE') req.query.x = 150 + 24*(req.query.pid % 4)
            execSync(`input ${req.query.action} ${req.query.x} ${req.query.y} "${req.query.str}"`)
        }
        else {
            setDisplay(req.query.pid)
            // copy str
            if(req.query.str){
                const clipboardy = require('clipboardy');
                clipboardy.writeSync(req.query.str)
            }

            if (req.query.action == 'CLOSE_BROWSER') {
                execSync(`xdotool key Control_L+w && sleep 1`)
            }
            else if (req.query.action == 'SHOW_BRAVE_ADS') {
                execSync(`xdotool key Shift+Tab && sleep 1`)
                execSync(`xdotool key Shift+Tab && sleep 1`)
                execSync(`xdotool key KP_Enter && sleep 1`)
            }
            else if (req.query.action == 'COPY_BAT') {
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
                        let braveInfo = await request_api.getBraveInfo(req.query.pid)
                        if (braveInfo) {
                            if (braveInfo.total_bat) {
                                if (!braveInfo.is_disabled_ads) {
                                    if (braveInfo.total_bat == currentBat) {
                                        request_api.updateProfileData({ is_disabled_ads: true, pid: req.query.pid, count_brave_rounds: 0 })
                                        request_api.getProfileProxy(req.query.pid, PLAYLIST_ACTION.WATCH, true)
                                        return res.send({ disable_ads: true })
                                    }
                                } else {
                                    if (braveInfo.count_brave_rounds >= braveInfo.brave_replay_ads_rounds) {
                                        request_api.updateProfileData({ is_disabled_ads: false, pid: req.query.pid })
                                        return res.send({ enable_ads: true })
                                    }
                                }
                            }
                        }
                        request_api.updateProfileData({ total_bat: currentBat, pid: req.query.pid, '$inc': { count_brave_rounds: 1 } })
                    } catch (error) {
                      utils.log(error)
                    }
                }
            }
            else if (req.query.action == 'ESC') {
                execSync(`xdotool key Escape && sleep 0.5`)
            }
            else if (req.query.action == 'GO_TO_FISRT_TAB') {
                execSync(`xdotool key Control_L+1 && sleep 1`)
            }
            else if (req.query.action == 'DOUBLE_CLICK') {
                execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click 1 && xdotool click 1 && sleep 1`)
            }
            else if (req.query.action == 'NEW_TAB') {
                execSync(`xdotool key Control_L+t && sleep 1`)
            } else if (req.query.action == 'RELOAD_PAGE') {
                execSync(`xdotool key F5 && sleep 1`)
            } else if (req.query.action == 'END_SCRIPT') {
                execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click 1 && sleep 1`)
                await utils.sleep(5000)
                runnings = runnings.filter(i => i.pid != req.query.pid)
            }

            if (req.query.action == 'GO_ADDRESS' || req.query.action == 'OPEN_DEV') setChromeSize(req.query.pid)
            // execSync(`xdotool windowactivate $(xdotool search --onlyvisible --pid $(pgrep chrome | head -n 1)) && sleep 1`)
            if (req.query.action == 'CLICK') {
                if (req.query.x > 65) {
                    execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click 1 && sleep 1`)
                }
            }
            if (req.query.action == 'TYPE') {
                execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click --repeat 3 1 && sleep 1 && xdotool key Control_L+v && sleep 1`)
            }
            else if (req.query.action == 'TYPE_ENTER') {
                execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click --repeat 3 1 && sleep 1 && xdotool key Control_L+v && sleep 3 && xdotool key KP_Enter && sleep 1`)
            }
            else if (req.query.action == 'ONLY_TYPE_ENTER') {
                execSync(`xdotool key Control_L+v && sleep 3 && xdotool key KP_Enter && sleep 1`)
            }
            else if (req.query.action == 'CLICK_ENTER') {
                execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click 1 && sleep 1 && xdotool key KP_Enter && sleep 1`)
            }
            else if (req.query.action == 'NEXT_VIDEO') {
                execSync(`xdotool key Shift+n && sleep 1`)
            }
            else if (req.query.action == 'SCROLL') {
                if (req.query.str == 6) {
                    execSync(`xdotool key Shift+Tab && sleep 1`)
                    execSync(`xdotool key Page_Down && sleep 1`)
                } else {
                    if (req.query.str > 0) {
                        let pageNumber = Math.ceil(req.query.str / 5)
                        while (pageNumber > 0) {
                            execSync(`xdotool key Page_Down && sleep 1`)
                            pageNumber--
                        }
                    }
                    else {
                        let pageNumber = Math.ceil(req.query.str / -5)
                        while (pageNumber > 0) {
                            execSync(`xdotool key Page_Up && sleep 1`)
                            pageNumber--
                        }
                    }
                }
            }
            else if (req.query.action == 'SEND_KEY') {
                execSync(`xdotool type ${req.query.str}`)
            }
            else if (req.query.action == 'GO_ADDRESS') {
                execSync(`xdotool key Escape && sleep 0.5 && xdotool key Control_L+l && sleep 0.5 && xdotool type "${req.query.str}" && sleep 0.5 && xdotool key KP_Enter`)
            }
            else if (req.query.action == 'OPEN_DEV') {
                execSync(`sleep 3;xdotool key Control_L+Shift+i;sleep 7;xdotool key Control_L+Shift+p;sleep 3;xdotool type "bottom";sleep 3;xdotool key KP_Enter`)
            }
            else if (req.query.action == 'OPEN_MOBILE') {
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
                let devicePo = Number(active_devices[Number(req.query.pid) % active_devices.length])
                devicePo -= 1
                execSync(`xdotool key Control_L+Shift+m;sleep 2;xdotool mousemove 855 90;sleep 1;xdotool click 1;sleep 1;xdotool mousemove 855 ${150 + 24 * devicePo};sleep 1;xdotool click 1;sleep 1`)
            }
            else if (req.query.action == 'OPEN_MOBILE_CUSTOM') {
                utils.log('add custom mobile')
                execSync(`xdotool key Control_L+Shift+m;sleep 2;xdotool key Control_L+Shift+p;sleep 1;xdotool type "show devices";sleep 1;xdotool key KP_Enter;sleep 1;xdotool key KP_Enter;xdotool type "custom";xdotool key Tab;xdotool type ${req.query.x};xdotool key Tab;xdotool type ${req.query.y};xdotool key Tab;xdotool key Tab;xdotool key Control_L+v;xdotool key Tab;xdotool key Tab;xdotool key KP_Enter;xdotool key Escape;xdotool mousemove 855 90;sleep 1;xdotool click 1;sleep 1;xdotool mousemove 855 150;sleep 1;xdotool click 1;sleep 1`)
            }
            else if (req.query.action == 'REOPEN_MOBILE_CUSTOM') {
                utils.log('add custom mobile')
                execSync(`sleep 2;xdotool key Control_L+Shift+p;sleep 1;xdotool type "show devices";sleep 1;xdotool key KP_Enter;sleep 1;xdotool key KP_Enter;xdotool type "custom";xdotool key Tab;xdotool type ${req.query.x};xdotool key Tab;xdotool type ${req.query.y};xdotool key Tab;xdotool key Tab;xdotool key Control_L+v;xdotool key Tab;xdotool key Tab;xdotool key KP_Enter;xdotool key Escape;xdotool mousemove 855 90;sleep 1;xdotool click 1;sleep 1;xdotool mousemove 855 150;sleep 1;xdotool click 1;sleep 1`)
            }
            else if (req.query.action == 'SELECT_MOBILE') {
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
                let devicePo = Number(active_devices[Number(req.query.pid) % active_devices.length])
                devicePo -= 1
                execSync(`xdotool mousemove 855 90;sleep 0.5;xdotool click 1;sleep 1;xdotool mousemove 855 ${150 + 24 * devicePo};sleep 0.5;xdotool click 1;sleep 1`)
            }
            else if (req.query.action == 'SELECT_MOBILE_CUSTOM') {
                utils.log('open mobile simulator')
                execSync(`xdotool mousemove 855 90;sleep 0.5;xdotool click 1;sleep 1;xdotool mousemove 855 150;sleep 0.5;xdotool click 1;sleep 1`)
            }
            else if (req.query.action == 'SHOW_PAGE') {
                execSync(`xdotool key Control_L+Shift+p;sleep 0.5;xdotool type "elements";sleep 0.5;xdotool key KP_Enter;sleep 0.5;xdotool key Control_L+Shift+p;sleep 0.5;xdotool type "search";sleep 0.5;xdotool key KP_Enter`)
            }
            else if (req.query.action == 'SELECT_OPTION') {
                execSync(`xdotool key Page_Up && sleep 1`)
                for(let i = 0; i < req.query.str*1; i++){
                    execSync(`xdotool key Down && sleep 0.2`)
                }
                execSync(`xdotool key KP_Enter`)
            }
            else if (req.query.action == 'SCREENSHOT') {
                utils.errorScreenshot(req.query.pid + '_input')
            }
            utils.screenshot(req.query.pid + '_input')
            if (addnewRunnings.filter(x => x.pid == req.query.pid).length) utils.errorScreenshot(req.query.pid + '_login')
        }
        res.send({ rs: 'ok' })
    })

    app.listen(LOCAL_PORT, () => {
        utils.log('start app on', LOCAL_PORT)
    })
}

function removePidAddnew(pid, status) {
    try {
        utils.log('removePidAddnew', pid, status)
        runnings = runnings.filter(x => x.pid != pid)
        if (status != 1 || IS_REG_USER) {
            // login error
            deleteProfile(pid)
        }
        else {
            // login success
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
    try {
        stopDisplay(pid)
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
                execSync(`pkill ${BROWSER}`)
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
        if (!WIN_ENV && !IS_SHOW_UI) {
            process.env.DISPLAY = ':' + pid
        }
    }
    catch (e) {
    }
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
