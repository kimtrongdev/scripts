async function regMail(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()
    await reportLive(action.pid)

    const linkAfterSuccess = 'https://www.google.com/search?q=google ads home'

    if (url == 'https://www.youtube.com/' || url == 'https://www.youtube.com/feed/trending' || url == 'https://m.youtube.com/') {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      await userClick(action.pid, '#avatar-btn,ytm-topbar-menu-button-renderer .profile-icon-img')
      await sleep(5000)
      let switchChannelOpt = document.querySelector('yt-multi-page-menu-section-renderer #endpoint #content-icon')
      if (switchChannelOpt) {
          await userClick(action.pid, 'switchChannelOpt', switchChannelOpt)
          
          await sleep(5000)
          let createChannelBtn = document.querySelector('#create-channel-button')
          if (createChannelBtn && elementInViewport(createChannelBtn)){
              if (createChannelBtn) {
                await userClick(action.pid, 'createChannelBtn', createChannelBtn)
                await sleep(10000)
              }
          } 
      }

      await goToLocation(action.pid, 'https://myaccount.google.com/personal-info')
    }
    else if (url.indexOf('google.com/personal-info') > -1) {
      await userClick(action.pid, 'div[data-picker="https://docs.google.com/picker"] figure')
      await sleep(4000)

      let fr = document.querySelector('iframe')
      await userClick(action.pid, 'Thêm ảnh hồ sơ', 
      getElementContainsInnerText('span', 'Thêm ảnh hồ sơ') || getElementContainsInnerText('span', 'Add profile picture'),fr)

      await sleep(3000)

      await userClick(action.pid, 'Từ máy tính', 
      getElementContainsInnerText('button', 'Từ máy tính') || getElementContainsInnerText('button', 'From computer'), fr)

      await userClick(action.pid, 'Tải lên từ máy tính', 
      getElementContainsInnerText('button', 'Tải lên từ máy tính') || getElementContainsInnerText('button', 'Upload from computer'), fr)
     
      let gender = ['female', 'male'][randomRanger(0, 1)]
      await userSelectAvatar(action.pid, gender)

      await sleep(10000)

      // Save as profile picture
      await userClick(action.pid, 'Lưu làm ảnh hồ sơ', 
      getElementContainsInnerText('button', 'Lưu làm ảnh hồ sơ') || getElementContainsInnerText('button', 'Lưu làm ảnh hồ sơ'))
      await sleep(10000)

      await goToLocation(action.pid, linkAfterSuccess)
    }
    else if (url.indexOf('youtube.com/channel') > -1) {
      await goToLocation(action.pid, 'https://myaccount.google.com/personal-info')
     //await goToLocation(action.pid, linkAfterSuccess)
    }
    else if (url.indexOf('google.com/adsense/start') > -1) {
      await updateActionStatus(action.pid, 'login', LOGIN_STATUS.ERROR, 'underage')
    }
    else if (url.indexOf('accounts.google.com/ServiceLogin/signinchooser') > -1) {
      await goToLocation(action.pid, 'https://www.google.com/adsense/signup/create?sac=true&pli=1&authuser=0&sac=true')
    }
    else if (url.indexOf('google.com/search?q') > -1) {
      let site = getElementContainsInnerText('cite', 'ads.google.com')
      if (site) {
        await userClick(action.pid, '', site)
      } else {
        await goToLocation(action.pid, 'https://www.ads.google.com/home/')
      }
    }
    else if (url.indexOf('mail.google.com/mail') > -1) {
      // success
      action.username = action.username + '@gmail.com'
      action.reg_ga_success = ''
      await setActionData(action)
      await reportAccount(action)

      await goToLocation(action.pid, 'https://www.youtube.com')
      //await goToLocation(action.pid, 'https://www.google.com/search?q=google ads home')
      //await goToLocation(action.pid, 'https://www.ads.google.com/home/')
      //await goToLocation(action.pid, 'https://www.google.com/adsense/signup/create?sac=true&pli=1&authuser=0&sac=true')
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
        await goToLocation(action.pid, 'https://www.ads.google.com/home/')
      }
    }
    else if (url.indexOf('ads.google.com/home') > -1 || url.indexOf('ads.google.com/intl') > -1) {
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

        if (document.querySelector('expert-view-wrapper communications-opt-in .opt-in-title')) {
          try {
            await userClick(action.pid, 'expert-view-wrapper communications-opt-in material-radio-group material-radio[tabindex="-1"]')
            let secondOpt = document.querySelectorAll('expert-view-wrapper communications-opt-in material-radio-group material-radio[tabindex="-1"]').item(1)
            await userClick(action.pid, 'secondOpt', secondOpt)
          } catch (error) {
            
          }

          await userClick(action.pid, 'expert-view material-button')
        } else {
          await userClick(action.pid, 'communications-opt-in material-radio')
          await userClick(action.pid, 'expert-view material-button')
        }
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

      await userType(action.pid, 'mask-money-input', '333333')

      await userClick(action.pid, 'end-date-picker material-datepicker')
      
      let listIimer = document.querySelectorAll('.preset-dates-wrapper material-select-item')
      await userClick(action.pid, 'timer', listIimer.item(randomRanger(0, listIimer.length - 1)))

      await userType(action.pid, 'bid-input mask-money-input', '333')
      
      let list = [
        "cD5NV99jeOk","iOZY9W3R5fs","0mGSIYCpw8s","KDvXlp1-dlw","YaS4Bi-nvms","u6ni94IGxHc",
        "U1K4pY7GFxM","UhGXJypxG1s","ryTYNC9XMPc","KA1jaXl5wn4","s0pQpCLBhi8","KjUA-Oopb6A",
        "NOtW0J-fJGQ","zgnsSXYAdDs","D6BSWq4ETNY","vJ7p7_i-sTg","kvxHOB61HeM","ADK-8d9FvFg",
        "Xyvka3GRH98","jG4YLAUoUgw","gSlLgvoflzY","cbs0E_Lj2_g","nYRyGKCUK0o","qIgeA6QxQaA",
        "FW5HlYx9OaI","jg3oaDTMqEQ","GeDAaHqYMec","l9yhMMoO5z8","CarfrR5T3tg","hHGYFB_hAKA",
        "VOLQv4xQ2qM","HF-ZBRvmPds","sFlTLUI_oVk","qNksHciOaqM","R06n3TudjYI","xAVclaKB5WE",
        "PKg8FA5PkuA","ysrkvwSIb2g","9jUxX70Q0SQ","JOsClXEd6mI","0jv3ppgZjAo","e5NeNm34FfI",
        "nnZ0vlvRP3g","gPjbIkoYhiU","uTzoV6QC5m8","_ghHvTJNDMI","hOdcppJW2XY","wkf_Bucd-kg",
        "IRpsu54X3qw","LFlKCOn1hA0","jdJsKaZnZMI","us7RTWlWesg","dAO_IJtD6wo","Lo3ja6DYntE",
        "Of6HE3BVDZs","c9CQFXA2eg4","xAdcoaPrIlg","2NiVDjDKaR4","FJ3Y93ITAtM","B8KXEPd_bPA",
        "Kkf0llk3Dd8","j7Di5Q7iU18","jx8fFdjrsQY","JYqoa7muBPs","kl3YdcxW0Zc","ipVAOHEnO6o",
        "omqQAIIbBvY","L8YkpCPnfEw","fJ5hs_I68Kc","WAE6OhpH7y0","njX5QfTv3Gg","cdK6v1v5ajQ",
        "5j3tGBLq5GI","lary4todNxU","fyKjytHL7yo","ldkIVhO6Cng","_kuQzceTQZA","XOnglZExqhk",
        "77CZtgIVZRs","oYAAdDjhHqE","xtcTOLQuUHM","mTso6B9S4qQ","XUy0ARkG3Zg","0JNB6DMg428",
        "7IX8nj6GNrI","pmWyG3UKehs","zgyDBKUAwT0","3_WquYnXHc8","H1FBhzADjwA","du4KY9uj_Jg",
        "7zPQp8oktK8","GE9wM1K23Aw","qsL3P5Im0zA","sr2Pf8FPLKQ","emELyBlfnHE","4d1lY5OXsz0",
        "AwQWNDxZrbk"
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
      if (document.querySelector('.explore-campaign-button')) {
        await userClick(action.pid, '.explore-campaign-button')
      } else if (document.querySelector('.overview-extended-fab-menu')) {
        await userClick(action.pid, '.overview-extended-fab-menu')
      }else {
        await goToLocation(action.pid, 'https://www.ads.google.com/aw/campaigns/new')
      }
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
      await goToLocation(action.pid, 'https://www.ads.google.com/aw/campaigns/new')
    }
  } catch (error) {
    console.log(error);
  }
}

