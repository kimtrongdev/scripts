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
      let likeBtn = getElementContainsInnerText('span', ['Like', 'Thích'], '', 'equal')
      let followBtn = getElementContainsInnerText('span', ['Follow', 'Theo dõi'], '', 'equal')
      let actionBtn = followBtn || likeBtn

      if (likeBtn || followBtn) {
        await userClick(action.pid, 'actionBtn', actionBtn)
        let reportData = getLikeDataPage()
        if (reportData) {
          action.data_reported = reportData
        }

        await sleep(7000)
        await checkErrorAfterRunScript(action)
      }
      
      await updateWatchedVideo(false, action.pid)
      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

function getLikeDataPage () {
  let likeData = ''
  //let url = window.location.toString()

  try {
    if (getElementContainsInnerText('span', ['people like this'])) {
      let like = getElementContainsInnerText('span', ['people like this'])
      let fol = getElementContainsInnerText('span', ['people follow this'])
  
      if (like) {
        like = like.innerText
        like = like.split(' ')[0]
        like = like.replace(',', '')
      }
      if (fol) {
        fol = fol.innerText
        fol = fol.split(' ')[0]
        fol = fol.replace(',', '')
      }

      return `${(like || 0)} likes • ${fol || 0} followers`
    }
  } catch (error) {
    console.log(error);
  }

  let likeEl = document.querySelector('div[role="main"]>div>div>div>div>div>div>div>div>div>span')
  if (likeEl.innerText.includes('friend')) {
    let el = getElementContainsInnerText('span', ['Followed by', 'Theo dõi'])
    if (el) {
      likeData = el.innerText
    }
  } else 
  if (likeEl) {
    likeData = likeEl.innerText
  }

  return likeData
}