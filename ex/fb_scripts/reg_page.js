let MAX_FB_PAGE  = 2
async function regFbPage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()

    if (url == 'https://www.facebook.com/') {
      if (action.id == 'create_fb_page') {
        await goToLocation(action.pid, 'https://facebook.com/pages/creation')
      } else {
        // succcess login
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
      }
    } else if (url.includes('facebook.com/pages/creation')) {
      let pageNameData = randomFullName()
      await userType(action.pid,'div[role="form"] label input[dir="ltr"]', pageNameData.name)
      await userType(action.pid,'div[role="form"] label input[type="search"]', 'web')
      await userClick(action.pid, 'ul[role="listbox"] li')

      await userClick(action.pid, 'div[role="button"] span[dir="auto"]')
      
      await sleep(15000)
      
      if (!action.total_created) {
        action.total_created = 0
      }
      if (action.total_created < MAX_FB_PAGE) {
        action.total_created += 1
        await setActionData(action)
        await goToLocation(action.pid, 'https://facebook.com/pages/creation')
      } else {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'Done')
      }
    }
  } catch (er) {
    console.log(er);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'err')
  }
}