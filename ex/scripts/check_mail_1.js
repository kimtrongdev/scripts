
async function checkMail1(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()

    if (url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/v3/signin/identifier') > -1) {
      console.log('enter email')
      await waitForSelector('#identifierId')
      let mail = action.email.split('@')[0]
      await userTypeEnter(action.pid, '#identifierId', mail)
      await sleep(180000)
    }
    else if (url.indexOf('accounts.google.com/v3/signin/challenge/pwd') > -1 || url.indexOf("accounts.google.com/signin/v2/challenge/pwd") > -1) {
      console.log('enter password')
      let forgotPassBtn = document.querySelectorAll('div[data-primary-action-label] div[data-is-touch-wrapper="true"] button').item(1)
      if (forgotPassBtn) {
        await userClick(action.pid, "forgotPassBtn", forgotPassBtn)
        await sleep(190000)
      }
    }
    else if (url.indexOf("accounts.google.com/signin/v2/challenge/kpp") > -1) {
      let noPhoneBtn = document.querySelectorAll('div[data-primary-action-label] div[data-is-touch-wrapper="true"] button').item(1)
      if (noPhoneBtn) {
        await userClick(action.pid, "noPhoneBtn", noPhoneBtn)
        await sleep(190000)
      }
    }
    else if (url.indexOf("accounts.google.com/signin/v2/challenge/wa") > -1 || url.indexOf("accounts.google.com/signin/v2/challenge/sq") > -1) {
      let tryBtn = document.querySelector('div[data-primary-action-label] div[data-is-touch-wrapper="true"] button')
      if (tryBtn) {
        await userClick(action.pid, "tryBtn", tryBtn)
        await sleep(190000)
      }
    }
    else if (url.indexOf("accounts.google.com/signin/v2/challenge/ipe") > -1) {
      console.log('enter password')
      let mail = action.email.split('@')[0]
      mail += '@' + action.mail_type
      await userTypeEnter(action.pid, '#knowledgePreregisteredEmailInput', mail)
      await sleep(5000)
      let errorEl = document.querySelector('div[aria-atomic="true"] span')

      if (document.querySelector('#idvPinId')) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'check_ok')
        return 
      }

      if (errorEl) {
        let errorText = errorEl.parentNode.innerText
        if (errorText) {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, errorText)
          return
        }
      }

      await sleep(190000)
    }

    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url.split('?')[0])
  } catch (error) {
    console.log(error);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url.split('?')[0])
  }
}
