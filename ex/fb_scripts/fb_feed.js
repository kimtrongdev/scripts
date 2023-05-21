async function fbFeed(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      let profileIcon = document.querySelector('div[role="navigation"] svg[aria-label="Your profile"]')
      await userClick(action.pid, 'profileIcon', profileIcon)
      let resetBtn = document.querySelector('div[aria-label="Switch Profiles"]')
      if (resetBtn) {
        await userClick(action.pid, 'resetBtn', resetBtn)
        await sleep(8000)
      }
      action.selected_page = true
      action.after_selected_page = true
      await setActionData(action)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (url.includes('https://www.facebook.com/profile')) {
      await goToLocation(action.pid, action.post_link)
    }
    else if (url == 'https://www.facebook.com/') {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let timeScroll = Number(action.scroll_time) || 15000
      for(let i = 0; i < timeScroll / 2000; i++) {
        await sleep(2000)
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