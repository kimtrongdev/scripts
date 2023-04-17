
async function getOtp(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.includes('google.com/search')) {
      await goToLocation(action.pid, 'https://mail.google.com/')
    }
    else if (url.indexOf('mail.google.com/mail') > -1) {
      await sleep(20000)
      const timeout = 600000
      let n = Math.ceil(timeout/2000)
      for(let i = 0; i < n; i++){
        reportLive(action.pid)
        let codeData = []
        let codes = getElementContainsInnerText('span', [
          'Email verification code:',
          'Mã xác minh cho email khôi phục:',
          'Verification code for recovery email:'
        ], '', 'contains', 'array')

        if (codes.length) {
          codes.forEach(codeel => {
            if (codeel) {
              codeel = codeel.innerText

              if (codeel) {
                codeel = codeel.split(':')[1]
                if (codeel) {
                  codeel = Number(codeel)
                  if (codeel && !codeData.includes(codeel)) {
                    codeData.push(codeel)
                  }
                }
              }
            }
          });

          if (codeData.length) {
            action.data_reported = 'p_used_for_recovery:' + codeData.join(',')
            await reportScript(action)
            return 
          }
        }
        await sleep(2000)
      }

      action.data_reported = 'p_expired_code'
      await reportScript(action)
    } else {
      //await reportScript(action, false)
    }
  } catch (error) {
    console.log(error);
  }
}
