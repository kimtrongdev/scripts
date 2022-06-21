
async function reqFacebook(action) {
  try {
    await sleep(5000)
    let url = window.location.toString()

    if (url.indexOf('facebook.com/profile.php') > -1) {


    }
    else if (url.indexOf('facebook.com/friends') > -1) {
      let loopRequest = 1
      while (loopRequest < 15) {
        loopRequest++
        let btnAdd = document.querySelectorAll('a[data-sigil="touchable m-add-friend"] button').item(loopRequest)
        await userClick(action.pid, 'btnAdd', btnAdd)
      }

      // go to upload avata
      await goToLocation(action.pid, '', 'facebook.com/profile.php')
      

    } else if (url.indexOf('facebook.com/home.php') > -1 || url == 'https://m.facebook.com/') {
      await goToLocation(action.pid, 'facebook.com/friends')

    } else if (url.indexOf('facebook.com/reg') > -1) {
      // handle reg inputs
      let tempEmail = await getTempEmail()

      let nameData = await getRandomVietnamesName()
      await userType(action.pid, '#firstname_input', nameData,first_name)
      await userTypeEnter(action.pid, '#lastname_input', nameData,last_name)

      document.querySelector('#day').value = randomRanger(1, 28)
      document.querySelector('#month').value = randomRanger(1, 11)
      document.querySelector('#year').value = randomRanger(1980, 2009)

      await userClick(action.pid, 'button[type="submit"]')

      //
      await userClick(action.pid, 'a[data-sigil="switch_phone_to_email"]')
      await userTypeEnter(action.pid, '#contactpoint_step_input', tempEmail)

      if (document.querySelector('input[name="sex"]')) {
        let input = document.querySelectorAll('input[name="sex"]')[randomRanger(0,1)]
        await userClick(action.pid, 'input-sex', input)
      }

      let newPassword = makeid(10)
      await userTypeEnter(action.pid, '#password_step_input', newPassword)
      // wait for creation

    } else if (url.indexOf('facebook.com/recover/code') > -1) {
      // enter email code
      let emailCode = ''
      await userTypeEnter(action.pid, 'input[data-sigil="code-input"]', emailCode)

    } else if (url.indexOf('facebook.com/checkpoint') > -1) {
      // failed
      await reportScript(action)

    } else {
      await goToLocation(action.pid, 'facebook.com/')

    }
  } catch (error) {
    console.log(error);
  }
}
