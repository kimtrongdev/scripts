async function youtubeLike(action) {
  try {
    console.log('start like')

    let url = window.location.toString()

    if (url.indexOf('support.google.com/accounts/answer/40039') > -1) {
      await updateActionStatus(action.pid, 'login', LOGIN_STATUS.ERROR, 'support.google.com/accounts/answer/40039')
      return
    }

    if (url.includes('accounts.google.com/v3/signin/identifier')) {
      await updateActionStatus(action.pid, 'login', LOGIN_STATUS.ERROR, 'accounts.google.com/v3/signin/identifier')
      return
    }
    

    if (url.includes('support.google.com/accounts/answer/40039') ||
      url.includes('accounts.google.com/v3/signin/productaccess/landing') ||
      url.includes('accounts.google.com/v3/signin/identifier')
    ) {
      await reportScript(action, 'ERROR_TYPE_1')
      return
    }

    if (url.includes('accounts.google.com/InteractiveLogin/signinchooser')) {
      // renew profile
      await resetProfile(action)
    }
    else if (url.indexOf('/videos') > -1) {
      await processWatchChannelPageLike(action)
    } if (url.indexOf('youtube.com/account') > -1) {
      await handleUsersSelection(action)
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
      await processHomePageLike(action)
    } else if (url.indexOf('youtube.com/feed/history') > -1) {
      await goToLocation(action.pid, 'https://www.youtube.com//')
      await sleep(60000)
    } else if (url.indexOf('https://www.youtube.com/results') > -1) {
      await processSearchPageLike(action)
    }
    else if (url.indexOf('https://www.youtube.com/watch') > -1 || url.indexOf('youtube.com/shorts') > -1) {
      await processWatchPageLike(action)
    }
    else if (url.indexOf('https://www.youtube.com/playlist?list=') > -1) {
      await processPlaylistPageLike(action)
    }
    else if (
      url.indexOf('youtube.com/@') > -1 ||
      url.indexOf('https://www.youtube.com/channel/') > -1 || 
      url.indexOf('https://www.youtube.com/user/') > -1 || 
      url.indexOf('https://www.youtube.com/c/') > -1
    ) {
      await processWatchChannelPageLike(action)
    }
    else if (url.indexOf('https://www.youtube.com/create_channel') == 0) {
      await createChannelLike(action)
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

async function processHomePageLike(action) {
  await checkLogin(action)

  if (action.video_name && action.sub_from_search_video) {
    if (action.channel_title) {
      action.video_name += ' ' + action.channel_title
    }
    await userTypeEnter(action.pid, 'input#search', action.video_name)
    return
  }

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

async function processPlaylistPageLike(action) {
  let playBtn = document.querySelector('#button > yt-icon > svg > g > path[d="M18.15,13.65l3.85,3.85l-3.85,3.85l-0.71-0.71L20.09,18H19c-2.84,0-5.53-1.23-7.39-3.38l0.76-0.65 C14.03,15.89,16.45,17,19,17h1.09l-2.65-2.65L18.15,13.65z M19,7h1.09l-2.65,2.65l0.71,0.71l3.85-3.85l-3.85-3.85l-0.71,0.71 L20.09,6H19c-3.58,0-6.86,1.95-8.57,5.09l-0.73,1.34C8.16,15.25,5.21,17,2,17v1c3.58,0,6.86-1.95,8.57-5.09l0.73-1.34 C12.84,8.75,15.79,7,19,7z M8.59,9.98l0.75-0.66C7.49,7.21,4.81,6,2,6v1C4.52,7,6.92,8.09,8.59,9.98z"]')
  if (playBtn) {
    await userClick(action.pid, '', playBtn)
  } else {
    await userClick(action.pid, 'ytd-playlist-sidebar-primary-info-renderer #thumbnail.ytd-playlist-thumbnail')
  }
}

async function processSearchPageLike(action, preventGoToChannel = false) {
  let url = window.location.toString()

  if (action.preview == "search") {
    await userScroll(action.pid, randomRanger(20, 50))
    await sleep(randomRanger(1000, 5000))
    await userClickRandomVideo(action.pid)
    return
  }

  // let suggestWatchSearch = await processSearchSuggest(action)
  // if (suggestWatchSearch) return

  let videoSelector = 'ytd-two-column-search-results-renderer .ytd-section-list-renderer a#thumbnail[href*="' + action.playlist_url + '"]'
  // scroll result
  // if(!document.querySelector(videoSelector) && (!action.filter || url.indexOf('253D%253D') > -1)){
  let element
  // if(url.indexOf('253D%253D') > -1 || (action.url_type=='video' && action.filter >= 5) || (action.url_type=='playlist' && action.filter >= 2)){
  // element = document.querySelector(videoSelector)
  // if(!element){
  let randomScroll = randomRanger(3, 5)
  while (randomScroll > 0 && !element) {
    await userScroll(action.pid, 10)
    await sleep(1000)
    randomScroll -= 1
    element = document.querySelector(videoSelector)
  }

  if (element) {
    await userClick(action.pid, videoSelector)
    await sleep(3000)
  }
  else {
    let channel = getElementContainsInnerText('a', action.channel_title, '', 'contains')
    if (channel) {
      await userClick(action.pid, 'channel', channel)
    } else if (!preventGoToChannel) {
      if (action.channel_id) {
        await goToLocation(action.pid, 'https://www.youtube.com/' + action.channel_id + '/videos')
        return
      }
    }
  }
}

async function getLikeData(action) {
  if (document.querySelector('[title="I like this"]')) {
    action.data_reported = document.querySelector('button[aria-label*="like this video"]').innerText
    await setActionData(action)
  }
}

async function processWatchChannelPageLike(action) {
  let url = window.location.toString()

  if (action.subscribed) {
    console.log('subscribed')
    await getLikeData(action)
    await reportScript(action)
    return
  }

  if(url.indexOf('/videos') > -1 || url.indexOf('/shorts') > -1){
    let videos 
    let video
    if (url.indexOf('/shorts') > -1) {
      videos = [...document.querySelectorAll(`ytd-rich-grid-slim-media ytd-thumbnail a#thumbnail`)]
    } else {
      videos = [...document.querySelectorAll('#content ytd-rich-grid-media ytd-thumbnail a#thumbnail')]
    }

    videos = videos.filter(video => {
      let pos = getElementPosition(video)
      return pos.x > 10
    })

    if(videos.length){
      video = videos[randomRanger(0, Math.min(videos.length-1, 15))]
      await setActionData(action)
    } else {
      let videoTab = document.querySelectorAll('#tabsContent .tab-content').item(1)
      if(videoTab){
        await userClick(action.pid,'#tabsContent .tab-content', videoTab)
        await sleep(4000)
      } else {
        await handleLikeYoutube(action)
        await sleep(3000)
        await reportScript(action)
      }
      return
    }

    await getLikeData(action)

    if (video && Number(action.sub_from_video_percent) > Math.random() * 100) {
      await userClick(action.pid,'video',video)
      await sleep(2000)
    } else {
      await handleLikeYoutube(action)
    }

  } else if (action.tab_clicked) {
    await handleLikeYoutube(action)
    await sleep(3000)
    await reportScript(action)
  }
  else{
    action.tab_clicked = true
    await setActionData(action)

    // click videos tab
    let videoTab = document.querySelectorAll('#tabsContent .tab-content').item(1)
    if(videoTab){
        await userClick(action.pid,'#tabsContent .tab-content', videoTab)
    }
    else if(document.querySelector('#title-text > a.yt-simple-endpoint[href*="/videos?"]')){
        await userClick(action.pid,'#title-text > a.yt-simple-endpoint[href*="/videos?"]')
    }
    else{
      await handleLikeYoutube(action)
      await sleep(3000)
      await reportScript(action)
    }
  }
}

async function handleLikeYoutube (action, endScript = true) {
  let url = window.location.toString()
  let likeBtn = document.querySelector('#inner-header-container #subscribe-button')

  if (url.indexOf('/watch') > -1 || url.indexOf('/shorts') > -1) {
    if (url.indexOf('/shorts') > -1) {
      likeBtn = document.querySelector('ytd-reel-player-overlay-renderer #channel-container #subscribe-button')
    } else {
      likeBtn = document.querySelector("#top-level-buttons-computed like-button-view-model")
    }
  }
  if (likeBtn) {
    await userClick(action.pid,'likeBtn', likeBtn)
    await sleep(3000)
    if (endScript) {
      await reportScript(action)
    }
  } else {
    // if (document.querySelector('#subscribe-button-shape')) {
    //   await userClick(action.pid,'#subscribe-button-shape')
    //   await sleep(3000)
    //   await reportScript(action)
    // } else {
    //   console.log('not found sub btn')
    //   await reportScript(action, 0)
    // }
  }
}

function loadVideoTime() {
  videoTime = document.querySelector('.ytp-time-duration').textContent.split(':')
  videoTime = videoTime.length==2?videoTime[0]*60+videoTime[1]*1:videoTime[0]*60*60+videoTime[1]*60+videoTime[2]*1
  return videoTime * 1000
}

async function processWatchPageLike(action) {
  let url = window.location.toString()
  await updateWatchedVideo(false, action.pid)

  await sleep(7000)
  await skipAds(true, action)

  let videoTime = loadVideoTime()
  if (!videoTime) {
    videoTime = 9999999
  }

  if (Number(action.watch_time) && videoTime > action.watch_time) {
    await sleep(Number(action.watch_time))
  }

  try {
    action.data_reported = document.querySelector('button[aria-label*="like this video"]')?.innerText
    if (action.data_reported) {
      await setActionData(action)
    }
  } catch (error) {
    console.log(error);
  }

  if (url.indexOf('youtube.com/shorts') > -1) {
    await sleep(3000)
    await handleLikeYoutube(action, false)
    action.subscribed = true
    await setActionData(action)
    await userClick(action.pid, '#channel-container #channel-info #avatar')
    await sleep(5000)
    await reportScript(action, 0)
  } else {
    //await sleep(10000)
    try {
      // like
      if (Number(action.like_percent) > Math.random() * 100) {
        await LikeOrDisLikeYoutubeVideo(action.pid, true)
      }
      // comment
      if (Number(action.comment_percent) > Math.random() * 100) {
        await CommentYoutubeVideo(action.pid, action.comment)
      } else {
        //await sleep(5000)
      }
    } catch (error) {
      console.log(error);
    }

    //await sleep(5000)
    await handleLikeYoutube(action)
  }
}

async function createChannelLike(action) {
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