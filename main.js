// config file
const TIME_REPORT = 110000
require('log-timestamp')
const utils = require('./utils')
const execSync = require('child_process').execSync;
const exec = require('child_process').exec;
let config
const BROWSER = 'google-chrome'
try {
    config = require('./config.json')
}
catch (e) {
    config = { }
}
let devJson = {
    "hostIp": "3.93.238.219:5000",
    "maxProfile" : 1,
    "isShowUI": false,
    "debug": false,
}

try {
    devJson = require('./dev.json')
} catch (error) {
    utils.log('Error while load dev config file')
}
global.DEBUG = devJson.debug

const request_api = require('./request_api')
global.workingDir = getScriptDir()
const path = require('path')
const del = require('del');
const fs = require('fs')
const version = fs.readFileSync(path.join(__dirname, 'version'), 'utf8')
const publicIp = require('public-ip');
const os = require('os');
const DOCKER = process.platform === "win32" ? false : execSync('cat /proc/1/cgroup | grep docker | wc -l').toString().split('\n')[0] > 0

const MAX_CURRENT_ACC_CAL = process.platform === "win32" ? 1 : process.env.MAX_PROFILE ? process.env.MAX_PROFILE : Math.min(DOCKER ? 4 : 100, Math.ceil(os.totalmem() / (600 * 1024 * 1024)))
const MAX_PROFILE_CAL = process.platform === "win32" ? 1 : process.env.MAX_PROFILE ? process.env.MAX_PROFILE : Math.min(DOCKER ? 4 : 100, Math.ceil(os.totalmem() / (600 * 1024 * 1024)))

const MAX_PROFILE_TOTAL = devJson.maxProfile > 1 ? devJson.maxProfile : 1;
let MAX_CURRENT_ACC = Number(devJson.maxProfile) //MAX_CURRENT_ACC_CAL > MAX_PROFILE_TOTAL ? MAX_PROFILE_TOTAL : MAX_CURRENT_ACC_CAL;
let MAX_PROFILE = MAX_CURRENT_ACC * 3 //MAX_PROFILE_CAL > MAX_PROFILE_TOTAL ? MAX_PROFILE_TOTAL : MAX_PROFILE_CAL;

const RUNNING_CHECK_INTERVAL = 20000     // 30 seconds
const MAX_REPORT_TIME = 150000           // 5 minutes
const MAX_SUB_RUNNING_TIME = 600000     // 10 minutes
const MAX_ADDNEW_TIME = 600000           // 10 minutes
const UPDATE_CHECK_TIME = 180000
let ids = []
global.usersPosition = []
global.subRunnings = []
global.watchRunnings = []
global.addnewRunnings = []
global.processRunning = []
global.proxy = null
global.gui = false
global.WIN_ENV = process.platform === "win32"
global.IS_LOG_SCREEN = false
global.is_show_ui = devJson.isShowUI
global.fisrt_video = 0
global.active_devices = []
global.channelInfo = []
let BACKUP = false
let CUSTOM = false
PR = [530810, 'abandondata7577@gmail.com', '8BTQ651e8cis', 'nCQFX4wh8340lzr@hotmail.com']

const PLAYLIST_ACTION = {
    WATCH: 0,
    WATCH_TO_SUB: 1,
    SUB: 2
}
const ADDNEW_ACTION = 3
const CONFIRM_ACTION = 4
const LOCAL_PORT = 2000

