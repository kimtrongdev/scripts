async function tiktokFeed(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url == 'https://www.tiktok.com/foryou' || url == 'https://www.tiktok.com/') {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let timeScroll = Number(action.time) || 15000
      for(let i = 0; i < timeScroll / 2000; i++) {
        await userScroll(action.pid, 15)
        await handleLikeTiktok(action)
        //await handleCommentFb(action)
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

async function handleLikeTiktok (action) {
  let isRun = isTrue(30)
  if (!isRun) {
    return
  }
  await sleep(randomRanger(10000, 15000))
  let likes = document.querySelectorAll('span[data-e2e="like-icon"]')
  for (let like of likes) {
    if (elementInViewportByTop(like)) {
      await userClick(action.pid, 'like', like)
      await sleep(1000)
      await updateUserInput(action.pid,'MOUSE_MOVE', 0, 0,0,0,"",'00')
    }
  }
}

// async function handleCommentFb (action) {
//   let isTrue = isTrue(10)
//   if (!isTrue) {
//     return
//   }
//   let items = document.querySelectorAll('div[role="textbox"]')
//   for (let item of items) {
//     if (elementInViewportByTop(item)) {
//       await userTypeEnter(action.pid, 'textbox', 'testcomment', item)
//     }
//   }
// }