
async function selectFBPage(action, link = '') {
  let url = window.location.toString()
  url = url.split('?')[0]

  await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

  if (!action.channel_position) {
    action.channel_position = 0
  }
  action.channel_position += 1

  let typeSwitch = false
  let pages = document.querySelectorAll('div[aria-label="More"]')

  if (pages.length == 0 && !document.querySelector('div[role="main"] span')) {
    typeSwitch = true
    let profileIcon = document.querySelector('div[role="navigation"] svg[aria-label="Your profile"]')
    if (profileIcon) {
      await userClick(action.pid, '#profileIcon', profileIcon)
      let seeAllProfileBtn = document.querySelectorAll('div[style="border-radius: max(0px, min(8px, ((100vw - 4px) - 100%) * 9999)) / 8px;"] div[role="button"]').item(1)
      if (seeAllProfileBtn) {
        await userClick(action.pid, '#seeAllProfileBtn', seeAllProfileBtn)
        await sleep(5000)

        pages = document.querySelectorAll('div[role="dialog"] div[role="list"] div[style="padding-left: 8px; padding-right: 8px;"] image')
      }
    }
  }

  if (pages.length == 0) {
    typeSwitch = true
    pages = getElementContainsInnerText('span', ['Switch Now'], '', 'equal', 'array')
    if (!pages) {
      pages = []
    }
  }

  if (!pages.length) {
    let profileIcon = document.querySelector('div[role="navigation"] svg[aria-label="Your profile"]')
    await userClick(action.pid, 'profileIcon', profileIcon)
    await sleep(3000)
    let resetBtn = document.querySelector('div[aria-label="Switch Profiles"]')
    if (resetBtn) {
      await userClick(action.pid, 'resetBtn', resetBtn)
      await sleep(10000)
      return
    }
  }

  action.selected_page = true
  action.after_selected_page = true
  await setActionData(action)

  if (!pages.length) {
    if (link) {
      await goToLocation(action.pid, link)
    }
    return
  }

  // if (action.channel_position >= pages.length) {
  //     if (pages.length) {
  //         action.channel_position = 0
  //     }
  // }
  action.channel_position = pages.length - 1

  let channel = typeSwitch ? pages[action.channel_position] : pages.item(action.channel_position)
  if (channel) {
    // if (action.channel_position == pages.length) {
    //     reportPositionChannel(action.pid, -1)
    // } else {
    //     reportPositionChannel(action.pid, action.channel_position)
    // }

    if (typeSwitch) {
      await userClick(action.pid, '', channel)
    } else {
      await userClick(action.pid, '', channel)
      await sleep(3000)
      const switchNowBtn = getElementContainsInnerText('span', ['Switch Now'])
      await userClick(action.pid, 'switchNowBtn', switchNowBtn)
      await sleep(2000)
      await userClick(action.pid, 'div[aria-label="Switch"]')
    }
  }
}

async function checkErrorFB (action) {
  let url = window.location.toString()
  url = url.split('?')[0]

  // let notFoundContent = getElementContainsInnerText('body', ["Sorry, this content isn't available right now"])

  // if (notFoundContent) {
  //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, "Sorry, this content isn't available right now")
  //   await sleep(5000)
  // }
  // else 

  if (url.includes('facebook.com/login/')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'logout')
    return
  }

  if (getElementContainsInnerText('span', ['You’re Temporarily Blocked'], '', 'equal')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'You’re Temporarily Blocked')
    return
  }

  if (url.includes('/login.php')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
    await sleep(5000)
  }
  else if (url.includes('index.php')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
    await sleep(5000)
  } else if (url.includes('facebook.com/checkpoint')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
  } else if (document.body.innerText == "Sorry, this content isn't available right now") {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, "Sorry, this content isn't available right now")
  }
}

async function checkErrorAfterRunScript(action) {
  let blockedEl = getElementContainsInnerText('span', ['Your account is restricted for']) 
  || getElementContainsInnerText('span', ["You’re Temporarily Blocked"]) 
  || getElementContainsInnerText('span', ["process this request at this time"])
  if (blockedEl) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, blockedEl.innerText)
    return
  }
}

async function handleRegPage (action) {
  if (getElementContainsInnerText('span', ['Go to News Feed'])) {
    await userClick(action.pid, 'image')
    await sleep(2000)
    let b = document.querySelectorAll('a svg g circle').item(1)
    if (b) {
      await userClick(action.pid, 'root User', b)
    }
    return
  }

  let pageName = await randomFullName()
  await userType(action.pid,'div[role="form"] label input[dir="ltr"]', pageName)
  await userType(action.pid,'div[role="form"] label input[type="search"]', 'web')

  let items = document.querySelectorAll('ul[role="listbox"] li')
  await userClick(action.pid, 'ul[role="listbox"] li', items[randomRanger(0, items.length - 1)])

  const createPageBtn = getElementContainsInnerText('span', ['Create Page', 'Tạo Trang'])
  await userClick(action.pid, 'createPageBtn', createPageBtn)
  await sleep(15000)
}