function getProfileIds() {
    return new Promise((resolve, reject) => {
        let directoryPath = path.resolve("profiles")
        fs.readdir(directoryPath, function (err, files) {
            if (err) reject(err)
            // else resolve(files.map(x => {return {id: x, time : 0}}))    // mapping add time field for computing reading for resume
            else resolve(files)    // mapping add time field for computing reading for resume
        })
    })
}

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

  
async function startChromeAction(action) {
    let userProxy = ''
    let windowPosition = '--window-position=0,0'
    let windowSize = is_show_ui ? ' --window-size="2348,1288"' : ' --window-size="1920,1040"'
    if (proxy && proxy[action.pid]) {
        utils.log('set proxy', proxy[action.pid])
        userProxy = ` --proxy-server="${proxy[action.pid].server}" --proxy-bypass-list="localhost:2000,${ devJson.hostIp },*dominhit.pro*"`
        action.proxy_username = proxy[action.pid].username
        action.proxy_password = proxy[action.pid].password
    }

    if (CUSTOM){
        let profile = await request_api.getProfile(action.pid)
        if(profile.err) throw `GET_PROFILE_ERROR`
        let hashCode = s => s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0)
        let hashPid = hashCode(profile.profile.email)
        hashPid = hashPid > 0 ? hashPid : -hashPid
        utils.log('hashPid',hashPid)
        let nav = await request_api.getNavigator(hashPid,'Android','Chrome')
        if(nav && nav.screen){
            action.userAgent = nav.navigator.userAgent
            action.availHeight = nav.screen.availHeight
            action.availWidth = nav.screen.availWidth
        }
    }

    action.backup = BACKUP

    // kien code
    if(action.mobile_percent === undefined || action.mobile_percent === null){
        let systemConfig = await request_api.getSystemConfig();
        utils.log('systemConfig', systemConfig);
        action.mobile_percent = systemConfig.browser_mobile_percent
        active_devices = systemConfig.active_devices || []
        if (active_devices.length) {
            action.mobile_percent = 100
        }

        if (systemConfig.ads_percent  && !Number(action.ads_percent)) {
            action.ads_percent = systemConfig.ads_percent
        }

        if (systemConfig.max_total_profiles) {
            MAX_PROFILE = MAX_CURRENT_ACC * Number(systemConfig.max_total_profiles)
        }

        action.total_channel_created = Number(systemConfig.total_channel_created)

        if (action.id == 'watch') {
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

            action.playlist_data = action.playlist_url
        }
    }

    if (fisrt_video < 3 && action.id != 'login') {
        if (fisrt_video === 0) {
            action.delete_history = true
        }
        action.direct_percent = 1000
        fisrt_video = fisrt_video + 1
    }

    let param = new URLSearchParams({ data: JSON.stringify(action) }).toString();
    let startPage = `http://localhost:${LOCAL_PORT}/action?` + param

    let exs = action.pid % 10 < 10 ? ["ex", "quality"].map(x => path.resolve(x)).join(",") : ["ex", "quality", "trace"].map(x => path.resolve(x)).join(",")

    if (WIN_ENV) {        
        exec(`start chrome${userProxy} --lang=en-US,en --start-maximized --user-data-dir="${path.resolve("profiles", action.pid + '')}" --load-extension="${exs}" "${startPage}"`)
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

            let cmdRun = `${BROWSER}${userProxy} --lang=en-US,en --disable-quic --user-data-dir="${path.resolve("profiles", action.pid + '')}" --load-extension="${exs}" "${startPage}" ${windowPosition}${windowSize}`
            exec(cmdRun)
            if (BROWSER == 'microsoft-edge') {
                await utils.sleep(5000)
                closeChrome(action.pid)
                await utils.sleep(2000)
                exec(cmdRun)
            } else {
                await utils.sleep(5000)
                // enter for asking default
                sendEnter(action.pid)
                await utils.sleep(8000)
            }

            // setChromeSize(action.pid)
            utils.log('process login')
        }
        else {
            setDisplay(action.pid)
            exec(`${BROWSER}${userProxy} --lang=en-US,en --disable-quic --user-data-dir="${path.resolve("profiles", action.pid + '')}" --load-extension="${exs}" "${startPage}" ${windowPosition}${windowSize}`)
            await utils.sleep(8000)
        }
        // if (fs.existsSync('ex.zip')) execSync('rm -rf ex quality')
    }
}

async function loginProfileChrome(profile) {
    try {
        utils.log('loginProfileChrome', profile)
        let action = profile
        action.pid = profile.id
        action.id = 'login'

        // if (!fs.existsSync(path.resolve('profiles',action.pid+''))){
        //     fs.mkdirSync(path.resolve('profiles',action.pid+''));
        // }

        await startChromeAction(action)
    }
    catch (e) {
        utils.log('error', 'loginProfile', profile.id, e)
    }
}

async function pauseWatchingProfile(pid, action) {
    try {
        utils.log('pauseWatchingProfile: ', pid)

        let removeWatch = null
        if(action == PLAYLIST_ACTION.SUB && subRunnings.filter(x => x.pid == pid).length) return false
        if(action == ADDNEW_ACTION && addnewRunnings.filter(x => x.pid == pid).length) return false

        if (action < PLAYLIST_ACTION.SUB) {
            if (addnewRunnings.filter(x => x.pid == pid).length || subRunnings.filter(x => x.pid == pid).length || watchRunnings.filter(x => x.pid == pid && x.action >= action).length) {
                utils.log('warning', 'pid: ', pid, ' is in addnewRunnings/subRunnings/watchRunnings')
                return false
            }
            if (addnewRunnings.length + subRunnings.length + watchRunnings.filter(x => x.action >= action).length >= MAX_CURRENT_ACC) {
                utils.log('info', 'pid: ', pid, ' cannot run, MAX_CURRENT_ACC')
                return false
            }
        }

        // stop watching own pid if has
        let ownRunnings = watchRunnings.filter(x => x.pid == pid && x.action < action)
        if (ownRunnings.length) {
            utils.log('remove own running: ', pid)
            removeWatch = ownRunnings[0]
        }
        else if (addnewRunnings.length + subRunnings.length + watchRunnings.length >= MAX_CURRENT_ACC) {
            let tempRun = watchRunnings.slice()
            tempRun.sort(function (a, b) {
                return a.action - b.action
            })
            utils.log('running by order: ', tempRun.map(x => { return { pid: x.pid, action: x.action } }))
            // remove lowest running by action
            removeWatch = tempRun.shift()
        }

        if (removeWatch) {
            utils.log('remove pid: ', removeWatch.pid, ' action: ', removeWatch.action, ' for pid: ', pid, ' action: ', action)
            watchRunnings = watchRunnings.filter(x => x.pid != removeWatch.pid)
            // close watching browser
            closeChrome(pid)
        }

        // check login
        // if(action < ADDNEW_ACTION && !await reLogin(pid)){
        //     return false
        // }

        // start new browser
        // let browser = await newBrowser(pid, action)
        let browser = true

        let startTime = Date.now()
        let actionRecord = { pid: pid, start: startTime, lastReport: startTime, browser: browser, action: action }
        if (action == ADDNEW_ACTION) {
            addnewRunnings.push(actionRecord)
        }
        else if (action == PLAYLIST_ACTION.SUB) {
            subRunnings.push(actionRecord)
        }
        else {
            actionRecord.playlist = {}
            actionRecord.playlistTime = {}
            watchRunnings.push(actionRecord)
        }

        return browser
    }
    catch (e) {
        utils.log('error', 'pauseWatchingProfile err: ', e)
        return false
    }
}

