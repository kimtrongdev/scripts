async function loginX(action) {
  try {
    let url = window.location.toString()
    reportLive(action.pid)
    if (url.indexOf('https://twitter.com/i/flow/login') > -1) {
      await userTypeEnter(action.pid, 'input[name="text"]', action.email)
      await sleep(2000)
      const useName = action?.useName || "@CQuees71178"
      await userTypeEnter(action.pid, 'input[name="text"]', useName)
      await sleep(2000)
      await userTypeEnter(action.pid, 'input[autocomplete="current-password"]', action?.password)
      await sleep(2000)
     



   
    } 
    if (url.indexOf("https://twitter.com/home")) {
      // login thành công
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    }
    // else if (url.indexOf('https://twitter.com/home') > -1) {
    //   await goToLocation(action.pid, 'https://twitter.com/settings/profile')
    //   await sleep(2000)
    // }
    // else if (url.indexOf('https://twitter.com/settings/profile') > -1) {
    //   await userType(action.pid, 'input[name="displayName"]', "earth")
    //   await userType(action.pid, 'textarea[name="description"]', "Trái đất là hành tinh thứ ba từ Mặt Trời trong hệ Mặt Trời ")
      
    //   await userType(action.pid, 'input[name="location"]', "earth")
    //   await userType(action.pid, 'input[name="url"]', "earth.com")
    //   await sleep(1000)
      
    //   let saveBtn = document.querySelector('div[class="css-175oi2r r-sdzlij r-1phboty r-rs99b7 r-lrvibr r-15ysp7h r-4wgw6l r-ymttw5 r-1loqt21 r-o7ynqc r-6416eg r-1ny4l3l"]') 
    //   if (saveBtn) {
    //     await userClick(action.pid, 'saveBtn', saveBtn)
    //   }
    // }
    else {
         // login bị lỗi, sai passs ....
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'lôi gi do')
      await reportScript(action, false)
    }
  } catch (error) {
    console.log(error);
    await reportScript(action)
  }
}
