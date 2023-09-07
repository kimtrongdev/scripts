async function fbUpdateInfo(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()


    if (url == 'https://www.facebook.com/') {
      await goToLocation(action.pid, 'https://www.facebook.com/profile.php')
    }
    else if (url.includes('facebook.com/profile.php')) {
      await userClick(action.pid, 'div[data-e2e="edit-profile-entrance"] button')
      await sleep(4000)
      await userType(action.pid, 'div[data-e2e="edit-profile-name-input"] input', action.info_name)
      await userType(action.pid, 'textarea[data-e2e="edit-profile-bio-input"]', action.info_description)
      await userClick(action.pid, 'button[data-e2e="edit-profile-save"]')
      await sleep(10000)
    }
  }
  catch (e) {
    await reportScript(action, 0)
  }
}
