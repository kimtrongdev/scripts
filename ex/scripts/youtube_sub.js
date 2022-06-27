async function scriptYoutubeSub(action) {
  try {
    console.log('start watch')

    let url = window.location.toString()

    if (url.indexOf('/videos') > -1) {
      await processWatchChannelPageSub(action)
    } else if (url.indexOf('youtube.com/account') > -1) {
      let channels = document.querySelectorAll('ytd-account-item-renderer')
      if (channels.length <= action.channel_position) {
        await updateActionStatus(action.pid, action.id, 0, 'end playlist')
        return
      }

      let channel = channels.item(action.channel_position)
      if (channel) {
        if (action.channel_position < channels.length - 2) {
          reportPositionChannel(action.pid, action.channel_position)
        }
        getPlaylistData(action)
        action.channel_position += 1
        await setActionData(action)
        await userClick(action.pid, '', channel)
      } else {
        await updateActionStatus(action.pid, action.id, 0, 'end playlist')
      }
      return
    }
    else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
      //action.

    }
    else if (url.indexOf('google.com/search?q=') > -1) {
      await sleep(2000)
      await userClick(action.pid, '#search div h3')
    }
    else if (url == 'https://www.youtube.com/' || url == 'https://www.youtube.com/feed/trending') {
      await processHomePageSub(action)
    } else if (url.indexOf('youtube.com/feed/history') > -1) {
      await deleteHistorySub(action)
      await goToLocation(action.pid, 'https://www.youtube.com//')
      await sleep(60000)
    } else if (url.indexOf('https://www.youtube.com/results') > -1) {
      await processSearchPageSub(action)
    }
    else if (url.indexOf('https://www.youtube.com/watch') > -1) {
      await processWatchPageSub(action)
    }
    else if (url.indexOf('https://www.youtube.com/playlist?list=') > -1) {
      await processPlaylistPageSub(action)
    }
    else if (
      url.indexOf('https://www.youtube.com/channel/') > -1 || 
      url.indexOf('https://www.youtube.com/user/') > -1 || 
      url.indexOf('https://www.youtube.com/c/') > -1
    ) {
      await processWatchChannelPageSub(action)
    }
    else if (url.indexOf('https://www.youtube.com/create_channel') == 0) {
      await createChannelSub(action)
    }
    else if (url.indexOf('https://myaccount.google.com/') == 0) {
      await goToLocation(action.pid, 'youtube.com//')
    }
    else if (url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/ServiceLogin') > -1) {
      throw 'NOT_LOGIN'
    }
    else if (window.location.toString().indexOf('youtube.com/oops') > -1 && document.querySelector('#alerts')) {
      throw new Error('NOT_LOGIN_' + document.querySelector('#alerts .yt-alert-message').textContent)
    }
    else if (url.indexOf('https://consent.youtube.com') > -1) {
      await updateActionStatus(action.pid, action.id, 0, 'consent.youtube.com')
    }
  }
  catch (e) {
    await reportScript(action, 0)
  }
}

async function processHomePageSub(action) {
  await checkLogin(action)

  if (action.channel_id) {
    await goToLocation(action.pid, 'https://www.youtube.com/' + action.channel_id + '/videos')
    return
  }

  if (action.video_id) {
    await goToLocation(action.pid, 'https://www.youtube.com/watch?v=' + action.video_id)
    return
  }
  await sleep(3000)
}

async function preWatchingVideoSub(action) {
  await setActionData(action)
  await skipAdsSub(false, action)
  action.watch_time = Number(action.sub_time) + 10000 || 30000
  action.sub_time = Number(action.sub_time)

  await setActionData(action)

  return true
}

