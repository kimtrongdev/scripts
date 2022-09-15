
async function regMail(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()

    if (url.indexOf('mail.google.com/mail') > -1) {
      // success
      action.username = action.username + '@gmail.com'
      await reportAccount(action)

      await goToLocation(action.pid, 'https://www.google.com/adsense/signup/create?sac=true&pli=1&authuser=0&sac=true')
    } else if (url.indexOf('accounts.google.com/signin/v2/identifier') > -1) {
      // failed

    }
    else if (url.indexOf('google.com/adsense/new/u') > -1) {
      await goToLocation(action.pid, 'https://ads.google.com/home/')
    }
    else if (url.indexOf('ads.google.com/home') > -1) {
      await userClick(action.pid, '.h-c-header__cta-li a[gtm-id="overall-signin-mainnav"]')
    }
    else if (url.indexOf('ads.google.com/nav/selectaccount') > -1) {
      await userClick(action.pid, 'material-button')
    }
    else if (url.indexOf('ads.google.com/aw/campaigns/new/express') > -1) {
      await userClick(action.pid, '#experiencedUserLink')
    }
    else if (url.indexOf('ads.google.com/aw/campaigns/new') > -1) {
      await userClick(action.pid, 'safasf', document.querySelectorAll('.unified-goals-card-format').item(15))
      await userClick(action.pid, 'safasf', document.querySelectorAll('.unified-goals-card-format').item(23))
      await userClick(action.pid, 'material-yes-no-buttons material-button')
    }
    else if (url.indexOf('ads.google.com/aw/campaigns/new/video') > -1) {
      await userType(action.pid, 'mask-money-input', '3333')

      await userClick(action.pid, 'end-date-picker material-datepicker')
      
      let listIimer = document.querySelectorAll('.preset-dates-wrapper material-select-item')
      await userClick(action.pid, 'timer', listIimer.item(randomRanger(0, listIimer.length - 1)))

      await userType(action.pid, 'bid-input mask-money-input', '333')
      
      await userType(action.pid, 'video-picker material-auto-suggest-input material-input input', 'https://www.youtube.com/watch?v=s5K0TEHvwVI')

      await userClick(action.pid, 'ad-construction-subpanel material-radio-group material-radio')
      
      await userType(action.pid, 'in-stream-panel url-input input', 'youtube.com/watch?v=s5K0TEHvwVI')

      await userType(action.pid, '.display-url input', 'https://www.youtube.com/watch?v=s5K0TEHvwVI')

      await userClick(action.pid, 'material-yes-no-buttons material-button')
    }
    else if (url.indexOf('ads.google.com/aw/signup/payment') > -1) {
      await userClick(action.pid, '.legal-messages-component span[role="checkbox"]')
      await userClick(action.pid, '#button-panel material-button')
    }
    
    // else if (url.indexOf('ads.google.com/aw/overview') > -1) {
    //   //await userClick(action.pid, '.h-c-header__cta-li a[gtm-id="overall-signin-mainnav"]')
    // }
    else if (url.indexOf('google.com/adsense/signup/create') > -1) {
      await userClick(action.pid, '.mdc-checkbox__native-control')
      await userClick(action.pid, 'material-dropdown-select')
      //77 hoa ki
      //218 anh 
      await userClick(action.pid, document.querySelectorAll('material-select-dropdown-item span').item(77))
      await userClick(action.pid, '.is-product-agreement-signed-checkbox .mdc-checkbox input')
      await userClick(action.pid, '.submit-button')
    }
    else if (url.indexOf('accounts.google.com/signup/v2/webcreateaccount') > -1) {
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
      async function enterPhone() {
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
      }

      await enterPhone()

      if (document.querySelector('div[aria-live="polite"] div span')) {
        action.entered_phone = false
        await enterPhone()
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

