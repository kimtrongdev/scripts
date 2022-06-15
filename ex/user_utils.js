var newsNames = [
    "cnn.com",
    "theguardian.com",
    "news18.com",
    "kyma.com",
    "inquirer.com",
    "npr.org",
    "thehindu.com",
    "politico.com",
    "nbcnews.com",
    "click2houston.com",
    "kktv.com",
    "wsbtv.com",
    "al.com",
    "fox5atlanta.com",
    "sltrib.com",
    "pennlive.com",
    "kiro7.com",
    "wsfa.com",
]

async function runAction (action) {
    if (action.id == 'check_bat') {
        await scriptCheckBat(action)
    }
}

async function initActionData(action) {
    let mobileRate = action.mobile_percent 
    action.mobile = (action.pid % 10) * 10 < mobileRate ? true : false;

    if(action.mobile){
        await setUserAgent(action.pid);
    }
    
    if(action.id=='watch' || action.id == 'watch_video'){
        setWatchParam(action)
    }

    if(action.id=='sub'){
        setSubParam(action)
    }

    console.log(action)
    await setActionData(action)

    if(action.mobile) await switchMobile(action)

    if (action.id == 'check_bat') {

    }
    else if (action.id == 'google_news') {
        if (!action.is_searched) {
            action.is_searched = true
            await setActionData(action)
            let randomPoSite = randomRanger(0, newsNames.length - 1)
            let link = action.news_link || `https://www.${newsNames[randomPoSite]}/`
            await goToLocation(action.pid, link)
        }
    }
    else if (action.id == 'search') {
        action.search_keywords = action.search_keywords.split(',')
        await setActionData(action)
        await goToLocation(action.pid, 'https://www.google.com/')
    }
    else if (action.id == 'map') {
        await goToLocation(action.pid,'google.com/maps')
    }
    else if (action.id == 'youtube_sub') {
        await goToLocation(action.pid,action.mobile?'m.youtube.com//':'youtube.com//')
    }
    else if(action.id == 'reg_user'){
        await goToLocation(action.pid,'accounts.google.com')
    }
    else if(action.id == 'login'){
        if (['brave', 'brave-browser', 'brave-browser-stable'].includes(action.browser_name)) {
            await handleBraveSetting(action)
        }
    }
    else if(action.id == 'logout'){
        await goToLocation(action.pid,'accounts.google.com/logout')
    }
    else if(action.id == 'confirm'){
        // await goToLocation(action.pid,'pay.google.com/gp/w/u/0/home/settings')
        await goToLocation(action.pid,'families.google.com')
    }
    else if(action.id == 'changepass'){
        await goToLocation(action.pid,'myaccount.google.com/security')
    }
    else if(action.id == 'checkpremium'){
        await goToLocation(action.pid,'m.youtube.com//')
    }
    else if(action.id == 'checkcountry'){
        await goToLocation(action.pid,'pay.google.com/gp/w/u/0/home/settings')
    }
    else if (action.id == 'watch' || action.id == 'watch_video') {
        // await goToLocation(action.pid,'youtube.com/feed/history//')
        // await goToLocation(action.pid,action.mobile?'m.youtube.com//':'myactivity.google.com/activitycontrols/youtube')
        if (action.google) {
            await goToLocation(action.pid, 'google.com/search?q=' + action.video + ' ' + action.playlist_url)
            await sleep(3000)
        } else {
            await goToLocation(action.pid,action.mobile?'m.youtube.com//':'youtube.com//')
        }
    }
}

function updateTotalCreatedUsers (pid, count = 0) {
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: {pid: pid, id: 'total_created_channel', count }}, function (response) {
        resolve(response);
    }))
}

function clearBSData () {
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'CLEAR_BROWSER_DATA', url: '/report',
        data: {}}, function (response) {
        resolve(response);
    }))
}

async function reportScript(action, status = true) {
    let isBreak = false
    if ([1, '1', 'true', true].includes(action.is_break)) {
        isBreak = true
        await clearBSData()
        await sleep(5000)
    }

    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: { isScriptReport: true, service_id: action._id, pid: action.pid, isBreak: action.is_break, stop: isBreak, status }}, 
    async function (response) {
        if (response) {
            if (action.watch_time) {
                action.watch_time = 0
            }
            Object.assign(action, response)
            //if (action.id != 'check_bat') {
                //await updateUserInput(action.pid,'NEW_TAB', 0,0,0,0,"",'New TAB')
                //await scrollForViewAds(action)
            //}

            await initActionData(action)
            await runAction(action)
        }
        resolve()
    }))
}

function reportLive(pid){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: {id: 'live_report', pid}}, function (response) {
        resolve(response);
    }))
}

function getNewPlaylistData (action) {
    return new Promise(resolve => chrome.runtime.sendMessage({
            url: '/get-new-playlist',
            data: {}
        }, function (response) {
        if (response && response.playlist_url) {
            action.playlist_data = response.playlist_url
            Object.assign(action, response)
        }
        resolve(action);
    }))
}

function closeTabs () {
    return new Promise(resolve => chrome.runtime.sendMessage({
            type: 'CLOSE_OLD_TABS', 
            url: '/report',
        }, function (response) {
        resolve(response);
    }))
}

function reportPositionChannel(pid, position) {
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: { id: 'channel-position', position, pid }}, function (response) {
        resolve(response);
    }))
}

function getPlaylistData (action) {
    if (action.id == 'watch') {
        let items = action.playlist_data.split(',')
        let playlist_id = items[Math.floor(Math.random()*items.length)];
        let data = playlist_id.split('&list=')
        action.playlist_url = data[1]
        action.playlist_video = data[0]
    }
}

