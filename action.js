const puppeteer = require('puppeteer');
const utils = require('./utils')
const request_api = require('./request_api')
const watch = require('./watch')
const watch_mobile = require('./watch_mobile')

async function startAction(action){
    try{
        console.log('startAction',utils.cloneOmit(action))
        if(!pidPage[action.pid]){
            let browser = await puppeteer.connect({browserWSEndpoint: action.ws, defaultViewport:null,});
            const page = await browser.newPage()
            page.setDefaultTimeout(40000)
            action.page = page
            pidPage[action.pid] = page
        }
        else{
            action.page = pidPage[action.pid]
        }
        action.lastChange = Date.now()
        if(action.proxy_username) await action.page.authenticate({ username: action.proxy_username , password: action.proxy_password});
        await initAction(action)
        while(!action.finish){
            await checkURLchange(action)
            await utils.sleep(1000)
        }
    }
    catch(e){
        console.log('startAction error',e)
        await request_api.updateActionStatus(action, action.id, 0, e.toString())
    }
}

async function checkURLchange(action){
    let currentURL = action.page.url()
    let oldURL = action.oldURL

    if(currentURL.indexOf('https://m.') == 0) action.mobile = true

    if(currentURL.split('#')[0] != oldURL.split('#')[0] && action.lastChange && Date.now() - action.lastChange > 3000){
        console.log('oldURL:',oldURL,'currentURL:',currentURL,action.lastChange,Date.now())
        console.log('url changed:',currentURL)
        action.oldURL = currentURL;
        action.lastChange = Date.now()
        loadPage(action)
    }
    else if(currentURL.split('#')[0] != oldURL.split('#')[0] && action.lastChange && Date.now() - action.lastChange < 3000){
        console.log('redirect',action.oldURL,currentURL)
        action.oldURL = currentURL
        action.lastChange = Date.now()
    }
    else{
        action.oldURL = currentURL
    }
}

async function loadPage(action){
    console.log('loadPage',utils.cloneOmit(action,'page'))
    await utils.sleep(5000)

    console.log('loadPage',action.id, action.pid)

    await dismissDialog(action.pid)

    if (action.id == 'login') {
        console.log('login')
    }
    else if(action.id == 'watch') {
        console.log('watch')
        if(action.mobile){
            await watch_mobile.userWatchMobile(action)
        }
        else{
            await watch.userWatch(action)
        }
    }
    else if(action.id == 'sub'){
        console.log('sub')
        await userSub(action)
    }
}

async function dismissDialog(pid){
    try{
    }
    catch (e) {
        console.log('error',pid,'dismissDialog',e)
    }
}

async function initAction(action){
    action.oldURL = ""
    // if(action.page.url().indexOf('localhost') > -1){
    if(!action.init){
        action.init = true
        action.lastRequest = Date.now()

        if(action.id=='watch'){
            setWatchParam(action)
        }

        if(action.id=='sub'){
            setSubParam(action)
        }

        console.log(utils.cloneOmit(action,'page'))

        if(action.id == 'login'){
            await action.page.goto('https://accounts.google.com')
        }
        else{
            // await action.page.goto('https://youtube.com/feed/history//')
            await action.page.goto('https://youtube.com//')
        }

        await utils.sleep(5000)
    }
}

function setWatchParam(action){
    // init watch params
    action.other_videos = []
    action.channel_videos = []
    action.home_percent = action.home_percent || 10
    action.suggest_percent = action.suggest_percent || 0
    action.page_watch = action.page_watch || 0
    action.suggest_videos = ''

    if(Math.random()<0.2){
        if(Math.random()<0.5){
            action.preview = "home"
        }
        else{
            action.preview = "search"
        }
    }

    let rand = Math.random()

    if(rand < action.home_percent/100){
        action.home = true
    }
    else if(rand < (action.home_percent+action.suggest_percent)/100){
        action.suggest = true
    }
    else if(rand < (action.home_percent+action.suggest_percent+action.page_watch)/100){
        action.channel = true
    }
    else if(rand < (action.home_percent+action.suggest_percent+action.page_watch + 2)/100){
        action.preview = false
        action.direct = true
    }

    // watch random after video
    action.after_video = Math.random() < 0.1
    let searchList = action.video.split(";;")
    action.playlist_url = action.playlist_url.trim()
    action.video = searchList[utils.randomRanger(0,searchList.length-1)].trim().split(action.playlist_url)[0]
    action.url_type = action.url_type.trim().toLowerCase()
    action.suggest_videos = action.suggest_videos?action.suggest_videos.trim():undefined
}

function setSubParam(action){
    Object.assign(action,action.channels[0])
    if(action.name && action.name.length){
        let searchList = action.name.split(";;")
        action.name = searchList[utils.randomRanger(0,searchList.length-1)]
    }

    action.sub_in_video = undefined
    action.sub_direct = undefined
    action.watched_video = undefined
    action.sub_in_videos_page = undefined
    action.pre_sub = undefined
    action.videoIds = undefined
    action.search_keyword = action.keyword && action.keyword.length?action.keyword[utils.randomRanger(0,action.keyword.length-1)]:undefined

    if(Math.random() < 0.5){ // 0.5
        action.sub_from_suggest = true
    }

    if(Math.random() < 0.7){
        action.sub_in_video = true
    }

    // paste link direct
    if(Math.random() < 0.05){
        action.sub_direct = true
        action.watched_video = true
    }

    // percent not watch video before sub
    if(Math.random() < 0.3){
        action.watched_video = true
    }

    // percent sub in videos page
    if(Math.random() < 0.3){
        action.sub_in_videos_page = true
    }

    // percent go to channel from videos link
    if(Math.random() < 0.7){
        action.go_channel_from_search_videos = true
    }

    // percent to reset sub action
    if(Math.random() < 0.2){
        action.restart_sub = true
    }
}

// function checkMiniPlayer(action){
//     if(!checkMiniPlayerRef){
//         console.log('INFO','checkMiniPlayer')
//         checkMiniPlayerRef = setInterval(pid =>
//             {
//                 if(document.querySelector('ytd-miniplayer[active]')){
//                     sendKey(pid,"i")
//                 }
//             }
//         ,5000,action.pid)
//     }
// }

module.exports.startAction = startAction