async function newProfileManage() {
    try {
        if (ids.length + addnewRunnings.length >= MAX_PROFILE) return
        utils.log('newProfileManage')
        // get new profile
        let newProfile = await request_api.getNewProfile()
        // if(WIN_ENV) newProfile = {profile: {id: 130, email: 'drybattle8386@gmail.com', password: 'drybattle9177', recover_mail: 'drybattle4856@gmx.com'}}
        // if(WIN_ENV) newProfile = {profile: {id: PR[0], email: PR[1], password: PR[2], recover_mail: PR[3]}}
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

            let browser = await pauseWatchingProfile(profile.id, ADDNEW_ACTION)
            if (browser) {
                utils.log('addProfile: ', profile)
                // login for profile
                // loginProfile(profile, browser)
                await loginProfileChrome(profile)
            }
            else {
                await request_api.updateProfileStatus(profile.id, config.vm_id, 'NEW')
                await deleteProfile(profile.id)
            }
        }
    }
    catch (e) {
        utils.log('newProfileManage err: ', e)
    }
}

async function checkSubRunningProfile() {
    try {
        utils.log('checkSubRunningProfile')
        let subRunningLength = subRunnings.length
        for (let i = 0; i < subRunningLength; i++) {
            // calculate last report time
            let timeDiff = Date.now() - subRunnings[i].lastReport
            if (timeDiff > MAX_SUB_RUNNING_TIME) {
                let pid = subRunnings[i].pid
                try {
                    utils.log('error', 'pid: ', pid, ' runningTime exceed ', MAX_SUB_RUNNING_TIME)
                    closeChrome(pid)
                }
                catch (e) {
                    utils.log('checkSubRunningProfile release err: ', e)
                }
                finally {
                    // delete in sub running queue
                    subRunnings = subRunnings.filter(x => x.pid != pid)
                    subRunningLength -= 1
                    i -= 1
                    utils.log('checkSubRunningProfile subRunnings: ', subRunnings.length)
                }
            }
        }
    }
    catch (e) {
        utils.log('checkSubRunningProfile err: ', e)
    }
}

async function checkAddNewRunningProfile() {
    try {
        utils.log('checkAddNewRunningProfile')
        let addnewRunningLength = addnewRunnings.length
        for (let i = 0; i < addnewRunningLength; i++) {
            // calculate last report time
            let timeDiff = Date.now() - addnewRunnings[i].lastReport
            if (timeDiff > MAX_ADDNEW_TIME) {
                let pid = addnewRunnings[i].pid
                try {
                    utils.log('error', 'pid: ', pid, ' addingTime exceed ', MAX_ADDNEW_TIME)
                    // delete profile in system
                    await deleteProfile(pid)
                    closeChrome(pid)
                }
                catch (e) {
                    utils.log('checkAddNewRunningProfile release err:', e)
                }
                finally {
                    // delete in add new running queue
                    addnewRunnings = addnewRunnings.filter(x => x.pid != pid)
                    addnewRunningLength -= 1
                    i -= 1
                    utils.log('addnewRunnings: ', addnewRunnings)
                }
            }
        }
    }
    catch (e) {
        utils.log('checkAddNewRunningProfile err: ', e)
    }
}

