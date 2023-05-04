async function viewFbHome(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, 'https://www.facebook.com/')
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, 'https://www.facebook.com/')
    }
    else {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      
      let timeScroll = Number(action.scroll_time) || 15000

      for(let i = 0; i < timeScroll / 2000; i++) {
        await sleep(2000)
        await userScroll(action.pid, 5)
      }

      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}
