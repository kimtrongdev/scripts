
async function regMail(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()

    if (url.indexOf('mail.google.com/mail') > -1) {
      // success
      action.username = action.username + '@gmail.com'
      await reportAccount(action)
    } else if (url.indexOf('accounts.google.com/signin/v2/identifier') > -1) {
      // failed

    } else if (url.indexOf('accounts.google.com/signup/v2/webcreateaccount') > -1) {
      let lastName = ''
      let firstName = ''

      async function typeEmail () {
        let newEmail = ''
        if (document.querySelector('button[data-username]')) {
          newEmail = document.querySelector('button[data-username]').dataset.username
          await userClick(action.pid, 'button[data-username]')
          action.username = newEmail
          await setActionData(action)
        } else {
          let rsName = await getRandomVietnamesName()
          lastName = rsName.last_name
          firstName = rsName.first_name
          newEmail = (lastName + firstName).toLowerCase().normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/đ/g, "d")
          .replace(/ /g, '')

          await userType(action.pid, 'form input[type="email"]', newEmail)
          await updateUserInput(action.pid,'TABS', 1, 0,0,0,"",'click')
          await sleep(9000)
          action.username = newEmail
          if (document.querySelector(`input[aria-invalid="true"]`)) {
            await sleep(3000)
            await typeEmail()
          } else {
            await setActionData(action)
          }
        }
      }
      await typeEmail()
      await sleep(5000)
      action.password = makeid(10)

      await setActionData(action)
      await userType(action.pid, 'form input[name="lastName"]', lastName)
      await userType(action.pid, 'form input[name="firstName"]', firstName)
      await userType(action.pid, 'form input[name="Passwd"]', action.password)
      await userTypeEnter(action.pid, 'form input[name="ConfirmPasswd"]', action.password)

    } else if (url.indexOf('accounts.google.com/signup/v2/webgradsidvphone') > -1) {
      let phoneRs = await getPhone()
      console.log('getPhone', phoneRs);
      if (phoneRs.error || action.entered_phone) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
      } else {
        action.order_id = phoneRs.orderID
        action.api_name = phoneRs.api_name
        action.entered_phone = true
        await setActionData(action)
        await userTypeEnter(action.pid, '#phoneNumberId', phoneRs.phone)

        await sleep(30000)
      }

    } else if (url.indexOf('accounts.google.com/signup/v2/webgradsidvverify') > -1) {
      //enter code
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

    } else if (url.indexOf('accounts.google.com/signup/v2/webpersonaldetails') > -1) {
      await userType(action.pid, '#day', randomRanger(1,28))

      await userClick(action.pid, '#month')
      await userSelect (action.pid, randomRanger(0,11))

      await userType(action.pid, '#year', randomRanger(1990,2005))

      await userClick(action.pid, '#gender')
      await userSelect (action.pid, randomRanger(0,1))

      await userType(action.pid, '#phoneNumberId', 'none')
      action.verify = action.username + makeid(3) + '@gmail.com'
      await setActionData(action)
      await userTypeEnter(action.pid, 'form input[name="recoveryEmail"]', action.verify)
      
    } else if (url.indexOf('accounts.google.com/signup/v2/webtermsofservice') > -1) {
      await userClick(action.pid, '#view_container div[data-secondary-action-label] button')

    } else {
      await goToLocation(action.pid, 'https://mail.google.com/')
    }
  } catch (error) {
    console.log(error);
  }
}
