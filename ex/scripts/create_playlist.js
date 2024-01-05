async function createPlaylistScript(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    if (url == 'https://www.google.com') {
      await goToLocation(action.pid, 'https://www.youtube.com/')
      return
    }

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
      if (action.channel_position == 0 || !action.channel_position) {
        await sleep(5000)
        let checkCreateChannel0 = getElementContainsInnerText('ytd-button-renderer', 'Create channel')
        let checkCreateChannel1 = getElementContainsInnerText('yt-formatted-string', 'CREATE CHANNEL')
        let checkCreateChannel2 = getElementContainsInnerText('yt-formatted-string', 'TẠO KÊNH')
        let checkCreateChannel3 = getElementContainsInnerText('yt-formatted-string', 'চ্যানেল তৈরি করুন')
        let checkCreateChannel5 = getElementContainsInnerText('yt-button-shape', 'สร้างช่อง')
        let checkCreateChannel4 = document.querySelector('#create-channel-button tp-yt-paper-button .style-blue-text')
        let checkCreateChannel = checkCreateChannel0 || checkCreateChannel1 || checkCreateChannel2 || checkCreateChannel3 || checkCreateChannel4 || checkCreateChannel5
        if (checkCreateChannel) {
          await userClick(action.pid, 'checkCreateChannel', checkCreateChannel)
          return
        }
      }

      if (action.fisrtStart) {
        action.fisrtStart = false
        await setActionData(action)
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
        await sleep(30000)
        return
      }

      await goToLocation(action.pid, 'https://www.youtube.com/verify_phone_number')
      //await goToLocation(action.pid, 'https://studio.youtube.com/')
    }
    else if (url.indexOf('/language') > -1) {
      await goToLocation(action.pid, 'https://www.youtube.com/verify_phone_number')
      await sleep(30000)
    }
    else if (url.indexOf('/content/playlists') > -1) {
      sleep(2000)
      while (document.querySelector('#single-step-navigation')) {
        await userClick(action.pid, '#single-step-navigation #close-button')
        await sleep(1000)
      }
      
      const linkDt = document.querySelector('h3[id="playlist-title"] a')
      if (linkDt) {
        let href = linkDt.href
        if (href) {
          href = href.split('/')
          href.pop()
          href = href.pop()
          await goToLocation(action.pid, `https://www.youtube.com/playlist?list=${href}`)
        }
      } else {
        await userClick(action.pid, 'h3[id="playlist-title"]')
      }
    }
    else if (url.indexOf('studio.youtube.com/playlist/') > -1) {
      await userClick(action.pid, 'ytcp-navigator-drawer ytcp-overlay-with-link')
    }
    else if (url.indexOf('youtube.com/verify_phone_number') > -1) {
      if (document.querySelector('input')) {
        //enter phone number
        let phoneRs = await getPhone()
        console.log('getPhone',phoneRs);
        if (phoneRs.error || action.entered_phone) {
          await reportScript(action)
        } else {
            if (phoneRs.err) {
                phoneRs = await getPhone()
            }
            
            action.order_id = phoneRs.orderID
            action.api_name = phoneRs.api_name
            action.entered_phone = true
            await setActionData(action)

            // select vn
            await userClick(action.pid, '#input input')
            let vnOption = getElementContainsInnerText('yt-formatted-string', 'Vietnam') || getElementContainsInnerText('yt-formatted-string', 'Việt Nam') || getElementContainsInnerText('yt-formatted-string', 'ไอร์แลนด์') 
            await userClick(action.pid, 'vnOption', vnOption)

            await userType(action.pid, 'input[required]', phoneRs.phone)
            await userClick(action.pid, '#send-code-button a')
            await sleep(2000)
            if (document.querySelector('#code-input input')) {
              //enter code
              let phoneRs = await getPhoneCode(action.order_id, action.api_name)
              console.log('getPhoneCode',phoneRs);
              if (phoneRs.error || action.entered_code) {
                  await reportScript(action)
              } else {
                  action.entered_code = true
                  await setActionData(action)

                  await userTypeEnter(action.pid, '#code-input input', phoneRs.code)
                  await userClick(action.pid, '#submit-button')
                  await sleep(5000)
                  await goToLocation(action.pid, 'https://studio.youtube.com/')
              }
            }
            await sleep(30000)
        }

      } else {
        await goToLocation(action.pid, 'https://studio.youtube.com/')
      }
    }
    else if (url.indexOf('https://support.google.com/accounts/answer/') > -1) {
      await goToLocation(action.pid, 'https://www.youtube.com/')
      return
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

      action.channel_position = 0
      let channel = channels.item(action.channel_position)

      // if (!channel) {
      //   action.channel_position = 0
      //   channel = channels.item(action.channel_position)
      // }

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

      if (action.max_playlist != 0 && document.querySelectorAll('ytcp-playlist-row img').length > (Number(action.max_playlist) || 3)) {
        action.channel_position += 1
        await setActionData(action)
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
      }

      await userClick(action.pid, '#new-playlist-button')

      await userType(action.pid, '#create-playlist-form textarea', action.playlist_name)
      await userClick(action.pid, '#create-button')
      await sleep(10000)
      
      // goto playlist setting
      let channelID = url.split('/')[4]
      await goToLocation(action.pid, `https://studio.youtube.com/channel/${channelID}/content/playlists`)
    }
    else if (url.indexOf('youtube.com/@') > -1 || url.indexOf('https://www.youtube.com/channel/') > -1 || url.indexOf('https://www.youtube.com/c/') > -1 || url.indexOf('https://www.youtube.com/user/') > -1) {
      await sleep(5000)  
      let videos = document.querySelectorAll('svg path[d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"]')
      let total = Math.min(videos.length, Number(action.total_added_from_channel) || 5)
      let count = 0
      while (count < total) {
        if (count % 5 == 0) {
          reportLive(action.pid)
        }
        
        let item = videos.item(count)
        if (item) {
          await userClick(action.pid, '', item)
          await userClick(action.pid, 'ytd-menu-service-item-renderer path[d="M22,13h-4v4h-2v-4h-4v-2h4V7h2v4h4V13z M14,7H2v1h12V7z M2,12h8v-1H2V12z M2,16h8v-1H2V16z"]')
          await userClick(action.pid, '#checkbox-container path[d="M9,1C4.58,1,1,4.58,1,9s3.58,8,8,8s8-3.58,8-8S13.42,1,9,1z M16,9c0,1.31-0.37,2.54-1,3.59V11h-2c-0.55,0-1-0.45-1-1   c0-1.1-0.9-2-2-2H8.73C8.9,7.71,9,7.36,9,7V5h1c1.1,0,2-0.9,2-2V2.69C14.36,3.81,16,6.21,16,9z M2.02,9.45L7,12.77V13   c0,1.1,0.9,2,2,2v1C5.29,16,2.26,13.1,2.02,9.45z M10,15.92V14H9c-0.55,0-1-0.45-1-1v-0.77L2.04,8.26C2.41,4.75,5.39,2,9,2   c0.7,0,1.37,0.11,2,0.29V3c0,0.55-0.45,1-1,1H8v3c0,0.55-0.45,1-1,1H5.5v1H10c0.55,0,1,0.45,1,1c0,1.1,0.9,2,2,2h1v1.89   C12.95,14.96,11.56,15.7,10,15.92z"]')
          await userClick(action.pid, 'yt-icon[icon="close"]')
        }
        count++
      }

      reportScript(action)
    }
    else if (url.indexOf('https://studio.youtube.com/channel/') > -1) {
      // await userClick(action.pid, '#menu-item-2')
      // await userClick(action.pid, '#menu-item-2')
      while (document.querySelector('#single-step-navigation')) {
        await userClick(action.pid, '#single-step-navigation #close-button')
        await sleep(1000)
      }

      if (action.max_playlist != 0 && document.querySelectorAll('ytcp-playlist-row img').length > (Number(action.max_playlist) || 3)) {
        action.channel_position += 1
        await setActionData(action)
        await goToLocation(action.pid, 'youtube.com/channel_switcher?next=%2Faccount&feature=settings')
      }
      
      await userClick(action.pid, '#create-icon')
      await sleep(2000)
      await userClick(action.pid, '#paper-list path[d="M22,13h-4v4h-2v-4h-4v-2h4V7h2v4h4V13z M14,7H2v1h12V7z M2,12h8v-1H2V12z M2,16h8v-1H2V16z"]')

      await userType(action.pid, '#title-textarea', action.playlist_name)
      await userClick(action.pid, '#create-button')
      await sleep(10000)
      
      // goto playlist setting
      let channelID = url.split('/')[4]
      await goToLocation(action.pid, `https://studio.youtube.com/channel/${channelID}/content/playlists`)
    }
    else if (url.indexOf('youtube.com/playlist?list=') > -1) {
      await handlePlaylistSettings(action)

    }
    else if (url.indexOf('youtube.com/results') > -1) {
      // search
      await handlePlaylistSearch(action)
    }
  }
  catch (e) {
    await reportScript(action, 0)
  }
}


