
async function addRecoveryMail(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)

    if (url.indexOf('/recovery/email') > -1) {
      if (action.recovery_mail) {
        await userTypeEnter(action.pid, 'input[autocomplete="username"]', action.recovery_mail)
        await sleep(3000)
        let code = await getMailCode(action.pid)
        if (code) {
          await userTypeEnter(action.pid, 'input[inputmode="numeric"]', code)
        } else {
          action.data_reported = 'p_not_found_code'
          await reportScript(action)
          return
        }

        await sleep(5000)
        action.data_reported = 'p_add_recovery_mail_success'
        await reportScript(action)
      } else {
        action.data_reported = 'p_not_recovery_mail'
        await reportScript(action)
      }
    } 
    else if (url.includes('accounts.google.com/signin/v2/challenge/pwd')) {
      if (action.password) {
        await userTypeEnter(action.pid, `input[name='password']`, action.password)
      } else {
        action.data_reported = 'p_not_password'
        await reportScript(action)
      }
    }
    else {

    }
  } catch (error) {
    console.log(error);
  }
}
