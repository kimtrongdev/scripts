async function scriptAddVideoPlaylist(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    //await checkLang(action)

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
    else if (url.indexOf('/language') > -1) {
      await goToLocation(action.pid, `https://www.youtube.com/playlist?${action.playlist_url}`)
      await sleep(30000)
    }
    else if (url.indexOf('youtube.com/playlist') > -1) {
      try {
        await sleep(4000)
        action.data_reported = document.querySelector('.ytd-playlist-byline-renderer').innerText
        await setActionData(action)
      } catch (error) {
        console.log(error);
      }
      
      let buttons = document.querySelectorAll('ytd-alert-with-button-renderer #buttons')
      let b = buttons.item(buttons.length - 1)
      if (b) {
        await userClick(action.pid, 'b', b)
        await sleep(5000)

        let createChannelBtn = document.querySelector('#create-channel-button')
        if (createChannelBtn && elementInViewport(createChannelBtn)){
          if (createChannelBtn) {
            await userClick(action.pid, 'createChannelBtn', createChannelBtn)
            await sleep(10000)
          }
        }
        await sleep(10000)
      }

      await goToLocation(action.pid, `https://www.youtube.com/results?search_query=${action.playlist_name}&sp=CAISAhAB`)
    }
    else if (url.indexOf('youtube.com/account') > -1) {
      await sleep(4000)
      let channels = document.querySelectorAll('ytd-account-item-renderer[class="style-scope ytd-channel-switcher-page-renderer"]')
      if (action.loadFirstUser) {
          action.loadFirstUser = false
          await setActionData(action)
          await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
          await sleep(60000)
          return
      }

      if (!channels.length) {
          await sleep(25000)
          channels = document.querySelectorAll('ytd-account-item-renderer[class="style-scope ytd-channel-switcher-page-renderer"]')
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
      const filteredElements = [];
      // Lặp qua danh sách các phần tử đã chọn
      channels.forEach(element => {
      // Kiểm tra xem phần tử có tồn tại children[3] không
        const children = element.children[0].children[3]
        if (children && children.hasAttribute('hidden')) {
            // Kiểm tra xem children[3] có thuộc tính hidden không (lọc ra những kênh bị khóa)
            // Thêm phần tử vào danh sách đã lọc
             filteredElements.push(element);
        }
      });

      let channel = filteredElements.item(randomRanger(0, filteredElements.length - 1))
      console.log(124124124124, filteredElements.length, channel);
      await sleep(20000)
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
    else if (url.indexOf('youtube.com/@') > -1 || url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1) {
      let videos = document.querySelectorAll('#contents ytd-rich-grid-media #details ytd-menu-renderer yt-icon-button yt-icon')
      let total = Math.min(videos.length, Number(action.total_added_from_channel) || 5)
      let count = 0
      while (count < total) {
        if (count % 5 == 0) {
          reportLive(action.pid)
        }
        
        let item = videos.item(count)
        if (item) {
          await userClick(action.pid, '', item)
          await userClick(action.pid, 'ytd-menu-service-item-renderer path[d="M22 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2zm-8-6H2v1h12V7zM2 12h8v-1H2v1zm0 4h8v-1H2v1z"]')

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
  await sleep(5000)
  let videos = document.querySelectorAll('#contents .ytd-video-renderer path[d="M12 16.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zM10.5 12c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5zm0-6c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5-.67-1.5-1.5-1.5-1.5.67-1.5 1.5z"]')
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
      await userClick(action.pid, 'ytd-menu-service-item-renderer path[d="M22 13h-4v4h-2v-4h-4v-2h4V7h2v4h4v2zm-8-6H2v1h12V7zM2 12h8v-1H2v1zm0 4h8v-1H2v1z"]')
      await sleep(3000)
      await userClick(action.pid, '#checkbox-container path[d="M9 1C4.58 1 1 4.58 1 9s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm7 8c0 1.31-.37 2.54-1 3.59V11h-2c-.55 0-1-.45-1-1 0-1.1-.9-2-2-2H8.73c.17-.29.27-.64.27-1V5h1c1.1 0 2-.9 2-2v-.31c2.36 1.12 4 3.52 4 6.31zm-13.98.45L7 12.77V13c0 1.1.9 2 2 2v1c-3.71 0-6.74-2.9-6.98-6.55zM10 15.92V14H9c-.55 0-1-.45-1-1v-.77L2.04 8.26C2.41 4.75 5.39 2 9 2c.7 0 1.37.11 2 .29V3c0 .55-.45 1-1 1H8v3c0 .55-.45 1-1 1H5.5v1H10c.55 0 1 .45 1 1 0 1.1.9 2 2 2h1v1.89c-1.05 1.07-2.44 1.81-4 2.03z"]')
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