async function watchingVideoSub(action) {
  let url = window.location.toString()
  let interval = 5000
  for (let i = 0; i < action.watch_time;) {
    // trick ads
    await skipAdsSub(true, action)

    if (i == 0 && url.indexOf('&t=') > -1) {
      await sendKey(action.pid, "0")
    }

    await clickPlayIfPauseSub(action.pid)

    if (action.is_sub && i > action.sub_time && i <= action.sub_time + interval) {
      if (!document.querySelector('tp-yt-paper-button[subscribed]')) {
        let subBtn = document.querySelector('#subscribe-button ytd-subscribe-button-renderer')
        await userClick(action.pid, '#subscribe-button ytd-subscribe-button-renderer', subBtn)
        await sleep(4000)
      }
    }

    let sleepTime = action.watch_time - i > interval ? interval : action.watch_time - i
    await sleep(sleepTime)

    // report time
    if (i % 300000 == 0) {
      if (Math.random() < 0.3) {
        let randomScroll = randomRanger(3, 7)
        await userScroll(action.pid, randomScroll)
        await sleep(1000)
        await userScroll(action.pid, -randomScroll)
      }
    }

    action.lastRequest = Date.now()
    await setActionData(action)

    i += sleepTime
  }
  return true
}

async function afterWatchingVideoSub(action) {
  await reportScript(action)
}

async function skipAdsSub(watchingCheck, action = {}) {
  if (!watchingCheck) await sleep(2000)
  while (document.querySelector('.ytp-ad-preview-slot')) {
    action.viewed_ads = true
    await setActionData(action)
    await sleep(2000)
  }
  while (document.querySelector('.ytp-ad-skip-ad-slot')) {
    console.log('skip ads')
    let adTimeCurrent = getTimeFromText(document.querySelector('.ytp-time-display .ytp-time-current').textContent)
    let adTimeDuration = getTimeFromText(document.querySelector('.ytp-time-display .ytp-time-duration').textContent)

    let adWatchTime
    if (Math.random() < SKIP_ADS_PERCENT) {
      // skip ad
      if (adTimeDuration <= 30) {
        adWatchTime = getWatchAdTime(adTimeCurrent, 1, 10)
      }
      else {
        adWatchTime = getWatchAdTime(adTimeCurrent, 1, 28)
      }
    }
    else {
      // watch ad
      if (adTimeDuration <= 30) {
        adWatchTime = getWatchAdTime(adTimeCurrent, 12, adTimeDuration)
      }
      else {
        if (Math.random() < 0.1) {
          adWatchTime = getWatchAdTime(adTimeCurrent, 0.9 * adTimeDuration, adTimeDuration)
        }
        else if (Math.random() < 0.4) {
          adWatchTime = getWatchAdTime(adTimeCurrent, Math.max(30, adTimeDuration * 0.5), adTimeDuration * 0.9)
        }
        else {
          adWatchTime = getWatchAdTime(adTimeCurrent, 30, Math.max(30, adTimeDuration * 0.5))
        }
      }
    }
    await sleep(adWatchTime * 1000)
    while (!document.querySelector('button.ytp-ad-skip-button') || !document.querySelector('button.ytp-ad-skip-button').getBoundingClientRect().x) {
      await sleep(1000)
    }
    // if (document.querySelector('button.ytp-ad-skip-button')) {
    //     action.viewed_ads = true
    //     await setActionData(action)
    // }
    action.viewed_ads = true
    await setActionData(action)
    await userClick(action.pid, 'button.ytp-ad-skip-button')
    await sleep(2000)
  }
}

async function processPlaylistPageSub(action) {
  let playBtn = document.querySelector('#button > yt-icon > svg > g > path[d="M18.15,13.65l3.85,3.85l-3.85,3.85l-0.71-0.71L20.09,18H19c-2.84,0-5.53-1.23-7.39-3.38l0.76-0.65 C14.03,15.89,16.45,17,19,17h1.09l-2.65-2.65L18.15,13.65z M19,7h1.09l-2.65,2.65l0.71,0.71l3.85-3.85l-3.85-3.85l-0.71,0.71 L20.09,6H19c-3.58,0-6.86,1.95-8.57,5.09l-0.73,1.34C8.16,15.25,5.21,17,2,17v1c3.58,0,6.86-1.95,8.57-5.09l0.73-1.34 C12.84,8.75,15.79,7,19,7z M8.59,9.98l0.75-0.66C7.49,7.21,4.81,6,2,6v1C4.52,7,6.92,8.09,8.59,9.98z"]')
  if (playBtn) {
    await userClick(action.pid, '', playBtn)
  } else {
    await userClick(action.pid, 'ytd-playlist-sidebar-primary-info-renderer #thumbnail.ytd-playlist-thumbnail')
  }
}

