
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

  let pages = document.querySelectorAll('div[aria-label="More"]')
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

  let channel = pages.item(action.channel_position)
  if (channel) {
    if (action.channel_position == pages.length) {
        reportPositionChannel(action.pid, -1)
    } else {
        reportPositionChannel(action.pid, action.channel_position)
    }

    await userClick(action.pid, '', channel)
    await sleep(1000)
    const switchNowBtn = getElementContainsInnerText('span', ['Switch Now'])
    await userClick(action.pid, 'switchNowBtn', switchNowBtn)
    await sleep(2000)
    await userClick(action.pid, 'div[aria-label="Switch"]')
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
  if (url.includes('index.php')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
    await sleep(5000)
  } else if (url.includes('facebook.com/checkpoint')) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
  }
}
