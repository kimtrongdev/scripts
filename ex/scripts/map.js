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
  let starRating = getRating(action)
  let btnSelector = 'img[src="//www.gstatic.com/images/icons/material/system_gm/1x/rate_review_gm_blue_18dp.png"]'
  await waitForSelector(btnSelector)

  let reviewBtn = document.querySelector(btnSelector)
  if (reviewBtn) {
    reviewBtn.scrollIntoViewIfNeeded()
    let pos = getElementPosition(reviewBtn)
    await updateUserInput(action.pid, 'CLICK', pos.x + 30, pos.y, 0,0,"", reviewBtn)

    await waitForSelector('iframe[name="goog-reviews-write-widget"]')
    let iframe = document.querySelector('iframe[name="goog-reviews-write-widget"]')

    let starsSelector = 'div[role="radiogroup"] div'
    if (iframe) {
      await waitForSelector(starsSelector, 30000, iframe)
      await userClick(action.pid, 'textarea', '', iframe)
      await userType(action.pid, 'textarea', action.comment, '', iframe)
      await sleep(3000)
      let star = iframe.contentWindow.document.querySelectorAll(starsSelector).item(starRating - 1)
      await userClick(action.pid, '', star, iframe)
      await sleep(3000)

      let btns = iframe.contentWindow.document.querySelectorAll('div[data-is-touch-wrapper] button')
      let pos = 2
      if (btns.length == 2) {
        pos = 1
      }
      let postBtn = btns.item(pos)
      await userClick(action.pid, '', postBtn, iframe)
      await sleep(9000)

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
  let star5 = Number(action['5_star_percent']) || 0
  let star4 = Number(action['4_star_percent']) || 0
  let star3 = Number(action['3_star_percent']) || 0
  let rateRd = randomRanger(0, (star5 + star4 + star3))
  let rate = 5
  if (rateRd <= star3) {
    rate = 3
  } else if (rateRd <= star3 + star4) {
    rate = 4
  }

  return rate
}