async function getActionData(){
    return new Promise(resolve => chrome.storage.sync.get('action', function(data) {
            resolve(data);
        })
    )
}

async function setActionData(data){
    if (Number(data.id)) {
        data.id = data.script_code
    }
    return new Promise(resolve => chrome.storage.sync.set({action: data}, function() {
            resolve();
        })
    )
}

async function sendUserAction(action){
    return new Promise(resolve => chrome.runtime.sendMessage(action, function (response) {
        resolve(response);
    }))
}

function updateWatchingTime(pid, action, readingTime, playlistTime, lastPlaylist){
    // return new Promise(resolve => chrome.runtime.sendMessage({type: 'POST', url: '/profile/update-watch-time',
    //         data: {pid: pid, action: action, reading_time: readingTime, playlist_time: playlistTime, last_playlist: lastPlaylist}}, function (response) {
    //     resolve(response);
    // }))
}


function updateWatchedVideo(viewedAds, pid){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: {id: 'watched', viewedAds: viewedAds, pid}}, function (response) {
        resolve(response);
    }))
}

function subStatusReport(pid, channelId, vmId, status, preSub, postSub, note){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'POST', url: '/profile/sub-update',
        data: {pid: pid, vmId: vmId, channel_id: channelId, status: status, ip: '', pre_sub: preSub, post_sub: postSub, note: note}}, function (response) {
        resolve(response);
    }))
}

async function updateActionStatus(pid, action, status, msg, stop = true){
    console.log('updateActionStatus',pid,status)
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/report',
        data: {pid: pid, id: action, status: status, stop: stop, msg: msg}}, function (response) {
        resolve(response);
    }))
}

function getComment(keyword){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'COMMENT', url: 'https://dominhit.pro/get-comment-api',
        data: {keyword: keyword}}, function (response) {
        resolve(response);
    }))
}

async function getPublicDays(videoId){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'COMMENT', url: 'https://pll.dominhit.pro/playlist/api',
        data: {action: 'get-public-time-day-ago',id: videoId}}, function (response) {
        resolve(response);
    }))
}

async function getFirstVideo(pllId){
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'COMMENT', url: 'https://pll.dominhit.pro/playlist/api',
        data: {action: 'get-video-of-playlist',id: pllId}}, function (response) {
        resolve(response);
    }))
}

// function updateLoginStatus(pid, status, msg){
//     console.log('updateLoginStatus',pid,status)
//     return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/login',
//         data: {pid: pid, stop: true, status: status, msg: msg}}, function (response) {
//         resolve(response);
//     }))
// }

function updateUserInput(pid, action, x, y, sx, sy, str, selector){
    console.log('updateUserInput',pid,action)
    return new Promise(resolve => chrome.runtime.sendMessage({type: 'REPORT', url: '/input',
        data: {pid: pid, action: action, x: x, y: y, sx: sx, sy: sy,str: str, selector: selector}}, function (response) {
        resolve(response);
    }))
}

function getElementPosition(el,iframe){
    if(el){
        let screenX = window.screen.width - window.screen.availWidth
        let screenY = window.screen.height - window.screen.availHeight
        let pos = el.getBoundingClientRect()
        let iframePost = iframe?iframe.getBoundingClientRect():undefined
        let menuBarHeight = mobileMenuBarHeight || (window.outerHeight - window.innerHeight)
        let menuLeftWith = (window.outerWidth - window.innerWidth)
        let x = zoom*(pos.left + (pos.width*0.6) + (iframe?iframePost.left:0)) + screenX + menuLeftWith + (windowWide?(windowWide-zoom*window.innerWidth)/2:0) + widthCustom
        let y = zoom*(pos.top + (pos.height*0.6) + (iframe?iframePost.top:0))  + screenY + menuBarHeight + heightCustom
        let scrollX = window.scrollX
        let scrollY = window.scrollY
        console.log({x: x, y: y, scrollX: scrollX, scrollY: scrollY})
        return {x: x, y: y, scrollX: scrollX, scrollY: scrollY}
    }
}

function listenMsg() {
    chrome.runtime.onMessage.addListener(
        function(request, sender, sendResponse) {
            sendResponse('OK');
        });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(function () {
        resolve('ok')
    }, ms));
}

function randomRanger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

async function waitForSelector(selector,timeout = 30000, iframe){
    let n = Math.ceil(timeout/1000)
    for(let i = 0; i < n; i++){
        let el = iframe ? iframe.contentWindow.document.querySelector(selector) : document.querySelector(selector)
        if(el && el.getBoundingClientRect().width) return
        await sleep(1000)
    }
    throw selector + '_NOT_FOUND'
}

// trong code
async function setUserAgent(pid) {
    let userAgents = []

    const userAgent = userAgents[pid % userAgents.length]

    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'SET_USER_AGENT',
        user_agent: userAgent
    }, function (response) {
        resolve(response);
    }))
}

async function closeAdsTabs() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'CLOSE_ADS_TAB',
    }, function (response) {
        resolve(response);
    }))
}

function getTotalTabs() {
    return new Promise(resolve => chrome.runtime.sendMessage({
        type: 'GET_TOTAL_TABS',
    }, function (response) {
        resolve(response);
    }))
}

async function randomFullName () {
    let rs = await fetch('https://random-data-api.com/api/name/random_name').then(response => {
        return response.json()
    }).then(response => response).catch(error => {
        return {
            name: makeName(5)
        }
    })

    return rs.name
}

function getElementContainsInnerText(tagName, innerText) {
    let headings = document.evaluate(
        `//${tagName}[contains(., '${innerText}')]`,
        document,
        null,
        XPathResult.ANY_TYPE,
        null
    );

    if (headings) {
        const thisHeading = headings.iterateNext();
        return thisHeading
    }
    return null
}
