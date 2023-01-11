
async function selectFBPage(action) {
  let url = window.location.toString()
  url = url.split('?')[0]

  await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
  let pages = document.querySelectorAll('div[aria-label="More"]')
  if (!pages.length) {
    return
  }

  if (!action.channel_position) {
    action.channel_position = 0
  }
  action.channel_position += 1
  action.selected_page = true
  await setActionData(action)

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