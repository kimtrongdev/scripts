async function tiktokLogin(action) {
  try {
    await sleep(3000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('tiktok.com/login/phone-or-email/email')) {
      await userType(action.pid, 'input[name="username"]', action.email)
      await userTypeEnter(action.pid, 'input[type="password"]', action.password)
      await sleep(15000)
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'tiktok login failed')
    } else if (url.indexOf('tiktok.com/foryou')) {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    }
  } catch (error) {
    console.log(error);
  }
}