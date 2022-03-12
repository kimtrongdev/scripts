async function scriptMap(action) {
  try {
    let url = window.location.toString()
      
    if (url.indexOf('google.com/maps/place') > -1) {
      await sleep(4000)
      await handleRating(action)
    } else if (url.indexOf('google.com/maps/@') > -1) {
      if (!action.searched) {
        action.searched = true
        await setActionData(action)
        await userTypeEnter(action.pid,'#searchboxinput',action.seach_data)
        await sleep(5000)
      }
      return
    } else {

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
      await sleep(2000)
      let iframe = document.querySelector('iframe[name="goog-reviews-write-widget"]')

      for await (let star of startList[getRating(action)]) {
        let startSelector = 'div[aria-label="'+star+'"]'
        if (iframe.contentWindow.document.querySelector(startSelector)) {
          await userClick(action.pid, 'textarea', '', iframe)
          await userType(action.pid, 'textarea', action.comment, '', iframe)
          await sleep(1000)
          await userClick(action.pid, startSelector, '', iframe)
          await sleep(1000)
          let postBtn = iframe.contentWindow.document.querySelectorAll('div[data-is-touch-wrapper] button').item(2)
          await userClick(action.pid, '', postBtn, iframe)
          await sleep(2000)
          let doneBtn = document.querySelectorAll('div[data-is-touch-wrapper] button').item(0)
          await userClick(action.pid, '', doneBtn, iframe)


          //report success
          break
        } 
      }
      break
    }
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