async function tiktokUpdateInfo(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    if (url.includes('tiktok.com/foryou') || url == 'https://www.tiktok.com/') {
      await userClick(action.pid, '#header-more-menu-icon')
      await userClick(action.pid, '#header-setting-popup-list li')
    }
    else if (url.includes('https://www.tiktok.com/@')) {
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
