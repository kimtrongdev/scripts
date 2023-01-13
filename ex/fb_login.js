async function fbLogin(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url == 'https://www.facebook.com/') {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
      //await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    } else if (url.includes('facebook.com/pages/creation')) {
      await handleRegPage(action)
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
      await updateUserInput(action.pid,'KEY_ENTER')
      await sleep(10000)
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'Không thể tạo page')
      await updateUserInput(action.pid,'KEY_ENTER')
    } else if (url.includes('facebook.com/pages')) {
      let pages = document.querySelectorAll('div[aria-label="More"]')
      if (pages && pages.length) {
        updateTotalCreatedUsers(action.pid, pages.length)
      }
      const totalPage = Number(action.total_page_created) || 2
      if (pages.length >= totalPage) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
      } else {
        await goToLocation(action.pid, 'https://facebook.com/pages/creation')
      }
    } else if (url.includes('https://www.facebook.com/login/device-based/regular/login')) {
      let erMessage = ''
      try {
        erMessage = document.querySelectorAll('#loginform div > div').item(4).innerText
      } catch (error) {
        console.log(error);
      }
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, erMessage || 'CANNOT LOGIN')
    } else if (url.includes('facebook.com/checkpoint')) {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
    } else if (url.includes('https://www.facebook.com/login')) {
      await userType(action.pid, 'input[name="email"]', action.email)
      await userTypeEnter(action.pid, 'input[name="pass"]', action.password)

      await sleep(15000)
      let erMessage = ''
      try {
        erMessage = document.querySelectorAll('#loginform div > div').item(4).innerText
      } catch (error) {
        console.log(error);
      }
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, erMessage || 'CANNOT LOGIN')
    } else {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url.split('?')[0])
    }
  } catch (er) {
    console.log(er);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, er.message)
  }
}
