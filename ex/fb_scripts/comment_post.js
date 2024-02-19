async function commentPost(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    await checkErrorFB(action)

    if (!action.selected_page && url.includes('facebook.com/pages')) {
      await selectFBPage(action, action.post_link)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (action.after_selected_page && url.includes('https://www.facebook.com/profile')) {
      action.after_selected_page = false
      await setActionData(action)
      await goToLocation(action.pid, action.post_link)
    }
    else {
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      let textbox = document.querySelector('div[role="textbox"]')
      if (textbox && action.comment) {
        await userClick(action.pid, 'textbox', textbox)
        await sleep(2000)
        textbox = document.querySelector('div[role="textbox"]')
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
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}