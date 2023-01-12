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
      if (getElementContainsInnerText('span', ['Go to News Feed'])) {
        await userClick(action.pid, 'image')
        await sleep(2000)
        let b = document.querySelectorAll('a svg g circle').item(1)
        if (b) {
          await userClick(action.pid, 'root User', b)
        }
        return
      }

      let pageName = await randomFullName()
      await userType(action.pid,'div[role="form"] label input[dir="ltr"]', pageName)
      await userType(action.pid,'div[role="form"] label input[type="search"]', 'web')

      let items = document.querySelectorAll('ul[role="listbox"] li')
      await userClick(action.pid, 'ul[role="listbox"] li', items[randomRanger(0, items.length - 1)])

      const createPageBtn = getElementContainsInnerText('span', ['Create Page', 'Tạo Trang'])
      await userClick(action.pid, 'createPageBtn', createPageBtn)
      await sleep(60000)
      reportLive(action.pid)
      await sleep(60000)
      reportLive(action.pid)
      await sleep(60000)
      reportLive(action.pid)
      await sleep(60000)
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
      updateTotalCreatedUsers(action.pid, pages.length)

      await goToLocation(action.pid, 'https://facebook.com/pages/creation')
    } else {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
    }
  } catch (er) {
    console.log(er);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'err')
  }
}