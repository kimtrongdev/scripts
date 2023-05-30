async function tiktokFeed(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (url == 'https://www.facebook.com/') {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let timeScroll = Number(action.scroll_time) || 15000
      for(let i = 0; i < timeScroll / 2000; i++) {
        await sleep(3000)
        await userScroll(action.pid, 5)
        
      }

      let likes = getElementContainsInnerText('span', ['Like', 'Thích'], '', 'equal', 'array')
      if (likes && likes.length) {
        let likeBtn = likes[randomRanger(0, likes.length - 1)]
        await userClick(action.pid, 'likeBtn', likeBtn)
        await sleep(3000)
      }

      await reportScript(action)
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}