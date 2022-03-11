async function scriptMap(action) {
  try {
    let url = window.location.toString()
        
    if (url.indexOf('google.com/maps') > -1) {
      await userTypeEnter(action.pid,'#searchboxinput',action.seach_data)
    } else if (url.indexOf('google.com/maps/place') > -1) {
      await handleRating(action)
    } else {

    }
  } catch (error) {
    
  }
}

async function handleRating (action) {
  let altList = ['Write a review', 'Viết bài đánh giá']
  for await (let alt of altList) {
    let btnSelector = 'div[role="main"] div[data-js-log-root] button img[alt="'+ alt +'"]'
    if (document.querySelector(btnSelector)) {
      await userClick(action.pid, btnSelector)
      await sleep(2000)
      let startList = {
        5: ['Five stars', 'Năm sao']
      }
      for await (let star of startList[getRating(action)]) {
        let startSelector = 'div[aria-label="'+star+'"]'
        if (document.querySelector(startSelector)) {
          await userClick(action.pid, startSelector)
          let postBtn = document.querySelectorAll('div[data-is-touch-wrapper] button').item(1)
          await userClick(action.pid, postBtn)
          await sleep(2000)
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