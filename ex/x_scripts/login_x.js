async function loginX(action) {
  console.log(22222225555555 + "loginX", action);
  await sleep(5000)
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.indexOf('https://twitter.com/i/flow/login') > -1) {
      const useName = action.user_name
      await userTypeEnter(action.pid, 'input[name="text"]', useName)
      await sleep(3000)
      await userTypeEnter(action.pid, 'input[autocomplete="current-password"]', action?.password)
    }
    if(url.indexOf('https://twitter.com/home') > -1){
      await sleep(5000)
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
      await reportScript(action)
    }
  } catch (error) {
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'lôi gi do')
  }
}
