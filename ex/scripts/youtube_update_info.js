async function youtubeUpdateInfo(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    if (url.indexOf('https://consent.youtube.com/m') > -1) {
        try {
            let btnRejectAll = document.querySelectorAll('form').item(1)
            if (btnRejectAll) {
                await userClick(action.pid, 'btnRejectAll', btnRejectAll)
            } else {
                await goToLocation(action.pid,'accounts.google.com')
                await sleep(60000)
            }
            return
        } catch (error) {
            console.log(error);
        }
    }

    if (url.includes('/editing/details')) {
      await userType(action.pid, '#brand-name-input', action.info_name)
      await userType(action.pid, '#description-textbox', action.info_description)
      await userClick(action.pid, '#publish-button')
      await sleep(10000)

    }
    else if (url == 'https://www.youtube.com/') {
      if (action.channel_position == 0) {
        await sleep(5000)
        let checkCreateChannel = await getElementContainsInnerText('yt-formatted-string', 'CREATE CHANNEL')
        if (checkCreateChannel) {
          await userClick(action.pid, 'checkCreateChannel', checkCreateChannel)
          return
        }
      }
      await goToLocation(action.pid, `https://www.youtube.com/playlist?${action.playlist_url}`)
      
    }
    else if (url.indexOf('youtube.com/playlist') > -1) {
      try {
        await sleep(4000)
        action.data_reported = document.querySelectorAll('#stats yt-formatted-string').item(1).innerText
        await setActionData(action)
      } catch (error) {
        console.log(error);
      }

      if (document.querySelector('ytd-alert-with-button-renderer button')) {
        await userClick(action.pid, 'ytd-alert-with-button-renderer button')
        await sleep(5000)
      }

      await goToLocation(action.pid, `https://www.youtube.com/results?search_query=${action.playlist_name}&sp=CAISAhAB`)
    }
    else if (url.indexOf('youtube.com/account') > -1) {
      await sleep(4000)
      let channels = document.querySelectorAll('ytd-account-item-renderer')
      if (action.loadFirstUser) {
          action.loadFirstUser = false
          await setActionData(action)
          await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
          await sleep(60000)
          return
      }

      if (!channels.length) {
          await sleep(25000)
          channels = document.querySelectorAll('ytd-account-item-renderer')
      }

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

      if (!channels || !channels.length) {
          action.loadFirstUser = true
          await setActionData(action)
          await goToLocation(action.pid, 'youtube.com/account')
          await sleep(60000)
          return
      }

      let channel = channels.item(randomRanger(0, channels.length - 1))
      if (channel) {
          await userClick(action.pid, '', channel)
      } else {
        await reportScript(action, 0)
      }
      return
    }
    else if (url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1) {
      let videos = document.querySelectorAll('#items #details #menu svg path[d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"]')
      let total = Math.min(videos.length, 3)
      let count = 0
      while (count < total) {
        if (count % 5 == 0) {
          reportLive(action.pid)
        }
        
        let item = videos.item(count)
        if (item) {
          await userClick(action.pid, '', item)
          await userClick(action.pid, 'ytd-menu-service-item-renderer path[d="M22,13h-4v4h-2v-4h-4v-2h4V7h2v4h4V13z M14,7H2v1h12V7z M2,12h8v-1H2V12z M2,16h8v-1H2V16z"]')

          let playlistItem = document.querySelector(`yt-formatted-string[title="${action.playlist_name}"]`)
          if (playlistItem) {
            await userClick(action.pid, '', playlistItem)
          }
          
          await userClick(action.pid, 'yt-icon[icon="close"]')
        }
        count++
      }

      reportScript(action)
    }
    else if (url.indexOf('https://studio.youtube.com/channel/') > -1) {
      let itemInfo = document.querySelectorAll('#tabsContent .tab-content').item(2)
      if (itemInfo) {
        await userClick(action.pid, 'itemInfo', itemInfo)
        await userClick(action.pid, 'itemInfo', itemInfo)
      }
    }
    else if (url.indexOf('youtube.com/playlist?list=') > -1) {
      

    }
    else if (url.indexOf('youtube.com/results') > -1) {
      // search
      await handleSearchAddVideo(action)
    }
  }
  catch (e) {
    await reportScript(action, 0)
  }
}

async function handleSearchAddVideo (action) {
  let videos = document.querySelectorAll('ytd-video-renderer #menu ytd-menu-renderer path[d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"]')
  let total = Math.min(videos.length, Number(action.total_added_from_search) || 10)
  let count = 0
  while (count < total) {
    if (count % 5 == 0) {
      reportLive(action.pid)
    }

    let item = videos.item(count)
    if (item) {
      await userClick(action.pid, '', item)
      await sleep(1000)
      await userClick(action.pid, 'ytd-menu-service-item-renderer path[d="M22,13h-4v4h-2v-4h-4v-2h4V7h2v4h4V13z M14,7H2v1h12V7z M2,12h8v-1H2V12z M2,16h8v-1H2V16z"]')
      await sleep(3000)
      await userClick(action.pid, '#checkbox-container path[d="M9,1C4.58,1,1,4.58,1,9s3.58,8,8,8s8-3.58,8-8S13.42,1,9,1z M16,9c0,1.31-0.37,2.54-1,3.59V11h-2c-0.55,0-1-0.45-1-1   c0-1.1-0.9-2-2-2H8.73C8.9,7.71,9,7.36,9,7V5h1c1.1,0,2-0.9,2-2V2.69C14.36,3.81,16,6.21,16,9z M2.02,9.45L7,12.77V13   c0,1.1,0.9,2,2,2v1C5.29,16,2.26,13.1,2.02,9.45z M10,15.92V14H9c-0.55,0-1-0.45-1-1v-0.77L2.04,8.26C2.41,4.75,5.39,2,9,2   c0.7,0,1.37,0.11,2,0.29V3c0,0.55-0.45,1-1,1H8v3c0,0.55-0.45,1-1,1H5.5v1H10c0.55,0,1,0.45,1,1c0,1.1,0.9,2,2,2h1v1.89   C12.95,14.96,11.56,15.7,10,15.92z"]')
      await userClick(action.pid, 'yt-icon[icon="close"]')
    }
    count++
  }

  // go to suggest channel
  if (action.suggest_channel) {
    await goToLocation(action.pid, `https://www.youtube.com/${action.suggest_channel}/videos`)
  } else {
    reportScript(action)
  }

}
