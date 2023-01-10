async function likePost(action) {
  try {
    await sleep(5000)
    reportLive(action.pid)

    let url = window.location.toString()
    url = url.split('?')[0]

    if (url.includes('facebook.com/pages')) {
      await selectFBPage(action)
    }
    else if (!action.selected_page) {
      await goToLocation(action.pid, 'https://www.facebook.com/pages/?category=your_pages')
    }
    else if (url.includes('https://www.facebook.com/profile')) {
      await goToLocation(action.pid, action.post_link)
    }
    // facebook.com/lugshop.vn/posts/pfbid
    // facebook.com/story.php?story_fbid=pfbid
    // facebook.com/watch/?v=481708590811457
    else if (url.includes('/posts/')) {
      const likeBtn = document.querySelector('div[aria-label="Like"]')
      if (likeBtn) {
        await userClick(action.pid, 'likeBtn', likeBtn)
      }
      await sleep(7000)
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