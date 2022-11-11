async function reqFacebook(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()
    await reportLive(action.pid)

    if (url.indexOf('facebook.com/confirmemail') > -1) {
      action.is_stop = true
      await reportAccount(action)
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
      
      await userType(action.pid,'input[name="reg_email__"]', action.email)
      await userType(action.pid,'input[name="reg_email_confirmation__"]', action.email)
      
      await userType(action.pid,'#password_step_input', password)

      await userClick(action.pid, 'select[name="birthday_day"]')
      await userSelect(action.pid,randomRanger(1,15))

      await userClick(action.pid, 'select[name="birthday_month"]')
      await userSelect(action.pid,randomRanger(1,10))

      await userClick(action.pid, 'select[name="birthday_year"]')
      await userSelect(action.pid,randomRanger(17,30))

      let s = document.querySelectorAll('input[type="radio"]').item(randomRanger(0,1))
      await userClick(action.pid, 's', s)

      action.username = action.email
      action.password = password
      action.type = action.account_type
      await setActionData(action)

      await userClick(action.pid, 'button[name="websubmit"]')
    }
  } catch (error) {
    console.log(error);
  }
}
