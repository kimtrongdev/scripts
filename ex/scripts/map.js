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
      let searchRs = document.querySelectorAll('div[role="region"] a')
      if (searchRs && searchRs.length) {
        let randomPo = randomRanger(0, searchRs.length - 1)

        let itemMap = searchRs.item(randomPo)
        if (itemMap) {
          await userClick(action.pid, '', itemMap)
        }
        return
      }
    } 
    else {

    } 
  } catch (error) {
    
  }
}

async function handleRating (action) {
  let altList = ['Write a review', 'Viết bài đánh giá']
  let startList = {
    5: ['Five stars', 'Năm sao'],
    4: ['Four stars']
  }

  for await (let alt of altList) {
    let btnSelector = 'div[role="main"] div[data-js-log-root] button img[alt="'+ alt +'"]'
    if (document.querySelector(btnSelector)) {
      await userClick(action.pid, btnSelector)
      await sleep(15000)
      let iframe = document.querySelector('iframe[name="goog-reviews-write-widget"]')

      for await (let star of startList[getRating(action)]) {
        let startSelector = 'div[aria-label="'+star+'"]'
        if (iframe.contentWindow.document.querySelector(startSelector)) {
          await userClick(action.pid, 'textarea', '', iframe)
          await userType(action.pid, 'textarea', action.comment, '', iframe)
          await sleep(1000)
          await userClick(action.pid, startSelector, '', iframe)
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
      break
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