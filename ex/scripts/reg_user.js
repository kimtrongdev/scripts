let LOGIN_STATUS = {
  ERROR: 0,
  SUCCESS: 1,
}

async function regUser(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    // let url = window.location.toString()

    // if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
    //   //action.
    //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'VERY')
    //   return
    // }

    // if (url.indexOf('/PlusPageSignUp') > -1) {
    //   await userCreateChannel(action)
    //   return
    // }

    // if (url.indexOf('https://consent.youtube.com/m') > -1) {
    //   try {
    //     let btnRejectAll = document.querySelectorAll('form').item(1)
    //     if (btnRejectAll) {
    //       await userClick(action.pid, 'btnRejectAll', btnRejectAll)
    //     } else {
    //       await goToLocation(action.pid, 'accounts.google.com')
    //       await sleep(60000)
    //     }
    //     return
    //   } catch (error) {
    //     console.log(error);
    //   }
    // }

    // if (url.indexOf('localhost') > 0 || url.indexOf('https://accounts.google.com/signin/v2/identifier') == 0) await sleep(10000)

    // if (url == 'https://www.youtube.com/') {
    //   await sleep(5000)

    //   let checkCreateChannel1 = await getElementContainsInnerText('yt-formatted-string', 'CREATE CHANNEL')
    //   let checkCreateChannel2 = await getElementContainsInnerText('yt-formatted-string', 'TẠO KÊNH')
    //   let checkCreateChannel3 = await getElementContainsInnerText('yt-formatted-string', 'চ্যানেল তৈরি করুন')

    //   let checkCreateChannel = checkCreateChannel1 || checkCreateChannel2 || checkCreateChannel3
    //   if (checkCreateChannel) {
    //     await userClick(action.pid, 'checkCreateChannel', checkCreateChannel)
    //     await sleep(60000)
    //   }

    //   let avatar = document.querySelector('#avatar-btn')
    //   if (avatar) {
    //     await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    //     return
    //   }

    //   let signinBtn = document.querySelector('ytd-button-renderer > a[href^="https://accounts.google.com/ServiceLogin"]')
    //   if (signinBtn) {
    //     await goToLocation(action.pid, 'accounts.google.com')
    //     await sleep(60000)
    //   }

    //   let createChannelLayer = document.querySelectorAll('.button-layer a yt-formatted-string[id="text"]')
    //   if (createChannelLayer) {
    //     let createChannelBtn = createChannelLayer.item(1)
    //     if (createChannelBtn) {
    //       await userClick(action.pid, 'createChannelBtn', createChannelBtn)
    //       await sleep(15000)
    //     }
    //   }
    // }

    // if (url.indexOf('/challenge/iap/verify') > -1) {
    //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '/challenge/iap/verify')
    // }
    // else if (url.indexOf('https://myaccount.google.com/u/5/language') > -1) {
    //   await goToLocation(action.pid, 'youtube.com/feed/history')
    //   await sleep(30000)
    // }
    // else if (url.indexOf('accounts.google.com/speedbump/idvreenable') > -1) {
    //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '/speedbump/idvreenable')
    // }
    // else if (url.indexOf('https://myaccount.google.com/signinoptions/password') > -1) {
    //   let newPassword = Math.random().toString(36).slice(9).toLocaleUpperCase() + Math.random().toString(36).slice(randomRanger(2, 5))
    //   action.newPassword = newPassword
    //   await setActionData(action)
    //   await userType(action.pid, 'input[name="password"]', newPassword)
    //   await sleep(randomRanger(3, 5) * 1000)
    //   await userType(action.pid, 'input[name="confirmation_password"]', newPassword)
    //   await sleep(randomRanger(3, 5) * 1000)
    //   await userClick(action.pid, 'button[type="submit"]')
    //   await sleep(10000)
    //   await beforeLoginSuccess(action)
    //   return
    // }
    // else if (url.indexOf('youtube.com/oops') > -1) {
    //   await goToLocation(action.pid, 'youtube.com?skip_registered_account_check=true')
    //   await sleep(15000)
    // }
    // else if (url.indexOf('consent.youtube.com') > -1) {
    //   await sleep(2000)
    //   await userScroll(action.pid, 5)
    //   let btnElement = document.querySelectorAll('div[data-is-touch-wrapper] > button').item(1)
    //   if (btnElement) {
    //     await userClick(action.pid, 'arrgre consent.youtube.com', btnElement)
    //     await sleep(30000)
    //   }
    //   throw "consent.youtube.com"
    // }
    // else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUpIdvChallenge') > -1) {
    //   //action.
    //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'PlusPageSignUpIdvChallenge')
    //   throw 'PlusPageSignUpIdvChallenge'
    // }
    // else if (url.indexOf('accounts.google.com/v3/signin/challenge/pwd') > -1 || url.indexOf("accounts.google.com/signin/v2/challenge/pwd") > -1) {
    //   await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'enter pass')
    // }
    // else if (url.indexOf('https://accounts.google.com/signin/privacyreminder') > -1) {
    //   while (document.querySelector('[role="button"][jsshadow]')) {
    //     await userClick(action.pid, '[role="button"][jsshadow]')
    //     await sleep(15000)
    //   }
    // }
    // else if (url.indexOf('accounts.google.com/speedbump/gaplustos') > -1) {
    //   await userClick(action.pid, 'input[type="submit"]')
    //   await sleep(60000)
    // }
    // else if (url.indexOf('https://www.youtube.com/channel/') > -1) {
    //   await reportScript(action)
    //   return
    // }
    // else if (url.indexOf('accounts.google.com/b/0/PlusPageSignUp') > -1) {
    //   await userCreateChannel(action)
    //   return
    // }
    // else if (url.indexOf('youtube.com/account') > -1) {
    //   let channels = document.querySelectorAll('ytd-account-item-renderer')

    //   if (!channels || !channels.length) {
    //     await sleep(5000)
    //     channels = document.querySelectorAll('ytd-account-item-renderer')
    //   }
    //   if (!channels || !channels.length) {
    //     await sleep(5000)
    //     channels = document.querySelectorAll('ytd-account-item-renderer')
    //   }
    //   if (!channels || !channels.length) {
    //     await sleep(5000)
    //     channels = document.querySelectorAll('ytd-account-item-renderer')
    //   }

    //   if (channels.length) {
    //     // update users count to server
    //     updateTotalCreatedUsers(action.pid, channels.length)
    //   }

    //   let btnCreateChannel = document.querySelector('a[href="/create_channel?action_create_new_channel_redirect=true"]')
    //   if (!btnCreateChannel) {
    //     await sleep(7000)
    //     btnCreateChannel = document.querySelector('a[href="/create_channel?action_create_new_channel_redirect=true"]')
    //   }

    //   if (channels.length < 100 && btnCreateChannel) {
    //     await userClick(action.pid, '', btnCreateChannel)
    //   } else {
    //     await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    //   }
    //   return
    // }
  } catch (e) {
    console.log('error', action.pid, e)
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, '[catch error] ' + e.toString())
  }
}
