async function reqFacebook(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()
    await reportLive(action.pid)


    if (url == 'https://www.facebook.com/') {
      await goToLocation(action.pid, `https://www.facebook.com/search/people/?q=${action.last_name}`)
    }
    else if (url.indexOf('facebook.com/pages/creation') > -1) {
      await userType(action.pid,'div[role="form"] label input[dir="ltr"]', action.last_name)
      await userType(action.pid,'div[role="form"] label input[type="search"]', 'web')
      await userClick(action.pid, 'ul[role="listbox"] li')

      await sleep(10000)
      action.is_stop = true
      await reportAccount(action)
    }
    else if (url.indexOf('facebook.com/search/people') > -1) {
      let count = 0
      let items = document.querySelectorAll('div[data-visualcompletion="ignore-dynamic"] div[role="button"] span[dir="auto"]')
      const max = Math.min(15, items.length)

      while(count > max) {
        await userClick(action.pid, 'click add fr', items.item(count))
        count++
      }

      await goToLocation(action.pid, `https://www.facebook.com/pages/creation`)
    }
    else if (url.indexOf('facebook.com/confirmemail') > -1) {
      if (action.verify_type == 'phone') {
        let phoneRs = await getPhoneCode(action.order_id, action.api_name)
        console.log('getPhoneCode', phoneRs);
        if (phoneRs.error || action.entered_code) {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
        } else {
          action.entered_code = true
          await setActionData(action)
          await userTypeEnter(action.pid, '#code', phoneRs.code)
          await sleep(30000)
        }

        await userTypeEnter(action.pid,'input[name="code"]', phoneRs.code)

        await sleep(20000)
        await waitForSelector('div[role="dialog"] span[dir="ltr"]')
        if (document.querySelector('div[role="dialog"] span[dir="ltr"]')) {
          await userClick(action.pid, 'div[role="dialog"] .uiOverlayButton')
        } else {
          //action.username
        }
      } else {
        action.is_stop = true
        await reportAccount(action)
      }
    }
    else if (url.indexOf('https://www.facebook.com/reg') > -1) {
      let name = {}
      if (action.zone_name == 'vn') {
        name = await getRandomVietnamesName()
      } else {
        name = await getRandomUSName()
      }
      
      const password = makeid(10)

      if (document.querySelector('button[data-cookiebanner="accept_button"]')) {
        await userClick(action.pid, 'button[data-cookiebanner="accept_button"]')
        await sleep(3000)
      }

      await userType(action.pid,'#fullname_field input[name="firstname"]', name.first_name)
      await userType(action.pid,'#fullname_field input[name="lastname"]', name.last_name)
      action.last_name = name.last_name
      
      if (action.verify_type == 'phone') {
        let phoneRs = await getPhone()
        console.log('getPhone', phoneRs);

        if (phoneRs.error || action.entered_phone) {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
        } else {
          action.order_id = phoneRs.orderID
          action.api_name = phoneRs.api_name
          action.entered_phone = true
          action.username = phoneRs.phone

          if (!action.username.startsWith('0')) {
            action.username = '+84' + action.username
          }

          await userType(action.pid,'input[name="reg_email__"]', action.username)
          await setActionData(action)
        }
      } else {
        action.username = action.email
        await userType(action.pid,'input[name="reg_email__"]', action.email)
        await userType(action.pid,'input[name="reg_email_confirmation__"]', action.email)
      }
      
      await userType(action.pid,'#password_step_input', password)

      await userClick(action.pid, 'select[name="birthday_day"]')
      await userSelect(action.pid,randomRanger(1,15))

      await userClick(action.pid, 'select[name="birthday_month"]')
      await userSelect(action.pid,randomRanger(1,10))

      await userClick(action.pid, 'select[name="birthday_year"]')
      await userSelect(action.pid,randomRanger(17,30))

      let s = document.querySelectorAll('input[type="radio"]').item(randomRanger(0,1))
      await userClick(action.pid, 's', s)

      action.password = password
      action.type = action.account_type
      await setActionData(action)

      await userClick(action.pid, 'button[name="websubmit"]')
    }
  } catch (error) {
    console.log(error);
  }
}
