
async function getOtp(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.includes('google.com/search')) {
      await goToLocation(action.pid, 'https://mail.google.com/')
    }
    else if (url.indexOf('mail.google.com/mail') > -1) {
      const timeout = 600000
      let n = Math.ceil(timeout/2000)
      for(let i = 0; i < n; i++){
        reportLive(action.pid)
        let codeData = getElementContainsInnerText('span', [
          'Email verification code:',
          'Mã xác minh cho email khôi phục:',
          'Verification code for recovery email:'
        ])
        if (codeData) {
          codeData = codeData.innerText
        }
        if (codeData) {
          codeData = codeData.split(':')[1]
          if (codeData) {
            codeData = Number(codeData)
            if (codeData) {
              action.data_reported = 'p_verify_code:' + codeData
              await reportScript(action)
              return 
            }
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
