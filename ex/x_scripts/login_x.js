async function loginX(action) {
  console.log(22222225555555, action);
  await sleep(3)
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.indexOf('https://twitter.com/i/flow/login') > -1) {
      await userTypeEnter(action.pid, 'input[name="text"]', action.email)
      await sleep(2000)
      const useName = action?.user_name || "@CQuees71178"
      await userTypeEnter(action.pid, 'input[name="text"]', useName)
      await sleep(2000)
      await userTypeEnter(action.pid, 'input[autocomplete="current-password"]', action?.password)
      await sleep(2000)
     
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
   
    } 
   
    else {
         // login bị lỗi, sai passs ....
      // await reportScript(action, false)
    }
  } catch (error) {
    console.log(error);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'lôi gi do')

    await reportScript(action)
  }
}
