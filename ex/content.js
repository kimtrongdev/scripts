// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let action
let checkMiniPlayerRef
var windowWide
var mobileMenuBarHeight
var zoom
var isNonUser = false
async function loadPage(){
    try{
        await sleep(5000)

        await initAction()

        checkMiniPlayer(action)

        console.log('loadPage',action.id, action.pid)

        await dismissDialog(action.pid)

        if (action.id == 'login') {
            console.log('login')
            await userLogin(action)
        }
        if (action.id == 'confirm') {
            console.log('confirm')
            await userConfirm(action)
        }
        if (action.id == 'changepass') {
            console.log('changepass')
            await changePassword(action)
        }
        if (action.id == 'checkpremium') {
            console.log('checkpremium')
            await checkPremium(action)
        }
        if (action.id == 'checkcountry') {
            console.log('checkcountry')
            await checkCountry(action)
        }
        else if(action.id == 'watch') {
            console.log('watch')
            !action.mobile ? await userWatch(action) : await userWatchMobile(action)
        }
        else if(action.id == 'sub'){
            console.log('sub')
            await userSub(action)
        }
        else if(action.id == 'logout'){
            if(window.location.toString().indexOf('https://accounts.google.com/ServiceLogin') == 0 || window.location.toString().indexOf('https://accounts.google.com/signin/v2/identifier') == 0){
                await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
            }
        }
    }
    catch (e) {
        console.log('error',e)
    }
    finally {

    }
}

async function dismissDialog(pid){
    try{
    }
    catch (e) {
        console.log('error',pid,'dismissDialog',e)
    }
}

// window.addEventListener("yt-navigate-start", _ => {
//     console.log('yt-navigate-start');
//     loadPage()
// }); // new youtube design


// window.addEventListener('load', _ => {
//     console.log('load');
//     loadPage()
// })

let lastChange
window.addEventListener('load', _ => {
    console.log('load');
    lastChange = Date.now()
    loadPage()
})

let oldURL = "";
function checkURLchange(currentURL){
    if(currentURL.split('#')[0] != oldURL.split('#')[0] && lastChange && Date.now() - lastChange > 3000){
        console.log('oldURL:',oldURL,'currentURL:',currentURL,lastChange,Date.now())
        console.log('url changed:',currentURL)
        oldURL = currentURL;
        lastChange = Date.now()
        loadPage()
    }
    else if(currentURL.split('#')[0] != oldURL.split('#')[0] && lastChange && Date.now() - lastChange < 3000){
        oldURL = currentURL
        lastChange = Date.now()
    }
    else{
        oldURL = currentURL
    }
}

setInterval(function() {
    checkURLchange(window.location.href);
}, 1000);

async function initAction(){
    if(window.location.toString().indexOf('localhost') > -1){
        closeTabs()
        let url = new URL(window.location.href);
        action = JSON.parse(url.searchParams.get("data"))
        action.lastRequest = Date.now()

        let mobileRate = action.mobile_percent 
        action.mobile = (action.pid % 10) * 10 < mobileRate ? true : false;

        // trong code
        if(action.mobile){
            await setUserAgent(action.pid);
        }

        if(action.id=='watch'){
            setWatchParam(action)
        }

        if(action.id=='sub'){
            setSubParam(action)
        }

        console.log(action)
        await setActionData(action)

        if(action.id == 'login'){
            if(action.mobile) await switchMobile(action)
            await goToLocation(action.pid,'accounts.google.com?abccc=tesstt')
        }
        else if(action.id == 'logout'){
            if(action.mobile) await switchMobile(action)
            await goToLocation(action.pid,'accounts.google.com/logout')
        }
        else if(action.id == 'confirm'){
            if(action.mobile) await switchMobile(action)
            // await goToLocation(action.pid,'pay.google.com/gp/w/u/0/home/settings')
            await goToLocation(action.pid,'families.google.com')
        }
        else if(action.id == 'changepass'){
            if(action.mobile) await switchMobile(action)
            await goToLocation(action.pid,'myaccount.google.com/security')
        }
        else if(action.id == 'checkpremium'){
            if(action.mobile) await switchMobile(action)
            await goToLocation(action.pid,'m.youtube.com//')
        }
        else if(action.id == 'checkcountry'){
            if(action.mobile) await switchMobile(action)
            await goToLocation(action.pid,'pay.google.com/gp/w/u/0/home/settings')
        }
        else{
            if(action.mobile) await switchMobile(action)
            // await goToLocation(action.pid,'youtube.com/feed/history//')
            // await goToLocation(action.pid,action.mobile?'m.youtube.com//':'myactivity.google.com/activitycontrols/youtube')
            if (action.google) {
                await goToLocation(action.pid, 'google.com/search?q=' + action.video + ' ' + action.playlist_url)
                await sleep(3000)
            } else {
                await goToLocation(action.pid,action.mobile?'m.youtube.com//':'youtube.com//')
            }
        }

        await sleep(5000)
    }
    else{
        let data = await getActionData()
        action = data.action
        windowWide = action.windowWide
        mobileMenuBarHeight = action.mobileMenuBarHeight
        zoom = action.zoom || 1
        console.log('action:',action)
    }
}

