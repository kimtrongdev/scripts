async function fbFeed(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (url == 'https://www.facebook.com//') {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let timeScroll = Number(action.scroll_time) || 15000
      for(let i = 0; i < timeScroll / 2000; i++) {
        await sleep(3000)
        await userScroll(action.pid, 5)
        
        await handleLikeFb(action)
        await handleCommentFb(action)
      }

      await reportScript(action)
    }
    else {
      await reportScript(action, false)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

async function handleLikeFb (action) {
  let isTrue = isTrue(30)
  if (!isTrue) {
    return
  }
  let likes = getElementContainsInnerText('span', ['Like', 'Thích'], '', 'equal', 'array')
  for (let like of likes) {
    if (elementInViewportByTop(like)) {
      await userClick(action.pid, 'like', like)
    }
  }
}

async function handleCommentFb (action) {
  let isTrue = isTrue(10)
  if (!isTrue) {
    return
  }
  let items = document.querySelectorAll('div[role="textbox"]')
  for (let item of items) {
    if (elementInViewportByTop(item)) {
      await userTypeEnter(action.pid, 'textbox', 'testcomment', item)
    }
  }
}