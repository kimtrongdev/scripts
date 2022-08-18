
async function renameChannel(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.indexOf('youtube.com/account') > -1) {
      await handleAccountPage(action)
    }
    else if (url.indexOf('https://www.youtube.com/shorts/') > -1) {
      await gotoWatch(action)
    }
    else if (url == 'https://www.youtube.com/' || url == 'https://www.youtube.com/feed/trending' || url == 'https://m.youtube.com/') {
      closeUnactiveTabs()
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

      await userClick(action.pid, '#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img')

      while (document.querySelector('#single-step-navigation')) {
        await userClick(action.pid, '#single-step-navigation #close-button')
        await sleep(1000)
      }

      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

      await userClick(action.pid, '#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img')
      await sleep(5000)

      let switchChannelOpt = document.querySelector('yt-multi-page-menu-section-renderer #endpoint #content-icon')
      if (switchChannelOpt) {
          await userClick(action.pid, 'switchChannelOpt', switchChannelOpt)
          
          await sleep(5000)
          if (document.querySelector('#create-channel-button')) {
            await userClick(action.pid, '#create-channel-button')
            await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
          }

          await userClick(action.pid, 'switchChannelOpt', switchChannelOpt)
      }
    }
    else if(url.indexOf('https://www.youtube.com/watch') > -1){
      reportLive(action.pid)
      await waitForSelector('#placeholder-area')
      await CommentYoutubeVideo(action.pid)
      await afterComment(action)
    } else if(url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1){
      if (document.querySelector('#edit-buttons a')) {
        await userClick(action.pid, '#edit-buttons a')
      } else {
        await handleChannelPage(action)
      }
    } else if (url.indexOf('/editing/sections') > -1) {
      await handleStudioSetting(action)
    }
  } catch (error) {
    console.log(error);
  }
}

async function handleStudioSetting (action) {
  await userClick(action.pid, '#publish-button')
  await userClick(action.pid, 'Thong tin co ban', document.querySelectorAll('tp-yt-paper-tab')[2])

  //close mini popup
  while (document.querySelector('#single-step-navigation')) {
    await userClick(action.pid, '#single-step-navigation #close-button')
    await sleep(1000)
  }
  
  await userClick(action.pid, '#edit-button')
  
  let fullname = await randomFullName()
  await userType(action.pid, '#brand-name-input', fullname)

  await userClick(action.pid, '#publish-button')
  await sleep(2000)
  await userClick(action.pid, '#discard-changes-button')

  await updateUserInput(action.pid,'GO_TO_FISRT_TAB',0,0,0,0,"",'GO_TO_FISRT_TAB')

  await goToLocation(action.pid,'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
}

async function gotoWatch (action) {
  if (action.channel_ids && action.channel_ids.length) {
    let channel_id = action.channel_ids[randomRanger(0, action.channel_ids.length - 1)]
    await goToLocation(action.pid, 'https://www.youtube.com/' + channel_id + '/videos')
  } else {
    if (!action.video_ids.length) {
      await reportScript(action)
    } else {
      let videoId = action.video_ids.shift()
      await setActionData(action)
      await goToLocation(action.pid, 'https://www.youtube.com/watch?v=' + videoId)
    }
  }
}

async function afterComment (action) {
  action.commented_count++
  await setActionData(action)
  if (action.commented_count <= action.commented_count_max) {
    if (action.commented_count % action.comment_change_user == 0) {
      await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
    } else {
      await gotoWatch(action)
    }
  } else {
    await reportScript(action)
  }
}

async function handleChannelPage (action) {
  await processWatchChannelPage(action)
}

async function handleAccountPage (action) {
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
      let msg = 'rename_success'
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, msg)
      return
  }

  action.channel_position += 1
  let channel = channels.item(action.channel_position)
  if (channel) {
      updateTotalCreatedUsers(action.pid, action.channel_position)
      if (action.channel_position < channels.length - 2) {
        reportPositionChannel(action.pid, action.channel_position)
      }

      await setActionData(action)
      await userClick(action.pid, '', channel)
  } else {
    let msg = 'rename_success'
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, msg)
    return
  }
}
