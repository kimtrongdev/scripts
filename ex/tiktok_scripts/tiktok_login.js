async function tiktokLogin(action) {
  try {
    await sleep(3000)
    reportLive(action.pid)

    if (ALLOW_RUN_UPDATE_ACCOUNT_INFO && action.running_update_info) {
      await tiktokUpdateInfo(action)
      return
    }

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('tiktok.com/login/phone-or-email/email')) {
      await sleep(2000)
      if (document.querySelector('button[data-list-item-value="email/username"]')) {
        await userClick(action.pid, 'button[data-list-item-value="email/username"]')
        await sleep(2000)
      }
      await userType(action.pid, 'input[name="username"]', action.email)
      await userTypeEnter(action.pid, 'input[type="password"]', action.password)
      await sleep(25000)
      if (document.querySelector('#captcha_container .captcha_verify_bar')) {
        let rs
        if (document.querySelector('.captcha_verify_img_slide ')) {
          let image = document.querySelector('#captcha-verify-image')
          let pos = image.getBoundingClientRect()
          let data = {
            image_width: image.width,
            startImageX: pos.left,
            startImageY: pos.top + 68,
            endImageX: pos.left + image.width,
            endImageY: pos.top + 68 + image.clientHeight,
            type: 'square',
          }
          rs = await handleCapchaTiktok(data)
        } else  {
          let innerImageURL = document.querySelector('img[data-testid="whirl-inner-img"]').src
          let outerImageURL = document.querySelector('img[data-testid="whirl-outer-img"]').src

          let data = {
            innerImageURL,
            outerImageURL,
            type: 'cicle',
          }
          rs = await handleCapchaTiktok(data)
        }

        let dragPos = 0
        try {
          if (rs?.result?.result) {
            dragPos = Number(rs?.result?.result)
          }
        } catch (error) {
          console.log(error);
        }
        
        console.log('f34g',rs)
        console.log('dragPos', dragPos)
        await userDragRecapcha(action.pid, '.secsdk-captcha-drag-icon', null, dragPos)
        await sleep(5000)
      }
      await sleep(10000)
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS, 'tiktok login failed')
    } else if (url == 'https://www.tiktok.com/' || url.indexOf('tiktok.com/foryou')) {
      if (ALLOW_RUN_UPDATE_ACCOUNT_INFO) {
        action.running_update_info = true
        await setActionData(action)
        await goToLocation(action.pid,'https://www.tiktok.com/')
      } else {
          await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
      }
    }
  } catch (error) {
    console.log(error);
  }
}