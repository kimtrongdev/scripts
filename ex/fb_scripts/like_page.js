async function likePage(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]
    if (url.includes(action.page_link)) {
      let likeBtn = getElementContainsInnerText('span', ['Like', 'Thích'])
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