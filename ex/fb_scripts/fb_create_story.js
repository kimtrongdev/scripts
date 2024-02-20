async function fbCreateStory(action) {
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
      await handleCreateStory(action)
      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}

async function handleCreateStory(action) {
  await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')

  let createPostInput = getElementContainsInnerText('span', ['Write something...', 'Bạn đang nghĩ gì?'], '', 'equal')

  if (createPostInput) {
    let inputText = document.querySelector('div[aria-label="Bạn đang nghĩ gì?"]')
    if (inputText) {
      await userTypeEnter(action.pid, 'textbox', action.content, inputText)
      await sleep(2000)
      let postBtn = document.querySelector('div[aria-label="Đăng"]') || document.querySelector('div[aria-label="Post"]')
      await userClick(action.pid, 'postBtn', postBtn)
      await sleep(7000)
      await checkErrorAfterRunScript(action)
    }
  }
}