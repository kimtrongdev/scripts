async function fbLogin(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url == 'https://www.facebook.com/' || url == 'https://m.facebook.com/' || url == 'https://m.facebook.com/home.php' || url.includes('/home.php')) {
      if (action.id == 'change_pass') {
        action.login_fb_success = true
        await setActionData(action)
        await goToLocation(action.pid, 'https://www.facebook.com/settings?tab=security')
      } else {
        if (url.includes('mbasic.facebook.com')) {
          await userClick(action.pid, 'nav a', document.querySelectorAll('nav a').item(3))
        } else {
          await goToLocation(action.pid, 'https://www.facebook.com/settings?tab=language')
        }
      }
      //await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
      //await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
    }
    else if (url.includes('facebook.com/notifications')) {
      await goToLocation(action.pid, 'https://www.facebook.com/settings?tab=language')
    }
    else if (url.includes('2fa.live')) {
      await userType(action.pid, '#listToken', action.recover_mail)
      await userClick(action.pid, '#submit')
      await sleep(2000)
      action.fa_code = document.querySelector('#output').value.split('|')[1]
      await setActionData(action)
      await updateUserInput(action.pid,'GO_TO_FISRT_TAB',0,0,0,0,"",'GO_TO_FISRT_TAB')
    }
    else if (url.includes('facebook.com/settings')) {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      if (!action.reloaded) {
        action.reloaded = true
        await setActionData(action)
        location.reload()
        return
      }

      if (action.changed_lang) {
        await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
        return
      }

      let editBtn = getElementContainsInnerText('span', ['Language for buttons, titles and other text from Facebook for this account on www.facebook.com'])
      if (!editBtn) {
        console.log('change lang');
        let formLangs = [...document.querySelectorAll('div[style="border-radius: max(0px, min(8px, ((100vw - 4px) - 100%) * 9999)) / 8px;"]')]
        let formLang = formLangs.pop()
        if (formLang) {
          let screenY = (window.screen.height - window.screen.availHeight) + (window.outerHeight - window.innerHeight)
          const formPos = formLang.getBoundingClientRect()
          const editBtnX = formPos.width + formPos.left -68 
          const editBtnY = screenY + formPos.top + 70
          await updateUserInput(action.pid,'CLICK', editBtnX, editBtnY,0,0,"", 'editBtn')

          let selectorVN = document.querySelector('div[aria-haspopup="listbox"]')
          if (selectorVN) {
            let pos = getElementPosition(selectorVN)
            await updateUserInput(action.pid,'TYPE_KEY_ENTER', pos.x, pos.y, 0,0,"Eng",'ESC')
            const saveBtnX = formPos.width + formPos.left - 68
            const saveBtnY = screenY + formPos.top + 195
            await updateUserInput(action.pid,'CLICK', saveBtnX, saveBtnY,0,0,"", 'saveBtn')
          }
        }

        action.changed_lang = true
        await setActionData(action)
      }

      await sleep(10000)
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    } else if (url.includes('facebook.com/pages/creation')) {
      await handleRegPage(action)
      window.open('https://www.facebook.com/pages/?category=your_pages')
      //await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
      //await updateUserInput(action.pid,'KEY_ENTER')
      await sleep(10000)
    } else if (url.includes('facebook.com/pages')) {
      let pages = document.querySelectorAll('div[aria-label="More"]')
      if (!pages) {
        pages = []
      }
      if (pages.length == 0) {
        pages = getElementContainsInnerText('span', ['Switch Now'], '', 'equal', 'array')
        if (!pages) {
          pages = []
        }
      }
      if (action.current_total_page == pages.length) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, 'không thể tạo thêm page')
        return
      }
      if (pages && pages.length) {
        updateTotalCreatedUsers(action.pid, pages.length)
      }

      const totalPage = Number(action.total_page_created) || 2
      action.current_total_page = pages.length
      await setActionData(action)

      if (pages.length >= totalPage) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.SUCCESS)
      } else {
        await goToLocation(action.pid, 'https://facebook.com/pages/creation')
      }
    } else if (url.includes('facebook.com/login/device-based/regular/login')) {
      let erMessage = ''
      try {
        erMessage = document.querySelectorAll('#loginform div > div').item(4).innerText
      } catch (error) {
        console.log(error);
      }
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, erMessage || 'CANNOT LOGIN')
    } 
    else if (url.includes('m.facebook.com/login/checkpoint/')) {
      await userClick(action.pid, 'button[type="submit"]')
    }
    else if (url.includes('facebook.com/checkpoint') || url.includes('mbasic.facebook.com/checkpoint') || url.includes('mbasic.facebook.com/login/checkpoint/')) {
      if (document.querySelector('form input[name="search"]')) {
        await userClick(action.pid, 'nav a', document.querySelectorAll('nav a').item(3))
        return
      }

      if (document.querySelector('#approvals_code')) {
        window.open('https://2fa.live/')
        let execeted = false
        setInterval(async () => {
          if (!execeted) {
            let rs = await getActionData()
            action = rs.action
            if (action.fa_code) {
              execeted = true
              await userTypeEnter(action.pid, '#approvals_code', action.fa_code)
              await sleep(5000)
              await userClick(action.pid, '#checkpointSubmitButton')
            }
          }
        }, 2000);
        await sleep(120000)
      } else if (document.querySelector('#checkpointSubmitButton')) {
        while (document.querySelector('#checkpointSubmitButton')) {
          await userClick(action.pid, '#checkpointSubmitButton')
          await sleep(5000)
        }
      } else {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url)
      }
    } else if (url.includes('facebook.com/login') || url.includes('https://mbasic.facebook.com/')) {
      if (action.loged) {
        await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, erMessage || 'CANNOT LOGIN')
        return
      } else {
        action.loged = true
        await setActionData(action)
      }
      
      await userType(action.pid, 'input[name="email"]', action.email)
      await userTypeEnter(action.pid, 'input[name="pass"]', action.password)

      await sleep(15000)
      let erMessage = ''
      try {
        erMessage = document.querySelectorAll('#loginform div > div').item(4).innerText
      } catch (error) {
        console.log(error);
      }
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, erMessage || 'CANNOT LOGIN')
    } else {
      await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, url.split('?')[0])
    }
  } catch (er) {
    console.log(er);
    await updateActionStatus(action.pid, action.id, LOGIN_STATUS.ERROR, er.message)
  }
}
