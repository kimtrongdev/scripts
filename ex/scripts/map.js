async function scriptMap(action) {
  try {
    let url = window.location.toString()
      
    if (url.indexOf('google.com/maps/place') > -1) {
      await sleep(5000)
      let rs = await handleRating(action)
      await sleep(2000)
      if (rs) {
        await reportScript(action)
      }
    } else if (url.indexOf('google.com/maps/@') > -1) {
      if (!action.searched) {
        action.searched = true
        await setActionData(action)

        let searchData = action.seach_data
        if (!searchData) {
          searchData = makeName(3)
        }
        await userTypeEnter(action.pid,'#searchboxinput', searchData)
        await sleep(5000)
      }
      return
    } else if (url.indexOf('google.com/maps/search') > -1) {
      await sleep(5000)
      let searchRs = document.querySelectorAll('div[role="region"] span[role="img"]')
      if (!searchRs || !searchRs.length) {
        searchRs = document.querySelectorAll('div[role="article"] span[role="img"]')
      }

      if (searchRs && searchRs.length) {
        let randomPo = randomRanger(2, searchRs.length - 1)

        let itemMap = searchRs.item(randomPo)
        if (itemMap) {
          await userClick(action.pid, '', itemMap)
        }
        return
      } else {
        await reportScript(action)
      }
    } 
    else {

    } 
  } catch (error) {
    
  }
}

async function handleRating (action) {
  let starRating = 5
  let btnSelector = 'img[src="//www.gstatic.com/images/icons/material/system_gm/1x/rate_review_gm_blue_18dp.png"]'
  await waitForSelector(btnSelector)

  let reviewBtn = document.querySelector(btnSelector)
  if (reviewBtn) {
    reviewBtn.scrollIntoViewIfNeeded()
    let pos = getElementPosition(reviewBtn)
    await updateUserInput(action.pid, 'CLICK', pos.x + 30, pos.y, 0,0,"", reviewBtn)

    await waitForSelector('iframe[name="goog-reviews-write-widget"]')
    let iframe = document.querySelector('iframe[name="goog-reviews-write-widget"]')

    if (iframe && iframe.contentWindow.document.querySelector('div[role="radiogroup"] div')) {
      await userClick(action.pid, 'textarea', '', iframe)
      await userType(action.pid, 'textarea', action.comment, '', iframe)
      await sleep(1000)
      let star = document.querySelectorAll('div[role="radiogroup"] div').item(starRating - 1)
      await userClick(action.pid, '', star, iframe)
      await sleep(1000)

      let btns = iframe.contentWindow.document.querySelectorAll('div[data-is-touch-wrapper] button')
      let pos = 2
      if (btns.length == 2) {
        pos = 1
      }
      let postBtn = btns.item(pos)
      await userClick(action.pid, '', postBtn, iframe)
      await sleep(2000)

      let backBtn = document.querySelectorAll('#omnibox-singlebox button img').item(0)
      if (backBtn) {
        await userClick(action.pid, '', backBtn)
      }

      //report success
      return true
    }
  }

  let backBtn = document.querySelectorAll('#omnibox-singlebox button img').item(0)
  if (backBtn) {
    await userClick(action.pid, '', backBtn)
  }
}

function getRating (action) {
  // "5_start_percent": "100",
  // "4_start_percent": "",
  // "3_start_percent": "",
  // "2_start_percent": "",
  // "1_start_percent": "",
  return 5
}