async function checkWatchingProfile() {
    try {
        utils.log('checkWatchingProfile: ', watchRunnings.length)
        let watchingLength = watchRunnings.length
        for (let i = 0; i < watchingLength; i++) {
            // calculate last report time
            let timeDiff = Date.now() - watchRunnings[i].lastReport
            if (timeDiff > MAX_REPORT_TIME) {
                let pid = watchRunnings[i].pid
                try {
                    utils.log('error', 'pid: ', pid, ' lastReport exceed ', MAX_REPORT_TIME)
                    closeChrome(pid)
                }
                catch (e) {
                    utils.log('error', 'checkWatchingProfile release err: ', e)
                }
                finally {
                    // delete in watching queue
                    watchRunnings = watchRunnings.filter(x => x.pid != pid)
                    watchingLength -= 1
                    i -= 1
                    utils.log('checkWatchingProfile watchRunnings: ', watchRunnings.length)
                }
            }
        }
    }
    catch (e) {
        utils.log('error', 'checkWatchingProfile err: ', e, ' watchRunnings: ', watchRunnings)
    }
}

async function newRunProfile() {
    utils.log('ids: ', ids)
    let pid = ids.shift()
    if (pid) {
        ids.push(pid)
        try {
            utils.log('check sub or run for profile: ', pid)
            utils.log('watchRunnings: ', watchRunnings.length)

            try {
                let rs = await request_api.getYTVideo(pid)
                let playlist = rs.playlist
                utils.log(pid, 'playlist', rs.playlist)
                if (playlist) {
                    if (!proxy) {
                        proxy = {}
                    }
                    proxy[pid] = await request_api.getProfileProxy(pid, PLAYLIST_ACTION.WATCH)
                    utils.log('pid', pid, 'proxy', proxy[pid])
                    if (!proxy[pid]) {
                        utils.log('error', 'pid:', pid, 'get proxy:', proxy[pid])
                        throw 'no proxy'
                    }
                    
                    let action = playlist
                    action.pid = pid
                    action.video = ''
                    action.id = 'watch'
                    utils.log(pid, action)

                    let startTime = Date.now()
                    let actionRecord = { pid: pid, start: startTime, lastReport: startTime, browser: true, action: 'watch' }
                    if (action == ADDNEW_ACTION) {
                        addnewRunnings.push(actionRecord)
                    } else {
                        actionRecord.playlist = {}
                        actionRecord.playlistTime = {}
                        watchRunnings.push(actionRecord)
                    }

                    await startChromeAction(action)
                }
                else {
                    watchRunnings = watchRunnings.filter(x => x.pid != pid)
                }
            }
            catch (e) {
                utils.log('pid: ', pid, ' reading err: ', e)
                watchRunnings = watchRunnings.filter(x => x.pid != pid)
            }
        }
        catch (e) {
            utils.log('error', 'pid: ', pid, ' subProfile err: ', e)
        }
    }
}
async function runProfile() {
    // get sub channel for profile
    utils.log('ids: ', ids)
    let pid = ids.shift()
    if (pid) {
        ids.push(pid)
        try {
            utils.log('check sub or run for profile: ', pid)
            utils.log('watchRunnings: ', watchRunnings.length)

            let channels = await request_api.getSubChannels(pid, config.vm_id, proxy ? true : false)
            utils.log('pid: ', pid, ' getSubChannels: ', channels)
            // if(WIN_ENV) if(watchRunnings.filter(x => x.pid == pid).length == 0) {channels = {err: 'CHECKCOUNTRY'} }else {channels = {action: 0, channels: []}}
            if (!channels.err) {
                if (proxy) {
                    proxy[pid] = await request_api.getProfileProxy(pid, PLAYLIST_ACTION.WATCH)
                    utils.log('pid', pid, 'proxy', proxy[pid])
                    if (!proxy[pid]) {
                        utils.log('error', 'pid:', pid, 'get proxy:', proxy[pid])
                        throw 'no proxy'
                    }
                }
                if (channels.channels.length) {
                    // pause watching
                    let browser = await pauseWatchingProfile(pid, channels.action)
                    try {
                        if (browser) {
                            let action = {}
                            action.pid = pid
                            action.id = 'sub'
                            action.vmId = config.vm_id
                            action.channels = channels.channels
                            utils.log(pid, action)
                            await startChromeAction(action)
                        }
                        else {
                            // report error
                            for (let i = 0; i < channels.channels.length; i++) {
                                request_api.subStatusReport(pid, channels.channels[i].channel_id, -1, null, null, null, 'pauseWatchingProfile timeout')
                            }
                        }
                    }
                    catch (e) {
                        utils.log('error', pid, 'sub', e)
                        subRunnings = subRunnings.filter(x => x.pid != pid)
                    }
                }
                else {
                    // pause watching
                    let browser = await pauseWatchingProfile(pid, channels.action)
                    if (browser) {
                        try {
                            let playlist = await request_api.getPlaylist(pid, channels.action)
                            utils.log(pid, 'playlist', playlist)

                            if (playlist && !playlist.err && playlist.playlist.length) {
                                let action = playlist.playlist[0]
                                action.pid = pid
                                action.id = 'watch'
                                action.keyword = playlist.keyword && playlist.keyword.length ? playlist.keyword[0] : undefined
                                // if(WIN_ENV) action.page_watch = 99
                                utils.log(pid, action)
                                await startChromeAction(action)
                            }
                            else {
                                watchRunnings = watchRunnings.filter(x => x.pid != pid)
                            }
                        }
                        catch (e) {
                            utils.log('pid: ', pid, ' reading err: ', e)
                            watchRunnings = watchRunnings.filter(x => x.pid != pid)
                        }
                    }
                }
            }
            else {
                utils.log('error', 'pid: ', pid, ' getSubChannels err: ', channels.err)
                if (channels.err == "PROFILE_INVALID") {
                    let runnings = watchRunnings.filter(x => x.pid == pid)
                    if (runnings.length) {
                        watchRunnings = watchRunnings.filter(x => x.pid != pid)
                    }
                    await deleteProfile(pid)
                }
                else if(channels.err == "LOGOUT") {
                    // stop running
                    closeChrome(pid)
                    watchRunnings = watchRunnings.filter(x => x.pid != pid)
                    let action = {}
                    action.pid = pid
                    action.id = 'logout'
                    await startChromeAction(action)
                }
                else if(channels.err == "CONFIRM" || channels.err) {
                    // stop running
                    closeChrome(pid)
                    await utils.sleep(5000)
                    watchRunnings = watchRunnings.filter(x => x.pid != pid)
                    if (proxy) {
                        proxy[pid] = await request_api.getProfileProxy(pid, channels.err == "CONFIRM"?CONFIRM_ACTION:PLAYLIST_ACTION.WATCH)
                        utils.log('pid', pid, `${channels.err} proxy`, proxy[pid])
                        if (!proxy[pid]) {
                            utils.log('error', 'pid:', pid, `get ${channels.err} proxy:`, proxy[pid])
                            throw 'no proxy'
                        }
                    }
                    let browser = await pauseWatchingProfile(pid, PLAYLIST_ACTION.WATCH)
                    try {
                        if (browser) {
                            let profile = await request_api.getProfile(pid)
                            utils.log(profile)
                            // if(WIN_ENV) profile = {profile: {password: PR[2]}}
                            if(profile.err) throw `GET_PROFILE_${channels.err}_ERROR`
                            let action = {}
                            action.pid = pid
                            action.id = channels.err.toLowerCase()
                            action.password = profile.profile.password
                            action.cardnumber = utils.GenCC("VISA",1)[0]
                            utils.log(pid, action)
                            await startChromeAction(action)
                        }
                    }
                    catch (e) {
                        utils.log('error', pid, channels.err, e)
                    }
                }
            }
        }
        catch (e) {
            utils.log('error', 'pid: ', pid, ' subProfile err: ', e)
        }
    }
}

