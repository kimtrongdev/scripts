
async function selectFBPage(action, link = '') {
  let url = window.location.toString()
  url = url.split('?')[0]

  await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

  if (!action.channel_position) {
    action.channel_position = 0
  }
  action.channel_position += 1
  action.selected_page = true
  action.after_selected_page = true
  await setActionData(action)

  let typeSwitch = false
  let pages = document.querySelectorAll('div[aria-label="More"]')
  if (pages.length == 0) {
    typeSwitch = true
    pages = getElementContainsInnerText('span', ['Switch Now'], '', 'equal', 'array')
  }
  if (!pages.length) {
    if (link) {
      await goToLocation(action.pid, link)
    }
    return
  }

  if (action.channel_position >= pages.length) {
      if (pages.length) {
          action.channel_position = 0
      }
  }

  let channel = typeSwitch ? pages[action.channel_position] : pages.item(action.channel_position)
  if (channel) {
    if (action.channel_position == pages.length) {
        reportPositionChannel(action.pid, -1)
    } else {
        reportPositionChannel(action.pid, action.channel_position)
    }

    if (typeSwitch) {
      await userClick(action.pid, '', channel)
    } else {
      await userClick(action.pid, '', channel)
      await sleep(1000)
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
