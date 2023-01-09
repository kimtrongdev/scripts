async function likePage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]
    if (url.includes(action.page_link)) {
      let likeBtn = getElementContainsInnerText('span', ['Like', 'Thích'])
      await updateUserInput(action.pid,'ESC', 0,0,0,0,"",'ESC')
      if (likeBtn) {
        await userClick(action.pid, 'likeBtn', likeBtn)
      }

      await sleep(10000)
      await reportScript(action)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}