async function processSearchPageSub(action) {
  let url = window.location.toString()

  if (action.preview == "search") {
    await userScroll(action.pid, randomRanger(20, 50))
    await sleep(randomRanger(1000, 5000))
    await userClickRandomVideo(action.pid)
    return
  }

  let suggestWatchSearch = await processSearchSuggest(action)
  if (suggestWatchSearch) return

  // filter by hour if first search
  // if(action.url_type=='video' && !action.filter){
  //     let filter = action.filter?(action.filter+1):1
  //     action.filter = filter
  //     await setActionData(action)

  //     await userClick(action.pid, '#filter-menu a > #button')
  //     await sleep(2000)
  //     // this hour
  //     await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
  //     return
  // }

  let videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="' + action.playlist_url + '"]'
  // scroll result
  // if(!document.querySelector(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
  let element
  // if(url.indexOf('253D%253D') > -1 || (action.url_type=='video' && action.filter >= 5) || (action.url_type=='playlist' && action.filter >= 2)){
  // element = document.querySelector(videoSelector)
  // if(!element){
  if (!action.filter || url.indexOf('253D%253D') > -1) {
    let randomScroll = randomRanger(3, 5)
    while (randomScroll > 0 && !element) {
      await userScroll(action.pid, 10)
      await sleep(1000)
      randomScroll -= 1
      element = document.querySelector(videoSelector)
    }
  }

  if (element) {
    if (Math.random() < SEARCH_SKIP) throw 'SEARCH_SKIP'
    if (action.suggest_search) {
      let otherVideos = document.querySelectorAll('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail:not([href*="' + action.playlist_url + '"])')
      if (otherVideos.length > 0) {
        let videoId = otherVideos[randomRanger(0, otherVideos.length - 1)].href
        videoId = videoId.substr(videoId.indexOf('?v=') + 3, 11)
        videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="' + videoId + '"]'
      }
    }
    else if (action.page || action.suggest || action.home) {
      console.log('page_watch')
      let channelLink = element.parentElement.nextElementSibling.querySelector('#channel-info > a')
      action.channel_url = channelLink.href
      action.filter = action.filter ? action.filter - 1 : undefined
      await setActionData(action)
      await userClick(action.pid, action.playlist_url + ' channel-info', channelLink)
    }
    else {
      await userClick(action.pid, videoSelector)
    }
    await sleep(3000)
  }
  else if (action.url_type == 'video') {
    // if filtered, go to home page
    if (url.indexOf('253D%253D') > -1) {
      await userClick(action.pid, '#search-icon-legacy')
      return
    }

    if (!action.query_correction && document.querySelector('a.yt-search-query-correction:nth-of-type(2)')) {
      action.query_correction = true
      await setActionData(action)
      await userClick(action.pid, 'a.yt-search-query-correction:nth-of-type(2)')
      return
    }

    let filter = action.filter ? (action.filter + 1) : 1
    if (filter > 5) {
      console.log('error', 'retry all')
      await updateActionStatus(action.pid, action.id, 0, 'VIDEO_NOT_FOUND')
      return
    }
    else {
      action.filter = filter
      await setActionData(action)
    }

    // await userScrollTo(action.pid,'#filter-menu a > #button')
    // await sleep(1000)
    await userClick(action.pid, '#filter-menu a > #button')
    await sleep(2000)

    if (filter == 1) {
      // this hour
      await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
    }
    if (filter == 2) {
      // today
      await userClick(action.pid, 'a#endpoint[href*="EgIIAg%253D%253D"]')
    }
    else if (filter == 3) {
      // this week
      await userClick(action.pid, 'a#endpoint[href*="EgIIAw%253D%253D"]')
    }
    else if (filter == 4) {
      // this month
      await userClick(action.pid, 'a#endpoint[href*="EgIIBA%253D%253D"]')
    }
    else if (filter == 5) {
      // live
      await userClick(action.pid, 'a#endpoint[href*="EgJAAQ%253D%253D"]')
    }
    await sleep(2000)
  }
  else if (action.url_type == 'playlist') {
    let filter = action.filter ? (action.filter + 1) : 1
    if (filter > 2) {
      console.log('error', 'retry all')
      await updateActionStatus(action.pid, action.id, 0, 'playlist not found')
      return
    }
    else {
      action.filter = filter
      await setActionData(action)
    }

    await userScrollTo(action.pid, '#filter-menu a > #button')
    await sleep(1000)
    await userClick(action.pid, '#filter-menu a > #button')
    await sleep(2000)

    if (filter == 1) {
      // playlist
      await userClick(action.pid, 'a#endpoint[href*="EgIQAw%253D%253D"]')
    }
    if (filter == 2) {
      // today
      await userClick(action.pid, 'a#endpoint[href*="CAISAhAD"]')
    }
  }
  else {
    throw 'unknown url_type'
  }
}

