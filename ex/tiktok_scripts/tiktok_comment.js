async function tiktokComment(action) {
  try {
    await sleep(3000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('tiktok.com/search')) {
      let videos = document.querySelectorAll('div[role="tabpanel"] div[data-e2e="search_top-item"] a img')
      if (videos) {
        let video = videos.item(randomRanger(0, videos.length - 1))
        await userClick(action.pid, 'video', video)
      }
    }
    else if (url.includes('/video/')) {
      await userTypeEnter(action.pid, 'div[data-e2e="comment-text"]', action.comment)
      await sleep(4000)
      await reportScript(action)
    }
    else
    if (url.includes('tiktok.com/@')) {
      let videos = document.querySelectorAll('div[data-e2e="user-post-item"]')
      let rdPos = randomRanger(0, Math.min(10, videos.length - 1))
      let video = videos.item(rdPos)
      await userClick(action.pid, 'video-' + rdPos, video)
    }
    else {
      await sleep(10000)
      await reportScript(action, 0)
    }
  } catch (er) {
    console.log(er);
    await reportScript(action, false)
  }
}