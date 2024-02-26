// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

let action
let checkMiniPlayerRef
var windowWide
var mobileMenuBarHeight
var menuBarWidth
var zoom
var isNonUser = false
var isRunBAT = true

var widthCustom = 0
var heightCustom = 0
var IS_MOBILE = false
var ALLOW_RUN_UPDATE_ACCOUNT_INFO = true
async function loadPage(){
    try{
        await sleep(4000)

        await initAction()

        checkMiniPlayer(action)

        console.log('loadPage',action.id, action.pid)

        await dismissDialog(action.pid)

        await runAction(action)
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
    if(currentURL.split('#')[0] != oldURL.split('#')[0] && lastChange && Date.now() - lastChange > 3000 && !(oldURL.includes('google.com/maps') && currentURL.includes('google.com/maps/@'))){
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
        initSettingData(action)
        await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

        // if (window.location.toString().indexOf('refreshed_localhost') == -1) {
        //     window.open(window.location.toString() + '&refreshed_localhost=true')
        //     await sleep(30000)
        //     return
        // }
        // if (action.id !== 'watch_video' && action.id !== 'search' && action.id !== 'login' && action.script_code != 'reg_user') {
        //     await goToLocation(action.pid,'https://www.google.com/')
        // } else {
        //     await initActionData(action)
        // }
        await initActionData(action)
        
        await sleep(5000)
    }
    else{
        let data = await getActionData()
        action = data.action

        //DEBUG
        // action.id = "login"
        // action.is_fb = true
        // action.running_update_info = true
        // action.info_description = 'my name is'


        initSettingData(action) 
        //if (action.id != 'search' && window.location.toString().indexOf('www.google.com') > -1) {
        //    await initActionData(action)
        //}

        console.log('action:',action)
    }
}

function initSettingData (action) {
    if (action.isRunBAT && ['brave-browser', 'brave', 'brave-browser-stable'].includes(action.browser_name)) {
        isRunBAT = Boolean(action.isRunBAT)
    } else {
        isRunBAT = false
    }

    zoom = action.zoom || 1

    if (action.browser_name == 'vivaldi-stable' || action.browser_name == 'vivaldi') {
        heightCustom = -23
        if (action.os_vm != 'vps' && !action.is_show_ui || action.is_show_ui == 'false') {
            heightCustom = -30
        }
    }

    if (action.os_vm == 'vps') {
        heightCustom = -23
    }

    if (action.browser_name == 'chromium-browser') {
        //heightCustom = 13
        if ((!action.is_show_ui || action.is_show_ui == 'false')) {
           // heightCustom = 23
        } else {
            //heightCustom = 23
        }
    }

    if (navigator.platform == 'iPhone') {
        IS_MOBILE = true
    }
   // mobileMenuBarHeight = barHeightMap[action.browser_name]
   // windowWide = action.windowWide
   // menuBarWidth = 27
}

function setWatchParam(action){
    // init watch params
    action.watch_time = Number(action.watch_time)
    if (action.watch_time && action.watch_time >= 30000) {
        action.sub_time = randomRanger(5000, action.watch_time - 10000)
        action.like_time = randomRanger(5000, action.watch_time - 10000)
        action.comment_time = randomRanger(5000, action.watch_time - 10000)
    } else {
        action.is_like = false
        action.is_sub = false 
        action.is_comment = false
    }

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
    if (action.id == 'watch' && action.playlist_percent == 100) {
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
            action.preview = "search"
        } else if (watchTypeRand < action.home_percent + action.suggest_percent + action.page_watch) {
            action.page = true
        } else if (watchTypeRand < action.home_percent + action.suggest_percent + action.page_watch + action.direct_percent) {
            action.preview = false
            action.direct = true
        //} else if (watchTypeRand < action.home_percent + action.suggest_percent + action.page_watch + action.direct_percent + action.google_percent) {
        //    action.google = true
        } else {
            // search
            action.search = true
        }
    }

    let adsPercent = action.ads_percent || 0
    if (Math.random() < adsPercent / 100) {
        action.is_view_ads = true
    }

    // watch random after video
    action.after_video = Math.random() < 0.1
    let searchList = ''//action.video.split(";;")
    action.searchList = searchList
    action.video = ''//searchList[randomRanger(0,searchList.length-1)].trim()
    action.playlist_url = action.playlist_url && action.playlist_url.trim()
    action.url_type = action.url_type && action.url_type.trim().toLowerCase()
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

async function regUserYoutube(action) {
    try {
      await sleep(5000)
      reportLive(action.pid)
  
      let url = window.location.toString()
  
      if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
        //action.
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'VERY')
        return
      }
  
      if (url.indexOf('/PlusPageSignUp') > -1) {
        await userCreateChannel(action)
        return
      }
  
      if (url.indexOf('https://consent.youtube.com/m') > -1) {
        try {
          let btnRejectAll = document.querySelectorAll('form').item(1)
          if (btnRejectAll) {
            await userClick(action.pid, 'btnRejectAll', btnRejectAll)
          } else {
            await goToLocation(action.pid, 'accounts.google.com')
            await sleep(60000)
          }
          return
        } catch (error) {
          console.log(error);
        }
      }
  
      if (url.indexOf('localhost') > 0 || url.indexOf('https://accounts.google.com/signin/v2/identifier') == 0) await sleep(10000)
  
      if (url == 'https://www.youtube.com/') {
        await sleep(5000)
  
        let checkCreateChannel1 = await getElementContainsInnerText('yt-formatted-string', 'CREATE CHANNEL')
        let checkCreateChannel2 = await getElementContainsInnerText('yt-formatted-string', 'TẠO KÊNH')
        let checkCreateChannel3 = await getElementContainsInnerText('yt-formatted-string', 'চ্যানেল তৈরি করুন')
  
        let checkCreateChannel = checkCreateChannel1 || checkCreateChannel2 || checkCreateChannel3
        if (checkCreateChannel) {
          await userClick(action.pid, 'checkCreateChannel', checkCreateChannel)
          await sleep(60000)
        }
  
        let avatar = document.querySelector('#avatar-btn')
        if (avatar) {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
          return
        }
  
        let signinBtn = document.querySelector('ytd-button-renderer > a[href^="https://accounts.google.com/ServiceLogin"]')
        if (signinBtn) {
          await goToLocation(action.pid, 'accounts.google.com')
          await sleep(60000)
        }
  
        let createChannelLayer = document.querySelectorAll('.button-layer a yt-formatted-string[id="text"]')
        if (createChannelLayer) {
          let createChannelBtn = createChannelLayer.item(1)
          if (createChannelBtn) {
            await userClick(action.pid, 'createChannelBtn', createChannelBtn)
            await sleep(15000)
          }
        }
      }
  
      if (url.indexOf('/challenge/iap/verify') > -1) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '/challenge/iap/verify')
      }
      else if (url.indexOf('https://myaccount.google.com/u/5/language') > -1) {
        await goToLocation(action.pid, 'youtube.com/feed/history')
        await sleep(30000)
      }
      else if (url.indexOf('accounts.google.com/speedbump/idvreenable') > -1) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '/speedbump/idvreenable')
      }
      else if (url.indexOf('https://myaccount.google.com/signinoptions/password') > -1) {
        let newPassword = Math.random().toString(36).slice(9).toLocaleUpperCase() + Math.random().toString(36).slice(randomRanger(2, 5))
        action.newPassword = newPassword
        await setActionData(action)
        await userType(action.pid, 'input[name="password"]', newPassword)
        await sleep(randomRanger(3, 5) * 1000)
        await userType(action.pid, 'input[name="confirmation_password"]', newPassword)
        await sleep(randomRanger(3, 5) * 1000)
        await userClick(action.pid, 'button[type="submit"]')
        await sleep(10000)
        await beforeLoginSuccess(action)
        return
      }
      else if (url.indexOf('youtube.com/oops') > -1) {
        await goToLocation(action.pid, 'youtube.com?skip_registered_account_check=true')
        await sleep(15000)
      }
      else if (url.indexOf('consent.youtube.com') > -1) {
        await sleep(2000)
        await userScroll(action.pid, 5)
        let btnElement = document.querySelectorAll('div[data-is-touch-wrapper] > button').item(1)
        if (btnElement) {
          await userClick(action.pid, 'arrgre consent.youtube.com', btnElement)
          await sleep(30000)
        }
        throw "consent.youtube.com"
      }
      else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
        //action.
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'PlusPageSignUpIdvChallenge')
        throw 'PlusPageSignUpIdvChallenge'
      }
      else if (url.indexOf('accounts.google.com/v3/signin/challenge/pwd') > -1 || url.indexOf("accounts.google.com/signin/v2/challenge/pwd") > -1) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'enter pass')
      }
      else if (url.indexOf('https://accounts.google.com/signin/privacyreminder') > -1) {
        while (document.querySelector('[role="button"][jsshadow]')) {
          await userClick(action.pid, '[role="button"][jsshadow]')
          await sleep(15000)
        }
      }
      else if (url.indexOf('accounts.google.com/speedbump/gaplustos') > -1) {
        await userClick(action.pid, 'input[type="submit"]')
        await sleep(60000)
      }
      else if (url.indexOf('https://www.youtube.com/channel/') > -1) {
        await reportScript(action)
        return
      }
      else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUp') > -1) {
        await userCreateChannel(action)
        return
      }
      else if (url.indexOf('youtube.com/account') > -1) {
        let channels = document.querySelectorAll('ytd-account-item-renderer')
  
        if (!channels || !channels.length) {
          await sleep(5000)
          channels = document.querySelectorAll('ytd-account-item-renderer')
        }
        if (!channels || !channels.length) {
          await sleep(5000)
          channels = document.querySelectorAll('ytd-account-item-renderer')
        }
        if (!channels || !channels.length) {
          await sleep(5000)
          channels = document.querySelectorAll('ytd-account-item-renderer')
        }
  
        if (channels.length) {
          // update users count to server
          updateTotalCreatedUsers(action.pid, channels.length)
        }
  
        let btnCreateChannel = document.querySelector('a[href="/create_channel?action_create_new_channel_redirect=true"]')
        if (!btnCreateChannel) {
          await sleep(7000)
          btnCreateChannel = document.querySelector('a[href="/create_channel?action_create_new_channel_redirect=true"]')
        }
  
        if (channels.length < 100 && btnCreateChannel) {
          await userClick(action.pid, '', btnCreateChannel)
        } else {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
        }
        return
      }
    } catch (e) {
      console.log('error', action.pid, e)
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '[catch error] ' + e.toString())
    }
  }