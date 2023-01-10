async function fbLogin(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url == 'https://www.facebook.com/') {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
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
