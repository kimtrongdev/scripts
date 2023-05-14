async function folowPage(action) {
  try {
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
    let followBtn = getElementContainsInnerText('span', ['Theo dõi'], '', 'equal')

    if (!followBtn) {

      let menuBtn = document.querySelector('div[role="main"]>div>div>div>div>div>div>div[aria-haspopup="menu"]') || document.querySelector('div[role="main"] div[aria-label="More actions"]')
      await userClick(action.pid, 'menuBtn', menuBtn)
      await sleep(2000)
      followBtn = getElementContainsInnerText('span', ['Theo dõi'], '', 'equal')
    }

    if (followBtn) {
      await userClick(action.pid, 'followBtn', followBtn)
      let reportData = getFolowDataPage()
      if (reportData) {
        action.data_reported = reportData
      }
      await updateWatchedVideo(false, action.pid)
      await sleep(5000)
      await reportScript(action)
      return
    }

    await reportScript(action, false)
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