async function profileRunningManage() {
    try {
        //await request_api.updateVmStatus()
        utils.log('profileRunningManage')
        // check sub running queue running time
        //await checkSubRunningProfile()
        // check add new running queue running time
        await checkAddNewRunningProfile()
        // check add new running queue running time
        await checkWatchingProfile()
        // check sub running queue
       // let avaiSub = MAX_CURRENT_ACC - subRunnings.length - addnewRunnings.length
        utils.log(' addnewRunnings: ', addnewRunnings.map(x => x.pid),
            ' watchRunnings: ', watchRunnings.map(x => [x.pid, JSON.stringify(x.playlist)]))

        if (MAX_CURRENT_ACC > (addnewRunnings.length + watchRunnings.length)) {
            if (ids.length + addnewRunnings.length < MAX_PROFILE) {
                newProfileManage()
            } else {
                newRunProfile()
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

async function updateVmStatus() {
    try {
        let _pids = await getProfileIds()
        let pids = _pids.join(',')
        await request_api.updateVmStatus({
            vm_id: config.vm_id,
            running: addnewRunnings.length + watchRunnings.length,
            pids
        })
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
        if (!is_show_ui) {
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
    // get profile ids
    ids = await getProfileIds()
    utils.log('ids: ', ids)
    ids.forEach(pid => startDisplay(pid))

    // manage profile actions
    await profileManage()
}

function initDir() {
    if (!fs.existsSync(path.resolve('logscreen'))) {
        fs.mkdirSync(path.resolve('logscreen'));
    }

    if (!fs.existsSync(path.resolve('logs'))) {
        fs.mkdirSync(path.resolve('logs'));
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

    if (!fs.existsSync('backup')) {
        fs.mkdirSync('backup');
    }
}

async function start() {
    try {
        let systemConfig = await request_api.getSystemConfig();
        if (systemConfig.max_total_profiles) {
            MAX_PROFILE = MAX_CURRENT_ACC * Number(systemConfig.max_total_profiles)
        }
        
        startupScript()

        // init dir
        initDir()

        // init configuration
        await initConfig()

        // init proxy
        initProxy()

        initExpress()

        // WIN_ENV?await installExtension():await installExtensionLinux()

        running()
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
    // load configuration
    utils.log('config: ', config)
    let ip = ''
    while(!ip || ip.length > 50){
        await utils.sleep(5000)
        try {
            if (fs.existsSync('./ip.log')) {
                ip = fs.readFileSync('./ip.log', 'utf8')
                if (ip.length > 50) {
                    ip = await publicIp.v4()
                }
            }
            else {
                ip = await publicIp.v4()
            }
        }
        catch (e) {
            utils.log('error', 'get ip err')
        }
    }

    utils.log('ip: ', ip)
    // check config

    // ip = DOCKER ? os.hostname() + '_' + ip : ip
    // // get vm_id from db
    // try {
    //     let rs = await request_api.getVmFromIp(ip)
    //     utils.log('getVmFromIp: ', rs)
    //     if (rs.err) return
    //     if (rs.vmId) {
    //         config.vm_id = rs.vmId
    //     }
    //     else {
    //         config = { vm_id: 2 }
    //     }
    // }
    // catch (e) {
    //     utils.log('getVmFromIp:', e)
    //     config = { vm_id: 2 }
    // }

    //if (!config.vm_id) {
        config.vm_id = makeid(9)//(Date.now()+'').slice(0,9)
    //}

    fs.writeFile("config.json", JSON.stringify(config), (err) => {
        if (err) throw err;
        utils.log('update config.json');
    })

    utils.log('version: ', version)
    // update version to db
    //await request_api.updateVmVersion(config.vm_id, version, ip)
}

function initProxy() {
    utils.log('USE_PROXY:', process.env.USE_PROXY)
    // if(process.env.USE_PROXY){
    if (true) {
        // proxy = await request_api.getProxy(config.vm_id)
        proxy = {}
    }

    utils.log('USE_GUI:', process.env.USE_GUI)
    // if(process.env.USE_GUI=="true"){
    if (process.env.USE_GUI == "true") {
        gui = true
    }
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

    app.get('/report', (req, res) => {
        utils.log(req.query)

        if (req.query.id == 'channel-position') {
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
            request_api.updateWatchedVideo(req.query.pid, req.query.viewedAds)
        }
        else if (req.query.id == 'login') {
            if (req.query.status == 1) {
                utils.log(req.query.pid, 'login success')
                let login = !req.query.msg
                req.query.msg = req.query.msg == "OK" ? undefined : req.query.msg
                request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
                backup(req.query.pid,login)
            }
            else {
                utils.log(req.query.pid, 'login error', req.query.msg)
                request_api.updateProfileStatus(req.query.pid, config.vm_id, 'ERROR', req.query.msg)
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
            watchRunnings = watchRunnings.filter(x => x.pid != req.query.pid)
        }
        else if(req.query.id == 'changepass'){
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
            if(req.query.stop && req.query.stop != 'false'){
                watchRunnings = watchRunnings.filter(x => x.pid != req.query.pid)
            }
        }
        else if(req.query.id == 'checkpremium' || req.query.id == 'checkcountry'){
            request_api.updateProfileStatus(req.query.pid, config.vm_id, 'SYNCED', req.query.msg)
            watchRunnings = watchRunnings.filter(x => x.pid != req.query.pid)
        }
        else if (req.query.id == 'watch') {
            if (req.query.status == 0) {
                utils.log(req.query.pid, 'stop')
                watchRunnings = watchRunnings.filter(x => x.pid != req.query.pid)
            }
            else {
                watchRunnings = watchRunnings.map(x => {
                    if (x.pid == req.query.pid) {
                        x.lastReport = Date.now()
                        x.playlist = req.query.msg
                    }
                    return x
                })
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

    app.get('/action', (req, res) => {
        utils.log(req.query)
        res.send(JSON.stringify(req.query))
    })

    app.get('/input', (req, res) => {
        utils.log(req.query)
        watchRunnings = watchRunnings.map(x => {
            if (x.pid == req.query.pid) {
                x.lastReport = Date.now()
            }
            return x
        })
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
            if (req.query.action == 'GO_ADDRESS' || req.query.action == 'OPEN_DEV') setChromeSize(req.query.pid)
            // execSync(`xdotool windowactivate $(xdotool search --onlyvisible --pid $(pgrep chrome | head -n 1)) && sleep 1`)
            if (req.query.action == 'CLICK') {
                execSync(`xdotool mousemove ${req.query.x} ${req.query.y} && sleep 1 && xdotool click 1 && sleep 1`)
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
        addnewRunnings = addnewRunnings.filter(x => x.pid != pid)
        if (status != 1) {
            // login error
            deleteProfile(pid)
        }
        else {
            // login success
            if (!ids.filter(x => x == pid).length) {
                ids.push(pid)
            }
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

async function installExtension() {
    let info
    let i = 0
    while (i < 10) {
        try {
            // open chrome
            await new Promise(resolve => {
                exec('start chrome', _ => resolve('ok'))
            })

            await utils.sleep(5000)
            // go to extension
            execSync(`input SEND_KEY "^l"`)
            await utils.sleep(2000)
            execSync(`input TYPE_ENTER 0 0 "chrome://extensions/"`)
            await utils.sleep(2000)
            // open dev tool
            execSync(`input SEND_KEY "^+i"`)
            await utils.sleep(2000)
            // show utils
            execSync(`input SEND_KEY "^+p"`)
            await utils.sleep(2000)
            execSync(`input TYPE_ENTER 0 0 "dock to right"`)
            await utils.sleep(2000)
            execSync(`input SEND_KEY "^+p"`)
            await utils.sleep(2000)
            execSync(`input TYPE_ENTER 0 0 "show utils"`)
            await utils.sleep(2000)
            await utils.screenshot('extensions')
            // copy info
            // const clipboardy = require('clipboardy');
            // let scriptContent = fs.readFileSync(path.resolve(__dirname,'extension.js'),'utf8')
            // clipboardy.writeSync(scriptContent)

            execSync(`input CLIP_PUT_SCRIPT`)
            execSync(`input SEND_KEY "^v{ENTER}"`)
            await utils.sleep(3000)
            let info = execSync(`input CLIP_GET`)
            utils.log('clipboard', info)
            // let info = clipboardy.readSync()
            info = JSON.parse(info)
            utils.log(info)
            if (!info.installed) {
                i++
                if (info.px > 0) {
                    execSync(`input CLICK ${info.dx} ${info.dy}`)
                    await utils.sleep(2000)
                }
                // add extension
                execSync(`input CLICK ${info.x} ${info.y}`)
                await utils.sleep(5000)
                execSync(`input SELECT_EX "${path.resolve('ex')}"`)
                utils.log('install extension')

                execSync(`input SEND_KEY "^+i"`)
                await utils.sleep(2000)

            }
            else {
                utils.log('extension installed')
                await utils.screenshot('extension_installed')
                break
            }
        }
        catch (e) {
            utils.log('error', 'install extension err', e)
            await utils.errorScreenshot('extension_error')
            i++
        }
        finally {
            closeChrome()
            await utils.sleep(2000)
        }
    }
    await utils.sleep(2000)
    // close program
    if (i >= 10) process.exit(1);
}

async function installExtensionLinux() {
    utils.log('installExtensionLinux')

    closeChrome()
    startupScript()

    let i = 0
    while (i < 3) {
        try {
            // open chrome
            exec('google-chrome')
            await utils.sleep(15000)
            execSync(`xdotool windowsize --sync $(xdotool search --onlyvisible --name chrome) 1920 1040 && sleep 1`)
            await utils.sleep(2000)
            break
        }
        catch (e) {
            utils.log('active chrome fail', e)
            closeChrome()
            startupScript()
            await utils.sleep(2000)
            i++
        }
    }
    if (i >= 3) throw 'INSTALL EXTENSION ERROR'
    await utils.sleep(4000)

    let info
    i = 0
    while (i < 3) {
        try {
            // go to extension
            utils.log('go to extension')
            execSync(`xdotool key Control_L+l`)
            await utils.sleep(3000)
            execSync(`xdotool type --delay 100 "chrome://extensions/" && sleep 1 && xdotool key KP_Enter`)
            await utils.sleep(3000)
            // open dev tool
            execSync(`xdotool key Control_L+Shift+i`)
            await utils.sleep(2000)
            // show utils
            execSync(`xdotool key Control_L+Shift+p`)
            await utils.sleep(2000)
            execSync(`xdotool type --delay 100 "dock to right" && sleep 1 && xdotool key KP_Enter`)
            await utils.sleep(2000)
            execSync(`xdotool key Control_L+Shift+p`)
            await utils.sleep(2000)
            execSync(`xdotool type --delay 100 "show utils" && sleep 1 && xdotool key KP_Enter`)
            await utils.sleep(2000)
            await utils.screenshot('extensions')
            // copy info
            const clipboardy = require('clipboardy');
            // let scriptContent = fs.readFileSync(path.resolve(__dirname,'extension.js'),'utf8')
            utils.log('writeSync scriptContent')
            clipboardy.writeSync('function copyTextToClipboard(e){let o=document.createElement("textarea");o.value=e,o.style.top="0",o.style.left="0",o.style.position="fixed",document.body.appendChild(o),o.focus(),o.select(),document.execCommand("copy"),document.body.removeChild(o)}async function getExtensionInfo(){let e={},o=window.outerHeight-window.innerHeight,t=document.querySelector("extensions-manager").shadowRoot.querySelector("extensions-item-list").shadowRoot.querySelectorAll("extensions-item");if(Array.from(t).filter(e=>0==e.shadowRoot.querySelector("#name-and-version").textContent.indexOf("ViewerViewer")).length>0)return e.installed=!0,void copyTextToClipboard(JSON.stringify(e));let n=document.querySelector("extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#devMode");"false"==n.getAttribute("aria-pressed")&&(n.click(),await new Promise(e=>setTimeout(function(){e("ok")},3e3)));let i=document.querySelector("extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#loadUnpacked").getBoundingClientRect();e.x=i.left+window.screenX+.3*i.width,e.y=i.top+window.screenY+o+.3*i.height,copyTextToClipboard(JSON.stringify(e))}getExtensionInfo();')
            // execSync(`echo 'function copyTextToClipboard(e){let o=document.createElement("textarea");o.value=e,o.style.top="0",o.style.left="0",o.style.position="fixed",document.body.appendChild(o),o.focus(),o.select(),document.execCommand("copy"),document.body.removeChild(o)}async function getExtensionInfo(){let e={},o=window.outerHeight-window.innerHeight,t=document.querySelector("extensions-manager").shadowRoot.querySelector("extensions-item-list").shadowRoot.querySelectorAll("extensions-item");if(Array.from(t).filter(e=>0==e.shadowRoot.querySelector("#name-and-version").textContent.indexOf("ViewerViewer")).length>0)return e.installed=!0,void copyTextToClipboard(JSON.stringify(e));let n=document.querySelector("extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#devMode");"false"==n.getAttribute("aria-pressed")&&(n.click(),await new Promise(e=>setTimeout(function(){e("ok")},3e3)));let i=document.querySelector("extensions-manager").shadowRoot.querySelector("extensions-toolbar").shadowRoot.querySelector("#loadUnpacked").getBoundingClientRect();e.x=i.left+window.screenX+.3*i.width,e.y=i.top+window.screenY+o+.3*i.height,copyTextToClipboard(JSON.stringify(e))}getExtensionInfo();' | xclip -sel clip`)
            utils.log('writeSync scriptContent finish')
            await utils.sleep(2000)
            // execSync(`input CLIP_PUT_SCRIPT`)
            execSync(`xdotool key Control_L+v && sleep 1`)
            execSync(`xdotool key KP_Enter`)
            await utils.sleep(7000)
            // let info = execSync(`input CLIP_GET`)
            let info = clipboardy.readSync()
            utils.log('clipboard', info)
            info = JSON.parse(info)
            utils.log(info)
            if (!info.installed) {
                i++
                // add extension
                execSync(`xdotool mousemove ${info.x} ${info.y} && sleep 1 && xdotool click 1`)
                await utils.sleep(2000)
                execSync(`xdotool type --delay 100 "${path.resolve('ex')}" && sleep 2 && xdotool key Tab && sleep 2 && xdotool key KP_Enter`)
                utils.log('install extension')
                await utils.sleep(2000)
                execSync(`xdotool key Control_L+Shift+i`)
                await utils.sleep(2000)
                await utils.screenshot('extension_install')
            }
            else {
                utils.log('extension installed')
                await utils.screenshot('extension_installed')
                break
            }
        }
        catch (e) {
            utils.log('error', 'install extension err', e)
            await utils.errorScreenshot('extension_error')
            await utils.sleep(2000)
            execSync(`xdotool key Control_L+Shift+i`)
            await utils.sleep(2000)
            i++
        }
    }
    await utils.sleep(2000)
    // close window
    execSync(`xdotool key Alt+F4`)
    if (i >= 3) throw 'INSTALL EXTENSION ERROR'
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
                execSync('pkill chrome')
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
        if (!WIN_ENV && !is_show_ui) {
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
            if (!is_show_ui) {
                process.env.DISPLAY = ':' + pid
            }
            
            execSync(`xdotool key KP_Enter && sleep 3 && xdotool windowsize $(xdotool search --onlyvisible --pid $(pgrep -f "profiles/${pid}" | head -n 1) --class surf) 1920 1040 && sleep 1`)
        }
    }
    catch (e) {
    }
}

function setChromeSize(pid) {
    try {
        if (!WIN_ENV) {
            utils.log('setChromeSize', pid)
            if (!is_show_ui) {
                process.env.DISPLAY = ':' + pid
            }
            
            execSync(`xdotool windowsize $(xdotool search --onlyvisible --class chrome) 1920 1040`)
            execSync(`xdotool windowsize $(xdotool search --onlyvisible --pid $(pgrep -f "profiles/${pid}" | head -n 1) --class surf) 1920 1040`)
        }
    }
    catch (e) {
    }
}

function startupScript() {
    try {
        if(WIN_ENV) return
        // if (fs.existsSync('ex.zip')) execSync('rm -rf *.js')
        execSync('rm -rf core.*;for i in /home/runuser/.forever/*.log; do cat /dev/null > $i; done;rm -rf ~/.ssh/known_hosts')
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

start()