async function fbUpdateInfo(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    if (url == 'https://www.facebook.com/') {
      await goToLocation(action.pid, 'https://www.facebook.com/profile.php')
    }
    else if (url.includes('accountscenter.facebook.com/profiles')) {
      IS_PREVENT_CHANGE_URL = true
      let profiles = [...document.querySelectorAll('a[href^="/profiles"]')]
      if (profiles) {
        let profile = profiles.pop()
        await userClick(action.pid, 'profile', profile)
        await sleep(4000)

        // update name
        if (action.client_config_fb_fisrt_name || action.client_config_fb_last_name) {
          let nameItem = document.querySelector('a[href*="/name/"]')
          if (nameItem) {
            await userClick(action.pid, 'nameItem', nameItem)
            await sleep(1000)
            if (action.client_config_fb_fisrt_name) {
              let firstNameInput = document.querySelectorAll('input').item(0)
              await userType(action.pid,'firstNameInput', action.client_config_fb_fisrt_name, firstNameInput)
            }
            
            if (action.client_config_fb_last_name) {
              let lastNameInput = document.querySelectorAll('input').item(2)
              await userType(action.pid,'lastNameInput', action.client_config_fb_last_name, lastNameInput)
            }

            let reviewBtn = getElementContainsInnerText('span', ['Review change', 'Review Change', 'Xem lại thay đổi'], '', 'equal')
            await userClick(action.pid, 'reviewBtn', reviewBtn)
            await sleep(2000)
            let doneBtn = getElementContainsInnerText('span', ['Done', 'Xong'], '', 'equal')
            await userClick(action.pid, 'doneBtn', doneBtn)
            await sleep(4000)
          }
        }
      }
      IS_PREVENT_CHANGE_URL = false
    }
    else if (url.includes('facebook.com/profile.php')) {
      try {
        let editBtn = getElementContainsInnerText('span', ['Edit profile', 'Chỉnh sửa trang cá nhân'], '', 'equal')
        if (editBtn) {
          await userClick(action.pid, 'editBtn', editBtn)
          await sleep(4000)
          const editStoryBtn =  document.querySelector('div[aria-label="Add bio"] > span > span') || 
                                document.querySelector('div[aria-label="Add Bio"] > span > span') || 
                                document.querySelector('div[aria-label="Chỉnh sửa tiểu sử"] > span > span')
          if (editStoryBtn) {
            await userClick(action.pid, 'editStoryBtn', editStoryBtn)
            await sleep(4000)
            let storyInput = document.querySelector('textarea[aria-label="Enter bio text"]') || document.querySelector('textarea[aria-label="Nhập phần tiểu sử"]')
            if (storyInput) {
              await userType(action.pid, 'storyInput', action.info_description, storyInput)
              await sleep(2000)
              const saveStoryBtn = document.querySelector('div[aria-label="Save"]') || document.querySelector('div[aria-label="Lưu"]')
              if (saveStoryBtn) {
                await userClick(action.pid, 'saveStoryBtn', saveStoryBtn)
              }
            }
          }

          // let editAvatarBtn = document.querySelector('div[aria-label="Add profile picture"] > span > span') || document.querySelector('div[aria-label="Thêm ảnh đại diện"] > span > span')
          // if (editAvatarBtn) {
          //   await userClick(action.pid, 'editAvatarBtn', editAvatarBtn)
          //   await sleep(4000)
          //   let uploadPhotoBtn = document.querySelector('div[aria-label="Upload photo"]') || document.querySelector('div[aria-label="Upload Photo"]') || document.querySelector('div[aria-label="Tải ảnh lên"]')
          //   await userClick(action.pid, 'uploadPhotoBtn', uploadPhotoBtn)
          //   await userSelectAvatar(action.pid, '')
          //   await sleep(10000)
          //   let saveBtn = document.querySelector('div[aria-label="Choose profile picture"] div[aria-label="Save"]') || document.querySelector('div[aria-label="Chọn ảnh đại diện"] div[aria-label="Lưu"]')
          //   await userClick(action.pid, 'saveBtn', saveBtn)
          //   await sleep(10000)
          // }
        }

        await goToLocation(action.pid, 'https://accountscenter.facebook.com/profiles')
      } catch (error) {
        console.log(error)
      }

      await sleep(10000)
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    }
  }
  catch (e) {
    await reportScript(action, 0)
  }
}
