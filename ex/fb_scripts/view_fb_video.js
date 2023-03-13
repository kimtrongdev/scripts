async function viewFBVideo(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.post_link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (url.includes('https://www.facebook.com/profile')) {
      await goToLocation(action.pid, action.link)
    }
    else {
      await sleep(Number(action.watch_time) || 30000)

      let reportData = document.querySelector('#watch_feed>div>div>div>div>div>div>div>div>div>div>div>span')
      if (reportData) {
        action.data_reported = reportData.innerText
      }

      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}