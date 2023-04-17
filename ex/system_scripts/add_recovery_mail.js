
async function addRecoveryMail(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)

    if (url.includes('/challenge/kpe')) {
      let emailInput = document.querySelector("input[name='email']")
      if (emailInput != null) {
          await userTypeEnter(action.pid, "input[name='email']", action.old_recovery_mail)
      } else {
          emailInput = document.querySelector("input[type='email']")
          if (emailInput != null) {
              await userTypeEnter(action.pid, "input[type='email']", action.old_recovery_mail)
          }
      }
    }
    else if (url.includes('/challenge/selection')) {
      await userClick(action.pid, "[data-challengetype='12']")
    }
    else if (url.indexOf('/recovery/email') > -1) {
      if (action.recovery_mail) {
        await userTypeEnter(action.pid, 'input[autocomplete="username"]', action.recovery_mail)
        await sleep(3000)
        let codeData = await getMailCode(action.get_otp_pid)
        if (codeData && codeData.success) {
          let codes = codeData.code.split(',')
          if (codes.length) {
            for await (let code of codes) {
              await userTypeEnter(action.pid, 'input[inputmode="numeric"]', code)
              await sleep(5000)
            }
          }
        } else {
          action.data_reported = 'p_not_found_code'
          await reportScript(action)
          return
        }

        action.data_reported = 'p_verified:' + action.recovery_mail
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
