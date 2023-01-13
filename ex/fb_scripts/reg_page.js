let MAX_FB_PAGE  = 2
async function regFbPage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (url == 'https://www.facebook.com/') {
      if (action.id == 'create_fb_page') {
        await goToLocation(action.pid, 'https://facebook.com/pages/creation')
      } else {
        // succcess login
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
      }
    } else if (url.includes('facebook.com/pages/creation')) {
      await handleRegPage(action)
      // reportLive(action.pid)
      // await sleep(60000)
      // reportLive(action.pid)
      // await sleep(60000)
      // reportLive(action.pid)
      // await sleep(60000)
      await reportScript(action)
      // if (!action.total_created) {
      //   action.total_created = 0
      // }
      // if (action.total_created < MAX_FB_PAGE) {
      //   action.total_created += 1
      //   await setActionData(action)
      //   await goToLocation(action.pid, 'https://facebook.com/pages/creation')
      // } else {
      //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'Done')
      // }
    } else if (url.includes('facebook.com/pages/')) {
      await sleep(2000)
      let pages = document.querySelectorAll('div[aria-label="More"]')
      if (pages && pages.length) {
        updateTotalCreatedUsers(action.pid, pages.length)
      }

      await goToLocation(action.pid, 'https://facebook.com/pages/creation')
    } else {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
    }
  } catch (er) {
    console.log(er);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'err')
  }
}