function setWatchParam(action){
    // init watch params
    action.fisrtStart = true
    action.other_videos = []
    action.channel_videos = []
    action.home_percent = Number(action.home_percent) || 0
    action.suggest_percent = Number(action.suggest_percent) || 0
    action.page_watch = Number(action.page_watch) || 0
    action.direct_percent = Number(action.direct_percent) || 0
    action.google_percent = Number(action.google_percent) || 0
    action.search_percent = Number(action.search_percent) || 0
    action.playlist_percent = Number(action.playlist_percent) || 0
    action.suggest_videos = ''
    action.total_times_next_video = Number(action.total_times_next_video) || 0
    action.watching_time_non_ads = Number(action.watching_time_non_ads) || 15000
    action.watching_time_non_ads -= 7000
    action.watching_time_start_ads = Number(action.watching_time_start_ads) || 31000
    action.watching_time_end_ads = Number(action.watching_time_end_ads) || 60000
    action.channel_position = Number(action.channel_position)
    action.total_channel_created = Number(action.total_channel_created) || 20
    action._total_loop_find_ads = 0
    if (action.playlist_percent == 100) {
        action.view_playlist = true
    } else {
        if(Math.random()<0.1){
            if(Math.random()<0.5){
                action.preview = "home"
            }
            else{
                action.preview = "search"
            }
        }
    
        let totalValue = action.home_percent +
                         action.suggest_percent + 
                         action.page_watch +
                         action.direct_percent +
                         action.google_percent +
                         action.search_percent
                         
        let watchTypeRand = randomRanger(0, totalValue)
        if (watchTypeRand < action.home_percent) {
            action.home = true
        } else if (watchTypeRand < action.home_percent + action.suggest_percent) {
            action.suggest = true
        } else if (watchTypeRand < action.home_percent + action.suggest_percent + action.page_watch) {
            action.page = true
        } else if (watchTypeRand < action.home_percent + action.suggest_percent + action.page_watch + action.direct_percent) {
            action.preview = false
            action.direct = true
        } else if (watchTypeRand < action.home_percent + action.suggest_percent + action.page_watch + action.direct_percent + action.google_percent) {
            action.google = true
        } else {
            // search
        }
    }

    let adsPercent = action.ads_percent || 0
    if (Math.random() < adsPercent / 100) {
        action.is_view_ads = true
    }

    // watch random after video
    action.after_video = Math.random() < 0.1
    let searchList = action.video.split(";;")
    action.searchList = searchList
    action.video = searchList[randomRanger(0,searchList.length-1)].trim()
    action.playlist_url = action.playlist_url.trim()
    action.url_type = action.url_type.trim().toLowerCase()
    action.suggest_videos = action.suggest_videos?action.suggest_videos.trim():undefined
}

function setSubParam(action){
    Object.assign(action,action.channels[0])
    if(action.name && action.name.length){
        let searchList = action.name.split(";;")
        action.name = searchList[randomRanger(0,searchList.length-1)]
    }

    action.sub_in_video = undefined
    action.sub_direct = undefined
    action.watched_video = undefined
    action.sub_in_videos_page = undefined
    action.pre_sub = undefined
    action.videoIds = undefined
    action.search_keyword = action.keyword && action.keyword.length?action.keyword[randomRanger(0,action.keyword.length-1)]:undefined

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

function checkMiniPlayer(action){
    if(!checkMiniPlayerRef){
        console.log('INFO','checkMiniPlayer')
        checkMiniPlayerRef = setInterval(pid =>
            {
                if(document.querySelector('ytd-miniplayer[active]')){
                    sendKey(pid,"i")
                }
            }
        ,5000,action.pid)
    }
}
