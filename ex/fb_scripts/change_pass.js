
async function changePassFb(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url == 'https://www.facebook.com/') {
      await goToLocation(action.pid, 'https://www.facebook.com/settings?tab=security')
    } else if (url.includes('https://www.facebook.com/login')) {
      await userType(action.pid, 'input[name="email"]', action.email)
      await userTypeEnter(action.pid, 'input[name="pass"]', action.password)
    } else if (url.includes('https://www.facebook.com/settings')) {
      await sleep(2000)
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let newPass = makeid(9)
      let ifr = document.querySelector('iframe')
      let changePassSection = getElementContainsInnerText('span', ['Change password', 'Đổi mật khẩu'], ifr.contentWindow.document)

      if (!changePassSection) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'NOT_FOUND_SECTION')
      }

      await userClick(action.pid, 'changePassSection', changePassSection, null, 0, 70)

      await userType(action.pid, 'input[type="password"]', action.password, '', ifr.contentWindow.document)
      await userType(action.pid, 'input[name="password_new"]', newPass, '', ifr.contentWindow.document)
      await userTypeEnter(action.pid, 'input[name="password_confirm"]', newPass, '', ifr.contentWindow.document)

      await sleep(5000)
      if (document.querySelector('form[action="https://www.facebook.com/ajax/login/password/change_reason/dialog"]')) {
        action.password = newPass
        await setActionData(action)
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'UPDATE_FB_SUCCESS_TO_' + newPass)
      }
    } 
  } catch (er) {
    console.log(er);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'err')
  }
}