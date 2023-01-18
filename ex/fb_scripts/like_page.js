async function likePage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.page_link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, action.page_link)
    }
    else {
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