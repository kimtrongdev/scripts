async function folowPage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, action.link)
    }
    else {
      let likeBtn = getElementContainsInnerText('span', ['Folow', 'Theo dõi'])

      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      if (likeBtn) {
        await userClick(action.pid, 'likeBtn', likeBtn)
        let reportData = getFolowDataPage()
        if (reportData) {
          action.data_reported = reportData
        }
      }

      await sleep(7000)
      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

function getFolowDataPage () {
  let likeData = ''
  //let url = window.location.toString()

  let likeEl = document.querySelector('div[role="main"]>div>div>div>div>div>div>div>div>div>span')
  if (likeEl) {
    likeData = likeEl.innerText
  }
  return likeData
}