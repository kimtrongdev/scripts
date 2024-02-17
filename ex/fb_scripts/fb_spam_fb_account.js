async function spamFbAccount(action) {
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
    else {
      await handle(action)
      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

async function handle(action) {
  await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

  let addFriend = document.querySelector('div[aria-label="Thêm bạn bè"]') || document.querySelector('div[aria-label="Add friend"]')
  if (addFriend) {
    await userClick(action.pid, 'addFriend', addFriend)
    await sleep(3000)
  }

  let textbox = document.querySelector('div[role="textbox"]')
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
}