async function processWatchChannelPageSub(action) {
  let url = window.location.toString()

  if(url.indexOf('/videos') > -1){
    let videos = [...document.querySelectorAll(`ytd-two-column-browse-results-renderer[page-subtype="channels"] .ytd-section-list-renderer a#thumbnail`)]
    let video
    if(videos.length){
      video = videos[randomRanger(0, Math.min(videos.length-1, 15))]
      await setActionData(action)
    }

    if (video && Number(action.sub_from_video_percent) > Math.random() * 100) {
      await userClick(action.pid,'video',video)
      await sleep(2000)
    } else {
      await clickSub(action)
    }

  } else{
    // click videos tab
    let videoTab = document.querySelectorAll('#tabsContent .tab-content').item(1)
    if(videoTab){
        await userClick(action.pid,'#tabsContent .tab-content', videoTab)
    }
    else if(document.querySelector('#title-text > a.yt-simple-endpoint[href*="/videos?"]')){
        await userClick(action.pid,'#title-text > a.yt-simple-endpoint[href*="/videos?"]')
    }
    else{
      await clickSub(action)
    }
  }
}

async function clickSub (action) {
  let url = window.location.toString()
  if (document.querySelector('#subscribe-button ytd-subscribe-button-renderer') && url.indexOf('/watch') > -1) {
    await userClick(action.pid,'#subscribe-button ytd-subscribe-button-renderer', subBtn)
    await sleep(3000)
    await reportScript(action)
    return
  }

  if (!document.querySelector('tp-yt-paper-button[subscribed]')) {
    let subBtn = document.querySelector('#subscribe-button ytd-subscribe-button-renderer')
    await userClick(action.pid,'#subscribe-button ytd-subscribe-button-renderer', subBtn)
    await sleep(3000)
    await reportScript(action)
    return
  }
  await reportScript(action, 0)
  return
}

async function processSearchSuggest(action) {
  let url = window.location.toString()
  if (action.suggest_videos) {
    // get public days
    try {
      action.public_days = action.public_days == undefined ? (action.url_type == 'video' ? (await getPublicDays(action.playlist_url)).data : 7) : action.public_days
      await setActionData(action)
    }
    catch (e) {
      console.log('getPublicDays err:', e)
    }

    // check public days
    if (action.public_days <= 1 / 24 && url.indexOf('253D%253D') < 0) {
      // filter by hour
      await userClick(action.pid, '#filter-menu a > #button')
      await sleep(2000)
      await userClick(action.pid, 'a#endpoint[href*="EgIIAQ%253D%253D"]')
    }
    else if (action.public_days <= 1 / 24 && Array.from(document.querySelectorAll('ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail')).length < 20) {
      // filter by hour by not enough results
      action.public_days = 1
      await setActionData(action)
      await userClick(action.pid, '#search-icon-legacy')
    }
    else if (action.public_days <= 1 && url.indexOf('253D%253D') < 0) {
      // filter by day
      await userClick(action.pid, '#filter-menu a > #button')
      await sleep(2000)
      await userClick(action.pid, 'a#endpoint[href*="EgIIAg%253D%253D"]')
    }
    else if (action.public_days <= 7 && url.indexOf('253D%253D') < 0) {
      // filter by week
      await userClick(action.pid, '#filter-menu a > #button')
      await sleep(2000)
      await userClick(action.pid, 'a#endpoint[href*="EgIIAw%253D%253D"]')
    }
    else if (action.public_days <= 30 && url.indexOf('253D%253D') < 0) {
      // filter by month
      await userClick(action.pid, '#filter-menu a > #button')
      await sleep(2000)
      await userClick(action.pid, 'a#endpoint[href*="EgIIBA%253D%253D"]')
    }
    else {
      let randomScroll
      if (action.url_type == 'video' && (action.public_days == undefined || action.public_days > 1)) {
        randomScroll = randomRanger(0, 9)
      }
      else {
        randomScroll = randomRanger(0, 4)

      }
      if (randomScroll > 0) {
        await userScroll(action.pid, randomScroll * 5)
      }
      await sleep(randomRanger(1000, 5000))
      await userClickRandomVideo(action.pid)
    }
    return true
  }
}

