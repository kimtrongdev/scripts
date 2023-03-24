async function likePage(action) {
  try {
    await sleep(2000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.page_link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, action.page_link)
    }
    else {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let exce = false
      let likeBtn = getElementContainsInnerText('span', ['Like', 'Thích'], '', 'equal')
      if (likeBtn) {
        await userClick(action.pid, 'likeBtn', likeBtn)
        exce = true
      }

      let followBtn = getElementContainsInnerText('span', ['Follow', 'Theo dõi'], '', 'equal')
      if (followBtn) {
        await userClick(action.pid, 'followBtn', followBtn)
        exce = true
      } else {
        let menuBtn = document.querySelector('div[role="main"]>div>div>div>div>div>div>div[aria-haspopup="menu"]') || document.querySelector('div[role="main"] div[aria-label="More actions"]')
        if (menuBtn) {
          await userClick(action.pid, 'menuBtn', menuBtn)
          await sleep(2000)
          followBtn = getElementContainsInnerText('span', ['Follow', 'Theo dõi'], '', 'equal')
          if (followBtn) {
            await userClick(action.pid, 'followBtn', followBtn)
            exce = true
          }
        }
      }

      let reportData = getLikeDataPage()
      if (reportData) {
        action.data_reported = reportData
      }

      if (exce) {
        await sleep(7000)
        await checkErrorAfterRunScript(action)
        await reportScript(action)
      }
      
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

function getLikeDataPage () {
  let likeData = ''
  //let url = window.location.toString()

  let likeEl = document.querySelector('div[role="main"]>div>div>div>div>div>div>div>div>div>span')
  if (likeEl) {
    likeData = likeEl.innerText
  }
  return likeData
}