async function regMail(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()
    await reportLive(action.pid)

    if (url.indexOf('google.com/adsense/start') > -1) {
      await updateActionStatus(action.pid, 'login', LOGIN_STATUS.ERROR, 'underage')
    }
    else if (url.indexOf('accounts.google.com/ServiceLogin/signinchooser') > -1) {
      await goToLocation(action.pid, 'https://www.google.com/adsense/signup/create?sac=true&pli=1&authuser=0&sac=true')
    }
    else if (url.indexOf('mail.google.com/mail') > -1) {
      // success
      action.username = action.username + '@gmail.com'
      await setActionData(action)
      await reportAccount(action)

      // disable gg GA
      //await goToLocation(action.pid, 'https://ads.google.com/home/')

      await goToLocation(action.pid, 'https://www.google.com/adsense/signup/create?sac=true&pli=1&authuser=0&sac=true')
    } else if (url.indexOf('accounts.google.com/signin/v2/identifier') > -1) {
      // failed

    }
    else if (url.indexOf('google.com/adsense/new/u/0/pub') > -1 && url.indexOf('onboarding/payments') > -1) {
      let add = await getRandomAddress()
      console.log('----> random add', add);
      await sleep(20000)

      await updateUserInput(action.pid,'ONLY_TYPE', 0, 0, 0,0, add.ad1)
      await updateUserInput(action.pid,'TABS', 1)

      await userClick(action.pid, `material-yes-no-buttons material-ripple`)
      await sleep(6000)

      if (!document.querySelector('material-input[exactmatch="phone-number"] input')) {
        await updateUserInput(action.pid,'ONLY_TYPE', 0, 0, 0,0, add.city)

        await updateUserInput(action.pid,'TABS', 1)
        await updateUserInput(action.pid,'KEY_ENTER')
        let statePosMap = { "AL": 0, "AK": 1, "AS": 2, "AZ": 3, "AR": 4, "AA": 5, "AE": 6, "AP": 7, "CA": 8, "CO": 9, "CT": 10, "DE": 11, "DC": 12, "FL": 13, "GA": 14, "GU": 15, "HI": 16, "ID": 17, "IL": 18, "IN": 19, "IA": 20, "KS": 21, "KY": 22, "LA": 23, "ME": 24, "MH": 25, "MD": 26, "MA": 27, "MI": 28, "FM": 29, "MN": 30, "MS": 31, "MO": 32, "MT": 33, "NE": 34, "NV": 35, "NH": 36, "NJ": 37, "NM": 38, "NY": 39, "NC": 40, "ND": 41, "MP": 42, "OH": 43, "OK": 44, "OR": 45, "PW": 46, "PA": 47, "PR": 48, "RI": 49, "SC": 50, "SD": 51, "TN": 52, "TX": 53, "UT": 54, "VT": 55, "VI": 56, "VA": 57, "WA": 58, "WV": 59, "WI": 60, "WY": 61 }
        let selectPos = statePosMap[add.state]
        await userSelect(action.pid, selectPos + 1)

        await updateUserInput(action.pid,'TABS', 1)
        await updateUserInput(action.pid,'ONLY_TYPE', 0, 0, 0,0, add.posC)
      }

      // await userType(action.pid, '.addressedit-country-specific-section .b3-text-input-container input[name="RECIPIENT"]', 'nmae')
      // await userType(action.pid, '.addressedit-country-specific-section .b3-text-input-container input[name="ADDRESS_LINE_1"]', add.ad1)
      // await userType(action.pid, '.addressedit-country-specific-section .b3-text-input-container input[name="ADDRESS_LINE_2"]', add.ad2)
      // await userType(action.pid, '.addressedit-country-specific-section .b3-text-input-container input[name="LOCALITY"]', add.city)
      // await userClick(action.pid, '.addressedit-country-specific-section .goog-menuitem-content')
      // await userClick(action.pid, `.goog-menuitem[data-value="${add.state}"]`)
      // await userType(action.pid, '.addressedit-country-specific-section .b3-text-input-container input[name="POSTAL_CODE"]', add.posC)

      await userClick(action.pid, `material-yes-no-buttons material-ripple`)
      
      await sleep(5000)

      // aaa
      let iframeConfirm = document.querySelector('iframe[name="buyFlowInitiatedPopup"]')
      if (iframeConfirm) {
        await userClick(action.pid, '.b3-expanding-form-selector-option-content-container svg', '', iframeConfirm)
        await userClick(action.pid, '.buttons-wrapper .goog-inline-block', '', iframeConfirm)
        await userClick(action.pid, `material-yes-no-buttons material-ripple`, '', iframeConfirm)
        await sleep(5000)
      }

      if (document.querySelector('material-input[exactmatch="phone-number"] input')) {
        let phoneRs = await getPhone()
        if (phoneRs.error || action.entered_phone) {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
        } else {
          action.order_id = phoneRs.orderID
          action.api_name = phoneRs.api_name
          action.entered_phone = true
          await setActionData(action)

          await userType(action.pid, 'material-input[exactmatch="phone-number"] input', '+84' + phoneRs.phone)
          await userClick(action.pid, `material-radio`)

          await userClick(action.pid, `material-yes-no-buttons material-ripple`)

          await sleep(5000)
          
          if (document.querySelector('material-input[exactmatch="phone-pin"] input')) {
            let phoneRs = await getPhoneCode(action.order_id, action.api_name)
            console.log('getPhoneCode', phoneRs);
            if (phoneRs.error || action.entered_code) {
              await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, phoneRs.error)
            } else {
              action.entered_code = true
              await setActionData(action)
              await userTypeEnter(action.pid, 'material-input[exactmatch="phone-pin"] input', phoneRs.code)
              await sleep(30000)
            }
          }
        }
      }
    }
    else if (url.indexOf('google.com/adsense/new/u') > -1) {
      if (document.querySelectorAll('.in-progress-button-container button').length == 3) {
        await userClick(action.pid, '.in-progress-button-container button')
      } else {
        await goToLocation(action.pid, 'https://ads.google.com/home/')
      }
    }
    else if (url.indexOf('ads.google.com/home') > -1) {
      if (document.querySelector('a[gtm-id="home-startnow-hero"]')) {
        await userClick(action.pid, 'a[gtm-id="home-startnow-hero"]')
      } else {
        await userClick(action.pid, '.h-c-header__cta-li a[gtm-id="overall-signin-mainnav"]')
      }
    }
    else if (url.indexOf('ads.google.com/nav/selectaccount') > -1) {
      await userClick(action.pid, 'material-button')
    }
    else if (url.indexOf('ads.google.com/aw/campaigns/new/express') > -1) {
      await userClick(action.pid, '#experiencedUserLink')
    }
    else if (url.indexOf('ads.google.com/aw/signup/business') > -1 || url.indexOf('ads.google.com/aw/signup/expert') > -1) {
      await sleep(5000)
      if (elementInViewport('.start-button')) {
        await userClick(action.pid, '.start-button')
      }

      if (document.querySelector('.business-name-container .mdc-button')) {
        await userClick(action.pid, '.business-name-container .mdc-button')
        await sleep(3000)
      }

      try {
        await sleep(5000)
        await userClick(action.pid, 'communications-opt-in material-radio')
        await userClick(action.pid, 'expert-view material-button')
      } catch (error) {
        console.log(error);
      }
    }
    else if (url.indexOf('ads.google.com/aw/campaigns/new/video') > -1) {
      await sleep(10000)
      if (document.querySelector('.congrats-title')) {
        // hadnle report success reg
        action.reg_ga_success = true
        await setActionData(action)
        await reportAccount(action)
        return
      }

      await userClick(action.pid, 'budget-and-dates dropdown-button')
      await userSelect(action.pid, 0)

      await userType(action.pid, 'mask-money-input', '3')

      await userClick(action.pid, 'end-date-picker material-datepicker')
      
      let listIimer = document.querySelectorAll('.preset-dates-wrapper material-select-item')
      await userClick(action.pid, 'timer', listIimer.item(randomRanger(0, listIimer.length - 1)))

      await userType(action.pid, 'bid-input mask-money-input', '1')
      
      let list = [
        '7ICKkagL3xA',
        '4BXHjfg7XPU',
        'nxsLkEPYR-4',
        '8VAJGGwL5t8',
        '11XkLOIsLHI',
        'Y0oYqspE988',
        'L2Ir7tDK3Mg',
        'ZN7jNEuXrvA'
      ]

      let ytLink = `youtube.com/watch?v=${list[randomRanger(0, list.length - 1)]}`
      await userType(action.pid, 'video-picker material-auto-suggest-input material-input input', ytLink)

      await sleep(5000)

      await userClick(action.pid, 'ad-construction-subpanel material-radio-group material-radio')
      
      await userType(action.pid, 'in-stream-panel url-input input', ytLink)

      await userType(action.pid, '.display-url input', ytLink)

      await userClick(action.pid, 'material-yes-no-buttons material-button')

      await sleep(10000)
      if (document.querySelector('.congrats-title')) {
        // hadnle report success reg
        action.reg_ga_success = true
        await setActionData(action)
        await reportAccount(action)
        return
      }
    }
    else if (url.indexOf('ads.google.com/aw/campaigns/new') > -1) {
      if (document.querySelector('span[buttondecorator]')) {
        await userClick(action.pid, 'span[buttondecorator]')
        await userClick(action.pid, 'material-radio-group material-radio')
        await userClick(action.pid, 'expert-view material-button')
      } else {
        await userClick(action.pid, 'safasf', document.querySelectorAll('.unified-goals-card-format').item(15))
        await userClick(action.pid, 'safasf', document.querySelectorAll('.unified-goals-card-format').item(24))
        await userClick(action.pid, 'material-yes-no-buttons material-button')
      }
    }
    else if (
      url.indexOf('ads.google.com/aw/signup/congrats') > -1 ||
      url.indexOf('ads.google.com/aw/campaigns') > -1 ||
      url.indexOf('ads.google.com/aw/overview') > -1
    ) {
      await goToLocation(action.pid, 'ads.google.com/aw/campaigns/new')
    }
    else if (url.indexOf('google.com/adsense/signup/create') > -1) {
      await userClick(action.pid, '.mdc-checkbox__native-control')
      await userClick(action.pid, 'email-preferences material-radio-group material-radio')
      await userClick(action.pid, 'material-dropdown-select')
      //77 hoa ki
      //218 anh 
      let elItem = getElementContainsInnerText('span', 'United States')
      if (elItem) {
        await userClick(action.pid, 'hoaki', elItem)
      } else {
        await userClick(action.pid, 'hoaki', document.querySelectorAll('material-select-dropdown-item span').item(77))
      }
      
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
  
          await sleep(5000)
        }
      }

      await enterPhone()

      if (document.querySelector('div[aria-live="polite"] div span')) {
        action.entered_phone = false
        await enterPhone()
        await sleep(4000)
      }

      if (document.querySelector('div[aria-live="polite"] div span')) {
        action.username = ''
        action.reg_ga_success = true
        await setActionData(action)
        await reportAccount(action)
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

      await userType(action.pid, '#year', randomRanger(1990,2000))

      await userClick(action.pid, '#gender')
      await userSelect (action.pid, randomRanger(0,1))

      await userType(action.pid, '#phoneNumberId', 'none')
      action.verify = action.username + makeid(3) + '@gmail.com'
      await setActionData(action)
      await userTypeEnter(action.pid, 'form input[name="recoveryEmail"]', action.verify)
      
    } else if (url.indexOf('accounts.google.com/signup/v2/webtermsofservice') > -1) {
      await userClick(action.pid, '#view_container div[data-secondary-action-label] button')

    } else {
      await goToLocation(action.pid, 'ads.google.com/aw/campaigns/new')
    }
  } catch (error) {
    console.log(error);
  }
}

