async function likePage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('facebook.com/pages')) {
      await selectFBPage(action)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (url.includes('https://www.facebook.com/profile')) {
      await goToLocation(action.pid, action.page_link)
    }
    else if (url.includes(action.page_link)) {
      let likeBtn = getElementContainsInnerText('span', ['Like', 'Thích'])
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      if (likeBtn) {
        await userClick(action.pid, 'likeBtn', likeBtn)
      }

      await sleep(7000)
      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}