async function handlePlaylistSettings (action) {
  // btn settings
  try {
    let menuBtn = document.querySelector('#menu path[d="M7.5,12c0,0.83-0.67,1.5-1.5,1.5S4.5,12.83,4.5,12s0.67-1.5,1.5-1.5S7.5,11.17,7.5,12z M12,10.5c-0.83,0-1.5,0.67-1.5,1.5 s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S12.83,10.5,12,10.5z M18,10.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5 S18.83,10.5,18,10.5z"]')
    if (!menuBtn) {
      menuBtn = document.querySelector('ytd-menu-renderer yt-button-shape .yt-spec-touch-feedback-shape')
    }

    // cài đặt mô tả
    if (action.pll_description) {
      await userClick(action.pid, '.description yt-button-shape')
      await userType(action.pid, '.description #textarea', action.pll_description)
      await userClick(action.pid, '.description #save-button')
    }

    // 
    await userClick(action.pid, 'menuBtn', menuBtn)
    // cai dat danh sach phat
    await userClick(action.pid, '.style-scope ytd-menu-service-item-renderer path[d="M12 9.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5-2.5-1.12-2.5-2.5 1.12-2.5 2.5-2.5m0-1c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5 3.5-1.57 3.5-3.5-1.57-3.5-3.5-3.5zM13.22 3l.55 2.2.13.51.5.18c.61.23 1.19.56 1.72.98l.4.32.5-.14 2.17-.62 1.22 2.11-1.63 1.59-.37.36.08.51c.05.32.08.64.08.98s-.03.66-.08.98l-.08.51.37.36 1.63 1.59-1.22 2.11-2.17-.62-.5-.14-.4.32c-.53.43-1.11.76-1.72.98l-.5.18-.13.51-.55 2.24h-2.44l-.55-2.2-.13-.51-.5-.18c-.6-.23-1.18-.56-1.72-.99l-.4-.32-.5.14-2.17.62-1.21-2.12 1.63-1.59.37-.36-.08-.51c-.05-.32-.08-.65-.08-.98s.03-.66.08-.98l.08-.51-.37-.36L3.6 8.56l1.22-2.11 2.17.62.5.14.4-.32c.53-.44 1.11-.77 1.72-.99l.5-.18.13-.51.54-2.21h2.44M14 2h-4l-.74 2.96c-.73.27-1.4.66-2 1.14l-2.92-.83-2 3.46 2.19 2.13c-.06.37-.09.75-.09 1.14s.03.77.09 1.14l-2.19 2.13 2 3.46 2.92-.83c.6.48 1.27.87 2 1.14L10 22h4l.74-2.96c.73-.27 1.4-.66 2-1.14l2.92.83 2-3.46-2.19-2.13c.06-.37.09-.75.09-1.14s-.03-.77-.09-1.14l2.19-2.13-2-3.46-2.92.83c-.6-.48-1.27-.87-2-1.14L14 2z"]')
    await userClick(action.pid, 'tp-yt-paper-toggle-button[aria-pressed="false"]') // enable Thêm video mới vào đầu danh sách phát
    await userClick(action.pid, 'click any menuBtn', menuBtn) // xong

    // btn settings
    await userClick(action.pid, 'menuBtn', menuBtn)
    // cộng tác
    await userClick(action.pid, '.ytd-menu-service-item-renderer path[d="M14 20c0-2.21 1.79-4 4-4s4 1.79 4 4h-8zm4-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-3-8c0-2.21-1.79-4-4-4S7 5.79 7 8c0 1.96 1.42 3.59 3.28 3.93C4.77 12.21 2 15.76 2 20h10.02L12 19H3.06c.38-3.11 2.61-6.1 7.94-6.1.62 0 1.19.05 1.73.13l.84-.84c-.58-.13-1.19-.23-1.85-.26A4.004 4.004 0 0015 8zm-4 3c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"]')
    await sleep(5000)
    await userClick(action.pid, 'tp-yt-paper-toggle-button[aria-pressed="false"]') // enable Cộng tác viên có thể thêm video vào danh sách phát này
    await userClick(action.pid, 'click any menuBtn', menuBtn)

    await sleep(5000)
    let shareListData = document.querySelector('#bar #share-url').value
    if (shareListData) {
      shareListData = shareListData.replace('https://www.youtube.com/playlist?', '')
      await reportPlaylistJCT({
        url: shareListData,
        playlist_name: action.playlist_name,
        user_position: action.channel_position,
        service_id: action._id,
        pid: action.pid,
        suggest_channel: action.suggest_channel
      })

      await setActionData(action)
      await userClick(action.pid, '#buttons ytd-button-renderer a') // xong

      // search keyword
      await userTypeEnter(action.pid, 'input#search', action.playlist_name)
    }
  } catch (error) {
    console.log('errror------', error);
  }
}

async function handlePlaylistSearch (action) {
  await sleep(5000)
  let videos = document.querySelectorAll('ytd-video-renderer #menu ytd-menu-renderer path[d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z"]')
  let total = Math.min(videos.length, Number(action.total_added_from_search) || 10)
  let count = 0
  console.log('videos',videos)
  console.log('total', total)
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
