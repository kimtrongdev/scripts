
async function checkRecovery(action) {
  try {
    reportLive(action.pid)
    let url = window.location.toString()

    if (url.includes('myaccount.google.com/security')) {
      let recoMail = document.querySelector('a[href="recovery/email?continue=https%3A%2F%2Fmyaccount.google.com%2Fsecurity"]')
      if (recoMail) {
        recoMail = recoMail.innerText.split('\n')[1]
        if (recoMail) {
          action.data_reported = 'check_recovery_success:' + recoMail
          await reportScript(action)
          return
        }
      } else {
        recoMail = document.querySelector('a[href="recovery/email?continue=https%3A%2F%2Fmyaccount.google.com%2Fu%2F1%2Fsecurity%3Fhl%3Den"]')
        if (recoMail) {
          recoMail = recoMail.innerText.split('\n')[1]
          if (recoMail) {
            recoMail = recoMail.replace('Verify ', '')

            action.data_reported = 'check_recovery_success_need_very:' + recoMail
            await reportScript(action)
            return
          }
        }
      }
    }

    action.data_reported = 'check_recovery_failed'
    await reportScript(action)
  } catch (error) {
    console.log(error);
  }
}
