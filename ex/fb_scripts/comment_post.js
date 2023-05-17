async function commentPost(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
    let textboxs = document.querySelector('div[role="textbox"]')
    let rdPos = randomRanger(0, Math.min(10, textboxs.length - 1))
    let textbox = textboxs.item(rdPos)

    if (textbox && action.comment) {
      await userTypeEnter(action.pid, 'textbox', action.comment, textbox)

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