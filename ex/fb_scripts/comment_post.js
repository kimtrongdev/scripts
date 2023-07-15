async function commentPost(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

    await userScroll(action.pid, 10)
    if (url.includes('facebook.com/groups')) {
      await userScroll(action.pid, randomRanger(15, 25))
      await sleep(2000)
    }

    let textboxs = document.querySelectorAll('div[role="textbox"]')
    let rdPos = randomRanger(0, Math.min(10, textboxs.length - 1))
    let textbox = textboxs.item(rdPos)

    if (textbox && action.comment) {
      await userType(action.pid, 'textbox', action.comment, textbox)
      if (action.comment.endsWith('+image')) {
        await waitForSelector('img[data-src*="https://scontent"]')
      }
      await updateUserInput(action.pid, 'KEY_ENTER')

      let likeData = document.querySelector('div>div>span>div>span[dir="auto"]')
      if (likeData) {
        let data_reported = likeData.innerText
        action.data_reported = data_reported
      }

      await sleep(7000)
      await checkErrorAfterRunScript(action)
    } else {
      console.log('NOT found text box or comment');
    }

    await reportScript(action)
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}