async function youtubeFeed(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url == 'https://www.youtube.com/') {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      while (action.time > 0) {
        await userScroll(action.pid, 5)
        await sleep(1000)
        await userScroll(action.pid, 5)
        await sleep(1000)
        await userScroll(action.pid, 5)
        await sleep(1000)
        action.time -= 3000
        await setActionData(action)
        let clicked = await clickVideo(action)
        if (clicked) {
          return
        }
      }

      await reportScript(action)
    } else if (url.includes('youtube.com/watch') || url.includes('youtube.com/shorts')) {
      await sleep(10000)
      if (url.includes('youtube.com/watch')) {
        await LikeOrDisLikeYoutubeVideo(action.pid, true)
      } else if (url.includes('youtube.com/shorts')) {
        await userClick(action.pid, '#like-button button')
      }
      await sleep(1000)
      await goToLocation(action.pid, 'https://www.youtube.com/')
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

async function clickVideo (action) {
  let isRun = isTrue(30)
  if (!isRun) {
    return
  }

  let items = document.querySelectorAll('#content ytd-rich-item-renderer #content ytd-thumbnail')
  for (let item of items) {
    if (elementInViewportByTop(item)) {
      action.time -= 12000
      await setActionData(action)

      await userClick(action.pid, 'item', item)
      await sleep(1000)
      break
    }
  }
  return true
}
