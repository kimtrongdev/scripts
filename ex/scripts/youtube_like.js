async function youtubeLike(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.indexOf('youtube.com/account') > -1) {
      await handleAccountPageLike(action)
    }
    else if (url.indexOf('https://www.youtube.com/shorts/') > -1) {
      await gotoLike(action)
    }
    else if (url == 'https://www.youtube.com/' || url == 'https://www.youtube.com/feed/trending' || url == 'https://m.youtube.com/') {
      if (action.video_name) {
        if (action.channel_title) {
          action.video_name += ' ' + action.channel_title
        }
        await userTypeEnter(action.pid, 'input#search', action.video_name)
        return
      }
      await gotoLike(action)
    }
    else if (url.indexOf('https://www.youtube.com/results') > -1) {
      action.channel_id_of_video = action.channel_id
      action.channel_id = null
      await processSearchPageSub(action, true)
      await sleep(10000)
      if (action.channel_id_of_video) {
        await goToLocation(action.pid, 'https://www.youtube.com/channel/' + action.channel_id_of_video + '/videos')
        return
      }
      await reportScript(action, false)
    }
    else if(url.indexOf('https://www.youtube.com/watch') > -1){
      reportLive(action.pid)
      await sleep(10000)
      await updateWatchedVideo(false, action.pid)
      await LikeOrDisLikeYoutubeVideo(action.pid, true)
      await sleep(3000)
      await reportScript(action)
    } else if(url.indexOf('youtube.com/@') > -1 || url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1){
      if (document.querySelector('#edit-buttons a')) {
        await userClick(action.pid, '#edit-buttons a')
      } else {
        await processWatchChannelPage(action, action.video_ids)
        await sleep(15000)
        await gotoLike(action)
        await sleep(10000)
        await reportScript(action, false)
      }
    } else {
      //await reportScript(action, false)
    }
  } catch (error) {
    console.log(error);
  }
}

async function gotoLike (action) {
  await goToLocation(action.pid, 'https://www.youtube.com/watch?v=' + action.video_ids)
}

async function handleAccountPageLike (action) {
  reportLive(action.pid)
  let channels = document.querySelectorAll('ytd-account-item-renderer img')
  if (action.loadFirstUser) {
      action.loadFirstUser = false
      await setActionData(action)
      await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
      await sleep(60000)
      return
  }

  if (!channels.length) {
      await sleep(15000)
      channels = document.querySelectorAll('ytd-account-item-renderer img')
  }

  let checkboxDontShow = document.querySelector('#checkboxContainer')
  if (document.querySelector('#primary-content')) {
      await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
      await sleep(60000)
  }

  // handle not found channels
  if (!channels.length) {
      await userClick(action.pid, '#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img')
      await sleep(5000)
      let switchChannelOpt = document.querySelectorAll('yt-multi-page-menu-section-renderer #endpoint #content-icon').item(3)
      if (switchChannelOpt) {
          await userClick(action.pid, 'switchChannelOpt', switchChannelOpt)
          await sleep(5000)
          let fisUser = document.querySelectorAll('ytd-account-item-section-renderer ytd-account-item-renderer #contentIcon img').item(1)
          if (fisUser) {
              await userClick(action.pid, 'fisUser', fisUser)
              await sleep(60000)
          }
      }
  }

  if (!channels || !channels.length || checkboxDontShow) {
      action.loadFirstUser = true
      await setActionData(action)
      await goToLocation(action.pid, 'youtube.com/account')
      await sleep(60000)
      return
  }

  if (channels.length <= action.channel_position) {
      reportPositionChannel(action.pid, 0)
      await reportScript(action)
      return
  }

  action.channel_position += 1

  if (!action.channel_position || action.channel_position > channels.length - 1) {
    action.channel_position = 0
  }

  let channel = channels.item(action.channel_position)

  if (!channel) {
    action.channel_position = 0
    channel = channels.item(action.channel_position)
  }

  if (channel) {
      if (action.channel_position < channels.length - 2) {
          reportPositionChannel(action.pid, action.channel_position)
      }

      await setActionData(action)
      await userClick(action.pid, '', channel)
  } else {
    await reportScript(action)
  }
}