async function processWatchPageSub(action) {
  await sleep(10000)
  try {
    // like
    if (Number(action.like_percent) > Math.random() * 100) {
      await LikeOrDisLikeYoutubeVideo(action.pid, true)
    }
    // comment
    if (Number(action.comment_percent) > Math.random() * 100) {
      await CommentYoutubeVideo(action.pid, action.comment)
    } else {
      await sleep(5000)
    }
  } catch (error) {
    console.log(error);
  }

  await sleep(5000)
  await clickSub(action)
}

async function clickPlayIfPauseSub(pid) {
  let btnPlay = document.querySelector('path[d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z"]')
  if (btnPlay) {
    await userClick(pid, 'button.ytp-play-button')
  }
}

function getTimeFromText(str) {
  try {
    let time = str.split(':')
    return time[0] * 60 + time[1] * 1
  }
  catch (e) {
    return 0
  }
}

function getWatchAdTime(currentTime, minTime, maxTime) {
  minTime = Math.round(minTime)
  maxTime = Math.round(maxTime)
  let adWatchTime = randomRanger(minTime, maxTime) - currentTime
  return adWatchTime > 0 ? adWatchTime : 0
}

async function deleteHistorySub(action) {
  try {
    let pauseIcon = document.querySelector("a > #button > yt-icon > svg > g > path[d='M11,16H9V8h2V16z M15,8h-2v8h2V8z M12,3c4.96,0,9,4.04,9,9s-4.04,9-9,9s-9-4.04-9-9S7.04,3,12,3 M12,2C6.48,2,2,6.48,2,12 s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2L12,2z']")
    if (!pauseIcon) return
    await userClick(action.pid, 'saved history button', pauseIcon)
    await sleep(2000)
    let historyOnInput = document.querySelector('.yt-confirm-dialog-renderer #confirm-button')
    if (historyOnInput) {
      console.log('pauseHistory')
      await userClick(action.pid, '.yt-confirm-dialog-renderer #confirm-button', historyOnInput)
      await sleep(2000)
      // await userClick(action.pid,'[role="dialog"] button[jsname] span')
      // await sleep(3000)
      // await waitForSelector('[role="dialog"] input:not([checked])')
      // await userClick(action.pid,'[role="dialog"] button')
      // await sleep(3000)
      // if(document.querySelector('[role="list"] [role="listitem"]')){
      //     await userClick(action.pid,'c-wiz[data-p*="activitycontrols"] > div > div > div:nth-child(2) > div:nth-child(2) button span')
      //     await sleep(2000)
      //     await userClick(action.pid,'[role="dialog"] ul > li:nth-child(3)')
      //     await sleep(3000)
      //     let btns = [...document.querySelectorAll('[role="dialog"] button:not([aria-label])')]
      //     await userClick(action.pid,'delete history',btns[btns.length-1])
      //     await sleep(5000)
      // }
    }
  }
  catch (e) {
    console.log('error', 'pauseHistory', e)
  }
}

async function createChannelSub(action) {
  await sleep(5000)
  for (let i = 0; i < 5; i++) {
    if (document.querySelector('button.create-channel-submit')) break
    await sleep(2000)
  }
  let firstName = document.querySelector('#create-channel-first-name')
  if (!firstName.value) {
    await userType(action.pid, '#create-channel-first-name', randomString(), firstName)
  }
  let lastName = document.querySelector('#create-channel-last-name')
  if (!lastName.value) {
    await userType(action.pid, '#create-channel-last-name', randomString(), lastName)
  }
  await userClick(action.pid, 'button.create-channel-submit')
}

function randomString() {
  return Math.random().toString(36).substring(2);
}