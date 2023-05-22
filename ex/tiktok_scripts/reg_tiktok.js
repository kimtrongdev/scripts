async function regTiktok(action) {
  try {
    await sleep(3000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('tiktok.com/signup/phone-or-email/phone')) {
      let phoneRs = await getPhone()
      if (phoneRs.error || action.entered_phone) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
      } else {
        action.order_id = phoneRs.orderID
        action.api_name = phoneRs.api_name
        action.entered_phone = true
        await setActionData(action)

        await userTypeEnter(action.pid, 'form input[name="mobile"]', scan_reco_mail_success	)
        await sleep(5000)
        
        let phoneRs = await getPhoneCode(action.order_id, action.api_name)
        console.log('getPhoneCode', phoneRs);
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