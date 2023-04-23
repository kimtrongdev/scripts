
async function addRecoveryMail(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)

    if (url.indexOf('/challenge/iap') > -1) {
      action.data_reported = 'p_verify_iap'
      await reportScript(action)
      return

      let phoneRs = await getPhone()
      console.log('getPhone',phoneRs);
      if (phoneRs.error || action.entered_phone) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
      } else {
        if (phoneRs.err) {
          phoneRs = await getPhone()
        }

        action.order_id = phoneRs.orderID
        action.api_name = phoneRs.api_name
        action.entered_phone = true
        await setActionData(action)

        if (phoneRs.phone.startsWith('0')) {
            phoneRs.phone = phoneRs.phone.replace('0', '+84')
        } else if (!phoneRs.phone.startsWith('+84')) {
            phoneRs.phone = '+84' + phoneRs.phone
        }
        await userTypeEnter(action.pid, '#phoneNumberId', phoneRs.phone)
        await sleep(30000)
      }
    }
    else if (url.includes('/challenge/kpe')) {
      async function enterMail (mail) {
        let enterMail = mail || action.old_recovery_mail
        let emailInput = document.querySelector("input[name='email']")
        if (emailInput != null) {
            await userTypeEnter(action.pid, "input[name='email']", enterMail)
        } else {
          emailInput = document.querySelector("input[type='email']")
          if (emailInput != null) {
              await userTypeEnter(action.pid, "input[type='email']", enterMail)
          }
        }
      }

      await enterMail()
      await sleep(2000)

      if (getElementContainsInnerText('div', [
        'The email you entered is incorrect. Try again'
      ])) {
        let wrapRecoMail = getElementContainsInnerText('div', ['Confirm the recovery email address you added to your account: '], '', 'equal')
        if (wrapRecoMail) {
          let recoMail = wrapRecoMail.querySelector('strong').innerText
          if (recoMail) {
            let startStr = ''
            for (var i = 0; i < recoMail.length; i++) {
              if (recoMail[i] == '•') {
                startStr += '•'
              }
            }
            recoMail = recoMail.replace(startStr, `.{${startStr.length}}`)
            let match = `^${recoMail}$`
            
            let rs = await getRecoMails(match)
            if (rs && rs.emails) {
              for await (let mail of rs.emails) {
                action.current_reco_mail = mail
                await setActionData(action)
                await enterMail(mail)
              }
            }
          }
        }
      }

      await sleep(10000)
      action.data_reported = 'p_invalid_recovery_2'
      await reportScript(action)
    }
    else if (url.includes('/challenge/selection')) {
      await userClick(action.pid, "[data-challengetype='12']")
      await sleep(8000)
      action.data_reported = 'p_invalid_recovery_2'
      await reportScript(action)
    }
    else if (url.indexOf('/recovery/email') > -1) {
      if (action.current_reco_mail) {
        action.data_reported = `p_success_reco_mail:${action.current_reco_mail}`
        await reportScript(action)
        return
      }
      if (action.recovery_mail) {
        await userTypeEnter(action.pid, 'input[type="email"]', action.recovery_mail)
        await sleep(3000)

        async function checkEndScript() {
          let check = getElementContainsInnerText('span', [
            'Verify your recovery email',
            'Xác minh email khôi phục của bạn'
          ])
          if (!check) {
            action.data_reported = 'p_verified:' + action.recovery_mail
            await reportScript(action)
            return
          }
        }

        const timeout = 300000
        let n = Math.ceil(timeout/5000)

        for(let i = 0; i < n; i++){
          reportLive(action.pid)
          let codeData = await getMailCode(action.get_otp_pid)
          if (codeData && codeData.success) {
            let codes = codeData.code.split(',')
            if (codes.length) {
              for await (let code of codes) {
                if (document.querySelector('input[inputmode="numeric"]')) {
                  await userTypeEnter(action.pid, 'input[inputmode="numeric"]', code)
                }
                await sleep(3000)
                // check abc
                await checkEndScript()

                if (i == 5 || i == 15 || i == 40) {
                  let sendNewCode = getElementContainsInnerText('font', ['Send a new code'])
                  if (sendNewCode) {
                    await userClick(action.pid, "sendNewCode", sendNewCode)
                  }
                }
                await sleep(5000)
              }
            }
          }
          await checkEndScript()
          await sleep(5000)
        }

        action.data_reported = 'p_not_found_code'
        await reportScript(action)
        return
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
