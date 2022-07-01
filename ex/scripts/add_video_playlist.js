async function scriptAddVideoPlaylist(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    if (url == 'https://www.youtube.com/') {
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
      //todo check views

      if (document.querySelector('ytd-alert-with-button-renderer #button yt-formatted-string')) {
        await userClick(action.pid, 'ytd-alert-with-button-renderer #button yt-formatted-string')
        await sleep(5000)
      }

      await goToLocation(action.pid, `https://www.youtube.com/results?search_query=${action.playlist_name}&sp=CAMSBAgCEAE%253D`)
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
    else if (url.indexOf('/playlists') > -1) {
      while (document.querySelector('#single-step-navigation')) {
        await userClick(action.pid, '#single-step-navigation #close-button')
        await sleep(1000)
      }

      await userClick(action.pid, '#new-playlist-button')

      await userType(action.pid, '#create-playlist-form textarea', action.playlist_name)
      await userClick(action.pid, '#create-button')
      await sleep(10000)
      
      // goto playlist setting
      await userClick(action.pid, 'ytcp-playlist-row img')
    }
    else if (url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1) {
      let videos = document.querySelectorAll('#items #details #menu svg path[d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"]')
      let total = Math.min(videos.length, 5)
      let count = 0
      while (count < total) {
        if (count % 5 == 0) {
          reportLive(action.pid)
        }
        
        let item = videos.item(count)
        if (item) {
          await userClick(action.pid, '', item)
          await userClick(action.pid, 'ytd-menu-service-item-renderer path[d="M22,13h-4v4h-2v-4h-4v-2h4V7h2v4h4V13z M14,7H2v1h12V7z M2,12h8v-1H2V12z M2,16h8v-1H2V16z"]')
         
          let playlistItem = getElementContainsInnerText('yt-formatted-string', action.playlist_name)
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
      await userClick(action.pid, '#menu-item-2')
      await userClick(action.pid, '#menu-item-2')

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
  let videos = document.querySelectorAll('path[d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"]')
  let total = Math.min(videos.length, 1)
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
      
      let playlistItem = getElementContainsInnerText('yt-formatted-string', action.playlist_name)
      if (playlistItem) {
        await userClick(action.pid, '', playlistItem)
      }
      await userClick(action.pid, 'yt-icon[icon="close"]')
    }
    count++
  }

  // go to suggest channel
  await goToLocation(action.pid, `https://www.youtube.com/${action.suggest_channel}/videos`)

}
