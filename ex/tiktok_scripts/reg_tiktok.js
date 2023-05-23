async function regTiktok(action) {
  try {
    await sleep(3000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('tiktok.com/signup/phone-or-email/phone')) {
      let phoneRs = await getPhone()
      console.log('phoneRs', phoneRs);
      if (phoneRs.error || action.entered_phone) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
      } else {
        action.order_id = phoneRs.orderID
        action.api_name = phoneRs.api_name
        action.entered_phone = true
        await setActionData(action)

        if (document.querySelector('div[data-e2e="select-container"]')) {
          const monthPick = document.querySelectorAll('div[data-e2e="select-container"]').item(0)
          await userClick(action.pid, 'monthPick', monthPick)
          await userSelect(action.pid,randomRanger(1, 11))

          const datePick = document.querySelectorAll('div[data-e2e="select-container"]').item(1)
          await userClick(action.pid, 'datePick', datePick)
          await userSelect(action.pid,randomRanger(1, 15))

          const yearPick = document.querySelectorAll('div[data-e2e="select-container"]').item(2)
          await userClick(action.pid, 'yearPick', yearPick)
          await userSelect(action.pid,randomRanger(11, 15))
        }

        await userType(action.pid, 'form input[name="mobile"]', phoneRs.phone)
        await userClick(action.pid, 'button[data-e2e="send-code-button"]')
        
        await sleep(5000)
        
        let codeRs = await getPhoneCode(action.order_id, action.api_name)
        console.log('codeRs', codeRs);
        await sleep(55000)
        // if (phoneRs.error || action.entered_code) {
        //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
        // } else {
        //   action.entered_code = true
        //   await setActionData(action)
        //   await userTypeEnter(action.pid, 'material-input[exactmatch="phone-pin"] input', phoneRs.code)
        //   await sleep(30000)
        // }
      }
    }
    else {
      await sleep(10000)
      await reportScript(action, 0)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}