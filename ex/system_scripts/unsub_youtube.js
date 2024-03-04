
async function unsubYoutube(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)

    if (url.indexOf('https://accounts.google.com/signin/v2/identifier') > -1 || url.indexOf('https://accounts.google.com/v3/signin/identifier') > -1) {
      console.log('enter email')
      await waitForSelector('#identifierId')
      await userTypeEnter(action.pid, '#identifierId', action.email)
      await sleep(180000)
    }
    else if (url.indexOf('accounts.google.com/v3/signin/challenge/pwd') > -1) {
      console.log('enter password')
      action.relogin = true
      await setActionData(action)
      await waitForSelector("input[name='Passwd']")
      await userTypeEnter(action.pid, "input[name='Passwd']", action.password)
      await sleep(190000)
    }
    else if (url.indexOf("accounts.google.com/signin/v2/challenge/pwd") > -1) {
      console.log('enter password')
      await setActionData(action)
      await waitForSelector("input[name='password']")
      await userTypeEnter(action.pid, "input[name='password']", action.password)
      await sleep(190000)
    }
    else if (url.indexOf("accounts.google.com/signin/selectchallenge") > -1 || url.indexOf("https://accounts.google.com/signin/v2/challenge/selection") > -1 || url.indexOf("https://accounts.google.com/v3/signin/challenge/selection") > -1) {
      let Unavailable = getElementContainsInnerText('em', ['Unavailable because of too many attempts. Please try again later'])
      if (Unavailable) {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'Unavailable because of too many attempts')
          return
      }
      if (document.querySelector("[data-challengetype='12']")) {
          await userClick(action.pid, "[data-challengetype='12']")
      } else {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'unknown challengetype')
          return
      }

      await sleep(180000)
    }
    else if (url.indexOf("challenge/kpe") > -1) {
      async function enterMail (mail) {
          let enterMail = mail
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

      await enterMail(action.recover_mail)
      await sleep(180000)
    }
    else if (url.includes('https://myaccount.google.com/brandaccounts')) {
      // scan user ids
      let users = document.querySelectorAll('article li a[href*="brandaccounts"]')
      let userIDs = []
      users.forEach(user => {
        let userID = ''
        userID = user.href
        userID = userID.replace('https://myaccount.google.com/brandaccounts/', '')
        userID = userID.replace('/view', '')
        userIDs.push(userID)
      });

      action.user_ids = userIDs
      await nextUser(action)
    }
    else if (url.includes('page=youtube_subscriptions')) {
      while (document.querySelectorAll('c-wiz[data-activity-collection-name="Your YouTube channel subscriptions"] button').length > 1) {
        let unsubBtn = document.querySelector('c-wiz[data-activity-collection-name="Your YouTube channel subscriptions"] button')
        if (unsubBtn) {
          await userClick(action.pid,'unsubBtn', unsubBtn)
          await sleep(3000)
        }
        reportLive(action.pid)
      }
      
      await nextUser(action)
    }
    else {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'Cannot unsub - ' + url)
    }
  } catch (error) {
    console.log(error);
  }
}

async function nextUser(action) {
  let userID = action.user_ids.pop()
  if (userID) {
    await setActionData(action)
    await goToLocation(action.pid, `https://myactivity.google.com/b/${userID}/page?utm_source=my-activity&hl=en&page=youtube_subscriptions`)
  } else {
    await reportDoneUnsub(action)
  }
}

async function reportDoneUnsub(action) {
  await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'UNSUB_DONE')
}
